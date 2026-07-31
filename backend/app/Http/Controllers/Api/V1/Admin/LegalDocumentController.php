<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Settings\Models\LegalDocument;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreLegalDocumentRequest;
use App\Http\Requests\Admin\UpdateLegalDocumentRequest;
use App\Http\Resources\Settings\LegalDocumentResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class LegalDocumentController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('legal.manage');

        return LegalDocumentResource::collection(
            LegalDocument::orderBy('type')->latest('created_at')->get()
        );
    }

    public function store(StoreLegalDocumentRequest $request): JsonResponse
    {
        $this->authorize('legal.manage');

        // Drafts only - publishing is a deliberate, separate action so a new
        // version never goes live the moment it's saved.
        $document = LegalDocument::create($request->validated() + ['published_at' => null]);

        return (new LegalDocumentResource($document))->response()->setStatusCode(201);
    }

    public function update(UpdateLegalDocumentRequest $request, LegalDocument $legalDocument): LegalDocumentResource
    {
        $this->authorize('legal.manage');

        if ($legalDocument->published_at !== null) {
            abort(422, 'A published legal document cannot be edited - create a new version instead.');
        }

        $legalDocument->update($request->validated());

        return new LegalDocumentResource($legalDocument->fresh());
    }

    public function publish(LegalDocument $legalDocument): LegalDocumentResource
    {
        $this->authorize('legal.manage');

        $legalDocument->update(['published_at' => now()]);

        return new LegalDocumentResource($legalDocument->fresh());
    }
}
