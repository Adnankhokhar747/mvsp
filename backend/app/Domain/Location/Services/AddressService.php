<?php

namespace App\Domain\Location\Services;

use App\Domain\Location\Models\Address;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class AddressService
{
    public function create(Model $addressable, array $data): Address
    {
        return DB::transaction(function () use ($addressable, $data) {
            if (! empty($data['is_default'])) {
                $addressable->addresses()->update(['is_default' => false]);
            }

            return $addressable->addresses()->create($data);
        });
    }

    public function update(Address $address, array $data): Address
    {
        return DB::transaction(function () use ($address, $data) {
            if (! empty($data['is_default'])) {
                $address->addressable->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
            }

            $address->update($data);

            return $address->fresh();
        });
    }

    public function delete(Address $address): void
    {
        $address->delete();
    }
}
