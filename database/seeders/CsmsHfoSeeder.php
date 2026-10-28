<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CsmsRig;

class CsmsHfoSeeder extends Seeder
{
    /**
     * Seed initial HFO (Health & Safety Field Officer) personnel for each RIG.
     */
    public function run(): void
    {
        $hfoData = [
            'BMS 01'  => ['AHMAD RIZKI', 'DWI PRASETYO', 'FAJAR SIDIK'],
            'BMS 02'  => ['ANDI KURNIAWAN S', 'ROMANIK', 'M. AKBAR'],
            'BMS 03'  => ['INSANUL ARIF', 'RAHMAD S', 'RIKI HARIYONO'],
            'BMS 03A' => ['KOESTRIANDI', 'ROY SUHENDRA', 'HAVIZ SATRIA'],
            'BMS 05'  => ['HENDRA', 'TOTOK H', 'M. QODAFI'],
            'BMS 06'  => ['OKY KEVIN S', 'TOPAN MANORA', 'WAHID HAIKAL F'],
            'BMS 07'  => ['APRIADI S', 'M.FAKHRI W', 'SULAIMAN'],
            'BMS 08'  => ['M. ANJAR A', 'GEMARA FITRAH DIMAS', 'WISNU N'],
            'BMS 10'  => ['ARIF ILYAS', 'YUDI', 'FIRDAUS'],
            'BMS 11'  => ['ARDI F', 'NUGRAHA', 'ANTONY'],
            'BMS 15'  => ['RIKO ANDRIAN', 'RICARDO N', 'REVY EIDY'],
            'BMS 16'  => ['ANUGRAH BIMA', 'FAUZAN', 'FADLY'],
            'BMS 17'  => ['ANDRI NUGROHO', 'M. ARIF', 'M. ILHAM S'],
            'BMS 18'  => ['DONY HANDRI S', 'IMRON IMAM B', 'ANTONIUS T'],
            'BMS 19'  => ['QOMARUDIN', 'NOFRI', 'FAUZI'],
            'BMS 20'  => ['M. GALANG', 'HARTONO', 'NOFFRI MUKRIZ'],
            'BMS 21'  => ['IQBAL FIRNANDA', 'HAMDAN', 'KHAIRUL M'],
        ];

        foreach ($hfoData as $code => $officers) {
            // Cocokkan baik 'BMS 02' maupun 'BMS-02'
            $rig = CsmsRig::where('code', $code)
                ->orWhere('code', str_replace(' ', '-', $code))
                ->first();

            if ($rig) {
                $rig->update([
                    'hfo_1' => $officers[0] ?? null,
                    'hfo_2' => $officers[1] ?? null,
                    'hfo_3' => $officers[2] ?? null,
                ]);
            }
        }
    }
}
