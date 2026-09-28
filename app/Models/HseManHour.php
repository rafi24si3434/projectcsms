<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HseManHour extends Model
{
    protected $table = 'hse_man_hours';

    protected $fillable = [
        'report_id',

        'premises_plan',
        'non_premises_plan',

        'premises_actual',
        'non_premises_actual',

        'kilometer_premises_plan',
        'kilometer_non_premises_plan',

        'kilometer_premises_actual',
        'kilometer_non_premises_actual',

        'total_employees',
        'total_vehicles',
    ];

    protected $casts = [
        'premises_plan' => 'decimal:2',
        'non_premises_plan' => 'decimal:2',

        'premises_actual' => 'decimal:2',
        'non_premises_actual' => 'decimal:2',

        'kilometer_premises_plan' => 'decimal:2',
        'kilometer_non_premises_plan' => 'decimal:2',

        'kilometer_premises_actual' => 'decimal:2',
        'kilometer_non_premises_actual' => 'decimal:2',

        'total_employees' => 'integer',
        'total_vehicles' => 'integer',
    ];

    public function report(): BelongsTo
    {
        return $this->belongsTo(
            HseReport::class,
            'report_id'
        );
    }

    /**
     * Total Man Hours Plan
     */
    public function getTotalPlanAttribute(): float
    {
        return (float) $this->premises_plan
            + (float) $this->non_premises_plan;
    }

    /**
     * Total Man Hours Actual
     */
    public function getTotalActualAttribute(): float
    {
        return (float) $this->premises_actual
            + (float) $this->non_premises_actual;
    }

    /**
     * Total Kilometer Plan
     */
    public function getTotalKilometerPlanAttribute(): float
    {
        return (float) $this->kilometer_premises_plan
            + (float) $this->kilometer_non_premises_plan;
    }

    /**
     * Total Kilometer Actual
     */
    public function getTotalKilometerActualAttribute(): float
    {
        return (float) $this->kilometer_premises_actual
            + (float) $this->kilometer_non_premises_actual;
    }
}