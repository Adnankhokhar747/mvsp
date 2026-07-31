<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Vendor\Models\Vendor;
use App\Domain\Vendor\Models\VendorKycDocument;
use App\Domain\Vendor\Services\VendorService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReviewKycDocumentRequest;
use App\Http\Resources\Vendor\VendorKycDocumentResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class VendorKycDocumentController extends Controller
{
    public function __construct(protected VendorService $vendors) {}

    public function index(Vendor $vendor): AnonymousResourceCollection
    {
        $this->authorize('kyc.review');

        return VendorKycDocumentResource::collection(
            $vendor->kycDocuments()->with('kycDocumentType')->latest()->get()
        );
    }

    public function review(ReviewKycDocumentRequest $request, Vendor $vendor, VendorKycDocument $document): VendorKycDocumentResource
    {
        $this->authorize('kyc.review');

        $document = $this->vendors->reviewKycDocument(
            $document,
            $request->user(),
            $request->validated('status'),
            $request->validated('reason'),
        );

        return new VendorKycDocumentResource($document);
    }

    public function download(Vendor $vendor, VendorKycDocument $document): StreamedResponse
    {
        $this->authorize('kyc.review');

        abort_unless($document->vendor_id === $vendor->id, 404);

        return Storage::disk('local')->response($document->file_path);
    }
}
