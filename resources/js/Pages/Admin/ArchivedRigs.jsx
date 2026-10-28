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
    AlertCircle,
    CheckCircle2,
    HardHat,
    Layers,
    FileSpreadsheet,
    FileText,
} from "lucide-react";

export default function ArchivedRigs({ archivedRigs = [], totalArchivedRecords = 0 }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [downloadRigTarget, setDownloadRigTarget] = useState(null);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

    const [rigToRestore, setRigToRestore] = useState(null);
    const [isRestoring, setIsRestoring] = useState(false);

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

            <div className="space-y-6">
                {/* ── HEADER BANNER ── */}
                <div
                    className="relative overflow-hidden rounded-2xl p-6 sm:p-7 text-white shadow-lg"
                    style={{
                        background: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #0f172a 100%)",
                    }}
                >
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wider uppercase">
                                <Archive size={14} className="text-emerald-400" />
                                <span>Pusat Arsip &amp; Nonaktif RIG</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                Pusat Arsip Unit RIG CSMS
                            </h1>
                            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl font-medium leading-relaxed">
                                Seluruh unit RIG yang dinonaktifkan atau diarsipkan. Sesuai kebijakan keselamatan kerja CSMS, seluruh berkas rekaman dokumen K3 <strong>tetap aman tersimpan utuh</strong> dan dapat ditinjau kapan saja.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <Link
                                href="/csms"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-sm border border-white/15 transition-all shadow-xs"
                            >
                                <HardDrive size={15} />
                                <span>Kembali ke 20 RIG Aktif</span>
                            </Link>
                        </div>
                    </div>

                    {/* Background Subtle Accent */}
                    <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                </div>

                {/* ── BENTO STATS CARDS ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                            <Archive size={22} />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-slate-800 leading-tight">
                                {archivedRigs.length} Unit
                            </div>
                            <div className="text-xs font-semibold text-slate-500 mt-0.5">
                                Total RIG Diarsipkan
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                            <FileText size={22} />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-slate-800 leading-tight">
                                {totalArchivedRecords} Berkas
                            </div>
                            <div className="text-xs font-semibold text-slate-500 mt-0.5">
                                Dokumen K3 Tersimpan Aman
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                            <ShieldCheck size={22} />
                        </div>
                        <div>
                            <div className="text-sm font-black text-slate-800 leading-tight">
                                Terlindungi Utuh
                            </div>
                            <div className="text-xs font-semibold text-slate-500 mt-0.5">
                                Berkas &amp; Audit Trail Terjaga
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── SEARCH & TABLE CONTAINER ── */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama RIG, kode, atau personil HFO..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                            />
                        </div>

                        <div className="text-xs font-bold text-slate-500">
                            Menampilkan <span className="text-slate-800 font-black">{filteredRigs.length}</span> dari {archivedRigs.length} unit
                        </div>
                    </div>

                    {filteredRigs.length === 0 ? (
                        <div className="p-12 text-center space-y-3">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
                                <Archive size={26} />
                            </div>
                            <h3 className="font-bold text-slate-700 text-sm">
                                {archivedRigs.length === 0
                                    ? "Belum ada Unit RIG yang Diarsipkan"
                                    : "Tidak ada unit RIG yang cocok dengan pencarian"}
                            </h3>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                {archivedRigs.length === 0
                                    ? "Semua 20 unit RIG saat ini berstatus aktif pada operasional CSMS lapangan."
                                    : "Coba gunakan kata kunci pencarian nama atau kode RIG yang lain."}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
                                        <th className="py-3.5 px-4 w-12 text-center">No</th>
                                        <th className="py-3.5 px-4">Unit RIG</th>
                                        <th className="py-3.5 px-4">Petugas HFO Terdaftar</th>
                                        <th className="py-3.5 px-4 text-center">Dokumen Tersimpan</th>
                                        <th className="py-3.5 px-4 text-center">Status</th>
                                        <th className="py-3.5 px-4 text-center w-56">Aksi &amp; Peninjauan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {filteredRigs.map((rig, idx) => {
                                        const hfos = [rig.hfo_1, rig.hfo_2, rig.hfo_3].filter(Boolean);
                                        return (
                                            <tr key={rig.id} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                                                    {idx + 1}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="font-black text-slate-800 text-sm">
                                                        {rig.name}
                                                    </div>
                                                    <div className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono font-bold text-[10px] mt-0.5 uppercase">
                                                        {rig.code}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    {hfos.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {hfos.map((hfo, i) => (
                                                                <div key={i} className="flex items-center gap-1.5 text-slate-700 font-medium">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                                    <span>HFO {i + 1}: <strong>{hfo}</strong></span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 italic font-medium">
                                                            (Belum terdaftar personil HFO)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                                                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold text-xs">
                                                        {rig.records_count ?? 0} Berkas
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10.5px] font-black uppercase tracking-wider">
                                                        <Archive size={11} />
                                                        <span>Diarsipkan</span>
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                                        {/* Tombol Lihat Dokumen */}
                                                        <Link
                                                            href={`/csms/rig/${rig.id}`}
                                                            title="Buka dan periksa seluruh dokumen CSMS RIG ini"
                                                            style={{ background: "linear-gradient(135deg, #22c55e 0%, #059669 45%, #064e3b 100%)" }}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white font-bold text-[11px] shadow-2xs hover:brightness-105 transition-all"
                                                        >
                                                            <Eye size={12} />
                                                            <span>Lihat Dokumen</span>
                                                        </Link>

                                                        {/* Tombol Unduh ZIP */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setDownloadRigTarget(rig);
                                                                setIsDownloadModalOpen(true);
                                                            }}
                                                            title="Unduh seluruh berkas ZIP unit rig ini"
                                                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                                        >
                                                            <Download size={13} />
                                                        </button>

                                                        {/* Tombol Pulihkan Unit */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setRigToRestore(rig)}
                                                            title="Pulihkan kembali unit RIG ini ke daftar aktif operasional"
                                                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                                                        >
                                                            <RotateCcw size={13} />
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
                                style={{ background: "linear-gradient(135deg, #22c55e 0%, #059669 45%, #064e3b 100%)" }}
                                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-md"
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
