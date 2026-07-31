<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Vendor\Models\Vendor;
use App\Domain\Vendor\Models\VendorKycDocument;
use App\Domain\Vendor\Services\VendorService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReviewKycDocumentRequest;
use App\Http\Resources\Vendor\VendorKycDocumentResource;

class VendorKycDocumentController extends Controller
{
    public function __construct(protected VendorService $vendors) {}

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
}
