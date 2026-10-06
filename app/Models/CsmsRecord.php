<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CsmsRecord extends Model
{
    protected $fillable = [
        'csms_rig_id',
        'csms_document_category_id',
        'periode_bulan',
        'periode_tahun',
        'crew',
        'file_path',
        'file_name',
        'file_size',
        'file_type',
        'attachments',
        'status',
        'approval_status',
        'approval_notes',
        'approved_by',
        'approved_at',
        'keterangan',
        'uploaded_by',
    ];

    protected $casts = [
        'attachments' => 'array',
        'approved_at' => 'datetime',
    ];

    public function rig(): BelongsTo
    {
        return $this->belongsTo(CsmsRig::class, 'csms_rig_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(CsmsDocumentCategory::class, 'csms_document_category_id');
    }
}
