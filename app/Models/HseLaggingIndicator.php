<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HseLaggingIndicator extends Model
{
    protected $table = 'hse_lagging_indicators';

    protected $fillable = [
        'report_id',
        'indicator_no',
        'indicator_name',
        'definition',
        'unit',
        'plan',
        'actual',
        'frequency_rate',
        'month',
        'year',
        'notes',
    ];

    protected $casts = [
        'indicator_no' => 'integer',
        'plan' => 'decimal:2',
        'actual' => 'decimal:2',
        'frequency_rate' => 'decimal:4',
        'month' => 'integer',
        'year' => 'integer',
    ];

    public function report(): BelongsTo
    {
        return $this->belongsTo(
            HseReport::class,
            'report_id'
        );
    }
}
