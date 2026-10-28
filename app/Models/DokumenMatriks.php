<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DokumenMatriks extends Model
{
    protected $table = 'csms_rig_document_categories';

    protected $fillable = [
        'rig_id',
        'category_id',
        'no',
        'nama_dokumen',
        'durasi',
        'scope',
        'keterangan_default',
    ];

    public function rig(): BelongsTo
    {
        return $this->belongsTo(CsmsRig::class, 'rig_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(CsmsDocumentCategory::class, 'category_id');
    }
}
