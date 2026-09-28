<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HseKpiTarget extends Model
{
    protected $table = 'hse_kpi_targets';

    protected $fillable = [
        'year',
        'contract_no',
        'rig_no',
        'focus_project',
        'location_district',

        'indicator_no',
        'indicator_name',
        'definition',

        'frequency_rate',
        'target_month',
        'target_year',
        'unit',

        'month',
        'quarter',

        'plan',
        'actual',

        'notes',
    ];

    protected $casts = [
        'year' => 'integer',
        'indicator_no' => 'integer',

        'target_month' => 'decimal:2',
        'target_year' => 'decimal:2',

        'month' => 'integer',

        'plan' => 'decimal:2',
        'actual' => 'decimal:2',
    ];
}