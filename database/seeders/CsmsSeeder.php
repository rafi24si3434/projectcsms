<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CsmsRig;
use App\Models\CsmsDocumentCategory;
use App\Models\CsmsRecord;

class CsmsSeeder extends Seeder
{
    /**
     * Seed the CSMS database with 20 RIGs and 21 Document Categories.
     */
    public function run(): void
    {
        $rigs = [
            'RIG BMS 01'  => 'BMS 01',
            'RIG BMS 02'  => 'BMS 02',
            'RIG BMS 03'  => 'BMS 03',
            'RIG BMS 03A' => 'BMS 03A',
            'RIG BMS 05'  => 'BMS 05',
            'RIG BMS 06'  => 'BMS 06',
            'RIG BMS 07'  => 'BMS 07',
            'RIG BMS 08'  => 'BMS 08',
            'RIG BMS 09'  => 'BMS 09',
            'RIG BMS 10'  => 'BMS 10',
            'RIG BMS 11'  => 'BMS 11',
            'RIG BMS 15'  => 'BMS 15',
            'RIG BMS 16'  => 'BMS 16',
            'RIG BMS 17'  => 'BMS 17',
            'RIG BMS 18'  => 'BMS 18',
            'RIG BMS 19'  => 'BMS 19',
            'RIG BMS 20'  => 'BMS 20',
            'RIG BMS 21'  => 'BMS 21',
            'RIG BMS 22'  => 'BMS 22',
            'RIG BMS 23'  => 'BMS 23',
        ];

        foreach ($rigs as $name => $code) {
            CsmsRig::firstOrCreate(
                ['name' => $name],
                ['code' => $code, 'status' => 'active']
            );
        }

        $categories = [
            [
                'no' => 1,
                'nama_dokumen' => 'Bukti Inspeksi APAR',
                'durasi' => '1x/Bln/Rig',
                'scope' => 'rig',
                'keterangan_default' => null,
            ],
            [
                'no' => 2,
                'nama_dokumen' => 'Bukti Inspeksi Tandu',
                'durasi' => '1x/Bln/Rig',
                'scope' => 'rig',
                'keterangan_default' => null,
            ],
            [
                'no' => 3,
                'nama_dokumen' => 'Bukti Inspeksi Gas Detector',
                'durasi' => '1x/Bln/Rig',
                'scope' => 'rig',
                'keterangan_default' => null,
            ],
            [
                'no' => 4,
                'nama_dokumen' => 'Bukti Inspeksi SCBA',
                'durasi' => '1x/Bln/Rig',
                'scope' => 'rig',
                'keterangan_default' => null,
            ],
            [
                'no' => 5,
                'nama_dokumen' => 'Bukti Inspeksi Eye Wash',
                'durasi' => '1x/Bln/Rig',
                'scope' => 'rig',
                'keterangan_default' => null,
            ],
            [
                'no' => 6,
                'nama_dokumen' => 'Bukti Inspeksi Shower',
                'durasi' => '1x/Bln/Rig',
                'scope' => 'rig',
                'keterangan_default' => null,
            ],
            [
                'no' => 7,
                'nama_dokumen' => 'Bukti Inspeksi Full Body Harness',
                'durasi' => '1x/Bln/Rig',
                'scope' => 'rig',
                'keterangan_default' => null,
            ],
            [
                'no' => 8,
                'nama_dokumen' => 'Bukti Inspeksi APD Crew',
                'durasi' => '1x/Bln/Crew',
                'scope' => 'crew',
                'keterangan_default' => null,
            ],
            [
                'no' => 9,
                'nama_dokumen' => 'Bukti Inspeksi APD Access control',
                'durasi' => '1x/Bln/Rig',
                'scope' => 'rig',
                'keterangan_default' => null,
            ],
            [
                'no' => 10,
                'nama_dokumen' => 'Bukti Pengukuran Fatig manajemen',
                'durasi' => '1x/Bln/Crew',
                'scope' => 'crew',
                'keterangan_default' => null,
            ],
            [
                'no' => 11,
                'nama_dokumen' => '(4.8) Bukti Sosialisasi Penggunaan dan Perawatan APD',
                'durasi' => '1x/bln/Crew',
                'scope' => 'crew',
                'keterangan_default' => null,
            ],
            [
                'no' => 12,
                'nama_dokumen' => 'Bukti Sosialisasi / OST MSDS',
                'durasi' => '1x/bln/Crew',
                'scope' => 'crew',
                'keterangan_default' => null,
            ],
            [
                'no' => 13,
                'nama_dokumen' => 'Pelaksanaan Drill',
                'durasi' => 'Sesuai Program',
                'scope' => 'crew',
                'keterangan_default' => null,
            ],
            [
                'no' => 14,
                'nama_dokumen' => 'Dokumen SSE (Form SSE yg di ttd WOWI)',
                'durasi' => 'Jika ada',
                'scope' => 'rig',
                'keterangan_default' => 'Jika ada',
            ],
            [
                'no' => 15,
                'nama_dokumen' => 'Dokumen SSE (Pemantauan SSE)',
                'durasi' => 'Jika ada',
                'scope' => 'rig',
                'keterangan_default' => 'Jika ada',
            ],
            [
                'no' => 16,
                'nama_dokumen' => 'Dokumen JSA (yang lengkap)--> Sample 1',
                'durasi' => 'N/U & N/D WPF',
                'scope' => 'rig',
                'keterangan_default' => 'N/U & N/D WPF',
            ],
            [
                'no' => 17,
                'nama_dokumen' => 'Implementasi GPTW dan permit khusus--> Sample 1',
                'durasi' => 'Kritikal Job',
                'scope' => 'rig',
                'keterangan_default' => 'Kritikal Job',
            ],
            [
                'no' => 18,
                'nama_dokumen' => 'Implementasi CRSSC--> Sample 1',
                'durasi' => 'Sample / bln',
                'scope' => 'crew',
                'keterangan_default' => 'Sample / bln',
            ],
            [
                'no' => 19,
                'nama_dokumen' => 'Implementasi TGM  (lengkap ttd)--> Sample 1',
                'durasi' => 'Kritikal Job (BOP)',
                'scope' => 'rig',
                'keterangan_default' => 'Kritikal Job (BOP)',
            ],
            [
                'no' => 20,
                'nama_dokumen' => 'Inspeksi DROPS',
                'durasi' => "7 Hari\n30 Hari\n90 Hari & 180 Hari",
                'scope' => 'rig',
                'keterangan_default' => null,
            ],
            [
                'no' => 21,
                'nama_dokumen' => 'Implementasi PJM (lengkap ttd)--> Sample 1',
                'durasi' => 'Kritikal Job (BOP)',
                'scope' => 'rig',
                'keterangan_default' => 'Kritikal Job (BOP)',
            ],
        ];

        foreach ($categories as $cat) {
            CsmsDocumentCategory::firstOrCreate(
                ['no' => $cat['no']],
                [
                    'dept' => 'Dokumen dan Rekaman HSE',
                    'nama_dokumen' => $cat['nama_dokumen'],
                    'durasi' => $cat['durasi'],
                    'scope' => $cat['scope'],
                    'keterangan_default' => $cat['keterangan_default'],
                ]
            );
        }
    }
}
