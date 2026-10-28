<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CsmsRig extends Model
{
    protected $fillable = [
        'name',
        'code',
        'status',
        'hfo_1',
        'hfo_2',
        'hfo_3',
    ];

    protected $appends = ['hfo_list'];

    /**
     * Ambil array daftar nama HFO yang terdaftar untuk rig ini
     */
    public function getHfoListAttribute(): array
    {
        return array_values(array_filter([
            $this->hfo_1,
            $this->hfo_2,
            $this->hfo_3,
        ]));
    }

    public function records(): HasMany
    {
        return $this->hasMany(CsmsRecord::class, 'csms_rig_id');
    }
}
