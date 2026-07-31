<?php

namespace App\Http\Resources\Vendor;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VendorKycDocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kyc_document_type_id' => $this->kyc_document_type_id,
            'document_type' => $this->whenLoaded('kycDocumentType', fn () => [
                'id' => $this->kycDocumentType->id,
                'name' => $this->kycDocumentType->name,
                'slug' => $this->kycDocumentType->slug,
            ]),
            'file_path' => $this->file_path,
            'status' => $this->status,
            'rejected_reason' => $this->rejected_reason,
            'reviewed_at' => $this->reviewed_at,
            'created_at' => $this->created_at,
        ];
    }
}
