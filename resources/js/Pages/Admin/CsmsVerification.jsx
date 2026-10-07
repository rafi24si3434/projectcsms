import React, { useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import YearSelect from "@/Components/YearSelect";
import RigDownloadModal from "@/Components/RigDownloadModal";
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    Eye,
    ShieldCheck,
    Search,
    Filter,
    FileText,
    HardDrive,
    HardHat,
    Calendar,
    ChevronRight,
    X,
    MessageSquare,
    ExternalLink,
    Check,
    RotateCcw,
    FileSpreadsheet,
    Download,
} from "lucide-react";

export default function CsmsVerification({ records = [], rigs = [], categories = [], filter = {}, stats = {}, availableYears = [] }) {
    const [selectedMonth, setSelectedMonth] = useState(filter.bulan || "Januari");
    const [selectedYear, setSelectedYear] = useState(filter.tahun || availableYears?.[0] || new Date().getFullYear());

    React.useEffect(() => {
        if (filter.tahun) {
            setSelectedYear(filter.tahun);
        }
    }, [filter.tahun]);
    const [selectedRigId, setSelectedRigId] = useState(filter.rig_id || "");
    const [selectedStatus, setSelectedStatus] = useState(filter.status || "all");
    const [searchQuery, setSearchQuery] = useState("");

    // Preview File Modal State
    const [previewRecord, setPreviewRecord] = useState(null);

    // Approval / Review Action Modal State
    const [actionModal, setActionModal] = useState({
        isOpen: false,
        record: null,
        targetStatus: "approved", // 'approved' | 'revision' | 'rejected'
    });

    // Bulk selection state
    const [selectedIds, setSelectedIds] = useState([]);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];


    const { data, setData, post, processing, reset } = useForm({
        approval_status: "approved",
        approval_notes: "",
    });

    const handleFilterApply = (month, year, rigId, status) => {
        router.get(
            '/admin/csms/verification',
            {
                bulan: month,
                tahun: year,
                rig_id: rigId || undefined,
                status: status === "all" ? undefined : status,
            },
            { preserveState: true, replace: true }
        );
    };

    const openReviewModal = (record, targetStatus) => {
        setActionModal({
            isOpen: true,
            record: record,
            targetStatus: targetStatus,
        });
        setData({
            approval_status: targetStatus,
            approval_notes: record.approval_notes || "",
        });
    };

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        if (!actionModal.record) return;

        post(`/admin/csms/verify/${actionModal.record.id}`, {
            onSuccess: () => {
                setActionModal({ isOpen: false, record: null, targetStatus: "approved" });
                reset();
            },
        });
    };

    // Bulk ACC
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(filteredRecords.map(r => r.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkApprove = () => {
        if (selectedIds.length === 0) return;
        if (confirm(`Apakah Anda yakin ingin menyetujui (ACC) ${selectedIds.length} dokumen CSMS sekaligus?`)) {
            router.post('/admin/csms/verify-bulk', {
                record_ids: selectedIds,
                approval_status: 'approved',
            }, {
                onSuccess: () => setSelectedIds([]),
            });
        }
    };

    // Client search filter
    const filteredRecords = records.filter(rec => {
        const q = searchQuery.toLowerCase();
        const rigMatch = rec.rig?.name?.toLowerCase().includes(q) || rec.rig?.code?.toLowerCase().includes(q);
        const catMatch = rec.category?.nama_dokumen?.toLowerCase().includes(q);
        const fileMatch = rec.file_name?.toLowerCase().includes(q);
        return rigMatch || catMatch || fileMatch;
    });

    return (
        <AdminLayout>
            <Head title="Verifikasi & ACC Dokumen CSMS - Admin HSE" />

            {/* SAFETY HAZARD ACCENT STRIPE */}
            <div
                className="w-full h-1.5 shrink-0"
                style={{
                    background:
                        "repeating-linear-gradient(45deg, #f59e0b, #f59e0b 16px, #1e293b 16px, #1e293b 32px)",
                }}
            />

            <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-7 font-sans bg-[#f8fafc] text-slate-800">
                
                {/* ═══════════════════════════════════════════════════════════════
                    1. HEADER CARD (ADMIN VERIFIKASI CSMS)
                ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs relative">
                    {/* Garis Aksen K3 Emerald Pekat di bagian atas card */}
                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900" />

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                                <ShieldCheck size={14} className="text-emerald-600" />
                                <span>Pusat Evaluasi & Verifikasi K3</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                                Verifikasi & ACC Dokumen CSMS (20 RIG)
                            </h1>
                            <p className="text-slate-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
                                Evaluasi kelayakan berkas per unit Rig, periksa isi lampiran, dan berikan persetujuan resmi (ACC) atau instruksi revisi dokumen HSE.
                            </p>
                        </div>

                        {/* Periode & Rig Selectors */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Filter Unit Rig */}
                            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 shadow-2xs">
                                <span className="text-xs font-bold text-slate-500 mr-2">RIG:</span>
                                <select
                                    value={selectedRigId}
                                    onChange={(e) => {
                                        setSelectedRigId(e.target.value);
                                        handleFilterApply(selectedMonth, selectedYear, e.target.value, selectedStatus);
                                    }}
                                    className="bg-transparent text-slate-800 text-xs sm:text-sm font-bold cursor-pointer border-none focus:ring-0 py-1 pl-1 pr-6 focus:outline-none"
                                >
                                    <option value="">Semua Unit RIG (20 Unit)</option>
                                    {rigs.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.name} ({r.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filter Periode */}
                            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1.5 shadow-2xs">
                                <div className="flex items-center pl-2 pr-1 text-emerald-600">
                                    <Calendar size={15} />
                                </div>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => {
                                        setSelectedMonth(e.target.value);
                                        handleFilterApply(e.target.value, selectedYear, selectedRigId, selectedStatus);
                                    }}
                                    className="bg-transparent text-slate-700 text-xs sm:text-sm font-bold cursor-pointer border-none focus:ring-0 py-1 pl-1 pr-6 focus:outline-none"
                                >
                                    {months.map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                                <span className="text-slate-300">/</span>
                                <YearSelect
                                    value={selectedYear}
                                    onChange={(year) => {
                                        setSelectedYear(year);
                                        handleFilterApply(selectedMonth, year, selectedRigId, selectedStatus);
                                    }}
                                    availableYears={availableYears}
                                    className="bg-transparent text-slate-700 text-xs sm:text-sm font-bold cursor-pointer border-none focus:ring-0 py-1 pl-1 pr-6 focus:outline-none"
                                    optionClass="bg-white text-slate-800"
                                />
                            </div>

                            {/* Tombol Unduh Dokumen Rig (ZIP) */}
                            <button
                                type="button"
                                onClick={() => setIsDownloadModalOpen(true)}
                                className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3.5 py-2.5 rounded-xl border border-emerald-300 text-xs sm:text-sm transition-all cursor-pointer shadow-2xs"
                                title="Tarik dan Unduh Seluruh Dokumen Rig (ZIP)"
                            >
                                <Download size={16} className="text-emerald-700" />
                                <span>Unduh Paket Rig (ZIP)</span>
                            </button>

                            {/* Tombol Input Lapangan */}
                            <Link
                                href="/csms/input-rig"
                                className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm transition-all"
                            >
                                <FileSpreadsheet size={16} />
                                <span>Buka Form Input Rig</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    2. SUMMARY CARDS VERIFIKASI (KPI STATUS)
                ═══════════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    {/* Total Berkas Masuk */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                            <FileText size={22} />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Berkas Terdaftar</span>
                            <h3 className="text-2xl font-black text-slate-800">
                                {stats.total || 0} <span className="text-xs font-semibold text-slate-500">Berkas</span>
                            </h3>
                        </div>
                    </div>

                    {/* Menunggu ACC (Pending) */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                            <Clock size={22} />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Menunggu ACC / Review</span>
                            <h3 className="text-2xl font-black text-slate-800">
                                {stats.pending || 0} <span className="text-xs font-semibold text-amber-600">Perlu Dicek</span>
                            </h3>
                        </div>
                    </div>

                    {/* Sudah Di-ACC (Approved) */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                            <CheckCircle2 size={22} />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Disetujui (ACC Sah)</span>
                            <h3 className="text-2xl font-black text-slate-800">
                                {stats.approved || 0} <span className="text-xs font-semibold text-emerald-600">Lengkap</span>
                            </h3>
                        </div>
                    </div>

                    {/* Perlu Revisi / Ditolak */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                            <AlertCircle size={22} />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">Perlu Revisi / Ditolak</span>
                            <h3 className="text-2xl font-black text-slate-800">
                                {(stats.revision || 0) + (stats.rejected || 0)} <span className="text-xs font-semibold text-red-600">Dikembalikan</span>
                            </h3>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    3. DAFTAR DOKUMEN & TABEL VERIFIKASI ACC
                ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    
                    {/* Table Control Header */}
                    <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Status Tabs */}
                        <div className="inline-flex p-1 rounded-xl bg-white border border-slate-200 text-xs font-semibold shadow-2xs">
                            <button
                                onClick={() => {
                                    setSelectedStatus("all");
                                    handleFilterApply(selectedMonth, selectedYear, selectedRigId, "all");
                                }}
                                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                    selectedStatus === "all"
                                        ? "bg-slate-800 text-white font-bold"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                Semua ({stats.total || 0})
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedStatus("pending");
                                    handleFilterApply(selectedMonth, selectedYear, selectedRigId, "pending");
                                }}
                                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                    selectedStatus === "pending"
                                        ? "bg-amber-500 text-white font-bold"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                Menunggu ACC ({stats.pending || 0})
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedStatus("approved");
                                    handleFilterApply(selectedMonth, selectedYear, selectedRigId, "approved");
                                }}
                                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                    selectedStatus === "approved"
                                        ? "bg-emerald-600 text-white font-bold"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                Sudah Di-ACC ({stats.approved || 0})
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedStatus("revision");
                                    handleFilterApply(selectedMonth, selectedYear, selectedRigId, "revision");
                                }}
                                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                    selectedStatus === "revision"
                                        ? "bg-red-600 text-white font-bold"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                Perlu Revisi ({stats.revision || 0})
                            </button>
                        </div>

                        {/* Search & Bulk Action Button */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari Rig / Kategori / Berkas..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 shadow-2xs w-60 placeholder-slate-400"
                                />
                            </div>

                            {selectedIds.length > 0 && (
                                <button
                                    onClick={handleBulkApprove}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                                >
                                    <Check size={14} />
                                    <span>ACC ({selectedIds.length}) Sekaligus</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="p-3.5 w-10 text-center">
                                        <input
                                            type="checkbox"
                                            checked={filteredRecords.length > 0 && selectedIds.length === filteredRecords.length}
                                            onChange={handleSelectAll}
                                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                        />
                                    </th>
                                    <th className="p-3.5">Unit RIG & Crew</th>
                                    <th className="p-3.5">Kategori Dokumen CSMS</th>
                                    <th className="p-3.5">Lampiran Berkas</th>
                                    <th className="p-3.5">Status ACC / Verifikasi</th>
                                    <th className="p-3.5">Catatan Evaluasi K3</th>
                                    <th className="p-3.5 text-center">Keputusan Admin</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="p-10 text-center text-slate-400">
                                            <FileText size={32} className="mx-auto mb-2 opacity-40" />
                                            <p className="font-bold text-slate-700 text-sm">Tidak ada berkas yang perlu diverifikasi pada kriteria ini.</p>
                                            <p className="text-xs text-slate-400 mt-1">Gunakan filter status atau periode lain untuk melihat berkas.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map((rec) => {
                                        const isApproved = rec.approval_status === "approved";
                                        const isRevision = rec.approval_status === "revision" || rec.approval_status === "rejected";
                                        const isPending = !isApproved && !isRevision;

                                        return (
                                            <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                                                {/* Checkbox */}
                                                <td className="p-3.5 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(rec.id)}
                                                        onChange={() => handleSelectOne(rec.id)}
                                                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                                    />
                                                </td>

                                                {/* Rig & Crew */}
                                                <td className="p-3.5">
                                                    <div className="font-bold text-slate-800 text-sm">{rec.rig?.name || '-'}</div>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold border border-slate-200">
                                                            {rec.rig?.code}
                                                        </span>
                                                        <span className="text-[11px] text-slate-500 font-medium">
                                                            • {rec.crew || 'Seluruh Rig'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Kategori Dokumen */}
                                                <td className="p-3.5 max-w-[240px]">
                                                    <div className="font-bold text-slate-800">
                                                        <span className="text-slate-400 mr-1">{rec.category?.no}.</span>
                                                        <span>{rec.category?.nama_dokumen}</span>
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                                                        Durasi: {rec.category?.durasi}
                                                    </div>
                                                </td>

                                                {/* Berkas Lampiran */}
                                                <td className="p-3.5">
                                                    {rec.file_path ? (
                                                        <div className="space-y-1">
                                                            <button
                                                                onClick={() => setPreviewRecord(rec)}
                                                                className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer max-w-[180px] truncate"
                                                                title="Klik untuk Pratinjau Berkas"
                                                            >
                                                                <Eye size={13} className="shrink-0" />
                                                                <span className="truncate">{rec.file_name}</span>
                                                            </button>
                                                            <div className="text-[10px] text-slate-400 font-mono">
                                                                {rec.file_size ? `${Math.round(rec.file_size / 1024)} KB` : ''} ({rec.file_type?.toUpperCase() || 'FILE'})
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 italic">Tanpa Berkas</span>
                                                    )}
                                                </td>

                                                {/* Status Approval */}
                                                <td className="p-3.5">
                                                    {isApproved && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <CheckCircle2 size={12} />
                                                            <span>DI-ACC SAH</span>
                                                        </span>
                                                    )}
                                                    {isRevision && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                                                            <RotateCcw size={12} />
                                                            <span>PERLU REVISI</span>
                                                        </span>
                                                    )}
                                                    {isPending && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                            <Clock size={12} />
                                                            <span>MENUNGGU ACC</span>
                                                        </span>
                                                    )}
                                                    {rec.approved_by && (
                                                        <div className="text-[10px] text-slate-400 mt-1">
                                                            Oleh: {rec.approved_by}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Catatan Evaluasi Admin */}
                                                <td className="p-3.5 max-w-[200px]">
                                                    {rec.approval_notes ? (
                                                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-[11px] leading-relaxed">
                                                            "{rec.approval_notes}"
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 italic text-[11px]">- Belum ada catatan -</span>
                                                    )}
                                                </td>

                                                {/* Keputusan Admin (ACC / Tolak) */}
                                                <td className="p-3.5 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        {/* Pratinjau Cepat */}
                                                        {rec.file_path && (
                                                            <button
                                                                onClick={() => setPreviewRecord(rec)}
                                                                className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                                                                title="Lihat Dokumen"
                                                            >
                                                                <Eye size={15} />
                                                            </button>
                                                        )}

                                                        {/* Tombol ACC Hijau */}
                                                        <button
                                                            onClick={() => openReviewModal(rec, "approved")}
                                                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                                                isApproved
                                                                    ? "bg-emerald-100 text-emerald-800 cursor-default"
                                                                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                                                            }`}
                                                            title="Beri ACC / Persetujuan"
                                                        >
                                                            <Check size={13} />
                                                            <span>ACC</span>
                                                        </button>

                                                        {/* Tombol Minta Revisi */}
                                                        <button
                                                            onClick={() => openReviewModal(rec, "revision")}
                                                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-all flex items-center gap-1 cursor-pointer"
                                                            title="Minta Revisi atau Tolak"
                                                        >
                                                            <MessageSquare size={13} />
                                                            <span>Revisi</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                MODAL 1: PRATINJAU BERKAS (FILE PREVIEW MODAL)
            ═══════════════════════════════════════════════════════════════ */}
            {previewRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Header Modal */}
                        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                                    {previewRecord.rig?.name} ({previewRecord.crew || 'Rig'}) • {previewRecord.category?.nama_dokumen}
                                </span>
                                <h3 className="text-base font-black text-slate-800 truncate max-w-xl">
                                    {previewRecord.file_name}
                                </h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={`/storage/${previewRecord.file_path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                                >
                                    <ExternalLink size={13} />
                                    <span>Buka di Tab Baru</span>
                                </a>
                                <button
                                    onClick={() => setPreviewRecord(null)}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Viewer Body */}
                        <div className="flex-1 bg-slate-100 p-2 overflow-hidden flex items-center justify-center">
                            {previewRecord.file_type === 'pdf' ? (
                                <iframe
                                    src={`/storage/${previewRecord.file_path}#toolbar=1`}
                                    title="PDF Preview"
                                    className="w-full h-full rounded-lg border border-slate-200 bg-white"
                                />
                            ) : ['jpg', 'jpeg', 'png'].includes(previewRecord.file_type?.toLowerCase()) ? (
                                <div className="max-h-full overflow-auto p-4 flex items-center justify-center">
                                    <img
                                        src={`/storage/${previewRecord.file_path}`}
                                        alt={previewRecord.file_name}
                                        className="max-h-[70vh] max-w-full rounded-lg shadow-md object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-md">
                                    <FileText size={48} className="mx-auto text-emerald-600 mb-3" />
                                    <h4 className="font-bold text-slate-800 text-sm">Dokumen Format Office / Non-Visual</h4>
                                    <p className="text-xs text-slate-500 mt-1 mb-4">
                                        Berkas bertipe <strong>.{previewRecord.file_type}</strong> tidak mendukung pratinjau langsung di dalam browser. Silakan unduh untuk memeriksa isi berkas.
                                    </p>
                                    <a
                                        href={`/storage/${previewRecord.file_path}`}
                                        download={previewRecord.file_name}
                                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-all"
                                    >
                                        <Download size={14} />
                                        <span>Unduh Berkas Sekarang</span>
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Footer Decision Bar */}
                        <div className="p-3 border-t border-slate-200 bg-white flex items-center justify-between">
                            <div className="text-xs text-slate-500">
                                Periode: <strong>{previewRecord.periode_bulan} {previewRecord.periode_tahun}</strong> • Status saat ini: <strong>{previewRecord.approval_status?.toUpperCase() || 'PENDING'}</strong>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        const r = previewRecord;
                                        setPreviewRecord(null);
                                        openReviewModal(r, "revision");
                                    }}
                                    className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition-all"
                                >
                                    Tolak / Minta Revisi
                                </button>
                                <button
                                    onClick={() => {
                                        const r = previewRecord;
                                        setPreviewRecord(null);
                                        openReviewModal(r, "approved");
                                    }}
                                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
                                >
                                    ACC Dokumen Ini
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                MODAL 2: FORM ACC / MINTA REVISI DOKUMEN
            ═══════════════════════════════════════════════════════════════ */}
            {actionModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                    <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                            <div className="flex items-center gap-2">
                                {actionModal.targetStatus === 'approved' ? (
                                    <CheckCircle2 size={18} className="text-emerald-600" />
                                ) : (
                                    <AlertCircle size={18} className="text-amber-600" />
                                )}
                                <h3 className="text-base font-bold text-slate-800">
                                    {actionModal.targetStatus === 'approved' ? 'ACC / Setujui Dokumen CSMS' : 'Instruksi Revisi Dokumen CSMS'}
                                </h3>
                            </div>
                            <button
                                onClick={() => setActionModal({ isOpen: false, record: null, targetStatus: "approved" })}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                                <div><strong>Unit RIG:</strong> {actionModal.record?.rig?.name} ({actionModal.record?.crew || 'Rig'})</div>
                                <div><strong>Kategori:</strong> {actionModal.record?.category?.nama_dokumen}</div>
                                <div><strong>Nama Berkas:</strong> {actionModal.record?.file_name}</div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Status Keputusan
                                </label>
                                <select
                                    value={data.approval_status}
                                    onChange={(e) => setData("approval_status", e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none"
                                >
                                    <option value="approved">Disetujui (ACC Sah)</option>
                                    <option value="revision">Perlu Revisi (Minta Perbaikan)</option>
                                    <option value="rejected">Ditolak Tidak Sesuai</option>
                                    <option value="pending">Kembalikan ke Status Pending</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Catatan / Feedback Evaluasi K3 {actionModal.targetStatus === 'revision' ? '(Wajib Diisi)' : '(Opsional)'}
                                </label>
                                <textarea
                                    value={data.approval_notes}
                                    onChange={(e) => setData("approval_notes", e.target.value)}
                                    rows="3"
                                    required={data.approval_status === 'revision'}
                                    placeholder={
                                        data.approval_status === 'approved'
                                            ? "Contoh: Dokumen lengkap sesuai standar audit K3."
                                            : "Contoh: Tolong tanda tangan HSE Officer pada halaman 2 dilengkapi dan unggah ulang."
                                    }
                                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none placeholder-slate-400"
                                />
                            </div>

                            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setActionModal({ isOpen: false, record: null, targetStatus: "approved" })}
                                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-sm transition-all ${
                                        data.approval_status === 'approved'
                                            ? 'bg-emerald-600 hover:bg-emerald-700'
                                            : 'bg-amber-600 hover:bg-amber-700'
                                    }`}
                                >
                                    {processing ? "Menyimpan Keputusan..." : "Simpan Keputusan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* [ADMIN ONLY] Modal Unduh Paket Dokumen Rig (ZIP) */}
            <RigDownloadModal
                isOpen={isDownloadModalOpen}
                onClose={() => setIsDownloadModalOpen(false)}
                rigs={rigs}
                selectedRig={rigs.find((r) => String(r.id) === String(selectedRigId)) || rigs[0]}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
            />
        </AdminLayout>
    );
}
