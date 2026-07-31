<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\ActivityLogResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('activity-logs.view');

        $query = Activity::query()->with('causer');

        if ($subjectType = $request->input('filter.subject_type')) {
            $query->where('subject_type', 'like', "%\\{$subjectType}");
        }

        if ($event = $request->input('filter.event')) {
            $query->where('event', $event);
        }

        $activities = $query->latest()->paginate($request->integer('per_page', 25));

        return ActivityLogResource::collection($activities);
    }
}
