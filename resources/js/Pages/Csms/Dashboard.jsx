import React, { useState, useMemo } from "react";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import FileDropzone from "@/Components/FileDropzone";
import AttachmentsModal from "@/Components/AttachmentsModal";
import RigDownloadModal from "@/Components/RigDownloadModal";
import YearSelect from "@/Components/YearSelect";
import { useTheme } from "@/Contexts/ThemeContext";
import {
    HardDrive,
    Upload,
    FileText,
    ChevronRight,
    Plus,
    X,
    Eye,
    Trash2,
    ShieldCheck,
    Sun,
    Moon,
    Search,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Activity,
    HardHat,
    Calendar,
    Sparkles,
    Download,
} from "lucide-react";

export default function CsmsDashboard({ rigs, categories, records, rigStats, filter, summary, availableYears = [] }) {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.role === "admin";
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    const [selectedMonth, setSelectedMonth] = useState(filter?.bulan || "Januari");
    const [selectedYear, setSelectedYear] = useState(filter?.tahun || availableYears?.[0] || new Date().getFullYear());

    useEffect(() => {
        if (filter?.tahun) {
            setSelectedYear(filter.tahun);
        }
    }, [filter?.tahun]);
    const [searchRig, setSearchRig] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [viewAttachmentsRecord, setViewAttachmentsRecord] = useState(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [downloadRigTarget, setDownloadRigTarget] = useState(null);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [showAddRigModal, setShowAddRigModal] = useState(false);
    const [addRigForm, setAddRigForm] = useState({
        name: "",
        code: "",
        status: "active",
    });
    const [addRigErrors, setAddRigErrors] = useState({});
    const [isSubmittingRig, setIsSubmittingRig] = useState(false);

    const handleOpenAddRigModal = () => {
        setAddRigForm({
            name: "",
            code: "",
            status: "active",
        });
        setAddRigErrors({});
        setShowAddRigModal(true);
    };

    const handleAddRigSubmit = (e) => {
        e.preventDefault();
        setIsSubmittingRig(true);
        setAddRigErrors({});

        router.post("/admin/csms/rigs", addRigForm, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmittingRig(false);
                setShowAddRigModal(false);
                setAddRigForm({
                    name: "",
                    code: "",
                    status: "active",
                });
            },
            onError: (errs) => {
                setIsSubmittingRig(false);
                setAddRigErrors(errs || {});
            },
        });
    };

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];


    const { data, setData, post, processing, reset, errors } = useForm({
        csms_rig_id: rigs?.[0]?.id || "",
        csms_document_category_id: categories?.[0]?.id || "",
        periode_bulan: selectedMonth,
        periode_tahun: selectedYear,
        crew: "Crew A",
        status: "Lengkap",
        keterangan: "",
        files: [],
    });

    const handleFilterChange = (month, year) => {
        setSelectedMonth(month);
        setSelectedYear(year);
        router.get(
            '/csms',
            { bulan: month, tahun: year },
            { preserveState: true, replace: true }
        );
    };

    const handleUploadSubmit = (e) => {
        e.preventDefault();
        if (!data.files || data.files.length === 0) {
            alert("Harap pilih atau tarik berkas dokumen yang akan diunggah terlebih dahulu (Maks. 500 KB per berkas: PDF, JPG, JPEG, Word).");
            return;
        }

        const formData = new FormData();
        formData.append("csms_rig_id", data.csms_rig_id);
        formData.append("csms_document_category_id", data.csms_document_category_id);
        formData.append("periode_bulan", data.periode_bulan);
        formData.append("periode_tahun", data.periode_tahun);
        formData.append("crew", data.crew);
        formData.append("status", data.status);
        formData.append("keterangan", data.keterangan || "");

        data.files.forEach((file) => {
            formData.append("files[]", file);
        });

        router.post("/csms/upload", formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsUploadModalOpen(false);
                reset();
            },
        });
    };

    const handleDeleteRecord = (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus arsip dokumen CSMS ini?")) {
            router.delete(`/csms/record/${id}`);
        }
    };

    // Filtered Rigs calculation
    const filteredRigs = useMemo(() => {
        return (rigStats || []).filter((rig) => {
            const matchesSearch =
                rig.name.toLowerCase().includes(searchRig.toLowerCase()) ||
                rig.code.toLowerCase().includes(searchRig.toLowerCase());
            
            if (statusFilter === "complete") {
                return matchesSearch && rig.percentage >= 100;
            } else if (statusFilter === "in_progress") {
                return matchesSearch && rig.percentage > 0 && rig.percentage < 100;
            } else if (statusFilter === "empty") {
                return matchesSearch && rig.percentage === 0;
            }
            return matchesSearch;
        });
    }, [rigStats, searchRig, statusFilter]);

    // Average overall compliance
    const averageCompliance = useMemo(() => {
        if (!rigStats || rigStats.length === 0) return 0;
        const total = rigStats.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
        return Math.round(total / rigStats.length);
    }, [rigStats]);

    return (
        <AdminLayout>
            <Head title="CSMS Portal - PT Besmindo Materi Sewatama" />

            {/* PITA GARIS KESELAMATAN K3 (SAFETY HAZARD RIBBON) */}
            <div
                className="w-full h-1.5 shrink-0"
                style={{
                    background:
                        "repeating-linear-gradient(45deg, #f59e0b, #f59e0b 16px, #1e293b 16px, #1e293b 32px)",
                }}
            />

            <div className="p-4 sm:p-6 lg:p-8 max-w-[1560px] mx-auto space-y-7 font-sans bg-[#f8fafc] text-slate-800">
                
                {/* ═══════════════════════════════════════════════════════════════
                    1. PORTAL HEADER CARD - PUTIH BERSIH & BERWIBAWA
                ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs relative">
                    {/* Garis Aksen K3 Hijau-Amber di bagian atas card */}
                    <div
                        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                        style={{
                            background: "linear-gradient(90deg, #10b981 0%, #34d399 50%, #f59e0b 100%)",
                        }}
                    />

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-2">
                            {/* K3 Slogan Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                                <HardHat size={14} className="text-emerald-600" />
                                <span>Safety First - Zero Accident</span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                                Portal Monitoring CSMS - 20 RIG BMS
                            </h1>
                            <p className="text-slate-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
                                Sistem Informasi Terpadu K3 & Penyimpanan Data Rekaman 21 Dokumen HSE PT Besmindo Materi Sewatama.
                            </p>
                        </div>

                        {/* Controls: Periode, Dark/Light Mode, Upload Button */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Dropdown Periode Bulan & Tahun */}
                            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1.5 shadow-2xs">
                                <div className="flex items-center pl-2 pr-1 text-emerald-600">
                                    <Calendar size={15} />
                                </div>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => handleFilterChange(e.target.value, selectedYear)}
                                    className="bg-transparent text-slate-700 text-xs sm:text-sm font-bold cursor-pointer border-none focus:ring-0 py-1 pl-1 pr-6 focus:outline-none"
                                >
                                    {months.map((m) => (
                                        <option key={m} value={m} className="bg-white text-slate-800">
                                            {m}
                                        </option>
                                    ))}
                                </select>
                                <span className="text-slate-300">/</span>
                                <YearSelect
                                    value={selectedYear}
                                    onChange={(year) => handleFilterChange(selectedMonth, year)}
                                    availableYears={availableYears}
                                    className="bg-transparent text-slate-700 text-xs sm:text-sm font-bold cursor-pointer border-none focus:ring-0 py-1 pl-1 pr-6 focus:outline-none"
                                    optionClass="bg-white text-slate-800"
                                />
                            </div>

                            {/* Tombol Input Per-Rig */}
                            <Link
                                href="/csms/input-rig"
                                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm transition-all"
                            >
                                <FileText size={16} className="text-slate-600" />
                                <span>Input Per-Rig</span>
                            </Link>

                            {/* Tombol Verifikasi & ACC Admin */}
                            <Link
                                href="/admin/csms/verification"
                                className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold px-3.5 py-2 rounded-xl border border-amber-300 text-xs sm:text-sm transition-all"
                            >
                                <ShieldCheck size={16} className="text-amber-600" />
                                <span>Pusat Verifikasi / ACC ({summary?.pending_count || 0})</span>
                            </Link>

                            {/* [ADMIN ONLY] Tombol Tarik & Unduh Dokumen Rig (ZIP) */}
                            {isAdmin && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDownloadRigTarget(null);
                                        setIsDownloadModalOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3.5 py-2 rounded-xl border border-emerald-300 text-xs sm:text-sm transition-all cursor-pointer shadow-2xs"
                                    title="Tarik dan Unduh Seluruh Berkas Dokumen & Data Rig (ZIP)"
                                >
                                    <Download size={16} className="text-emerald-700" />
                                    <span>Unduh Paket Dokumen Rig</span>
                                </button>
                            )}

                            {/* Tombol Upload Dokumen Baru */}
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all transform active:scale-95 text-xs sm:text-sm cursor-pointer"
                            >
                                <Plus size={17} className="stroke-[2.5]" />
                                <span>Upload Dokumen CSMS</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    2. K3 SUMMARY METRICS - 4 CARD PUTIH BERSIH & SEGAR
                ═══════════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    {/* Card 1: Total Rig Aktif */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                            <HardDrive size={22} className="text-slate-700" />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Total Operasional
                            </span>
                            <h3 className="text-2xl font-black text-slate-800">
                                {summary?.total_rigs || 20} <span className="text-xs font-semibold text-slate-500">RIG</span>
                            </h3>
                        </div>
                    </div>

                    {/* Card 2: Dokumen Terverifikasi Lengkap */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                            <CheckCircle2 size={22} className="text-emerald-600" />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                                Terverifikasi K3
                            </span>
                            <h3 className="text-2xl font-black text-slate-800">
                                {summary?.lengkap_count || 0} <span className="text-xs font-semibold text-slate-500">Dokumen</span>
                            </h3>
                        </div>
                    </div>

                    {/* Card 3: Menunggu Tindakan / Pending */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                            <Clock size={22} className="text-amber-600" />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                                Perlu Tindakan
                            </span>
                            <h3 className="text-2xl font-black text-slate-800">
                                {summary?.pending_count || 0} <span className="text-xs font-semibold text-slate-500">Pending</span>
                            </h3>
                        </div>
                    </div>

                    {/* Card 4: Indeks Kepatuhan K3 */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-200">
                            <Activity size={22} className="text-teal-600" />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600">
                                Kepatuhan CSMS
                            </span>
                            <h3 className="text-2xl font-black text-slate-800">
                                {averageCompliance}% <span className="text-xs font-semibold text-slate-500">Rata-rata</span>
                            </h3>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    3. GRID KARTU 20 RIG - SEMUA CARD PUTIH BERSIH
                ═══════════════════════════════════════════════════════════════ */}
                <div className="space-y-4">
                    {/* Header Bar Grid */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={20} className="text-emerald-600" />
                            <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                                Status Kesiapan Dokumen RIG ({filteredRigs.length} Unit)
                            </h2>
                        </div>

                        {/* Search & Filter Buttons */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            {/* Input Search */}
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari Rig (misal: BMS-01)..."
                                    value={searchRig}
                                    onChange={(e) => setSearchRig(e.target.value)}
                                    className="pl-8 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 shadow-2xs w-52 placeholder-slate-400"
                                />
                            </div>

                            {/* Filter Status Tabs */}
                            <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
                                <button
                                    onClick={() => setStatusFilter("all")}
                                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                        statusFilter === "all"
                                            ? "bg-white text-slate-800 shadow-xs font-bold"
                                            : "text-slate-500 hover:text-slate-800"
                                    }`}
                                >
                                    Semua
                                </button>
                                <button
                                    onClick={() => setStatusFilter("complete")}
                                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                        statusFilter === "complete"
                                            ? "bg-white text-emerald-600 shadow-xs font-bold"
                                            : "text-slate-500 hover:text-slate-800"
                                    }`}
                                >
                                    100% Selesai
                                </button>
                                <button
                                    onClick={() => setStatusFilter("in_progress")}
                                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                        statusFilter === "in_progress"
                                            ? "bg-white text-amber-600 shadow-xs font-bold"
                                            : "text-slate-500 hover:text-slate-800"
                                    }`}
                                >
                                    Sedang Berjalan
                                </button>
                            </div>

                            {/* Tombol Tambah Unit RIG (Khusus Admin) */}
                            {isAdmin && (
                                <button
                                    type="button"
                                    onClick={handleOpenAddRigModal}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-md shrink-0"
                                >
                                    <Plus size={15} className="stroke-[2.5]" />
                                    <span>Tambah Unit RIG</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 20 RIG CARD GRID - PUTIH BERSIH */}
                    {filteredRigs.length === 0 ? (
                        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-xs">
                            <AlertTriangle size={32} className="mx-auto text-amber-500 mb-2" />
                            <p className="font-bold text-slate-700 text-sm">Tidak ada RIG yang cocok dengan pencarian.</p>
                            <p className="text-xs text-slate-400 mt-1">Coba bersihkan kata kunci pada kotak pencarian di atas.</p>
                            {isAdmin && (
                                <button
                                    type="button"
                                    onClick={handleOpenAddRigModal}
                                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all cursor-pointer"
                                >
                                    <Plus size={14} className="stroke-[2.5]" />
                                    <span>Tambah Unit RIG Baru</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredRigs.map((rig) => {
                                const isComplete = rig.percentage >= 100;
                                const isHalf = rig.percentage > 0 && rig.percentage < 100;

                                return (
                                    <Link
                                        key={rig.id}
                                        href={`/csms/rig/${rig.id}?bulan=${selectedMonth}&tahun=${selectedYear}`}
                                        className="group bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-lg hover:border-emerald-500 transition-all duration-200 flex flex-col justify-between hover:-translate-y-0.5"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-2.5">
                                                <span className="px-2.5 py-1 text-xs font-extrabold rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                                                    {rig.code}
                                                </span>

                                                <div className="flex items-center gap-1.5">
                                                    {isAdmin && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                setDownloadRigTarget(rig);
                                                                setIsDownloadModalOpen(true);
                                                            }}
                                                            title={`Unduh Paket Dokumen ${rig.name} (${rig.code})`}
                                                            className="p-1 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all cursor-pointer"
                                                        >
                                                            <Download size={13} />
                                                        </button>
                                                    )}

                                                    <span
                                                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                                                            isComplete
                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                                : isHalf
                                                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                                                : "bg-slate-50 text-slate-500 border-slate-200"
                                                        }`}
                                                    >
                                                        {rig.percentage}%
                                                    </span>
                                                </div>
                                            </div>

                                            <h3 className="font-black text-slate-800 text-sm group-hover:text-emerald-600 transition-colors">
                                                {rig.name}
                                            </h3>

                                            <p className="text-[11px] font-medium text-slate-500 mt-1">
                                                {rig.completed_count} dari {rig.total_required} dokumen
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                                        isComplete
                                                            ? "bg-emerald-500"
                                                            : isHalf
                                                            ? "bg-amber-500"
                                                            : "bg-slate-300"
                                                    }`}
                                                    style={{ width: `${Math.min(rig.percentage, 100)}%` }}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 group-hover:text-emerald-600 transition-colors pt-0.5">
                                                <span>Matriks 21 Dokumen</span>
                                                <ChevronRight size={13} className="transform group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}

                            {/* Card Tambah Unit RIG (Khusus Admin) */}
                            {isAdmin && (
                                <button
                                    type="button"
                                    onClick={handleOpenAddRigModal}
                                    className="group border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/40 bg-white/60 rounded-2xl p-4 transition-all duration-200 flex flex-col items-center justify-center text-center min-h-[160px] cursor-pointer hover:-translate-y-0.5 shadow-2xs hover:shadow-md"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-600 flex items-center justify-center mb-2 transition-colors">
                                        <Plus size={20} className="stroke-[2.5]" />
                                    </div>
                                    <span className="text-xs font-black text-slate-700 group-hover:text-emerald-700 transition-colors">
                                        + Tambah Unit RIG
                                    </span>
                                    <span className="text-[11px] text-slate-400 mt-0.5 font-medium">
                                        Khusus Hak Akses Admin
                                    </span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    4. TABEL ARSIP REKAMAN - SOLID WHITE & BERSIH
                ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <FileText size={18} className="text-emerald-600" />
                            <h3 className="font-bold text-slate-800 text-sm">
                                Riwayat Dokumen CSMS Terunggah ({records?.length || 0} Berkas)
                            </h3>
                        </div>

                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600">
                            Periode: {selectedMonth} {selectedYear}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="p-3.5">Unit RIG</th>
                                    <th className="p-3.5">Kategori Dokumen K3</th>
                                    <th className="p-3.5">Lingkup / Crew</th>
                                    <th className="p-3.5">Nama Berkas</th>
                                    <th className="p-3.5">Status</th>
                                    <th className="p-3.5 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {(!records || records.length === 0) ? (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-slate-400">
                                            Belum ada berkas CSMS yang diunggah untuk periode {selectedMonth} {selectedYear}.
                                        </td>
                                    </tr>
                                ) : (
                                    records.map((rec) => (
                                        <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-3.5 font-bold text-slate-800">
                                                {rec.rig?.name || '-'}
                                            </td>
                                            <td className="p-3.5">
                                                <span className="font-semibold text-slate-400 mr-1.5">{rec.category?.no}.</span>
                                                <span className="font-semibold text-slate-700">{rec.category?.nama_dokumen}</span>
                                            </td>
                                            <td className="p-3.5">
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-semibold border border-slate-200">
                                                    {rec.crew || 'Seluruh Rig'}
                                                </span>
                                            </td>
                                            <td className="p-3.5 font-mono text-emerald-600 max-w-[220px] truncate">
                                                {rec.file_path ? (
                                                    <div className="flex items-center gap-1.5 truncate">
                                                        {rec.attachments && Array.isArray(rec.attachments) && rec.attachments.length > 1 ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => setViewAttachmentsRecord(rec)}
                                                                className="hover:underline truncate block font-bold text-emerald-700 hover:text-emerald-800 text-left cursor-pointer"
                                                                title="Klik untuk melihat semua berkas terlampir"
                                                            >
                                                                {rec.file_name}
                                                            </button>
                                                        ) : (
                                                            <a
                                                                href={`/storage/${rec.file_path}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="hover:underline truncate block font-bold"
                                                                title={rec.file_name}
                                                            >
                                                                {rec.file_name}
                                                            </a>
                                                        )}
                                                        {rec.attachments && Array.isArray(rec.attachments) && rec.attachments.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setViewAttachmentsRecord(rec)}
                                                                className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-100 text-blue-800 border border-blue-200 shrink-0 cursor-pointer hover:bg-blue-200 transition-colors"
                                                                title="Buka daftar lampiran berkas"
                                                            >
                                                                {rec.attachments.length} Berkas
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic font-sans">Tanpa File</span>
                                                )}
                                            </td>
                                            <td className="p-3.5">
                                                <span
                                                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                                                        rec.status === 'Lengkap'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : rec.status === 'Pending'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                            : 'bg-red-50 text-red-700 border-red-200'
                                                    }`}
                                                >
                                                    {rec.status}
                                                </span>
                                            </td>
                                            <td className="p-3.5 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    {rec.file_path && (
                                                        rec.attachments && Array.isArray(rec.attachments) && rec.attachments.length > 1 ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => setViewAttachmentsRecord(rec)}
                                                                className="p-1.5 bg-slate-100 text-slate-600 rounded hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer"
                                                                title="Lihat Semua Lampiran Berkas"
                                                            >
                                                                <Eye size={14} />
                                                            </button>
                                                        ) : (
                                                            <a
                                                                href={`/storage/${rec.file_path}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="p-1.5 bg-slate-100 text-slate-600 rounded hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                                                title="Lihat Berkas"
                                                            >
                                                                <Eye size={14} />
                                                            </a>
                                                        )
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteRecord(rec.id)}
                                                        className="p-1.5 bg-slate-100 text-slate-600 rounded hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                                                        title="Hapus Rekaman"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                5. MODAL UPLOAD DOKUMEN - BERSIH PUTIH
            ═══════════════════════════════════════════════════════════════ */}
            {isUploadModalOpen && (
                <div
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer) e.dataTransfer.dropEffect = "copy"; }}
                    onDrop={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
                >
                    <div
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer) e.dataTransfer.dropEffect = "copy"; }}
                        onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                                setData("file", e.dataTransfer.files[0]);
                            }
                        }}
                        className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 text-slate-800"
                    >
                        
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                            <div className="flex items-center gap-2">
                                <HardHat size={18} className="text-emerald-600" />
                                <h3 className="text-base font-bold text-slate-800">
                                    Upload Dokumen CSMS
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsUploadModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                                    Pilih Unit RIG
                                </label>
                                <select
                                    value={data.csms_rig_id}
                                    onChange={(e) => setData("csms_rig_id", e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800"
                                >
                                    {(rigs || []).map((rig) => (
                                        <option key={rig.id} value={rig.id}>
                                            {rig.name} ({rig.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                                    Kategori Dokumen K3 (21 Item)
                                </label>
                                <select
                                    value={data.csms_document_category_id}
                                    onChange={(e) => setData("csms_document_category_id", e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800"
                                >
                                    {(categories || []).map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.no}. {cat.nama_dokumen} ({cat.durasi})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                                        Crew / Scope
                                    </label>
                                    <select
                                        value={data.crew}
                                        onChange={(e) => setData("crew", e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800"
                                    >
                                        <option value="Crew A">Crew A</option>
                                        <option value="Crew B">Crew B</option>
                                        <option value="Crew C">Crew C</option>
                                        <option value="Rig">Seluruh Rig</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                                        Status Dokumen
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData("status", e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800"
                                    >
                                        <option value="Lengkap">Lengkap</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Tidak Ada">Tidak Ada</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                    Berkas Dokumen CSMS (Tarik & Lepas Banyak File Sekaligus)
                                </label>
                                <FileDropzone
                                    files={data.files}
                                    onFilesChange={(newFiles) => setData("files", newFiles)}
                                    error={errors.files || errors.file}
                                    maxSizeKB={500}
                                    multiple={true}
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    required={true}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                                    Catatan / Keterangan Tambahan
                                </label>
                                <textarea
                                    value={data.keterangan}
                                    onChange={(e) => setData("keterangan", e.target.value)}
                                    rows="2"
                                    placeholder="Tuliskan catatan singkat jika ada..."
                                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-800"
                                />
                            </div>

                            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm transition-all cursor-pointer"
                                >
                                    {processing ? "Menyimpan..." : "Simpan Dokumen"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Pratinjau / Daftar Lampiran Berkas CSMS */}
            <AttachmentsModal
                isOpen={Boolean(viewAttachmentsRecord)}
                onClose={() => setViewAttachmentsRecord(null)}
                record={viewAttachmentsRecord}
            />

            {/* Modal Unduh Seluruh Dokumen Rig (Admin Only) */}
            {isAdmin && (
                <RigDownloadModal
                    isOpen={isDownloadModalOpen}
                    onClose={() => setIsDownloadModalOpen(false)}
                    rigs={rigs}
                    selectedRig={downloadRigTarget || rigs?.[0]}
                    selectedYear={selectedYear}
                    selectedMonth={selectedMonth}
                />
            )}

            {/* Modal Tambah Unit RIG Baru (Khusus Admin) */}
            {isAdmin && showAddRigModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h3 className="font-black text-slate-800 text-base">
                                    Tambah Unit RIG Baru
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Daftarkan unit RIG baru ke dalam matriks pemantauan CSMS.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAddRigModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleAddRigSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Nama Lengkap RIG <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: RIG BMS 21"
                                    value={addRigForm.name}
                                    onChange={(e) => setAddRigForm({ ...addRigForm, name: e.target.value })}
                                    className={`w-full border rounded-xl p-2.5 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${
                                        addRigErrors.name ? "border-red-400 ring-1 ring-red-300" : "border-slate-300"
                                    }`}
                                />
                                {addRigErrors.name && (
                                    <p className="text-[11px] font-semibold text-red-500 mt-1">
                                        {addRigErrors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Kode Singkat RIG <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: BMS 21 atau BMS-21"
                                    value={addRigForm.code}
                                    onChange={(e) => setAddRigForm({ ...addRigForm, code: e.target.value.toUpperCase() })}
                                    className={`w-full border rounded-xl p-2.5 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all uppercase ${
                                        addRigErrors.code ? "border-red-400 ring-1 ring-red-300" : "border-slate-300"
                                    }`}
                                />
                                {addRigErrors.code && (
                                    <p className="text-[11px] font-semibold text-red-500 mt-1">
                                        {addRigErrors.code}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Status Operasional
                                </label>
                                <select
                                    value={addRigForm.status}
                                    onChange={(e) => setAddRigForm({ ...addRigForm, status: e.target.value })}
                                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700 font-semibold"
                                >
                                    <option value="active">Aktif (Beroperasi)</option>
                                    <option value="inactive">Nonaktif (Standby / Pemeliharaan)</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 mt-5">
                                <button
                                    type="button"
                                    onClick={() => setShowAddRigModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingRig}
                                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-md"
                                >
                                    {isSubmittingRig ? (
                                        <span>Menyimpan...</span>
                                    ) : (
                                        <>
                                            <Plus size={14} className="stroke-[2.5]" />
                                            <span>Simpan Unit RIG</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
