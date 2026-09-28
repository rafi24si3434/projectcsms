<?php

namespace Database\Seeders;

use App\Models\HseIndicator;
use Illuminate\Database\Seeder;

class HseIndicatorSeeder extends Seeder
{
    public function run(): void
    {
        $indicators = [

            [
                'code' => '1.1',
                'name' => 'FATALITY',
                'definition' => 'Record case',
                'calculation_type' => 'record_case',
                'unit' => 'Case',
            ],

            [
                'code' => '1.2',
                'name' => 'SERIOUS LOST TIME INJURY (>21 LOST DAY)',
                'definition' => 'Frequency rate = (kasus cedera × 200.000) / Jam Kerja',
                'calculation_type' => 'frequency_rate',
                'unit' => 'Frequency Rate',
            ],

            [
                'code' => '1.3',
                'name' => 'RESTRICTED WORK CASE (RWC)',
                'definition' => 'Frequency rate = (kasus cedera × 200.000) / Jam Kerja',
                'calculation_type' => 'frequency_rate',
                'unit' => 'Frequency Rate',
            ],

            [
                'code' => '1.4',
                'name' => 'MEDICAL TREATMENT CASE (MTC)',
                'definition' => 'Frequency rate = (kasus cedera × 200.000) / Jam Kerja',
                'calculation_type' => 'frequency_rate',
                'unit' => 'Frequency Rate',
            ],

            [
                'code' => '1.5',
                'name' => 'TOTAL RECORDABLE INJURY',
                'definition' => 'Frequency rate = (kasus cedera × 200.000) / Jam Kerja',
                'calculation_type' => 'frequency_rate',
                'unit' => 'Frequency Rate',
            ],

            [
                'code' => '1.6',
                'name' => 'MOTOR VEHICLE CRASH (MVC)',
                'definition' => 'MVC FR = (kasus × 1.000.000) / kilometer perjalanan kendaraan',
                'calculation_type' => 'mvc_rate',
                'unit' => 'MVC Frequency Rate',
            ],

            [
                'code' => '1.7',
                'name' => 'TUMPAHAN / OIL SPILL',
                'definition' => 'Record case > 1 barrel',
                'calculation_type' => 'oil_spill',
                'unit' => 'Case',
            ],

            [
                'code' => '1.8',
                'name' => 'FIRE',
                'definition' => 'Record case > Rp. 100 Jt',
                'calculation_type' => 'fire',
                'unit' => 'Case',
            ],

            [
                'code' => '1.9',
                'name' => 'PROPERTY DAMAGE',
                'definition' => 'Record case > Rp. 100 Jt',
                'calculation_type' => 'property_damage',
                'unit' => 'Case',
            ],

            [
                'code' => '1.10',
                'name' => 'SECURITY CASE',
                'definition' => 'Record case',
                'calculation_type' => 'record_case',
                'unit' => 'Case',
            ],

            [
                'code' => '1.11',
                'name' => 'ILLNESS/FATALITY',
                'definition' => 'Record case',
                'calculation_type' => 'record_case',
                'unit' => 'Case',
            ],

            [
                'code' => '1.12',
                'name' => 'REPORTABLE CASE : OPS. INCIDENT / ETA / FAC / NEARMISS',
                'definition' => 'Reportable case',
                'calculation_type' => 'reportable_case',
                'unit' => 'Case',
            ],

        ];

        foreach ($indicators as $indicator) {
            HseIndicator::updateOrCreate(
                ['code' => $indicator['code']],
                $indicator
            );
        }
    }
}