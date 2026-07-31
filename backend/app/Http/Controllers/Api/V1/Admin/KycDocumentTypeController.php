<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Vendor\Models\KycDocumentType;
use App\Http\Controllers\Controller;
use App\Http\Resources\Vendor\KycDocumentTypeResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class KycDocumentTypeController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('kyc.review');

        return KycDocumentTypeResource::collection(KycDocumentType::orderBy('name')->get());
    }
}
