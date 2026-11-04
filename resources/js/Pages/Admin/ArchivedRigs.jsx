import React, { useState, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import RigDownloadModal from "@/Components/RigDownloadModal";
import {
    Archive,
    HardDrive,
    Search,
    Eye,
    Download,
    RotateCcw,
    ShieldCheck,
    CheckCircle2,
    Layers,
    FileText,
    TrendingUp,
    Calendar,
    X,
    Activity,
} from "lucide-react";

/**
 * Format tanggal Indonesia: "12 Okt 2026, 14:30"
 */
const formatDateIndo = (dateStr) => {
    if (!dateStr) return "-";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return String(dateStr);
        const day = String(d.getDate()).padStart(2, "0");
        const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, "0");
        const mins = String(d.getMinutes()).padStart(2, "0");
        return `${day} ${month} ${year}, ${hours}:${mins}`;
    } catch {
        return String(dateStr);
    }
};

export default function ArchivedRigs({
    archivedRigs = [],
    totalArchivedRecords = 0,
    avgCompliance = 0,
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [downloadRigTarget, setDownloadRigTarget] = useState(null);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

    const [rigToRestore, setRigToRestore] = useState(null);
    const [isRestoring, setIsRestoring] = useState(false);

    // Filter daftar rig terarsip berdasarkan nama, kode BMS, atau personil HFO
    const filteredRigs = useMemo(() => {
        if (!searchQuery.trim()) return archivedRigs;
        const q = searchQuery.toLowerCase();
        return archivedRigs.filter((rig) => {
            const nameMatch = (rig.name || "").toLowerCase().includes(q);
            const codeMatch = (rig.code || "").toLowerCase().includes(q);
            const hfoMatch = [rig.hfo_1, rig.hfo_2, rig.hfo_3]
                .filter(Boolean)
                .some((h) => h.toLowerCase().includes(q));
            return nameMatch || codeMatch || hfoMatch;
        });
    }, [archivedRigs, searchQuery]);

    // Handle konfirmasi pemulihan/restore status RIG ke aktif
    const handleConfirmRestore = () => {
        if (!rigToRestore) return;
        setIsRestoring(true);

        router.post(`/admin/csms/rigs/${rigToRestore.id}/unarchive`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsRestoring(false);
                setRigToRestore(null);
            },
            onError: () => {
                setIsRestoring(false);
            },
            onFinish: () => {
                setIsRestoring(false);
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Pusat Arsip Unit RIG — CSMS PT Besmindo Materi Sewatama" />

            <div className="p-4 sm:p-6 lg:p-8 max-w-[1560px] mx-auto space-y-6 font-sans text-slate-800">
                {/* ═══════════════════════════════════════════════════════════════
                    1. PORTAL HEADER CARD - PUTIH BERSIH & BERWIBAWA (IDENTIK CSMS STORAGE)
                ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs relative">
                    {/* Garis Aksen K3 Emerald Pekat di bagian atas card */}
                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        {/* Sisi Kiri: Badge, Judul, dan Subjudul */}
                        <div className="space-y-2">
                            {/* Badge Pill Atas */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
                                <Archive size={14} className="text-amber-700" />
                                <span>PUSAT ARSIP &amp; NONAKTIF RIG</span>
                            </div>

                            {/* Judul Utama */}
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                                Pusat Arsip Unit RIG CSMS
                            </h1>

                            {/* Deskripsi Modul */}
                            <p className="text-slate-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
                                Seluruh unit RIG yang dinonaktifkan atau diarsipkan. Seluruh berkas rekaman dokumen K3 tetap aman tersimpan utuh dan dapat ditinjau kapan saja.
                            </p>
                        </div>

                        {/* Sisi Kanan: Tombol Kembali ke CSMS Storage */}
                        <div className="flex items-center gap-3 shrink-0">
                            <Link
                                href="/csms"
                                prefetch="mount"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-semibold border border-slate-200 shadow-2xs transition-all"
                            >
                                <HardDrive size={16} className="text-slate-600" />
                                <span>Kembali ke 20 RIG Aktif</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    2. STANDARISASI GRID 4 KARTU METRIK RINGKASAN (IDENTIK CSMS STORAGE)
                ═══════════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                    {/* Kartu 1: Total RIG Diarsipkan */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                Total RIG Diarsipkan
                            </span>
                            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/70 flex items-center justify-center shrink-0">
                                <Archive size={20} className="text-amber-700" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-1.5">
                                <span>{archivedRigs.length}</span>
                                <span className="text-sm font-semibold text-slate-500">Unit</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 line-clamp-1" title="Unit operasional yang dinonaktifkan sementara">
                                Unit operasional yang dinonaktifkan sementara
                            </p>
                        </div>
                    </div>

                    {/* Kartu 2: Dokumen Tersimpan */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                Dokumen Tersimpan
                            </span>
                            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center justify-center shrink-0">
                                <FileText size={20} className="text-emerald-700" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-1.5">
                                <span>{totalArchivedRecords}</span>
                                <span className="text-sm font-semibold text-slate-500">Berkas</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 line-clamp-1" title="Seluruh arsip K3 tersimpan utuh di storage">
                                Seluruh arsip K3 tersimpan utuh di storage
                            </p>
                        </div>
                    </div>

                    {/* Kartu 3: Kepatuhan Terakhir */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                Kepatuhan Terakhir
                            </span>
                            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/70 flex items-center justify-center shrink-0">
                                <TrendingUp size={20} className="text-blue-700" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-1.5">
                                <span>{avgCompliance}%</span>
                                <span className="text-sm font-semibold text-slate-500">ACC</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 line-clamp-1" title="Rata-rata pemenuhan rekaman sebelum unit diarsipkan">
                                Rata-rata pemenuhan rekaman sebelum diarsipkan
                            </p>
                        </div>
                    </div>

                    {/* Kartu 4: Status Integritas */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                Status Integritas
                            </span>
                            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300/70 flex items-center justify-center shrink-0">
                                <ShieldCheck size={20} className="text-emerald-700" />
                            </div>
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
                                Terlindungi Utuh
                            </div>
                            <p className="text-xs text-slate-400 mt-2 line-clamp-1" title="Audit trail dan riwayat unggahan terjaga aman">
                                Audit trail &amp; riwayat unggahan terjaga aman
                            </p>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    3. KONTEN TABEL DAFTAR ARSIP RIG (CARD PUTIH RAPI)
                ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    {/* Header Kontrol di Atas Tabel */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                        {/* Kotak Pencarian */}
                        <div className="relative flex-1 max-w-md">
                            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama RIG, kode BMS, atau petugas HFO..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-2xs"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        {/* Sisi Kanan: Keterangan Jumlah Data */}
                        <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs font-semibold text-slate-500">
                                Menampilkan <strong className="text-slate-800 font-black">{filteredRigs.length}</strong> dari {archivedRigs.length} unit diarsipkan
                            </span>
                        </div>
                    </div>

                    {/* Isi Tabel atau State Kosong */}
                    {filteredRigs.length === 0 ? (
                        <div className="p-12 text-center space-y-3">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
                                <Archive size={26} />
                            </div>
                            <h3 className="font-bold text-slate-800 text-sm">
                                {archivedRigs.length === 0
                                    ? "Belum ada Unit RIG yang Diarsipkan"
                                    : "Tidak ada unit RIG yang cocok dengan pencarian"}
                            </h3>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                                {archivedRigs.length === 0
                                    ? "Semua unit RIG saat ini berstatus aktif pada operasional CSMS lapangan."
                                    : "Coba gunakan kata kunci pencarian nama atau kode RIG yang lain."}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/90 border-b border-slate-200/90 text-slate-600 font-semibold text-xs tracking-wider uppercase">
                                        <th className="py-3.5 px-4 w-12 text-center">NO</th>
                                        <th className="py-3.5 px-4">UNIT RIG</th>
                                        <th className="py-3.5 px-4">PETUGAS HFO TERAKHIR</th>
                                        <th className="py-3.5 px-4 text-center">TOTAL DOKUMEN</th>
                                        <th className="py-3.5 px-4 text-center">TANGGAL DIARSIPKAN</th>
                                        <th className="py-3.5 px-4 text-center">STATUS</th>
                                        <th className="py-3.5 px-4 text-center w-56">AKSI &amp; PENINJAUAN</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                                    {filteredRigs.map((rig, idx) => {
                                        const hfos = [rig.hfo_1, rig.hfo_2, rig.hfo_3].filter(Boolean);
                                        return (
                                            <tr key={rig.id} className="hover:bg-slate-50/70 transition-colors">
                                                {/* Kolom 1: No */}
                                                <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                                                    {idx + 1}
                                                </td>

                                                {/* Kolom 2: Unit RIG (Nama & Badge Kode BMS) */}
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-black text-slate-800 text-sm">
                                                            {rig.name}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-bold text-[10.5px] uppercase border border-slate-200/80">
                                                            {rig.code}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Kolom 3: Petugas HFO Terakhir */}
                                                <td className="py-3.5 px-4">
                                                    {hfos.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {hfos.map((hfo, i) => (
                                                                <div key={i} className="flex items-center gap-1.5 text-slate-700 font-medium">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                                                    <span className="truncate max-w-[200px]" title={hfo}>
                                                                        {hfo}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 italic text-[11.5px]">
                                                            (Belum terdaftar personil HFO)
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Kolom 4: Total Dokumen */}
                                                <td className="py-3.5 px-4 text-center">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold text-xs">
                                                        {rig.records_count ?? 0} Berkas
                                                    </span>
                                                </td>

                                                {/* Kolom 5: Tanggal Diarsipkan */}
                                                <td className="py-3.5 px-4 text-center">
                                                    <div className="inline-flex items-center gap-1.5 text-slate-600 font-medium text-xs">
                                                        <Calendar size={13} className="text-slate-400 shrink-0" />
                                                        <span>{formatDateIndo(rig.updated_at || rig.created_at)}</span>
                                                    </div>
                                                </td>

                                                {/* Kolom 6: Status */}
                                                <td className="py-3.5 px-4 text-center">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10.5px] font-black uppercase tracking-wider">
                                                        <Archive size={11} className="text-amber-700 shrink-0" />
                                                        <span>DIARSIPKAN</span>
                                                    </span>
                                                </td>

                                                {/* Kolom 7: Aksi */}
                                                <td className="py-3.5 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                                        {/* Tombol Lihat Dokumen */}
                                                        <Link
                                                            href={`/csms/rig/${rig.id}`}
                                                            title="Buka dan tinjau seluruh dokumen CSMS unit RIG ini"
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white font-bold text-xs bg-emerald-600 hover:bg-emerald-700 shadow-2xs hover:shadow-xs transition-all"
                                                        >
                                                            <Eye size={13} />
                                                            <span>Lihat Dokumen</span>
                                                        </Link>

                                                        {/* Tombol Unduh ZIP */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setDownloadRigTarget(rig);
                                                                setIsDownloadModalOpen(true);
                                                            }}
                                                            title="Unduh seluruh paket berkas arsip unit RIG ini (ZIP)"
                                                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                                                        >
                                                            <Download size={14} />
                                                        </button>

                                                        {/* Tombol Pulihkan Unit */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setRigToRestore(rig)}
                                                            title="Pulihkan kembali unit RIG ini ke operasional aktif"
                                                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                                                        >
                                                            <RotateCcw size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Unduh ZIP untuk Unit Terarsip */}
            <RigDownloadModal
                isOpen={isDownloadModalOpen}
                onClose={() => setIsDownloadModalOpen(false)}
                rigs={archivedRigs}
                selectedRig={downloadRigTarget || archivedRigs?.[0]}
                selectedYear={new Date().getFullYear()}
                selectedMonth="Januari"
            />

            {/* Modal Konfirmasi Pulihkan RIG */}
            {rigToRestore && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3.5 border border-emerald-200 shadow-2xs">
                            <RotateCcw size={24} />
                        </div>
                        <h3 className="text-base font-black text-slate-800 mb-1">
                            Pulihkan Unit RIG?
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4">
                            Unit <strong className="text-slate-800 font-bold">"{rigToRestore.name}" ({rigToRestore.code})</strong> akan diaktifkan kembali ke daftar operasional CSMS 20 RIG.
                        </p>

                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-left text-[11.5px] text-emerald-800 leading-relaxed mb-5">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                <span>
                                    Akun login kru operasional untuk RIG ini akan diaktifkan kembali dan dapat digunakan seperti biasa.
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-2.5">
                            <button
                                type="button"
                                disabled={isRestoring}
                                onClick={() => setRigToRestore(null)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isRestoring}
                                onClick={handleConfirmRestore}
                                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-md"
                            >
                                {isRestoring ? (
                                    <span>Memulihkan...</span>
                                ) : (
                                    <>
                                        <RotateCcw size={14} />
                                        <span>Ya, Pulihkan Unit</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
