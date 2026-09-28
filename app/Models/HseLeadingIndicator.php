<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HseLeadingIndicator extends Model
{
    protected $table = 'hse_leading_indicators';

    protected $fillable = [
        'report_id',
        'indicator_no',
        'indicator_name',
        'definition',
        'unit',
        'target_month',
        'target_year',
        'plan',
        'actual',
        'month',
        'year',
        'notes',
    ];

    protected $casts = [
        'indicator_no' => 'integer',
        'target_month' => 'decimal:2',
        'target_year' => 'decimal:2',
        'plan' => 'decimal:2',
        'actual' => 'decimal:2',
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