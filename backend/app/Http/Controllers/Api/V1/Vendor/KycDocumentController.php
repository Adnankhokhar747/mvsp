<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Domain\Vendor\Models\KycDocumentType;
use App\Domain\Vendor\Models\Vendor;
use App\Domain\Vendor\Services\VendorService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Vendor\UploadKycDocumentRequest;
use App\Http\Resources\Vendor\VendorKycDocumentResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class KycDocumentController extends Controller
{
    public function __construct(protected VendorService $vendors) {}

    public function index(Vendor $vendor): AnonymousResourceCollection
    {
        $this->authorize('uploadKyc', $vendor);

        return VendorKycDocumentResource::collection(
            $vendor->kycDocuments()->with('kycDocumentType')->latest()->get()
        );
    }

    public function store(UploadKycDocumentRequest $request, Vendor $vendor): VendorKycDocumentResource
    {
        $this->authorize('uploadKyc', $vendor);

        $type = KycDocumentType::findOrFail($request->validated('kyc_document_type_id'));
        $path = $request->file('file')->store("kyc-documents/{$vendor->id}", 'local');

        $document = $this->vendors->uploadKycDocument($vendor, $type, $path);

        return new VendorKycDocumentResource($document->load('kycDocumentType'));
    }
}
