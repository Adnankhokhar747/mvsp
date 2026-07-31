<?php

namespace App\Domain\Booking\Services;

use App\Domain\Catalog\Models\Service;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Collection;

class AvailabilityService
{
    /**
     * Computed open slots for a service across a date range — availability windows
     * minus anything already booked. A thin, best-effort scheduler: fixed-length
     * slots stepping by the slot duration itself, no overlapping/partial slots.
     */
    public function openSlots(Service $service, Carbon $from, Carbon $to, ?int $staffId = null): Collection
    {
        $slotMinutes = $service->duration_minutes ?? 60;

        $windows = $service->availability()
            ->when($staffId, fn ($q) => $q->where(fn ($q2) => $q2->where('staff_id', $staffId)->orWhereNull('staff_id')))
            ->get();

        $existingBookings = $service->bookings()
            ->whereIn('status', ['pending', 'quoted', 'confirmed', 'in_progress'])
            ->whereBetween('scheduled_at', [$from->copy()->startOfDay(), $to->copy()->endOfDay()])
            ->when($staffId, fn ($q) => $q->where('staff_id', $staffId))
            ->get(['scheduled_at', 'duration_minutes', 'staff_id']);

        $slots = collect();

        foreach (CarbonPeriod::create($from->copy()->startOfDay(), $to->copy()->startOfDay()) as $date) {
            $dayWindows = $windows->filter(fn ($w) => $w->specific_date?->isSameDay($date));

            if ($dayWindows->isEmpty()) {
                $dayWindows = $windows->filter(fn ($w) => is_null($w->specific_date) && $w->day_of_week === $date->dayOfWeek);
            }

            foreach ($dayWindows as $window) {
                $slots = $slots->merge($this->generateSlotsForWindow($date, $window, $slotMinutes));
            }
        }

        return $slots->reject(function (array $slot) use ($existingBookings) {
            return $existingBookings->contains(function ($booking) use ($slot) {
                if (! $booking->scheduled_at) {
                    return false;
                }

                $bookingEnd = $booking->scheduled_at->copy()->addMinutes($booking->duration_minutes ?? 60);

                return $slot['start']->lt($bookingEnd) && $booking->scheduled_at->lt($slot['end']);
            });
        })->values();
    }

    protected function generateSlotsForWindow(Carbon $date, $window, int $slotMinutes): Collection
    {
        $slots = collect();

        $start = $date->copy()->setTimeFromTimeString($window->start_time);
        $end = $date->copy()->setTimeFromTimeString($window->end_time);

        while ($start->copy()->addMinutes($slotMinutes)->lte($end)) {
            $slots->push([
                'start' => $start->copy(),
                'end' => $start->copy()->addMinutes($slotMinutes),
                'staff_id' => $window->staff_id,
            ]);
            $start->addMinutes($slotMinutes);
        }

        return $slots;
    }
}
