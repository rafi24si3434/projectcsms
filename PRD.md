# Product Requirements Document (PRD)

## 1. Project Overview
**Nama Proyek:** Project CSMS & HSE Reporting System
**Deskripsi:** Aplikasi manajemen keselamatan kerja yang terdiri dari dua modul utama: Contractor Safety Management System (CSMS) untuk pelacakan dan penyimpanan dokumen terkait rig, dan Health, Safety, and Environment (HSE) Reporting System untuk pengumpulan, perhitungan, dan persetujuan (approval) laporan kinerja K3 (Kesehatan dan Keselamatan Kerja).
**Teknologi:** Laravel 13, React 19 (Inertia.js), Tailwind CSS v4, MySQL/SQLite.

## 2. Tujuan (Goals & Objectives)
- Menyediakan platform terpusat untuk menyimpan dan melacak kepatuhan dokumen CSMS pada berbagai Rig.
- Mendemokratisasi pelaporan HSE dengan metrik seperti Man Hours, Lagging Indicators, dan Leading Indicators.
- Menstandarkan alur persetujuan (approval workflow) laporan HSE dari level user/creator hingga disetujui (approved) oleh administrator.

## 3. Target Pengguna (User Personas)
1. **User (Crew/Karyawan Lapangan):**
   - Bertugas menginput data HSE bulanan (Man Hours, Lagging & Leading indicators).
   - Mengunggah dokumen/rekaman CSMS untuk Rig terkait.
2. **Admin (HSE Manager/Administrator):**
   - Menyetujui atau menolak (approve/reject) laporan HSE yang diajukan.
   - Mengelola master data User.
   - Memantau Dashboard HSE, KPI Per Rig, dan Performance secara keseluruhan.

## 4. Fitur Utama (Core Features)

### 4.1 Modul Autentikasi & Manajemen Pengguna
- **Login, Register & Logout** menggunakan email/password.
- **Forgot & Reset Password** via email.
- **Role-Based Access Control (RBAC):** Pemisahan hak akses antara `admin` dan `user`.
- **Manajemen User (Admin):** CRUD pengguna, dan pengaktifan/penonaktifan status user.

### 4.2 Modul CSMS (Contractor Safety Management System)
- **Dashboard CSMS:** Memantau ringkasan kelengkapan dokumen per rig.
- **Manajemen Rig & Kategori Dokumen:** Tersedia untuk 20 Rigs, lengkap dengan berbagai kategori departemen (HSE).
- **Pengelolaan Rekaman (Records):** 
  - Mengunggah file PDF/Excel (rekaman bulanan).
  - Melacak status kelengkapan dokumen (Lengkap, Tidak Ada, Pending, In Progress) berdasarkan Periode (Bulan/Tahun) dan Kru.

### 4.3 Modul Pelaporan HSE (Health, Safety, and Environment)
- **Form Input Laporan HSE:**
  - Input **Identifikasi:** Tanggal pelaporan, No Kontrak, No Rig, Periode Kerja, Distrik Lokasi.
  - Input **Man Hours (Jam Kerja) & Jarak Tempuh (Kilometer):** Plan & Actual, Premises & Non-Premises.
  - Input **Lagging Indicators:** Otomatis menghitung *Frequency Rate* (FR) & *Motor Vehicle Crash Frequency Rate* (MVC FR) sesuai rumus standar. Termasuk pencatatan Recordable Case.
  - Input **Leading Indicators:** Perencanaan dan aktualisasi program K3.
- **Alur Persetujuan (Approval Workflow):**
  - Laporan yang di-submit masuk ke status `pending`.
  - Sistem mengirimkan email persetujuan (approval) berisikan token ke Admin.
  - Admin dapat melakukan klik Approve / Reject langsung via link email atau melalui Dashboard Admin.
- **Dashboard & Laporan (Admin):**
  - **Plan Report & Actual Report:** Analisis antara rencana kerja HSE dan realisasi.
  - **KPI Per Rig:** Pemantauan KPI HSE spesifik untuk setiap Rig (mencakup Q1 hingga Q4).
  - **HSE Performance:** Tinjauan kinerja keseluruhan dari lagging dan leading indicators.

## 5. Struktur Database & Model Data (Entity Relationship)
- `users`: Data otentikasi dan peran (roles).
- **CSMS Tables:**
  - `csms_rigs`: Master data nama dan kode Rig.
  - `csms_document_categories`: Master kategori/jenis dokumen wajib per rig/kru.
  - `csms_records`: Data rekapitulasi dan file unggahan dokumen berdasarkan rig dan periode.
- **HSE Tables:**
  - `hse_reports`: Header laporan bulanan (No Rig, Periode, Status, dll).
  - `hse_man_hours`: Detail jumlah jam kerja, jumlah kendaraan, kilometer (terkait ke `hse_reports`).
  - `hse_lagging_indicators`: Metrik insiden (kasus cedera, MVC, tumpahan minyak, dll). Menyimpan plan, actual, frequency rate.
  - `hse_leading_indicators`: Metrik preventif (inspeksi, meeting, observasi bahaya).
  - *(Tabel pendukung kinerja seperti `hse_performances`, `hse_indicators`, dll)*.

## 6. Non-Functional Requirements
- **Security:** CSRF Protection, autentikasi terenkripsi, Middleware pembatasan role.
- **Performance:** Penggunaan Inertia.js untuk perpindahan halaman tanpa reload penuh (SPA experience).
- **Usability:** Desain responsif menggunakan Tailwind CSS dan antarmuka interaktif yang diperkaya dengan komponen React (Lucide icons).

## 7. Status Pengembangan Saat Ini
- Struktur database (Migrations) untuk modul CSMS dan HSE sudah diimplementasikan.
- Routing untuk CSMS, Admin Users, dan Settings telah tersedia.
- Backend Logic (Controller) untuk mengalkulasi dan menyimpan laporan HSE (Termasuk auto-calculating FR dan MVC FR) beserta alur email approval telah ditulis dalam `HseReportController`.
- Frontend dependencies (React, Inertia, Tailwind) sudah terinstal dan terkonfigurasi.
