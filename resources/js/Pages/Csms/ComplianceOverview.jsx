import React, { useState, useMemo, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import DocumentViewerModal from "@/Components/DocumentViewerModal";
import YearSelect from "@/Components/YearSelect";
import {
    Activity,
    Award,
    CheckCircle2,
    Clock,
    AlertTriangle,
    XCircle,
    HardHat,
    Check,
    Search,
    ChevronRight,
    ChevronLeft,
    ExternalLink,
    Filter,
    HelpCircle,
    Info,
    FileText,
    ArrowUpRight,
    Sparkles,
    Eye,
    TrendingUp,
    ShieldCheck,
    RotateCcw,
    X,
    Layers,
    Download,
    ChevronDown,
    Trophy,
    Users,
    Flame,
} from "lucide-react";

export default function ComplianceOverview({
    summaryStats = {},
    rigMatrix = [],
    categories = [],
    availableYears = [],
    filter = {},
    hfoStats = {},
    activeTab: initialActiveTab = "matrix",
}) {
    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];

    const [selectedMonth, setSelectedMonth] = useState(filter.bulan || "Januari");
    const [selectedYear, setSelectedYear] = useState(filter.tahun || new Date().getFullYear());
    const [searchRig, setSearchRig] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'perfect' | 'high' | 'attention'

    // ── TAB NAVIGATION STATE ─────────────────────────────────────────────────
    const [currentTab, setCurrentTab] = useState(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get("tab");
            if (tabParam === "hfo" || tabParam === "matrix") return tabParam;
        }
        return initialActiveTab || "matrix";
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get("tab");
            if (tabParam && (tabParam === "hfo" || tabParam === "matrix")) {
                setCurrentTab(tabParam);
            }
        }
    }, []);

    const handleTabSwitch = (tab) => {
        setCurrentTab(tab);
        if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.set("tab", tab);
            window.history.replaceState({}, "", url.toString());
        }
    };

    // ── HFO TAB STATE & FILTERS ──────────────────────────────────────────────
    const [searchHfo, setSearchHfo] = useState("");
    const [selectedHfoRig, setSelectedHfoRig] = useState("all");
    const [hfoStatusFilter, setHfoStatusFilter] = useState("all"); // 'all' | 'sangat_aktif' | 'cukup_aktif' | 'belum_aktif'
    const [hfoSortBy, setHfoSortBy] = useState("uploaded_desc"); // 'uploaded_desc' | 'uploaded_asc' | 'name_asc' | 'name_desc' | 'rig_asc'
    const [hfoPage, setHfoPage] = useState(1);
    const [hfoPerPage, setHfoPerPage] = useState(15);

    // List unique rigs for HFO Rig filter dropdown
    const uniqueHfoRigs = useMemo(() => {
        const fullList = hfoStats?.full_list || [];
        const map = new Map();
        fullList.forEach((item) => {
            if (item.rig_id && item.rig_code && !map.has(item.rig_id)) {
                map.set(item.rig_id, { id: item.rig_id, code: item.rig_code, name: item.rig_name });
            }
        });
        return Array.from(map.values()).sort((a, b) => (a.code || "").localeCompare(b.code || ""));
    }, [hfoStats?.full_list]);

    // Maximum uploads among all HFOs (for percentage progress bar)
    const maxHfoUploads = useMemo(() => {
        const fullList = hfoStats?.full_list || [];
        if (!fullList.length) return 1;
        return Math.max(...fullList.map((x) => x.total_uploaded || 0), 1);
    }, [hfoStats?.full_list]);

    // Filter & Sort HFO List
    const filteredHfoList = useMemo(() => {
        const fullList = hfoStats?.full_list || [];
        return fullList
            .filter((hfo) => {
                if (searchHfo) {
                    const q = searchHfo.toLowerCase();
                    const matchName = hfo.name?.toLowerCase().includes(q);
                    const matchRig = hfo.rig_code?.toLowerCase().includes(q) || hfo.rig_name?.toLowerCase().includes(q);
                    if (!matchName && !matchRig) return false;
                }

                if (selectedHfoRig !== "all") {
                    if (String(hfo.rig_id) !== String(selectedHfoRig) && hfo.rig_code !== selectedHfoRig) {
                        return false;
                    }
                }

                if (hfoStatusFilter === "sangat_aktif" && hfo.activity_status !== "Sangat Aktif") {
                    return false;
                }
                if (hfoStatusFilter === "cukup_aktif" && hfo.activity_status !== "Cukup Aktif") {
                    return false;
                }
                if (hfoStatusFilter === "belum_aktif" && hfo.activity_status !== "Belum Aktif") {
                    return false;
                }

                return true;
            })
            .sort((a, b) => {
                if (hfoSortBy === "uploaded_desc") {
                    return (b.total_uploaded || 0) - (a.total_uploaded || 0) || (a.name || "").localeCompare(b.name || "");
                }
                if (hfoSortBy === "uploaded_asc") {
                    return (a.total_uploaded || 0) - (b.total_uploaded || 0) || (a.name || "").localeCompare(b.name || "");
                }
                if (hfoSortBy === "name_asc") {
                    return (a.name || "").localeCompare(b.name || "");
                }
                if (hfoSortBy === "name_desc") {
                    return (b.name || "").localeCompare(a.name || "");
                }
                if (hfoSortBy === "rig_asc") {
                    return (a.rig_code || "").localeCompare(b.rig_code || "");
                }
                return 0;
            });
    }, [hfoStats?.full_list, searchHfo, selectedHfoRig, hfoStatusFilter, hfoSortBy]);

    // Reset pagination when filter changes
    useEffect(() => {
        setHfoPage(1);
    }, [searchHfo, selectedHfoRig, hfoStatusFilter, hfoSortBy, hfoPerPage]);

    // Pagination slice
    const totalHfoPages = hfoPerPage === -1 ? 1 : Math.ceil(filteredHfoList.length / hfoPerPage) || 1;
    const paginatedHfoList = useMemo(() => {
        if (hfoPerPage === -1) return filteredHfoList;
        const start = (hfoPage - 1) * hfoPerPage;
        return filteredHfoList.slice(start, start + hfoPerPage);
    }, [filteredHfoList, hfoPage, hfoPerPage]);

    // Modal untuk sel yang memiliki banyak crew (Crew A, B, C)
    const [activeCellModal, setActiveCellModal] = useState(null); // { rig, category, cell }

    // Modal In-App Document Viewer
    const [viewerState, setViewerState] = useState({
        isOpen: false,
        record: null,
        category: null,
        crew: null,
        initialIndex: 0,
    });

    // Handler pergantian periode filter
    const handleFilterChange = (month, year) => {
        setSelectedMonth(month);
        setSelectedYear(year);
        router.get(
            "/admin/csms/compliance",
            { bulan: month, tahun: year, tab: currentTab },
            { preserveState: true, preserveScroll: true }
        );
    };

    // Handler Verifikasi Langsung dari Document Viewer Modal
    const handleApproveFromViewer = (recordId) => {
        router.post(
            `/csms/verify/${recordId}`,
            { approval_status: "approved" },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setViewerState(prev => ({ ...prev, isOpen: false }));
                    setActiveCellModal(null);
                },
            }
        );
    };

    const handleReviseFromViewer = (recordId, notes) => {
        router.post(
            `/csms/verify/${recordId}`,
            { approval_status: "revision", approval_notes: notes },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setViewerState(prev => ({ ...prev, isOpen: false }));
                    setActiveCellModal(null);
                },
            }
        );
    };

    // Filter daftar rig berdasarkan pencarian dan status kepatuhan
    const filteredRigMatrix = useMemo(() => {
        return rigMatrix.filter((item) => {
            const matchSearch =
                item.rig.name.toLowerCase().includes(searchRig.toLowerCase()) ||
                item.rig.code.toLowerCase().includes(searchRig.toLowerCase());

            if (!matchSearch) return false;

            if (statusFilter === "perfect") {
                return item.stats.percentage >= 100;
            }
            if (statusFilter === "high") {
                return item.stats.percentage >= 80 && item.stats.percentage < 100;
            }
            if (statusFilter === "attention") {
                return item.stats.percentage < 80;
            }
            return true;
        });
    }, [rigMatrix, searchRig, statusFilter]);

    // Buka berkas saat sel diklik
    const handleCellClick = (rig, category, cell) => {
        if (!cell.is_assigned || cell.status === "not_assigned") {
            alert(`Dokumen "${category.nama_dokumen}" tidak ditugaskan pada unit ${rig.code}.`);
            return;
        }

        if (!cell.records || cell.records.length === 0) {
            alert(`Unit ${rig.code} belum mengunggah dokumen "${category.nama_dokumen}" pada periode ${selectedMonth} ${selectedYear}.`);
            return;
        }

        // Jika hanya ada 1 record, buka langsung di viewer
        if (cell.records.length === 1) {
            const rec = cell.records[0];
            setViewerState({
                isOpen: true,
                record: rec,
                category: category,
                crew: rec.crew || "Rig",
                initialIndex: 0,
            });
            return;
        }

        // Jika ada beberapa crew (Crew A, B, C), buka modal pilihan crew
        setActiveCellModal({ rig, category, cell });
    };

    return (
        <AdminLayout>
            <Head title="Rekapitulasi Kepatuhan & Matriks 20 RIG — Portal HSE CSMS" />

            <div className="p-4 sm:p-6 lg:p-8 max-w-[1700px] mx-auto space-y-6">

                {/* ═══════════════════════════════════════════════════════════════
                    PAGE HEADER & PERIOD CONTROLS
                ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider mb-2">
                            <Activity size={13} className="text-emerald-600" />
                            <span>Rekapitulasi Terpusat • Monitoring HSE & CSMS</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            {currentTab === "matrix"
                                ? "Matriks Statistik & Rekap Kepatuhan RIG"
                                : "Statistik Keaktifan Petugas HFO"}
                        </h1>
                        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                            {currentTab === "matrix"
                                ? "Cross-tabulation status pemenuhan dan verifikasi dokumen K3 seluruh unit RIG operasional (BMS-01 s/d BMS-21) bersanding dengan 22 kategori rekaman wajib."
                                : "Leaderboard performa kontribusi unggahan berkas K3 personil Health & Safety Field Officer (HFO) serta audit trail keaktifan petugas di seluruh unit RIG."}
                        </p>
                    </div>

                    {/* Period Switcher (Month & Year) */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
                            <span className="text-xs font-bold text-slate-500">Periode:</span>
                            <div className="relative">
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => handleFilterChange(e.target.value, selectedYear)}
                                    className="text-xs font-bold text-slate-800 bg-transparent pr-5 border-none focus:outline-none cursor-pointer appearance-none"
                                >
                                    {months.map((m) => (
                                        <option key={m} value={m}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>

                            <span className="text-slate-300">/</span>

                            <YearSelect
                                value={selectedYear}
                                onChange={(year) => handleFilterChange(selectedMonth, year)}
                                availableYears={availableYears}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => handleFilterChange(selectedMonth, selectedYear)}
                            title="Segarkan data matriks"
                            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all cursor-pointer shadow-2xs hover:scale-105"
                        >
                            <RotateCcw size={14} />
                        </button>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    TAB NAVIGATION (HEATMAP MATRIX vs HFO ACTIVITY LEADERBOARD)
                ═══════════════════════════════════════════════════════════════ */}
                <div className="flex items-center gap-2 border-b border-slate-200/90 pb-3 flex-wrap">
                    <button
                        type="button"
                        onClick={() => handleTabSwitch("matrix")}
                        className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                            currentTab === "matrix"
                                ? "bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/20"
                                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
                        }`}
                    >
                        <Layers size={15} />
                        <span>Matriks Kepatuhan 20 RIG</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            currentTab === "matrix"
                                ? "bg-emerald-700/70 text-emerald-100"
                                : "bg-slate-100 text-slate-600"
                        }`}>
                            {summaryStats.total_rigs || 20} Unit RIG
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleTabSwitch("hfo")}
                        className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                            currentTab === "hfo"
                                ? "bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/20"
                                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
                        }`}
                    >
                        <Award size={15} />
                        <span>Statistik Keaktifan Petugas HFO</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            currentTab === "hfo"
                                ? "bg-emerald-700/70 text-emerald-100"
                                : "bg-emerald-50 text-emerald-700"
                        }`}>
                            {hfoStats?.total_hfos || 0} Petugas
                        </span>
                    </button>
                </div>

                {currentTab === "matrix" ? (
                    <>
                        {/* ═══════════════════════════════════════════════════════════════
                            SUMMARY METRIC CARDS (4 METRICS)
                        ═══════════════════════════════════════════════════════════════ */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                            {/* Card 1: Rata-rata Kepatuhan Global */}
                            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        Kepatuhan Global
                                    </span>
                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                                        <TrendingUp size={18} strokeWidth={2.4} />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                        {summaryStats.global_compliance_rate || 0}%
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${Math.min(summaryStats.global_compliance_rate || 0, 100)}%`,
                                                background: "linear-gradient(135deg, #22c55e 0%, #059669 100%)",
                                            }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-2 font-medium">
                                        Rata-rata dokumen terverifikasi dari seluruh unit RIG
                                    </p>
                                </div>
                            </div>

                            {/* Card 2: Total Dokumen Terkumpul / Terverifikasi */}
                            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        Dokumen Terverifikasi
                                    </span>
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                                        <CheckCircle2 size={18} strokeWidth={2.4} />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                        {summaryStats.total_approved || 0}
                                        <span className="text-slate-400 text-sm font-semibold ml-1">
                                            / {summaryStats.total_required || 0}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-2 flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                                            <Check size={12} strokeWidth={3} />
                                            {summaryStats.total_approved || 0} ACC Sah
                                        </span>
                                        <span className="text-slate-300">•</span>
                                        <span className="font-medium text-amber-700">
                                            {summaryStats.total_pending || 0} Pending
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3: RIG Paling Patuh */}
                            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        RIG Paling Patuh
                                    </span>
                                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                                        <Award size={18} strokeWidth={2.4} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                            {summaryStats.top_rig ? summaryStats.top_rig.code : "-"}
                                        </div>
                                        <span className="text-xs font-extrabold text-emerald-700">
                                            {summaryStats.top_rig ? `${summaryStats.top_rig.percentage}%` : ""}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-2 font-medium">
                                        {summaryStats.top_rig
                                            ? `${summaryStats.top_rig.approved} dari ${summaryStats.top_rig.required} dokumen terverifikasi ACC`
                                            : "Belum ada data"}
                                    </p>
                                </div>
                            </div>

                            {/* Card 4: RIG Perlu Perhatian */}
                            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        Perlu Perhatian Khusus
                                    </span>
                                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                                        <AlertTriangle size={18} strokeWidth={2.4} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                            {summaryStats.attention_rig ? summaryStats.attention_rig.code : "-"}
                                        </div>
                                        <span className="text-xs font-extrabold text-rose-600">
                                            {summaryStats.attention_rig ? `${summaryStats.attention_rig.percentage}%` : ""}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-2 font-medium">
                                        {summaryStats.attention_rig
                                            ? `Baru ${summaryStats.attention_rig.approved}/${summaryStats.attention_rig.required} dokumen ACC`
                                            : "Seluruh RIG telah patuh"}
                                    </p>
                                </div>
                            </div>

                        </div>

                        {/* ═══════════════════════════════════════════════════════════════
                            FILTER, SEARCH & LEGEND BAR
                        ═══════════════════════════════════════════════════════════════ */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 flex-wrap">
                            {/* Search & Quick Filter */}
                            <div className="flex items-center gap-2.5 w-full md:w-auto flex-1">
                                <div className="relative flex-1 max-w-xs">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchRig}
                                        onChange={(e) => setSearchRig(e.target.value)}
                                        placeholder="Cari unit RIG (cth: BMS-02)..."
                                        className="w-full text-xs font-semibold pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                    />
                                </div>

                                <div className="relative">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="text-xs font-bold text-slate-700 border border-slate-200 rounded-xl px-3 py-2 pr-7 bg-white focus:outline-none cursor-pointer appearance-none"
                                    >
                                        <option value="all">Semua Status RIG ({rigMatrix.length})</option>
                                        <option value="perfect">Kepatuhan 100%</option>
                                        <option value="high">Kepatuhan 80% - 99%</option>
                                        <option value="attention">Kepatuhan &lt; 80%</option>
                                    </select>
                                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Color Legend (Petunjuk Warna) */}
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-[11px] font-bold text-slate-600">
                                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                                    Keterangan Sel:
                                </span>
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span>ACC (Disetujui)</span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                    <span>Menunggu Review</span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-red-50 border border-red-200 text-red-800">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    <span>Revisi / Ditolak</span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500">
                                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                    <span>Belum Unggah</span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-50 border border-dashed border-slate-300 text-slate-400">
                                    <span>— Tidak Ditugaskan</span>
                                </div>
                            </div>
                        </div>

                        {/* ═══════════════════════════════════════════════════════════════
                            COMPLIANCE MATRIX TABLE (CROSS-TAB HEATMAP)
                        ═══════════════════════════════════════════════════════════════ */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                            <div className="overflow-x-auto max-w-full">
                                <table className="w-full text-left border-collapse border-spacing-0">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-black text-slate-600 tracking-wider">
                                            {/* Sticky RIG Column Header */}
                                            <th className="sticky left-0 z-30 bg-slate-100/95 backdrop-blur-xs p-3.5 border-r border-slate-200 min-w-[210px] shadow-2xs">
                                                <div className="flex items-center justify-between">
                                                    <span>UNIT RIG OPERASIONAL</span>
                                                    <span className="text-[9px] text-slate-400 font-bold">20 RIG</span>
                                                </div>
                                            </th>

                                            {/* Category Column Headers */}
                                            {categories.map((cat) => (
                                                <th
                                                    key={cat.id}
                                                    title={`[No. ${cat.no}] ${cat.nama_dokumen} (${cat.durasi})`}
                                                    className="p-2 border-r border-slate-200/80 text-center font-bold text-slate-700 min-w-[58px] max-w-[65px] hover:bg-slate-100 transition-colors cursor-help"
                                                >
                                                    <div className="flex flex-col items-center justify-end h-28 pb-1">
                                                        <span className="text-[9px] font-mono font-bold text-slate-400 mb-1">
                                                            #{cat.no}
                                                        </span>
                                                        <div
                                                            className="text-[10px] font-bold text-slate-700 tracking-tight leading-tight line-clamp-3 text-center"
                                                            style={{
                                                                writingMode: "vertical-rl",
                                                                transform: "rotate(180deg)",
                                                            }}
                                                        >
                                                            {cat.short_name}
                                                        </div>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100 text-xs">
                                        {filteredRigMatrix.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={categories.length + 1}
                                                    className="text-center py-12 text-slate-400 font-medium"
                                                >
                                                    Tidak ada unit RIG yang cocok dengan filter pencarian.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredRigMatrix.map((item) => {
                                                const rig = item.rig;
                                                const stats = item.stats;
                                                const is100 = stats.percentage >= 100;

                                                return (
                                                    <tr key={rig.id} className="hover:bg-slate-50/80 transition-colors group">
                                                        {/* Sticky Left RIG Information Column */}
                                                        <td className="sticky left-0 z-20 bg-white group-hover:bg-slate-50 p-3 border-r border-slate-200 shadow-2xs">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <div className="min-w-0">
                                                                    <Link
                                                                        href={`/csms/rig/${rig.id}?bulan=${selectedMonth}&tahun=${selectedYear}`}
                                                                        className="font-black text-slate-900 hover:text-emerald-700 hover:underline flex items-center gap-1.5 transition-colors group/link"
                                                                        title={`Buka Halaman Matriks Dokumen ${rig.name}`}
                                                                    >
                                                                        <span className="truncate">{rig.code}</span>
                                                                        <ExternalLink size={11} className="opacity-0 group-hover/link:opacity-100 text-slate-400 transition-opacity" />
                                                                    </Link>
                                                                    <div className="text-[10px] text-slate-400 font-medium truncate">
                                                                        {rig.name}
                                                                    </div>
                                                                </div>

                                                                {/* Progress Badge */}
                                                                <div className="text-right shrink-0">
                                                                    <div className={`text-xs font-black ${
                                                                        is100
                                                                            ? "text-emerald-700"
                                                                            : stats.percentage >= 80
                                                                            ? "text-blue-700"
                                                                            : "text-amber-700"
                                                                    }`}>
                                                                        {stats.percentage}%
                                                                    </div>
                                                                    <div className="text-[9px] text-slate-400 font-mono font-bold">
                                                                        {stats.approved}/{stats.required} ACC
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Micro Progress Bar */}
                                                            <div className="w-full bg-slate-100 rounded-full h-1 mt-1.5 overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-300 ${
                                                                        is100 ? "bg-emerald-500" : stats.percentage >= 80 ? "bg-blue-500" : "bg-amber-500"
                                                                    }`}
                                                                    style={{ width: `${Math.min(stats.percentage, 100)}%` }}
                                                                />
                                                            </div>
                                                        </td>

                                                        {/* Category Matrix Cells */}
                                                        {categories.map((cat) => {
                                                            const cell = item.cells[cat.id];
                                                            if (!cell) {
                                                                return (
                                                                    <td key={cat.id} className="p-2 border-r border-slate-100 text-center">
                                                                        <span className="text-slate-300">-</span>
                                                                    </td>
                                                                );
                                                            }

                                                            let cellBadge = null;
                                                            let titleText = `${rig.code} • ${cat.nama_dokumen}`;

                                                            if (!cell.is_assigned || cell.status === "not_assigned") {
                                                                cellBadge = (
                                                                    <span className="text-slate-300 text-xs font-bold select-none cursor-default">
                                                                        —
                                                                    </span>
                                                                );
                                                                titleText += " • Tidak Ditugaskan untuk Rig ini";
                                                            } else if (cell.status === "approved") {
                                                                cellBadge = (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleCellClick(rig, cat, cell)}
                                                                        className="w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-xs transition-all hover:scale-105 cursor-pointer"
                                                                        title="Dokumen Terverifikasi & ACC Sah. Klik untuk pratinjau berkas."
                                                                    >
                                                                        <Check size={14} strokeWidth={3} />
                                                                    </button>
                                                                );
                                                                titleText += ` • ACC SAH (${cell.approved_count}/${cell.required_count})`;
                                                            } else if (cell.status === "partial_approved") {
                                                                cellBadge = (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleCellClick(rig, cat, cell)}
                                                                        className="w-8 h-8 rounded-lg bg-emerald-400 hover:bg-emerald-500 text-emerald-950 font-black text-[10px] flex items-center justify-center shadow-xs transition-all hover:scale-105 cursor-pointer"
                                                                        title="Sebagian Crew Disetujui. Klik untuk pratinjau."
                                                                    >
                                                                        {cell.approved_count}/{cell.required_count}
                                                                    </button>
                                                                );
                                                                titleText += ` • ACC Sebagian (${cell.approved_count}/${cell.required_count} Crew)`;
                                                            } else if (cell.status === "pending") {
                                                                cellBadge = (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleCellClick(rig, cat, cell)}
                                                                        className="w-8 h-8 rounded-lg bg-amber-400 hover:bg-amber-500 text-amber-950 flex items-center justify-center shadow-xs transition-all hover:scale-105 cursor-pointer animate-pulse"
                                                                        title="Menunggu Review Admin HSE. Klik untuk verifikasi & ACC."
                                                                    >
                                                                        <Clock size={13} strokeWidth={2.6} />
                                                                    </button>
                                                                );
                                                                titleText += " • Menunggu Review & ACC Admin";
                                                            } else if (cell.status === "revision") {
                                                                cellBadge = (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleCellClick(rig, cat, cell)}
                                                                        className="w-8 h-8 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-xs transition-all hover:scale-105 cursor-pointer"
                                                                        title="Dokumen Ditolak / Perlu Revisi Kru. Klik untuk periksa."
                                                                    >
                                                                        <RotateCcw size={13} strokeWidth={2.6} />
                                                                    </button>
                                                                );
                                                                titleText += " • Perlu Revisi / Ditolak";
                                                            } else {
                                                                cellBadge = (
                                                                    <span
                                                                        className="w-7 h-7 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center text-[10px] text-slate-300 select-none"
                                                                        title="Unit ini belum mengunggah dokumen rekaman pada periode ini."
                                                                    >
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                                    </span>
                                                                );
                                                                titleText += " • Belum Ada Berkas Diunggah";
                                                            }

                                                            return (
                                                                <td
                                                                    key={cat.id}
                                                                    title={titleText}
                                                                    className="p-2 border-r border-slate-100 text-center align-middle"
                                                                >
                                                                    <div className="flex items-center justify-center">
                                                                        {cellBadge}
                                                                    </div>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    /* ═══════════════════════════════════════════════════════════════
                        HFO ACTIVITY MONITORING & LEADERBOARD MODULE
                    ═══════════════════════════════════════════════════════════════ */
                    <div className="space-y-6 animate-fade-in">

                        {/* ── 4 KPI SUMMARY CARDS FOR HFO ── */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Card 1: Total Personil HFO */}
                            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        Total Personil HFO
                                    </span>
                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                                        <Users size={18} strokeWidth={2.4} />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                        {hfoStats?.total_hfos || 0} <span className="text-sm font-semibold text-slate-400">Petugas</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-2 font-medium">
                                        Tersebar di 20 unit RIG operasional (3 HFO per Rig)
                                    </p>
                                </div>
                            </div>

                            {/* Card 2: Total Berkas CSMS Terunggah */}
                            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        Total Dokumen Terunggah
                                    </span>
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                                        <FileText size={18} strokeWidth={2.4} />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                        {hfoStats?.total_uploads || 0} <span className="text-sm font-semibold text-slate-400">Berkas</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-2 font-medium">
                                        Akumulasi seluruh rekaman K3 yang diunggah kru lapangan
                                    </p>
                                </div>
                            </div>

                            {/* Card 3: Petugas Sangat Aktif */}
                            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        Petugas Sangat Aktif
                                    </span>
                                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                                        <Flame size={18} strokeWidth={2.4} className="text-emerald-700" />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
                                        {hfoStats?.active_count || 0} <span className="text-sm font-semibold text-slate-400">Petugas</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-2 font-medium">
                                        Kontribusi tinggi (mengunggah ≥ 5 berkas rekaman K3)
                                    </p>
                                </div>
                            </div>

                            {/* Card 4: Petugas Perlu Evaluasi */}
                            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        Perlu Evaluasi (0 Berkas)
                                    </span>
                                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                                        <AlertTriangle size={18} strokeWidth={2.4} />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
                                        {hfoStats?.inactive_count || 0} <span className="text-sm font-semibold text-slate-400">Petugas</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-2 font-medium">
                                        Belum pernah mengunggah rekaman K3 (perlu follow-up)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ── LEADERBOARD WIDGETS (2 KARTU PERBANDINGAN) ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* WIDGET 1: TOP 5 PETUGAS HFO PALING AKTIF */}
                            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                                                <Trophy size={20} className="text-amber-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                                                    <span>Top 5 Petugas HFO Paling Aktif</span>
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                        Leaderboard
                                                    </span>
                                                </h3>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    Personil dengan frekuensi kontribusi unggahan berkas K3 terbanyak
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* List of Top 5 HFOs */}
                                    <div className="space-y-3">
                                        {(!hfoStats?.top_active || hfoStats.top_active.length === 0) ? (
                                            <div className="text-center py-8 text-slate-400 text-xs italic">
                                                Belum ada riwayat unggahan dokumen oleh personil HFO.
                                            </div>
                                        ) : (
                                            hfoStats.top_active.map((item, idx) => {
                                                const rank = item.rank || idx + 1;
                                                return (
                                                    <div
                                                        key={item.name + idx}
                                                        className="p-3 sm:p-3.5 rounded-xl border border-slate-100 hover:border-emerald-200 bg-slate-50/50 hover:bg-emerald-50/30 transition-all flex items-center justify-between gap-3 group"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            {/* Rank Badge */}
                                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                                                                rank === 1
                                                                    ? "bg-amber-400 text-amber-950 shadow-xs ring-2 ring-amber-300"
                                                                    : rank === 2
                                                                    ? "bg-slate-200 text-slate-800 font-extrabold"
                                                                    : rank === 3
                                                                    ? "bg-amber-100 text-amber-900 font-extrabold"
                                                                    : "bg-white text-slate-600 border border-slate-200"
                                                            }`}>
                                                                #{rank}
                                                            </div>

                                                            {/* Avatar & Info */}
                                                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getHfoAvatarGradient(item.name)} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs`}>
                                                                {getHfoInitials(item.name)}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                                                                        {item.name}
                                                                    </span>
                                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white text-emerald-800 border border-emerald-300">
                                                                        {item.rig_code}
                                                                    </span>
                                                                </div>
                                                                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 truncate">
                                                                    <span>Aktivitas terakhir:</span>
                                                                    <span className="font-semibold text-slate-700 truncate">
                                                                        {item.last_activity_date || "Hari ini"}
                                                                    </span>
                                                                    {item.last_activity_doc && (
                                                                        <>
                                                                            <span className="text-slate-300">•</span>
                                                                            <span className="truncate max-w-[140px] text-slate-500" title={item.last_activity_doc}>
                                                                                {item.last_activity_doc}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Upload Count Badge */}
                                                        <div className="text-right shrink-0">
                                                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 font-black text-xs sm:text-sm">
                                                                <span>{item.total_uploaded}</span>
                                                                <span className="text-[10px] font-bold text-emerald-700">Berkas</span>
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                                ACC: <strong className="text-emerald-700">{item.approved_count}</strong>
                                                                {item.revision_count > 0 && <span> • Rev: <strong className="text-amber-700">{item.revision_count}</strong></span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                                    <span>Diurutkan berdasarkan total unggahan dokumen rekaman K3</span>
                                    <span className="font-bold text-emerald-700">Top 5 Performer</span>
                                </div>
                            </div>

                            {/* WIDGET 2: PETUGAS HFO JARANG / BELUM MENGUNGGAH */}
                            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-center shrink-0">
                                                <AlertTriangle size={20} className="text-rose-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                                                    <span>Petugas HFO Jarang / Belum Mengunggah</span>
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                                                        Perlu Evaluasi
                                                    </span>
                                                </h3>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    Personil dengan unggahan paling rendah atau 0 berkas rekaman K3
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* List of Low Activity HFOs */}
                                    <div className="space-y-3">
                                        {(!hfoStats?.low_activity || hfoStats.low_activity.length === 0) ? (
                                            <div className="text-center py-8 text-slate-400 text-xs italic">
                                                Seluruh personil HFO aktif mengunggah dokumen K3.
                                            </div>
                                        ) : (
                                            hfoStats.low_activity.slice(0, 5).map((item, idx) => {
                                                const isZero = (item.total_uploaded || 0) === 0;
                                                return (
                                                    <div
                                                        key={item.name + idx}
                                                        className="p-3 sm:p-3.5 rounded-xl border border-slate-100 hover:border-rose-200 bg-slate-50/50 hover:bg-rose-50/20 transition-all flex items-center justify-between gap-3"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            {/* Alert Icon Badge */}
                                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                                                isZero ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-800"
                                                            }`}>
                                                                <AlertTriangle size={13} />
                                                            </div>

                                                            {/* Avatar & Info */}
                                                            <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                                                                {getHfoInitials(item.name)}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                                                                        {item.name}
                                                                    </span>
                                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white text-slate-700 border border-slate-300">
                                                                        {item.rig_code}
                                                                    </span>
                                                                </div>
                                                                <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                                                                    Penugasan: <span className="font-medium text-slate-700">{item.rig_name}</span> • {isZero ? "Belum ada berkas terunggah" : `Baru ${item.total_uploaded} berkas`}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Action Pill */}
                                                        <div className="text-right shrink-0">
                                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold border ${
                                                                isZero
                                                                    ? "bg-rose-100 text-rose-800 border-rose-300"
                                                                    : "bg-amber-100 text-amber-800 border-amber-300"
                                                            }`}>
                                                                {isZero ? "0 Berkas" : `${item.total_uploaded} Berkas`}
                                                            </span>
                                                            <div className="text-[10px] text-rose-600 font-bold mt-0.5">
                                                                Perlu Follow-up
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* Follow up callout banner */}
                                <div className="mt-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                                    <Info size={14} className="text-amber-700 shrink-0 mt-0.5" />
                                    <p className="leading-relaxed">
                                        <strong>Tindak Lanjut Admin HSE:</strong> Hubungi personil HFO di atas atau Rig Superintendent terkait untuk percepatan pemenuhan dokumen rekaman K3 periode berjalan.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ── TABEL DETAIL KEAKTIFAN SELURUH PERSONIL HFO ── */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                            {/* Header Tabel & Controls Bar */}
                            <div className="p-5 border-b border-slate-200/90 bg-gradient-to-r from-slate-50 to-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                                            <Users size={16} />
                                        </div>
                                        <h3 className="text-base font-black text-slate-900 tracking-tight">
                                            Detail Keaktifan Seluruh Personil HFO ({filteredHfoList.length} Petugas)
                                        </h3>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Audit trail lengkap performa pengunggahan dokumen K3 personil Health & Safety Field Officer lintas RIG
                                    </p>
                                </div>

                                {/* Search & Filters */}
                                <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
                                    {/* Search Input */}
                                    <div className="relative min-w-[200px] flex-1 lg:flex-none">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={searchHfo}
                                            onChange={(e) => setSearchHfo(e.target.value)}
                                            placeholder="Cari nama HFO / Rig..."
                                            className="w-full text-xs font-semibold pl-8 pr-7 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-2xs"
                                        />
                                        {searchHfo && (
                                            <button
                                                type="button"
                                                onClick={() => setSearchHfo("")}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                            >
                                                <X size={13} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Rig Filter Dropdown */}
                                    <div className="relative">
                                        <select
                                            value={selectedHfoRig}
                                            onChange={(e) => setSelectedHfoRig(e.target.value)}
                                            className="text-xs font-bold text-slate-700 border border-slate-200 rounded-xl px-3 py-2 pr-7 bg-white focus:outline-none cursor-pointer appearance-none shadow-2xs"
                                        >
                                            <option value="all">Semua Unit RIG ({uniqueHfoRigs.length})</option>
                                            {uniqueHfoRigs.map((rig) => (
                                                <option key={rig.id} value={rig.id}>
                                                    {rig.code} ({rig.name})
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>

                                    {/* Status Filter Dropdown */}
                                    <div className="relative">
                                        <select
                                            value={hfoStatusFilter}
                                            onChange={(e) => setHfoStatusFilter(e.target.value)}
                                            className="text-xs font-bold text-slate-700 border border-slate-200 rounded-xl px-3 py-2 pr-7 bg-white focus:outline-none cursor-pointer appearance-none shadow-2xs"
                                        >
                                            <option value="all">Semua Keaktifan</option>
                                            <option value="sangat_aktif">Sangat Aktif (≥ 5)</option>
                                            <option value="cukup_aktif">Cukup Aktif (1 - 4)</option>
                                            <option value="belum_aktif">Belum Aktif (0)</option>
                                        </select>
                                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>

                                    {/* Sort Dropdown */}
                                    <div className="relative">
                                        <select
                                            value={hfoSortBy}
                                            onChange={(e) => setHfoSortBy(e.target.value)}
                                            className="text-xs font-bold text-slate-700 border border-slate-200 rounded-xl px-3 py-2 pr-7 bg-white focus:outline-none cursor-pointer appearance-none shadow-2xs"
                                        >
                                            <option value="uploaded_desc">Dokumen Terbanyak ↓</option>
                                            <option value="uploaded_asc">Dokumen Tersedikit ↑</option>
                                            <option value="name_asc">Nama HFO (A - Z)</option>
                                            <option value="name_desc">Nama HFO (Z - A)</option>
                                            <option value="rig_asc">Unit RIG (BMS)</option>
                                        </select>
                                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-black uppercase tracking-wider text-slate-600">
                                            <th className="py-3.5 px-4 text-center w-12">#</th>
                                            <th className="py-3.5 px-4 min-w-[220px]">Nama Personil HFO</th>
                                            <th className="py-3.5 px-4 min-w-[140px]">Unit RIG Penugasan</th>
                                            <th className="py-3.5 px-4 min-w-[170px]">Total Dokumen Diunggah</th>
                                            <th className="py-3.5 px-4 min-w-[230px]">Status Verifikasi Dokumen</th>
                                            <th className="py-3.5 px-4 min-w-[220px]">Aktivitas Terakhir</th>
                                            <th className="py-3.5 px-4 min-w-[140px] text-center">Status Keaktifan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {paginatedHfoList.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="text-center py-12 text-slate-400">
                                                    <div className="max-w-xs mx-auto space-y-2">
                                                        <Users size={32} className="mx-auto text-slate-300" />
                                                        <div className="font-bold text-slate-700">Tidak ada personil HFO yang cocok</div>
                                                        <p className="text-[11px]">Silakan ubah kriteria pencarian atau reset filter untuk melihat daftar lengkap.</p>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSearchHfo("");
                                                                setSelectedHfoRig("all");
                                                                setHfoStatusFilter("all");
                                                                setHfoSortBy("uploaded_desc");
                                                            }}
                                                            className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs hover:bg-emerald-100 cursor-pointer"
                                                        >
                                                            Reset Filter
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedHfoList.map((item, idx) => {
                                                const globalIndex = hfoPerPage === -1 ? idx + 1 : (hfoPage - 1) * hfoPerPage + idx + 1;
                                                const isTop3 = hfoSortBy === "uploaded_desc" && globalIndex <= 3 && item.total_uploaded > 0;
                                                const uploadPercent = Math.min(Math.round(((item.total_uploaded || 0) / maxHfoUploads) * 100), 100);

                                                return (
                                                    <tr
                                                        key={item.name + idx}
                                                        className="hover:bg-slate-50/80 transition-colors group"
                                                    >
                                                        {/* 1. Row Number */}
                                                        <td className="py-3 px-4 text-center text-slate-400 font-mono font-semibold">
                                                            {isTop3 ? (
                                                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-black ${
                                                                    globalIndex === 1
                                                                        ? "bg-amber-400 text-amber-950 shadow-2xs"
                                                                        : globalIndex === 2
                                                                        ? "bg-slate-300 text-slate-800"
                                                                        : "bg-amber-100 text-amber-900 border border-amber-300"
                                                                }`}>
                                                                    {globalIndex}
                                                                </span>
                                                            ) : (
                                                                globalIndex
                                                            )}
                                                        </td>

                                                        {/* 2. Nama Personil HFO */}
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getHfoAvatarGradient(item.name)} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs`}>
                                                                    {getHfoInitials(item.name)}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="font-extrabold text-slate-900 truncate flex items-center gap-1.5">
                                                                        <span>{item.name}</span>
                                                                    </div>
                                                                    <div className="text-[10px] text-slate-400 font-medium">
                                                                        HSE Field Officer
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* 3. Unit RIG Penugasan */}
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-1.5">
                                                                <Link
                                                                    href={`/csms/rig/${item.rig_id}?bulan=${selectedMonth}&tahun=${selectedYear}`}
                                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors shadow-2xs group/link"
                                                                    title={`Buka Matriks Dokumen ${item.rig_code}`}
                                                                >
                                                                    <span>{item.rig_code}</span>
                                                                    <ExternalLink size={10} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                                                </Link>
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                                                                {item.rig_name}
                                                            </div>
                                                        </td>

                                                        {/* 4. Total Dokumen Diunggah */}
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-black text-slate-900 text-sm">
                                                                    {item.total_uploaded}
                                                                </span>
                                                                <span className="text-[11px] font-semibold text-slate-400">
                                                                    Dokumen
                                                                </span>
                                                            </div>
                                                            <div className="w-full max-w-[120px] bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                                                                <div
                                                                    className="h-full rounded-full transition-all duration-300"
                                                                    style={{
                                                                        width: `${uploadPercent}%`,
                                                                        background: item.total_uploaded >= 5
                                                                            ? "linear-gradient(90deg, #10b981 0%, #059669 100%)"
                                                                            : item.total_uploaded >= 1
                                                                            ? "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)"
                                                                            : "#e2e8f0",
                                                                    }}
                                                                />
                                                            </div>
                                                        </td>

                                                        {/* 5. Status Dokumen Terverifikasi */}
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                    <CheckCircle2 size={10} />
                                                                    <span>{item.approved_count} ACC</span>
                                                                </span>
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                                    <Clock size={10} />
                                                                    <span>{item.pending_count} Pending</span>
                                                                </span>
                                                                {item.revision_count > 0 && (
                                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                                                        <RotateCcw size={10} />
                                                                        <span>{item.revision_count} Rev</span>
                                                                    </span>
                                                                )}
                                                                {item.rejected_count > 0 && (
                                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                                        <XCircle size={10} />
                                                                        <span>{item.rejected_count} Tolak</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* 6. Aktivitas Terakhir */}
                                                        <td className="py-3 px-4">
                                                            {item.last_activity_date ? (
                                                                <div>
                                                                    <div className="font-bold text-slate-800">
                                                                        {item.last_activity_date}
                                                                    </div>
                                                                    <div className="text-[10.5px] text-slate-500 font-medium truncate max-w-[200px]" title={item.last_activity_doc}>
                                                                        {item.last_activity_doc}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-400 italic text-[11px]">
                                                                    Belum pernah mengunggah
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* 7. Status Keaktifan */}
                                                        <td className="py-3 px-4 text-center">
                                                            {item.activity_status === "Sangat Aktif" && (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                                                                    <CheckCircle2 size={11} className="text-emerald-700" />
                                                                    <span>SANGAT AKTIF</span>
                                                                </span>
                                                            )}
                                                            {item.activity_status === "Cukup Aktif" && (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                                                    <Clock size={11} className="text-blue-600" />
                                                                    <span>CUKUP AKTIF</span>
                                                                </span>
                                                            )}
                                                            {item.activity_status === "Belum Aktif" && (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                                    <AlertTriangle size={11} className="text-rose-500" />
                                                                    <span>BELUM AKTIF</span>
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Bar */}
                            <div className="p-4 border-t border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                                <div className="flex items-center gap-2">
                                    <span>
                                        Menampilkan <strong>{filteredHfoList.length === 0 ? 0 : (hfoPage - 1) * hfoPerPage + 1}</strong> - <strong>{Math.min(hfoPage * hfoPerPage, filteredHfoList.length)}</strong> dari <strong>{filteredHfoList.length}</strong> personil HFO
                                    </span>
                                    <span className="text-slate-300">|</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-slate-500">Tampilkan:</span>
                                        <select
                                            value={hfoPerPage}
                                            onChange={(e) => setHfoPerPage(Number(e.target.value))}
                                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                                        >
                                            <option value={15}>15 per hal</option>
                                            <option value={25}>25 per hal</option>
                                            <option value={50}>50 per hal</option>
                                            <option value={-1}>Semua ({filteredHfoList.length})</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Page Numbers */}
                                {totalHfoPages > 1 && (
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setHfoPage((p) => Math.max(1, p - 1))}
                                            disabled={hfoPage <= 1}
                                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 cursor-pointer shadow-2xs"
                                            title="Halaman Sebelumnya"
                                        >
                                            <ChevronLeft size={14} />
                                        </button>

                                        {Array.from({ length: Math.min(totalHfoPages, 7) }, (_, i) => {
                                            const pageNum = i + 1;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    type="button"
                                                    onClick={() => setHfoPage(pageNum)}
                                                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                        hfoPage === pageNum
                                                            ? "bg-emerald-600 text-white shadow-2xs"
                                                            : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}

                                        <button
                                            type="button"
                                            onClick={() => setHfoPage((p) => Math.min(totalHfoPages, p + 1))}
                                            disabled={hfoPage >= totalHfoPages}
                                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 cursor-pointer shadow-2xs"
                                            title="Halaman Berikutnya"
                                        >
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════
                    MODAL SHEET RINCIAN CREW (JIKA DOKUMEN SCOPE CREW)
                ═══════════════════════════════════════════════════════════════ */}
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
                                            {activeCellModal.rig.code} • {activeCellModal.category.nama_dokumen}
                                        </h3>
                                        <p className="text-[11px] text-slate-500 font-medium">
                                            Periode {selectedMonth} {selectedYear} • {activeCellModal.cell.records.length} Berkas Tersimpan
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
                                {activeCellModal.cell.records.map((rec) => {
                                    const appStatus = strtolower(rec.approval_status || "");
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
                                                        Crew {rec.crew}
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
                                    href={`/csms/rig/${activeCellModal.rig.id}?bulan=${selectedMonth}&tahun=${selectedYear}`}
                                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1"
                                >
                                    <span>Buka Matriks Lengkap {activeCellModal.rig.code}</span>
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

                {/* ═══════════════════════════════════════════════════════════════
                    IN-APP DOCUMENT VIEWER MODAL (ACC & REVISI)
                ═══════════════════════════════════════════════════════════════ */}
                <DocumentViewerModal
                    isOpen={viewerState.isOpen}
                    onClose={() => setViewerState(prev => ({ ...prev, isOpen: false }))}
                    record={viewerState.record}
                    category={viewerState.category}
                    crew={viewerState.crew}
                    isAdmin={true}
                    onApprove={handleApproveFromViewer}
                    onRevise={handleReviseFromViewer}
                    initialIndex={viewerState.initialIndex}
                />
            </div>
        </AdminLayout>
    );
}

const AVATAR_GRADIENTS = [
    "from-emerald-500 to-teal-700",
    "from-blue-500 to-indigo-700",
    "from-amber-500 to-orange-700",
    "from-purple-500 to-indigo-800",
    "from-rose-500 to-red-700",
    "from-cyan-500 to-blue-700",
    "from-teal-500 to-emerald-800",
];

function getHfoAvatarGradient(name) {
    if (!name) return AVATAR_GRADIENTS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % AVATAR_GRADIENTS.length;
    return AVATAR_GRADIENTS[idx];
}

function getHfoInitials(name) {
    if (!name) return "HF";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function strtolower(str) {
    return String(str || "").toLowerCase();
}
