<?php

namespace App\Domain\Vendor\Services;

use App\Domain\Identity\Models\User;
use App\Domain\Subscription\Models\SubscriptionPlan;
use App\Domain\Vendor\Exceptions\VendorException;
use App\Domain\Vendor\Models\KycDocumentType;
use App\Domain\Vendor\Models\Vendor;
use App\Domain\Vendor\Models\VendorKycDocument;
use App\Domain\Vendor\Models\VendorUser;
use App\Domain\Wallet\Models\VendorWallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VendorService
{
    /**
     * @throws VendorException
     */
    public function createProfile(User $owner, array $data): Vendor
    {
        if ($owner->vendorMemberships()->exists()) {
            throw VendorException::alreadyHasVendorProfile();
        }

        return DB::transaction(function () use ($owner, $data) {
            $vendor = Vendor::create([
                'user_id' => $owner->id,
                'business_name' => $data['business_name'],
                'slug' => $this->uniqueSlug($data['business_name']),
                'description' => $data['description'] ?? null,
                'email' => $data['email'] ?? $owner->email,
                'phone' => $data['phone'] ?? null,
                'whatsapp' => $data['whatsapp'] ?? null,
                'status' => 'pending',
                'currency_code' => $data['currency_code'] ?? 'USD',
                'timezone' => $data['timezone'] ?? 'UTC',
            ]);

            VendorUser::create([
                'vendor_id' => $vendor->id,
                'user_id' => $owner->id,
                'role' => 'owner',
                'joined_at' => now(),
            ]);

            VendorWallet::create([
                'vendor_id' => $vendor->id,
                'currency_code' => $vendor->currency_code,
            ]);

            $defaultPlan = SubscriptionPlan::where('is_default', true)->first();
            if ($defaultPlan) {
                $vendor->subscriptions()->create([
                    'subscription_plan_id' => $defaultPlan->id,
                    'status' => 'active',
                    'starts_at' => now(),
                    'auto_renew' => true,
                ]);
            }

            return $vendor->fresh();
        });
    }

    public function updateProfile(Vendor $vendor, array $data): Vendor
    {
        $vendor->update($data);

        return $vendor->fresh();
    }

    public function approve(Vendor $vendor, User $approver): Vendor
    {
        $vendor->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $approver->id,
            'rejection_reason' => null,
        ]);

        return $vendor;
    }

    public function reject(Vendor $vendor, string $reason): Vendor
    {
        $vendor->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
        ]);

        return $vendor;
    }

    public function suspend(Vendor $vendor, ?string $reason = null): Vendor
    {
        $vendor->update([
            'status' => 'suspended',
            'rejection_reason' => $reason,
        ]);

        return $vendor;
    }

    /**
     * @throws VendorException
     */
    public function inviteStaff(Vendor $vendor, User $inviter, string $email, string $role): VendorUser
    {
        $user = User::where('email', $email)->first();

        if (! $user) {
            throw VendorException::userNotFound();
        }

        if ($vendor->vendorUsers()->where('user_id', $user->id)->exists()) {
            throw VendorException::userAlreadyMember();
        }

        return DB::transaction(function () use ($vendor, $inviter, $user, $role) {
            $vendorUser = VendorUser::create([
                'vendor_id' => $vendor->id,
                'user_id' => $user->id,
                'role' => $role,
                'invited_by' => $inviter->id,
                'joined_at' => now(),
            ]);

            $user->assignRole($role === 'manager' ? 'vendor-manager' : 'vendor-staff');

            return $vendorUser;
        });
    }

    /**
     * @throws VendorException
     */
    public function removeStaff(Vendor $vendor, int $userId): void
    {
        $vendorUser = $vendor->vendorUsers()->where('user_id', $userId)->firstOrFail();

        if ($vendorUser->role === 'owner') {
            throw VendorException::cannotRemoveOwner();
        }

        $vendorUser->delete();
    }

    public function uploadKycDocument(Vendor $vendor, KycDocumentType $type, string $filePath): VendorKycDocument
    {
        return $vendor->kycDocuments()->create([
            'kyc_document_type_id' => $type->id,
            'file_path' => $filePath,
            'status' => 'pending',
        ]);
    }

    public function reviewKycDocument(VendorKycDocument $document, User $reviewer, string $status, ?string $reason = null): VendorKycDocument
    {
        $document->update([
            'status' => $status,
            'rejected_reason' => $status === 'rejected' ? $reason : null,
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
        ]);

        return $document;
    }

    protected function uniqueSlug(string $businessName): string
    {
        $base = Str::slug($businessName);
        $slug = $base;
        $suffix = 1;

        while (Vendor::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
