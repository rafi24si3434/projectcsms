<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CsmsDocumentCategory extends Model
{
    protected $fillable = [
        'dept',
        'no',
        'nama_dokumen',
        'durasi',
        'scope',
        'keterangan_default',
    ];

    public function records(): HasMany
    {
        return $this->hasMany(CsmsRecord::class, 'csms_document_category_id');
    }
}
