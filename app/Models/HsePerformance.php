<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HsePerformance extends Model
{
    protected $fillable = [
        'hse_indicator_id',
        'year',
        'month',
        'cases',
        'working_hours',
        'kilometers',
        'amount',
        'barrels',
        'result',
    ];

    protected $casts = [
        'year' => 'integer',
        'month' => 'integer',
        'cases' => 'decimal:2',
        'working_hours' => 'decimal:2',
        'kilometers' => 'decimal:2',
        'amount' => 'decimal:2',
        'barrels' => 'decimal:2',
        'result' => 'decimal:4',
    ];

    public function indicator(): BelongsTo
    {
        return $this->belongsTo(
            HseIndicator::class,
            'hse_indicator_id'
        );
    }
}