<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CsmsRig extends Model
{
    protected $fillable = ['name', 'code', 'status'];

    public function records(): HasMany
    {
        return $this->hasMany(CsmsRecord::class, 'csms_rig_id');
    }
}
