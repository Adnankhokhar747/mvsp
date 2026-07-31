<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Notification\Models\NotificationTemplate;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreNotificationTemplateRequest;
use App\Http\Requests\Admin\UpdateNotificationTemplateRequest;
use App\Http\Resources\Notification\NotificationTemplateResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class NotificationTemplateController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('notification-templates.manage');

        return NotificationTemplateResource::collection(
            NotificationTemplate::orderBy('key')->orderBy('channel')->get()
        );
    }

    public function store(StoreNotificationTemplateRequest $request): JsonResponse
    {
        $this->authorize('notification-templates.manage');

        $template = NotificationTemplate::create($request->validated());

        return (new NotificationTemplateResource($template->fresh()))->response()->setStatusCode(201);
    }

    public function update(UpdateNotificationTemplateRequest $request, NotificationTemplate $notificationTemplate): NotificationTemplateResource
    {
        $this->authorize('notification-templates.manage');

        $notificationTemplate->update($request->validated());

        return new NotificationTemplateResource($notificationTemplate->fresh());
    }

    public function destroy(NotificationTemplate $notificationTemplate): JsonResponse
    {
        $this->authorize('notification-templates.manage');

        $notificationTemplate->delete();

        return response()->json(['message' => 'Template deleted.']);
    }
}
