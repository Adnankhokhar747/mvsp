<?php

namespace App\Domain\Booking\Services;

use App\Domain\Booking\Exceptions\BookingException;
use App\Domain\Booking\Models\Booking;
use App\Domain\Booking\Models\BookingQuote;
use App\Domain\Catalog\Models\Service;
use App\Domain\Identity\Models\User;
use App\Domain\Settings\Services\SettingsService;
use App\Domain\Subscription\Services\FeatureGateService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingService
{
    /** @var array<string, string[]> */
    protected const ALLOWED_TRANSITIONS = [
        'pending' => ['confirmed', 'quoted', 'cancelled'],
        'quoted' => ['confirmed', 'cancelled'],
        'confirmed' => ['in_progress', 'cancelled'],
        'in_progress' => ['completed', 'disputed'],
    ];

    public function __construct(
        protected FeatureGateService $featureGate,
        protected CancellationPolicyResolver $cancellationPolicy,
        protected SettingsService $settings,
    ) {}

    /**
     * @throws BookingException
     */
    public function create(User $customer, Service $service, array $data): Booking
    {
        if ($service->status !== 'active') {
            throw BookingException::serviceNotBookable();
        }

        $vendor = $service->vendor;
        $monthlyCount = $vendor->bookings()->where('created_at', '>=', now()->startOfMonth())->count();

        if ($this->featureGate->hasReachedLimit($vendor, 'max_bookings_per_month', $monthlyCount)) {
            throw BookingException::maxBookingsReached();
        }

        $bookingMode = $service->price_type === 'quote' ? 'request' : 'slot';
        $package = $data['service_package_id'] ?? null
            ? $service->packages()->find($data['service_package_id'])
            : null;

        $duration = $package->duration_minutes ?? $service->duration_minutes ?? 60;
        $price = $bookingMode === 'request' ? null : ($package->price ?? $service->base_price);

        return DB::transaction(function () use ($customer, $service, $vendor, $data, $bookingMode, $package, $duration, $price) {
            if ($bookingMode === 'slot') {
                if (empty($data['scheduled_at'])) {
                    throw BookingException::scheduledAtRequired();
                }

                $this->assertSlotFree($service, $data['scheduled_at'], $duration, $data['staff_id'] ?? null);
            }

            $booking = Booking::create([
                'booking_number' => $this->generateBookingNumber(),
                'customer_id' => $customer->id,
                'vendor_id' => $vendor->id,
                'service_id' => $service->id,
                'service_package_id' => $package?->id,
                'staff_id' => $data['staff_id'] ?? null,
                'booking_mode' => $bookingMode,
                'scheduled_at' => $data['scheduled_at'] ?? null,
                'duration_minutes' => $duration,
                'address_id' => $data['address_id'] ?? null,
                'status' => 'pending',
                'price' => $price,
                'currency_code' => $service->currency_code,
                'notes' => $data['notes'] ?? null,
            ]);

            $this->logStatus($booking, null, 'pending', $customer, 'Booking created.');

            return $booking->fresh();
        });
    }

    /**
     * @throws BookingException
     */
    protected function assertSlotFree(Service $service, string $scheduledAt, int $duration, ?int $staffId): void
    {
        $scheduledAt = \Carbon\Carbon::parse($scheduledAt);
        $end = $scheduledAt->copy()->addMinutes($duration);

        // Row-lock overlapping bookings for this service/staff for the duration of the
        // transaction so two simultaneous requests for the same slot can't both win
        // (docs/architecture/06-validation-and-edge-cases.md — "Booking slot race").
        $conflict = Booking::where('service_id', $service->id)
            ->when($staffId, fn ($q) => $q->where('staff_id', $staffId))
            ->whereIn('status', ['pending', 'quoted', 'confirmed', 'in_progress'])
            ->whereNotNull('scheduled_at')
            ->lockForUpdate()
            ->get()
            ->contains(function (Booking $existing) use ($scheduledAt, $end) {
                $existingEnd = $existing->scheduled_at->copy()->addMinutes($existing->duration_minutes ?? 60);

                return $scheduledAt->lt($existingEnd) && $existing->scheduled_at->lt($end);
            });

        if ($conflict) {
            throw BookingException::slotUnavailable();
        }
    }

    public function reschedule(Booking $booking, User $actor, string $newScheduledAt): Booking
    {
        return DB::transaction(function () use ($booking, $actor, $newScheduledAt) {
            $this->assertSlotFree($booking->service, $newScheduledAt, $booking->duration_minutes ?? 60, $booking->staff_id);

            $new = Booking::create([
                'booking_number' => $this->generateBookingNumber(),
                'customer_id' => $booking->customer_id,
                'vendor_id' => $booking->vendor_id,
                'service_id' => $booking->service_id,
                'service_package_id' => $booking->service_package_id,
                'staff_id' => $booking->staff_id,
                'booking_mode' => $booking->booking_mode,
                'scheduled_at' => $newScheduledAt,
                'duration_minutes' => $booking->duration_minutes,
                'address_id' => $booking->address_id,
                'status' => 'pending',
                'price' => $booking->price,
                'currency_code' => $booking->currency_code,
                'notes' => $booking->notes,
                'rescheduled_from_id' => $booking->id,
            ]);

            $this->logStatus($new, null, 'pending', $actor, 'Created via reschedule.');

            $booking->update([
                'status' => 'cancelled',
                'cancellation_reason' => 'rescheduled',
                'cancelled_by' => $actor->id,
                'cancelled_at' => now(),
            ]);
            $this->logStatus($booking, $booking->getOriginal('status'), 'cancelled', $actor, 'Rescheduled.');

            return $new;
        });
    }

    /**
     * @throws BookingException
     */
    public function cancel(Booking $booking, User $actor, ?string $reason = null): array
    {
        if (! in_array($booking->status, ['pending', 'quoted', 'confirmed'], true)) {
            throw BookingException::notCancellable($booking->status);
        }

        $refundPercentage = $this->cancellationPolicy->refundPercentageFor(
            $booking->vendor,
            $booking->service->category,
            $booking->scheduled_at,
        );

        $from = $booking->status;
        $booking->update([
            'status' => 'cancelled',
            'cancellation_reason' => $reason,
            'cancelled_by' => $actor->id,
            'cancelled_at' => now(),
        ]);
        $this->logStatus($booking, $from, 'cancelled', $actor, $reason);

        return ['booking' => $booking->fresh(), 'refund_percentage' => $refundPercentage];
    }

    /**
     * @throws BookingException
     */
    public function submitQuote(Booking $booking, array $data): BookingQuote
    {
        if ($booking->booking_mode !== 'request') {
            throw BookingException::notRequestMode();
        }

        $expiryHours = (int) $this->settings->get('booking', 'quote_expiry_hours', 72);

        return DB::transaction(function () use ($booking, $data, $expiryHours) {
            $quote = $booking->quotes()->create([
                'vendor_id' => $booking->vendor_id,
                'quoted_price' => $data['quoted_price'],
                'quoted_duration' => $data['quoted_duration'] ?? null,
                'message' => $data['message'] ?? null,
                'status' => 'pending',
                'expires_at' => now()->addHours($expiryHours),
            ]);

            $from = $booking->status;
            $booking->update(['status' => 'quoted']);
            $this->logStatus($booking, $from, 'quoted', null, 'Vendor submitted a quote.');

            return $quote;
        });
    }

    /**
     * @throws BookingException
     */
    public function acceptQuote(BookingQuote $quote, User $actor): Booking
    {
        if ($quote->status !== 'pending' || $quote->expires_at->isPast()) {
            throw BookingException::quoteNotPending();
        }

        return DB::transaction(function () use ($quote, $actor) {
            $quote->update(['status' => 'accepted']);
            $booking = $quote->booking;

            $from = $booking->status;
            $booking->update([
                'price' => $quote->quoted_price,
                'duration_minutes' => $quote->quoted_duration ?? $booking->duration_minutes,
                'status' => 'confirmed',
            ]);
            $this->logStatus($booking, $from, 'confirmed', $actor, 'Quote accepted.');

            return $booking->fresh();
        });
    }

    /**
     * @throws BookingException
     */
    public function rejectQuote(BookingQuote $quote, User $actor): Booking
    {
        if ($quote->status !== 'pending') {
            throw BookingException::quoteNotPending();
        }

        return DB::transaction(function () use ($quote, $actor) {
            $quote->update(['status' => 'rejected']);
            $booking = $quote->booking;

            $from = $booking->status;
            $booking->update([
                'status' => 'cancelled',
                'cancellation_reason' => 'quote_rejected',
                'cancelled_by' => $actor->id,
                'cancelled_at' => now(),
            ]);
            $this->logStatus($booking, $from, 'cancelled', $actor, 'Quote rejected.');

            return $booking->fresh();
        });
    }

    /**
     * @throws BookingException
     */
    public function transitionStatus(Booking $booking, User $actor, string $action): Booking
    {
        $targetStatus = match ($action) {
            'confirm' => 'confirmed',
            'start' => 'in_progress',
            'complete' => 'completed',
            default => throw BookingException::invalidStatusTransition($booking->status, $action),
        };

        $allowed = self::ALLOWED_TRANSITIONS[$booking->status] ?? [];

        if (! in_array($targetStatus, $allowed, true)) {
            throw BookingException::invalidStatusTransition($booking->status, $targetStatus);
        }

        $from = $booking->status;
        $booking->update(['status' => $targetStatus]);
        $this->logStatus($booking, $from, $targetStatus, $actor);

        return $booking->fresh();
    }

    protected function logStatus(Booking $booking, ?string $from, string $to, ?User $actor, ?string $note = null): void
    {
        $booking->statusHistory()->create([
            'from_status' => $from,
            'to_status' => $to,
            'changed_by' => $actor?->id,
            'note' => $note,
        ]);
    }

    protected function generateBookingNumber(): string
    {
        return 'BK-'.now()->format('ymd').'-'.Str::upper(Str::random(6));
    }
}
