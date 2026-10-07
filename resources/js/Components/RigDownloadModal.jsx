import React, { useState } from "react";
import {
    Download,
    FolderArchive,
    FileSpreadsheet,
    FileText,
    CheckCircle2,
    X,
    Loader2,
    HardHat,
    Layers,
    Calendar,
    ChevronDown,
    ShieldCheck
} from "lucide-react";

/**
 * RigDownloadModal — Modal khusus Admin untuk mengunduh paket seluruh dokumen & rekaman per-RIG
 *
 * Props:
 *  - isOpen        {boolean}
 *  - onClose       {function}
 *  - rigs          {Array}    List 20 Rig
 *  - selectedRig   {Object}   Rig yang aktif/terpilih saat ini
 *  - selectedYear  {number|string}
 *  - selectedMonth {string}
 */
export default function RigDownloadModal({
    isOpen,
    onClose,
    rigs = [],
    selectedRig = null,
    selectedYear = new Date().getFullYear(),
    selectedMonth = "all",
}) {
    if (!isOpen) return null;

    const [targetRigId, setTargetRigId] = useState(() => selectedRig?.id || rigs[0]?.id || "");
    const [targetYear, setTargetYear] = useState(() => selectedYear || new Date().getFullYear());
    const [targetMonth, setTargetMonth] = useState(() => selectedMonth || "all");
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(false);

    const activeRigObj = rigs.find((r) => String(r.id) === String(targetRigId)) || selectedRig || rigs[0];

    const months = [
        { key: "all", label: "Semua Bulan (1 Tahun Penuh)" },
        { key: "Januari", label: "Januari" },
        { key: "Februari", label: "Februari" },
        { key: "Maret", label: "Maret" },
        { key: "April", label: "April" },
        { key: "Mei", label: "Mei" },
        { key: "Juni", label: "Juni" },
        { key: "Juli", label: "Juli" },
        { key: "Agustus", label: "Agustus" },
        { key: "September", label: "September" },
        { key: "Oktober", label: "Oktober" },
        { key: "November", label: "November" },
        { key: "Desember", label: "Desember" },
    ];

    const currentYear = new Date().getFullYear();
    const availableYears = [
        { key: "all", label: "Semua Tahun Arsip" },
        ...Array.from({ length: 11 }, (_, i) => {
            const y = 2024 + i;
            return { key: String(y), label: `Tahun ${y}` };
        }),
    ];

    const handleStartDownload = () => {
        if (!targetRigId) return;

        setIsDownloading(true);
        setDownloadSuccess(false);

        const params = new URLSearchParams();
        if (targetYear) params.append("year", targetYear);
        if (targetMonth) params.append("month", targetMonth);

        const downloadUrl = `/admin/csms/rigs/${targetRigId}/download-zip?${params.toString()}`;

        // Trigger native browser download with target folder naming
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.setAttribute("download", `CSMS_${activeRigObj?.code || "RIG"}_${targetYear}.zip`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
            setIsDownloading(false);
            setDownloadSuccess(true);
            setTimeout(() => {
                setDownloadSuccess(false);
            }, 5000);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
                
                {/* Top Accent Gradient */}
                <div className="h-1.5 w-full rounded-t-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900" />

                {/* Header */}
                <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/80 shadow-2xs">
                            <FolderArchive size={20} />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider mb-0.5">
                                <ShieldCheck size={11} className="text-emerald-600" />
                                <span>Fitur Khusus Admin</span>
                            </div>
                            <h3 className="text-base font-black text-slate-900 leading-tight">
                                Tarik & Unduh Dokumen Rig (ZIP)
                            </h3>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body Form Controls */}
                <div className="p-6 space-y-4">
                    
                    {/* 1. Pilih Unit RIG */}
                    <div>
                        <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                            Pilih Unit RIG Target
                        </label>
                        <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                <HardHat size={16} />
                            </div>
                            <select
                                value={targetRigId}
                                onChange={(e) => setTargetRigId(e.target.value)}
                                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer appearance-none"
                            >
                                {rigs.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.name} ({r.code})
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                <ChevronDown size={15} />
                            </div>
                        </div>
                    </div>

                    {/* 2. Grid Periode Tahun & Bulan */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Pilihan Tahun */}
                        <div>
                            <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                                Periode Tahun
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                    <Calendar size={14} />
                                </div>
                                <select
                                    value={targetYear}
                                    onChange={(e) => setTargetYear(e.target.value)}
                                    className="w-full pl-9 pr-7 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer appearance-none"
                                >
                                    {availableYears.map((y) => (
                                        <option key={y.key} value={y.key}>
                                            {y.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                    <ChevronDown size={14} />
                                </div>
                            </div>
                        </div>

                        {/* Pilihan Bulan */}
                        <div>
                            <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                                Periode Bulan
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                    <Layers size={14} />
                                </div>
                                <select
                                    value={targetMonth}
                                    onChange={(e) => setTargetMonth(e.target.value)}
                                    className="w-full pl-9 pr-7 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer appearance-none"
                                >
                                    {months.map((m) => (
                                        <option key={m.key} value={m.key}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                    <ChevronDown size={14} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Struktur Paket Berkas ZIP */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <div className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                            <span>Isi Paket Berkas (.ZIP)</span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                                Auto-Structured
                            </span>
                        </div>

                        <div className="text-xs text-slate-600 space-y-1.5">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                                <span>Folder Matriks 21 Kategori CSMS resmi (01. Kebijakan s/d 21. Audit)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                                <span>Seluruh file PDF, gambar, dan lampiran terunggah dari Crew & Rig</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                                <span>File Rekapitulasi Data (Excel-Compatible CSV & Laporan HTML Visual)</span>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-medium text-slate-500">
                            <span>Nama Folder / File:</span>
                            <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                                CSMS_{activeRigObj?.code || "RIG"}_{targetYear}.zip
                            </span>
                        </div>
                    </div>

                    {downloadSuccess && (
                        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                            <span>Arsip dokumen sedang diunduh. Silakan simpan pada folder komputer Anda.</span>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition-all cursor-pointer"
                    >
                        Tutup
                    </button>

                    <button
                        type="button"
                        disabled={isDownloading}
                        onClick={handleStartDownload}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-700/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
                    >
                        {isDownloading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Mengompresi Berkas ZIP...</span>
                            </>
                        ) : (
                            <>
                                <Download size={16} />
                                <span>Unduh Paket Dokumen ({activeRigObj?.code || "RIG"})</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
