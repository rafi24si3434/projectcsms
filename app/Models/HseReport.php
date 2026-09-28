<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HseReport extends Model
{
    protected $table = 'hse_reports';

    protected $fillable = [
        'report_date',
        'contract_no',
        'rig_no',
        'work_period',
        'year',
        'period',
        'focus_project',
        'location_district',
        'issued_date',
        'revision_no',
        'program_reference',
        'status',
        'approval_token',
        'remarks',
        'submitter_role',
        'submitter_name',
        'submitter_email',
        'rejection_reason',
        'approved_at',
        'approved_by',
        'created_by',
    ];

    protected $casts = [
        'report_date' => 'date',
        'issued_date' => 'date',
        'approved_at' => 'datetime',
        'year' => 'integer',
    ];

    /**
     * Relasi ke Man Hours
     */
    public function manHours(): HasOne
    {
        return $this->hasOne(
            HseManHour::class,
            'report_id'
        );
    }

    /**
     * Relasi ke Lagging Indicators
     */
    public function laggingIndicators(): HasMany
    {
        return $this->hasMany(
            HseLaggingIndicator::class,
            'report_id'
        );
    }

    /**
     * Relasi ke Leading Indicators
     */
    public function leadingIndicators(): HasMany
    {
        return $this->hasMany(
            HseLeadingIndicator::class,
            'report_id'
        );
    }

    /**
     * Relasi ke User yang menyetujui (Approver)
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Relasi ke User pembuat
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}