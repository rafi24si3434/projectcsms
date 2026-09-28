<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HseIndicator extends Model
{
    protected $fillable = [
        'code',
        'name',
        'definition',
        'calculation_type',
        'unit',
        'is_active',
    ];

    public function performances(): HasMany
    {
        return $this->hasMany(HsePerformance::class);
    }
}