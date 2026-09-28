<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Admin HSE Notification Email
    |--------------------------------------------------------------------------
    |
    | Alamat email admin yang menerima notifikasi dan tautan permohonan approval
    | saat user / field PIC melakukan submit data HSE dari lapangan.
    | Anda dapat mengubahnya sewaktu-waktu di file .env melalui key ADMIN_HSE_EMAIL.
    |
    */
    'admin_email' => env('ADMIN_HSE_EMAIL', 'admin@besmindo.com'),
];
