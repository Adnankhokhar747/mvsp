<?php

namespace App\Http\Controllers\Api\V1\Catalog;

use App\Domain\Booking\Services\AvailabilityService;
use App\Domain\Catalog\Models\Service;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AvailabilityController extends Controller
{
    public function __construct(protected AvailabilityService $availability) {}

    public function index(Request $request, Service $service): JsonResponse
    {
        $request->validate([
            'date_from' => ['required', 'date'],
            'date_to' => ['required', 'date', 'after_or_equal:date_from'],
            'staff_id' => ['nullable', 'integer'],
        ]);

        $from = Carbon::parse($request->query('date_from'));
        $to = Carbon::parse($request->query('date_to'));

        $slots = $this->availability->openSlots($service, $from, $to, $request->integer('staff_id') ?: null);

        return response()->json([
            'data' => $slots->map(fn ($slot) => [
                'start' => $slot['start']->toIso8601String(),
                'end' => $slot['end']->toIso8601String(),
                'staff_id' => $slot['staff_id'],
            ]),
        ]);
    }
}
