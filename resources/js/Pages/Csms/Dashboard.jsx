import React, { useState, useEffect, useMemo } from "react";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import FileDropzone from "@/Components/FileDropzone";
import AttachmentsModal from "@/Components/AttachmentsModal";
import DocumentViewerModal from "@/Components/DocumentViewerModal";
import RigDownloadModal from "@/Components/RigDownloadModal";
import YearSelect from "@/Components/YearSelect";
import CustomDropdown from "@/Components/CustomDropdown";
import { useTheme } from "@/Contexts/ThemeContext";
import {
    HardDrive,
    Upload,
    FileText,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Plus,
    X,
    Eye,
    Trash2,
    Archive,
    Edit2,
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
    LayoutGrid,
    Table,
    Check,
    RotateCcw,
    XCircle,
    ArrowUpRight,
    Layers,
    ExternalLink,
    Users,
} from "lucide-react";

export default function CsmsDashboard({
    rigs = [],
    categories = [],
    matrixCategories = [],
    rigMatrix = [],
    summaryStats = {},
    records = [],
    rigStats = [],
    filter = {},
    summary = {},
    availableYears = [],
    initialView = "grid",
}) {
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

    // State Modal Dialog Checklist Dokumen RIG (Centered Modal)
    const [drawerRig, setDrawerRig] = useState(null);
    const [drawerFilter, setDrawerFilter] = useState("all"); // 'all' | 'uploaded' | 'missing'
    const [drawerSearch, setDrawerSearch] = useState("");

    // Keyboard listener untuk tombol Escape agar menutup modal dialog
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && drawerRig) {
                setDrawerRig(null);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [drawerRig]);

    // Modal untuk sel multi-crew (Crew A, B, C)
    const [activeCellModal, setActiveCellModal] = useState(null); // { rig, category, cell }

    // Modal In-App Document Viewer
    const [viewerState, setViewerState] = useState({
        isOpen: false,
        record: null,
        category: null,
        crew: null,
        initialIndex: 0,
    });

    const [searchRig, setSearchRig] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [viewAttachmentsRecord, setViewAttachmentsRecord] = useState(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [downloadRigTarget, setDownloadRigTarget] = useState(null);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [showAddRigModal, setShowAddRigModal] = useState(false);
    const [showEditRigModal, setShowEditRigModal] = useState(false);
    const [rigToArchive, setRigToArchive] = useState(null);
    const [isArchivingRig, setIsArchivingRig] = useState(false);

    const [addRigForm, setAddRigForm] = useState({
        name: "",
        code: "",
        status: "active",
        hfo_1: "",
        hfo_2: "",
        hfo_3: "",
    });
    const [addRigErrors, setAddRigErrors] = useState({});
    const [isSubmittingRig, setIsSubmittingRig] = useState(false);

    const [editRigForm, setEditRigForm] = useState({
        id: null,
        name: "",
        code: "",
        status: "active",
        hfo_1: "",
        hfo_2: "",
        hfo_3: "",
    });
    const [editRigErrors, setEditRigErrors] = useState({});
    const [isUpdatingRig, setIsUpdatingRig] = useState(false);

    const handleConfirmArchiveRig = () => {
        if (!rigToArchive) return;
        setIsArchivingRig(true);

        router.post(`/admin/csms/rigs/${rigToArchive.id}/archive`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsArchivingRig(false);
                setRigToArchive(null);
            },
            onError: () => {
                setIsArchivingRig(false);
            },
            onFinish: () => {
                setIsArchivingRig(false);
            },
        });
    };

    const handleOpenAddRigModal = () => {
        setAddRigForm({
            name: "",
            code: "",
            status: "active",
            hfo_1: "",
            hfo_2: "",
            hfo_3: "",
        });
        setAddRigErrors({});
        setShowAddRigModal(true);
    };

    const handleOpenEditRigModal = (rig) => {
        setEditRigForm({
            id: rig.id,
            name: rig.name || "",
            code: rig.code || "",
            status: rig.status || "active",
            hfo_1: rig.hfo_1 || "",
            hfo_2: rig.hfo_2 || "",
            hfo_3: rig.hfo_3 || "",
        });
        setEditRigErrors({});
        setShowEditRigModal(true);
    };

    const handleEditRigSubmit = (e) => {
        e.preventDefault();
        if (!editRigForm.id) return;
        setIsUpdatingRig(true);
        setEditRigErrors({});

        router.patch(`/admin/csms/rigs/${editRigForm.id}`, editRigForm, {
            preserveScroll: true,
            onSuccess: () => {
                setIsUpdatingRig(false);
                setShowEditRigModal(false);
            },
            onError: (errs) => {
                setIsUpdatingRig(false);
                setEditRigErrors(errs || {});
            },
            onFinish: () => {
                setIsUpdatingRig(false);
            },
        });
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
                    hfo_1: "",
                    hfo_2: "",
                    hfo_3: "",
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

    // Handler Klik Sel Matriks
    const handleCellClick = (rig, category, cell) => {
        if (!cell.is_assigned || cell.status === "not_assigned") {
            alert(`Dokumen "${category.nama_dokumen}" tidak ditugaskan pada unit ${rig.code}.`);
            return;
        }

        if (!cell.records || cell.records.length === 0) {
            alert(`Unit ${rig.code} belum mengunggah dokumen "${category.nama_dokumen}" pada periode ${selectedMonth} ${selectedYear}.`);
            return;
        }

        // Jika hanya 1 berkas, langsung buka di DocumentViewerModal
        if (cell.records.length === 1) {
            const rec = cell.records[0];
            setViewerState({
                isOpen: true,
                record: rec,
                category: category,
                crew: rec.crew,
                initialIndex: 0,
            });
            return;
        }

        // Jika multi-crew (Crew A, B, C), buka lembar modal pemilihan crew
        setActiveCellModal({ rig, category, cell });
    };

    const handleApproveFromViewer = (recordId) => {
        router.post(
            `/admin/csms/verify/${recordId}`,
            { approval_status: "approved" },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setViewerState((prev) => ({ ...prev, isOpen: false }));
                    setActiveCellModal(null);
                },
            }
        );
    };

    const handleReviseFromViewer = (recordId, notes) => {
        router.post(
            `/admin/csms/verify/${recordId}`,
            { approval_status: "revision", approval_notes: notes },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setViewerState((prev) => ({ ...prev, isOpen: false }));
                    setActiveCellModal(null);
                },
            }
        );
    };

    const handleUploadSubmit = (e) => {
        e.preventDefault();
        if (!data.files || data.files.length === 0) {
            alert("Harap pilih atau tarik berkas dokumen yang akan diunggah terlebih dahulu (Maks. 5 MB per berkas: PDF, JPG, JPEG, Word).");
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

    // Memoized Map untuk mengambil data dokumen checklist per unit RIG secara instan
    const rigMatrixMap = useMemo(() => {
        const map = new Map();
        (rigMatrix || []).forEach((item) => {
            if (item?.rig?.id) {
                map.set(item.rig.id, item);
            }
        });
        return map;
    }, [rigMatrix]);

    const activeCategories = useMemo(() => {
        return matrixCategories?.length > 0 ? matrixCategories : categories;
    }, [matrixCategories, categories]);

    // Perhitungan data dokumen checklist untuk RIG yang sedang dibuka di Slide-Over Drawer
    const drawerMatrixItem = useMemo(() => {
        if (!drawerRig) return null;
        return rigMatrixMap.get(drawerRig.id) || null;
    }, [drawerRig, rigMatrixMap]);

    const drawerChecklistData = useMemo(() => {
        if (!drawerRig) {
            return {
                items: [],
                totalAssigned: 0,
                uploadedCount: 0,
                approvedCount: 0,
                pendingCount: 0,
                revisionCount: 0,
                missingCount: 0,
            };
        }

        const cells = drawerMatrixItem?.cells || {};
        let totalAssigned = 0;
        let uploadedCount = 0;
        let approvedCount = 0;
        let pendingCount = 0;
        let revisionCount = 0;

        const items = activeCategories.map((cat) => {
            const cell = cells[cat.id];
            const isAssigned = cell ? (cell.is_assigned !== false && cell.status !== "not_assigned") : true;
            const records = cell?.records || [];
            const hasRecords = records.length > 0;
            const cellStatus = cell?.status || (hasRecords ? "pending" : "empty");

            const isApproved = cellStatus === "approved" || cellStatus === "partial_approved";
            const isPending = cellStatus === "pending";
            const isRevision = cellStatus === "revision";
            const isUploaded = hasRecords || isApproved || isPending || isRevision;

            if (isAssigned) {
                totalAssigned++;
                if (isUploaded) uploadedCount++;
                if (isApproved) approvedCount++;
                if (isPending) pendingCount++;
                if (isRevision) revisionCount++;
            }

            return {
                cat,
                cell,
                isAssigned,
                isUploaded,
                isApproved,
                isPending,
                isRevision,
                records,
            };
        });

        const missingCount = Math.max(0, totalAssigned - uploadedCount);

        return {
            items,
            totalAssigned,
            uploadedCount,
            approvedCount,
            pendingCount,
            revisionCount,
            missingCount,
        };
    }, [drawerRig, drawerMatrixItem, activeCategories]);

    // Filter dokumen di dalam drawer berdasarkan tab dan pencarian
    const filteredDrawerItems = useMemo(() => {
        return drawerChecklistData.items.filter((item) => {
            if (!item.isAssigned) return false;

            // Filter tab
            if (drawerFilter === "uploaded" && !item.isUploaded) return false;
            if (drawerFilter === "missing" && item.isUploaded) return false;

            // Search query
            if (drawerSearch.trim()) {
                const q = drawerSearch.toLowerCase();
                const nameMatch = item.cat.nama_dokumen?.toLowerCase().includes(q);
                const shortMatch = item.cat.short_name?.toLowerCase().includes(q);
                const noMatch = String(item.cat.no || "").includes(q);
                if (!nameMatch && !shortMatch && !noMatch) return false;
            }

            return true;
        });
    }, [drawerChecklistData, drawerFilter, drawerSearch]);

    return (
        <AdminLayout>
            <Head title="CSMS Portal - PT Besmindo Materi Sewatama" />

            <div className="p-4 sm:p-6 lg:p-8 max-w-[1560px] mx-auto space-y-7 font-sans bg-[#f8fafc] text-slate-800">
                
                {/* ═══════════════════════════════════════════════════════════════
                    1. PORTAL HEADER CARD - PUTIH BERSIH & BERWIBAWA
                ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs relative">
                    {/* Garis Aksen K3 Emerald Pekat di bagian atas card */}
                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900" />

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
                                <CustomDropdown
                                    value={selectedMonth}
                                    onChange={(m) => handleFilterChange(m, selectedYear)}
                                    options={months}
                                    headerLabel="PILIH BULAN"
                                    variant="inline"
                                    minWidth="w-48 sm:w-52"
                                />
                                <span className="text-slate-300 mx-0.5">/</span>
                                <YearSelect
                                    value={selectedYear}
                                    onChange={(year) => handleFilterChange(selectedMonth, year)}
                                    availableYears={availableYears}
                                    className="bg-transparent text-slate-700 text-xs sm:text-sm font-bold cursor-pointer border-none focus:ring-0 py-1 pl-1 pr-1 focus:outline-none"
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
                    2. K3 SUMMARY METRICS - 4 KARTU BERSIH & SEGAR
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
                    3. KONTEN UTAMA: GRID KARTU UNIT RIG & ACCORDION MINI RESUME
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
                                    className="pl-8 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 shadow-2xs w-48 placeholder-slate-400"
                                />
                            </div>

                            {/* Filter Status Tabs */}
                            <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold shadow-2xs">
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
                                    style={{ background: "linear-gradient(135deg, #22c55e 0%, #059669 45%, #064e3b 100%)" }}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-md shrink-0"
                                >
                                    <Plus size={15} className="stroke-[2.5]" />
                                    <span>Tambah Unit RIG</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 20 RIG CARD GRID DENGAN ACCORDION MINI RESUME */}
                    {filteredRigs.length === 0 ? (
                        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-xs">
                            <AlertTriangle size={32} className="mx-auto text-amber-500 mb-2" />
                            <p className="font-bold text-slate-700 text-sm">Tidak ada RIG yang cocok dengan pencarian.</p>
                            <p className="text-xs text-slate-400 mt-1">Coba bersihkan kata kunci pada kotak pencarian di atas.</p>
                            {isAdmin && (
                                <button
                                    type="button"
                                    onClick={handleOpenAddRigModal}
                                    style={{ background: "linear-gradient(135deg, #22c55e 0%, #059669 45%, #064e3b 100%)" }}
                                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-md"
                                >
                                    <Plus size={14} className="stroke-[2.5]" />
                                    <span>Tambah Unit RIG Baru</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 items-start gap-4">
                            {filteredRigs.map((rig) => {
                                const isComplete = rig.percentage >= 100;
                                const isHalf = rig.percentage > 0 && rig.percentage < 100;
                                const isDrawerActive = drawerRig?.id === rig.id;

                                return (
                                    <div
                                        key={rig.id}
                                        className={`bg-white rounded-2xl border transition-all duration-200 p-4 shadow-xs flex flex-col justify-between ${
                                            isDrawerActive
                                                ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                                                : "border-slate-200 hover:border-emerald-400 hover:shadow-md"
                                        }`}
                                    >
                                        <div>
                                            {/* Baris Atas: Kode Rig & Tombol Aksi Admin */}
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <Link
                                                    href={`/csms/rig/${rig.id}?bulan=${selectedMonth}&tahun=${selectedYear}`}
                                                    className="px-2.5 py-1 text-xs font-extrabold rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
                                                    title={`Buka detail dokumen K3 ${rig.name}`}
                                                >
                                                    {rig.code}
                                                </Link>

                                                <div className="flex items-center gap-1.5">
                                                    {isAdmin && (
                                                        <div className="flex items-center gap-0.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setDownloadRigTarget(rig);
                                                                    setIsDownloadModalOpen(true);
                                                                }}
                                                                title={`Unduh Paket Dokumen ${rig.name} (${rig.code})`}
                                                                className="p-1 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all cursor-pointer"
                                                            >
                                                                <Download size={13} />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenEditRigModal(rig)}
                                                                title={`Ubah Data ${rig.name} & Personil HFO`}
                                                                className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all cursor-pointer"
                                                            >
                                                                <Edit2 size={13} />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => setRigToArchive(rig)}
                                                                title={`Arsipkan Unit ${rig.name} (${rig.code})`}
                                                                className="p-1 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all cursor-pointer"
                                                            >
                                                                <Archive size={13} />
                                                            </button>
                                                        </div>
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

                                            {/* Nama Rig & Rangkuman Dokumen */}
                                            <Link
                                                href={`/csms/rig/${rig.id}?bulan=${selectedMonth}&tahun=${selectedYear}`}
                                                className="block group/title mt-1"
                                                title={`Buka detail matriks K3 ${rig.name}`}
                                            >
                                                <h3 className="font-black text-slate-800 text-sm group-hover/title:text-emerald-600 transition-colors flex items-center justify-between">
                                                    <span>{rig.name}</span>
                                                    <ArrowUpRight size={13} className="opacity-0 group-hover/title:opacity-100 text-emerald-600 transition-opacity" />
                                                </h3>
                                            </Link>

                                            <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                                                {rig.completed_count} dari {rig.total_required} dokumen
                                            </p>

                                            {/* Personil HFO Penugasan */}
                                            {rig.hfo_list && rig.hfo_list.length > 0 && (
                                                <div
                                                    className="mt-2 text-[10px] text-slate-500 font-semibold truncate flex items-center gap-1.5"
                                                    title={`Petugas HFO: ${rig.hfo_list.join(", ")}`}
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                                    <span className="truncate"><strong>HFO:</strong> {rig.hfo_list.join(", ")}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Progress Bar & Trigger Slide-Over Drawer */}
                                        <div className="mt-3.5 space-y-2">
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

                                            {/* Tombol Trigger Modal Dialog Checklist Dokumen */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setDrawerRig(rig);
                                                    setDrawerFilter("all");
                                                    setDrawerSearch("");
                                                }}
                                                className={`w-full pt-2.5 border-t flex items-center justify-between text-[11px] font-bold transition-all cursor-pointer group/btn ${
                                                    isDrawerActive
                                                        ? "border-emerald-200 text-emerald-700"
                                                        : "border-slate-100 text-slate-500 hover:text-emerald-700"
                                                }`}
                                                title={`Buka ringkasan checklist dokumen ${rig.name}`}
                                            >
                                                <span className="flex items-center gap-1.5">
                                                    <Layers size={13} className={`transition-colors ${isDrawerActive ? "text-emerald-600" : "text-slate-400 group-hover/btn:text-emerald-600"}`} />
                                                    <span>Checklist Dokumen</span>
                                                </span>
                                                <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border font-black transition-colors ${
                                                    isDrawerActive
                                                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                                        : "bg-slate-50 text-slate-600 border-slate-200 group-hover/btn:bg-emerald-50 group-hover/btn:text-emerald-700 group-hover/btn:border-emerald-200"
                                                }`}>
                                                    <span>{rig.completed_count}/{rig.total_required}</span>
                                                    <ChevronRight size={11} strokeWidth={2.5} />
                                                </span>
                                            </button>
                                        </div>
                                    </div>
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
                                <CustomDropdown
                                    value={data.csms_rig_id}
                                    onChange={(val) => setData("csms_rig_id", val)}
                                    options={(rigs || []).map((rig) => ({
                                        value: rig.id,
                                        label: `${rig.name} (${rig.code})`,
                                    }))}
                                    headerLabel="PILIH UNIT RIG"
                                    placeholder="Pilih Unit RIG"
                                    variant="form"
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                                    Kategori Dokumen K3 (21 Item)
                                </label>
                                <CustomDropdown
                                    value={data.csms_document_category_id}
                                    onChange={(val) => setData("csms_document_category_id", val)}
                                    options={(categories || []).map((cat) => ({
                                        value: cat.id,
                                        label: `${cat.no}. ${cat.nama_dokumen} (${cat.durasi})`,
                                    }))}
                                    headerLabel="PILIH KATEGORI K3"
                                    placeholder="Pilih Kategori Dokumen"
                                    variant="form"
                                    className="w-full"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                                        Crew / Scope
                                    </label>
                                    <CustomDropdown
                                        value={data.crew}
                                        onChange={(val) => setData("crew", val)}
                                        options={[
                                            { value: "Crew A", label: "Crew A" },
                                            { value: "Crew B", label: "Crew B" },
                                            { value: "Crew C", label: "Crew C" },
                                            { value: "Rig", label: "Seluruh Rig" },
                                        ]}
                                        headerLabel="PILIH CREW"
                                        variant="form"
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                                        Status Dokumen
                                    </label>
                                    <CustomDropdown
                                        value={data.status}
                                        onChange={(val) => setData("status", val)}
                                        options={[
                                            { value: "Lengkap", label: "Lengkap", badge: "ACC" },
                                            { value: "Pending", label: "Pending", badge: "Proses" },
                                            { value: "Tidak Ada", label: "Tidak Ada", badge: "N/A" },
                                        ]}
                                        headerLabel="STATUS DOKUMEN"
                                        variant="form"
                                        className="w-full"
                                    />
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
                                    maxSizeKB={5120}
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
                                    style={{ background: "linear-gradient(135deg, #22c55e 0%, #059669 45%, #064e3b 100%)" }}
                                    className="px-5 py-2 text-xs font-bold text-white disabled:opacity-50 rounded-lg shadow-sm transition-all cursor-pointer hover:shadow-md"
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
                                <CustomDropdown
                                    value={addRigForm.status}
                                    onChange={(val) => setAddRigForm({ ...addRigForm, status: val })}
                                    options={[
                                        { value: "active", label: "Aktif (Beroperasi)", badge: "Operasi" },
                                        { value: "inactive", label: "Nonaktif (Standby / Pemeliharaan)", badge: "Standby" },
                                    ]}
                                    headerLabel="STATUS OPERASIONAL"
                                    variant="form"
                                    className="w-full"
                                />
                            </div>

                            {/* Input 3 Personil HFO */}
                            <div className="pt-2 border-t border-slate-100 space-y-2.5">
                                <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider">
                                    Daftar Personil HFO (Health & Safety Field Officer)
                                </label>
                                
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                        Petugas HFO 1
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Nama Lengkap Personil HFO 1"
                                        value={addRigForm.hfo_1}
                                        onChange={(e) => setAddRigForm({ ...addRigForm, hfo_1: e.target.value })}
                                        className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                        Petugas HFO 2
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Nama Lengkap Personil HFO 2"
                                        value={addRigForm.hfo_2}
                                        onChange={(e) => setAddRigForm({ ...addRigForm, hfo_2: e.target.value })}
                                        className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                        Petugas HFO 3
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Nama Lengkap Personil HFO 3"
                                        value={addRigForm.hfo_3}
                                        onChange={(e) => setAddRigForm({ ...addRigForm, hfo_3: e.target.value })}
                                        className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
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
                                    style={{ background: "linear-gradient(135deg, #22c55e 0%, #059669 45%, #064e3b 100%)" }}
                                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-md"
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

            {/* Modal Ubah Data Unit RIG & Personil HFO (Khusus Admin) */}
            {isAdmin && showEditRigModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h3 className="font-black text-slate-800 text-base">
                                    Ubah Data RIG & Personil HFO
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Perbarui informasi RIG dan daftar 3 personil HFO bertugas.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowEditRigModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleEditRigSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Nama Lengkap RIG <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editRigForm.name}
                                    onChange={(e) => setEditRigForm({ ...editRigForm, name: e.target.value })}
                                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                />
                                {editRigErrors.name && (
                                    <p className="text-[11px] font-semibold text-red-500 mt-1">
                                        {editRigErrors.name}
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
                                    value={editRigForm.code}
                                    onChange={(e) => setEditRigForm({ ...editRigForm, code: e.target.value.toUpperCase() })}
                                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all uppercase"
                                />
                                {editRigErrors.code && (
                                    <p className="text-[11px] font-semibold text-red-500 mt-1">
                                        {editRigErrors.code}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Status Operasional
                                </label>
                                <CustomDropdown
                                    value={editRigForm.status}
                                    onChange={(val) => setEditRigForm({ ...editRigForm, status: val })}
                                    options={[
                                        { value: "active", label: "Aktif (Beroperasi)", badge: "Operasi" },
                                        { value: "inactive", label: "Nonaktif (Standby / Pemeliharaan)", badge: "Standby" },
                                        { value: "archived", label: "Diarsipkan (Pusat Arsip)", badge: "Arsip" },
                                    ]}
                                    headerLabel="STATUS OPERASIONAL"
                                    variant="form"
                                    className="w-full"
                                />
                            </div>

                            {/* Input Personil HFO 1, 2, 3 */}
                            <div className="pt-2 border-t border-slate-100 space-y-2.5">
                                <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider">
                                    Daftar Personil HFO (Health & Safety Field Officer)
                                </label>
                                
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                        Petugas HFO 1
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Nama Lengkap Personil HFO 1"
                                        value={editRigForm.hfo_1}
                                        onChange={(e) => setEditRigForm({ ...editRigForm, hfo_1: e.target.value })}
                                        className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                        Petugas HFO 2
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Nama Lengkap Personil HFO 2"
                                        value={editRigForm.hfo_2}
                                        onChange={(e) => setEditRigForm({ ...editRigForm, hfo_2: e.target.value })}
                                        className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                        Petugas HFO 3
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Nama Lengkap Personil HFO 3"
                                        value={editRigForm.hfo_3}
                                        onChange={(e) => setEditRigForm({ ...editRigForm, hfo_3: e.target.value })}
                                        className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 mt-5">
                                <button
                                    type="button"
                                    onClick={() => setShowEditRigModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdatingRig}
                                    style={{ background: "linear-gradient(135deg, #22c55e 0%, #059669 45%, #064e3b 100%)" }}
                                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-md"
                                >
                                    {isUpdatingRig ? <span>Menyimpan...</span> : <span>Simpan Perubahan RIG</span>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Arsipkan Unit RIG (Khusus Admin) */}
            {isAdmin && rigToArchive && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3.5 border border-amber-200 shadow-2xs">
                            <Archive size={24} />
                        </div>
                        <h3 className="text-base font-black text-slate-800 mb-1">
                            Arsipkan Unit RIG?
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4">
                            Apakah Anda yakin ingin mengarsipkan unit <strong className="text-slate-800 font-bold">"{rigToArchive.name}" ({rigToArchive.code})</strong>?
                        </p>

                        <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-left text-[11.5px] text-emerald-800 leading-relaxed mb-5">
                            <div className="flex items-start gap-2">
                                <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                <span>
                                    <strong>Kebijakan CSMS:</strong> Seluruh berkas rekaman dokumen K3 unit RIG ini <strong>tetap utuh tersimpan aman</strong> di database dan storage. Unit ini dapat ditinjau kapan saja melalui menu <strong>Arsip Rig</strong> di sidebar admin.
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-2.5">
                            <button
                                type="button"
                                disabled={isArchivingRig}
                                onClick={() => setRigToArchive(null)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isArchivingRig}
                                onClick={handleConfirmArchiveRig}
                                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-md"
                            >
                                {isArchivingRig ? (
                                    <span>Mengarsipkan...</span>
                                ) : (
                                    <>
                                        <Archive size={14} />
                                        <span>Ya, Arsipkan RIG</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                MODAL DIALOG CHECKLIST DOKUMEN RIG (CENTERED MODAL)
            ═══════════════════════════════════════════════════════════════ */}
            {drawerRig && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-hidden">
                    {/* Backdrop Overlay Gelap & Lembut */}
                    <div
                        onClick={() => setDrawerRig(null)}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in cursor-pointer"
                    />

                    {/* Modal Dialog Card di Tengah Layar */}
                    <div className="relative w-full max-w-2xl sm:max-w-3xl max-h-[88vh] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10">
                        {/* 1. Header Tetap (Sticky Top) */}
                        <div className="p-5 sm:p-6 border-b border-slate-200/80 bg-gradient-to-b from-slate-50/90 to-white shrink-0">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black">
                                            {drawerRig.code}
                                        </span>
                                        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border ${
                                            drawerRig.percentage >= 100
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                : drawerRig.percentage > 0
                                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                                : "bg-slate-50 text-slate-500 border-slate-200"
                                        }`}>
                                            {drawerRig.percentage}% Kepatuhan
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                        {drawerRig.name}
                                    </h2>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Periode Evaluasi: <strong className="text-slate-700">{selectedMonth} {selectedYear}</strong>
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setDrawerRig(null)}
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                    title="Tutup Modal (Esc)"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Personil HFO Bertugas & Baris Ringkasan Progres dalam Grid 2 Kolom */}
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Petugas HFO */}
                                <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center gap-2 text-xs">
                                    <Users size={15} className="text-emerald-600 shrink-0" />
                                    <div className="truncate">
                                        <span className="text-slate-400 font-semibold mr-1">Petugas HFO:</span>
                                        <strong className="text-slate-800">
                                            {drawerRig.hfo_list && drawerRig.hfo_list.length > 0 ? drawerRig.hfo_list.join(", ") : "Belum ditentukan"}
                                        </strong>
                                    </div>
                                </div>

                                {/* Progres Ringkasan Mini */}
                                <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1.5 flex flex-col justify-center">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-slate-600">
                                            {drawerChecklistData.uploadedCount}/{drawerChecklistData.totalAssigned} Terunggah
                                        </span>
                                        <span className="font-extrabold text-emerald-700">
                                            {drawerChecklistData.approvedCount} ACC Sah
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="h-1.5 rounded-full transition-all duration-300 bg-emerald-500"
                                            style={{
                                                width: `${
                                                    drawerChecklistData.totalAssigned > 0
                                                        ? Math.min(100, Math.round((drawerChecklistData.uploadedCount / drawerChecklistData.totalAssigned) * 100))
                                                        : 0
                                                }%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 2. Filter Tabs & Pencarian Tetap (Sticky Subheader) */}
                            <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                                {/* Tab Pills */}
                                <div className="flex items-center gap-1.5 text-xs font-bold shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setDrawerFilter("all")}
                                        className={`py-1.5 px-3 rounded-xl transition-all cursor-pointer text-center ${
                                            drawerFilter === "all"
                                                ? "bg-slate-800 text-white font-extrabold shadow-2xs"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                    >
                                        Semua ({drawerChecklistData.totalAssigned})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDrawerFilter("uploaded")}
                                        className={`py-1.5 px-3 rounded-xl transition-all cursor-pointer text-center ${
                                            drawerFilter === "uploaded"
                                                ? "bg-emerald-600 text-white font-extrabold shadow-2xs"
                                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60"
                                        }`}
                                    >
                                        Sudah ({drawerChecklistData.uploadedCount})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDrawerFilter("missing")}
                                        className={`py-1.5 px-3 rounded-xl transition-all cursor-pointer text-center ${
                                            drawerFilter === "missing"
                                                ? "bg-slate-600 text-white font-extrabold shadow-2xs"
                                                : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200/80"
                                        }`}
                                    >
                                        Belum ({drawerChecklistData.missingCount})
                                    </button>
                                </div>

                                {/* Search Bar Input */}
                                <div className="relative flex-1">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={drawerSearch}
                                        onChange={(e) => setDrawerSearch(e.target.value)}
                                        placeholder="Cari nama atau nomor dokumen K3..."
                                        className="w-full pl-8 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                                    />
                                    {drawerSearch && (
                                        <button
                                            type="button"
                                            onClick={() => setDrawerSearch("")}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                        >
                                            <X size={13} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 3. Konten Daftar Dokumen (Scrollable Mandiri) */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
                            {filteredDrawerItems.length === 0 ? (
                                <div className="py-12 text-center">
                                    <Layers size={36} className="mx-auto text-slate-300 mb-2.5" />
                                    <p className="text-sm font-bold text-slate-600">
                                        Tidak ada dokumen ditemukan
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {drawerFilter === "missing"
                                            ? "Seluruh dokumen K3 telah lengkap terunggah!"
                                            : "Coba sesuaikan tab filter atau kata kunci pencarian Anda."}
                                    </p>
                                </div>
                            ) : (
                                filteredDrawerItems.map(({ cat, cell, isUploaded, isApproved, isPending, isRevision, records }) => {
                                    const hasFiles = records && records.length > 0;

                                    return (
                                        <div
                                            key={cat.id}
                                            onClick={() => {
                                                if (hasFiles && cell) {
                                                    handleCellClick(drawerRig, cat, cell);
                                                }
                                            }}
                                            className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 transition-all ${
                                                isApproved
                                                    ? "bg-emerald-50/50 border-emerald-200 text-slate-800 hover:bg-emerald-100/70 cursor-pointer shadow-2xs"
                                                    : isPending
                                                    ? "bg-amber-50/50 border-amber-200 text-slate-800 hover:bg-amber-100/70 cursor-pointer shadow-2xs"
                                                    : isRevision
                                                    ? "bg-rose-50/50 border-rose-200 text-slate-800 hover:bg-rose-100/70 cursor-pointer shadow-2xs"
                                                    : "bg-slate-50/80 border-slate-200/80 text-slate-500 select-none"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 truncate flex-1 min-w-0">
                                                <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-mono font-bold text-[10px] text-slate-600 flex items-center justify-center shrink-0 shadow-2xs">
                                                    #{cat.no}
                                                </span>
                                                <div className="truncate min-w-0">
                                                    <p className={`font-bold truncate text-xs ${isUploaded ? "text-slate-800" : "text-slate-600"}`}>
                                                        {cat.nama_dokumen}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-[10.5px] text-slate-400 font-medium mt-0.5">
                                                        <span>Durasi: {cat.durasi}</span>
                                                        {hasFiles && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="text-slate-600 font-semibold">{records.length} berkas</span>
                                                                {cell?.latest_uploader && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="truncate">HFO: <strong className="text-slate-700 font-semibold">{cell.latest_uploader}</strong></span>
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="shrink-0 flex items-center gap-2">
                                                {isApproved ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-2.5 py-1 rounded-lg">
                                                        <Check size={12} strokeWidth={3} />
                                                        <span>ACC</span>
                                                    </span>
                                                ) : isPending ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/90 border border-amber-200 px-2.5 py-1 rounded-lg">
                                                        <Clock size={12} strokeWidth={2.5} />
                                                        <span>Review</span>
                                                    </span>
                                                ) : isRevision ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100/90 border border-rose-200 px-2.5 py-1 rounded-lg">
                                                        <RotateCcw size={12} />
                                                        <span>Revisi</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                                                        Belum Unggah
                                                    </span>
                                                )}

                                                {hasFiles && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCellClick(drawerRig, cat, cell);
                                                        }}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                                                        title="Pratinjau Berkas"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* 4. Footer Tetap (Sticky Bottom) */}
                        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between gap-3 shrink-0">
                            <Link
                                href={`/csms/rig/${drawerRig.id}?bulan=${selectedMonth}&tahun=${selectedYear}`}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
                                style={{ background: "linear-gradient(135deg, #22c55e 0%, #059669 45%, #064e3b 100%)" }}
                            >
                                <span>Buka Halaman Matriks Penuh RIG Ini</span>
                                <ArrowUpRight size={14} />
                            </Link>

                            <button
                                type="button"
                                onClick={() => setDrawerRig(null)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Lembar Berkas Multi-Crew (Crew A, B, C) */}
            {activeCellModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 my-8 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                                    <HardHat size={16} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900">
                                        {activeCellModal.rig?.code} • {activeCellModal.category?.nama_dokumen}
                                    </h3>
                                    <p className="text-[11px] text-slate-500 font-medium">
                                        Periode {selectedMonth} {selectedYear} • {activeCellModal.cell?.records?.length || 0} Berkas Tersimpan
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveCellModal(null)}
                                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Daftar Berkas Per Crew */}
                        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto text-xs">
                            {activeCellModal.cell?.records?.map((rec) => {
                                const appStatus = (rec.approval_status || "").toLowerCase();
                                const isApproved = appStatus === "approved";
                                const isPending  = appStatus === "pending";
                                const isRevision = ["revision", "revisi", "rejected", "ditolak"].includes(appStatus);

                                return (
                                    <div
                                        key={rec.id}
                                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3"
                                    >
                                        <div className="overflow-hidden flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded font-black text-[10px] bg-slate-200 text-slate-800">
                                                    Crew {rec.crew || "-"}
                                                </span>
                                                <span className="font-bold text-slate-900 truncate">
                                                    {rec.file_name}
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                                                <span>Diunggah oleh: <strong className="text-slate-700">{rec.uploaded_by || "Kru Lapangan"}</strong></span>
                                                {rec.updated_at && <span>• {rec.updated_at}</span>}
                                            </div>
                                            {rec.approval_notes && (
                                                <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg mt-2 border border-amber-200">
                                                    <strong>Catatan Evaluasi:</strong> {rec.approval_notes}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {isApproved && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                    <Check size={11} strokeWidth={3} />
                                                    <span>ACC</span>
                                                </span>
                                            )}
                                            {isPending && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                                    <Clock size={11} />
                                                    <span>Pending</span>
                                                </span>
                                            )}
                                            {isRevision && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                                                    <RotateCcw size={11} />
                                                    <span>Revisi</span>
                                                </span>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setViewerState({
                                                        isOpen: true,
                                                        record: rec,
                                                        category: activeCellModal.category,
                                                        crew: rec.crew,
                                                        initialIndex: 0,
                                                    });
                                                }}
                                                className="p-1.5 rounded-lg bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer"
                                                title="Pratinjau & Verifikasi Berkas Ini"
                                            >
                                                <Eye size={13} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                            <Link
                                href={`/csms/rig/${activeCellModal.rig?.id}?bulan=${selectedMonth}&tahun=${selectedYear}`}
                                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1"
                            >
                                <span>Buka Matriks Lengkap {activeCellModal.rig?.code}</span>
                                <ArrowUpRight size={13} />
                            </Link>

                            <button
                                type="button"
                                onClick={() => setActiveCellModal(null)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* In-App Document Viewer Modal (ACC & Revisi) */}
            <DocumentViewerModal
                isOpen={viewerState.isOpen}
                onClose={() => setViewerState((prev) => ({ ...prev, isOpen: false }))}
                record={viewerState.record}
                category={viewerState.category}
                crew={viewerState.crew}
                isAdmin={isAdmin}
                onApprove={handleApproveFromViewer}
                onRevise={handleReviseFromViewer}
                initialIndex={viewerState.initialIndex}
            />
        </AdminLayout>
    );
}
