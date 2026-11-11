import React, { useState, useMemo, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import DocumentViewerModal from "@/Components/DocumentViewerModal";
import YearSelect from "@/Components/YearSelect";
import CustomDropdown from "@/Components/CustomDropdown";
import CustomDateRangePicker, { formatDateDisplay } from "@/Components/CustomDateRangePicker";
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
    BarChart3,
    Table,
    ChevronUp,
    Calendar,
    ArrowRight,
    Crown,
    Medal,
    Building2,
    LayoutGrid,
} from "lucide-react";

export default function ComplianceOverview({
    summaryStats = {},
    rigMatrix = [],
    categories = [],
    availableYears = [],
    filter = {},
    hfoStats = {},
    activeTab: initialActiveTab = "hfo",
}) {
    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];

    const [selectedMonth, setSelectedMonth] = useState(filter.bulan || "Januari");
    const [selectedYear, setSelectedYear] = useState(filter.tahun || new Date().getFullYear());

    // Helper default tanggal rentang (30 hari terakhir s/d hari ini)
    const getDefaultStartDate = () => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split("T")[0];
    };
    const getDefaultEndDate = () => {
        return new Date().toISOString().split("T")[0];
    };

    const [startDate, setStartDate] = useState(filter.start_date || getDefaultStartDate());
    const [endDate, setEndDate] = useState(filter.end_date || getDefaultEndDate());

    useEffect(() => {
        if (filter.start_date) setStartDate(filter.start_date);
        if (filter.end_date) setEndDate(filter.end_date);
    }, [filter.start_date, filter.end_date]);

    const [searchRig, setSearchRig] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'perfect' | 'high' | 'attention'

    // ── TAB NAVIGATION STATE ─────────────────────────────────────────────────
    const [currentTab, setCurrentTab] = useState(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get("tab");
            if (tabParam === "hfo" || tabParam === "hfo_rig" || tabParam === "matrix") return tabParam;
        }
        return initialActiveTab || "matrix";
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get("tab");
            if (tabParam && (tabParam === "hfo" || tabParam === "hfo_rig" || tabParam === "matrix")) {
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
    const [showHfoTable, setShowHfoTable] = useState(false);
    const [selectedHfoDetail, setSelectedHfoDetail] = useState(null);
    const [showHfoLegend, setShowHfoLegend] = useState(false);

    // ── PER RIG VIEW STATE & FILTERS ─────────────────────────────────────────
    const [searchRigHfo, setSearchRigHfo] = useState("");
    const [rigStatusFilter, setRigStatusFilter] = useState("all"); // 'all' | 'solid' | 'partial' | 'inactive'
    const [rigSortBy, setRigSortBy] = useState("rig_code_asc"); // 'rig_code_asc' | 'uploaded_desc' | 'approval_rate_desc'
    const [selectedRigPill, setSelectedRigPill] = useState("all");

    // Top 3 Ranking untuk Podium Kehormatan K3
    const top3Hfos = useMemo(() => {
        const fullList = [...(hfoStats?.full_list || [])];
        fullList.sort((a, b) => {
            const upDiff = (b.total_uploaded || 0) - (a.total_uploaded || 0);
            if (upDiff !== 0) return upDiff;
            const appDiff = (b.approved_count || 0) - (a.approved_count || 0);
            if (appDiff !== 0) return appDiff;
            return (a.name || "").localeCompare(b.name || "");
        });

        const hasAnyUploads = (fullList[0]?.total_uploaded || 0) > 0;
        return {
            rank1: fullList[0] || null,
            rank2: fullList[1] || null,
            rank3: fullList[2] || null,
            hasAnyUploads,
        };
    }, [hfoStats?.full_list]);

    // Wawasan Performa K3 (Bento Grid)
    const bentoMetrics = useMemo(() => {
        const totalHfos = hfoStats?.total_hfos || 60;
        const activeCount = hfoStats?.active_count || 0;
        const moderateCount = hfoStats?.moderate_count || 0;
        const inactiveCount = hfoStats?.inactive_count || 0;
        const activeTotal = activeCount + moderateCount;
        const participationRate = totalHfos > 0 ? Math.round((activeTotal / totalHfos) * 100) : 0;

        const totalUploads = hfoStats?.total_uploads || 0;
        const fullList = hfoStats?.full_list || [];
        const totalApproved = fullList.reduce((acc, h) => acc + (h.approved_count || 0), 0);
        const approvalRate = totalUploads > 0 ? Math.round((totalApproved / totalUploads) * 100) : 0;
        const avgUploadPerActive = activeTotal > 0 ? (totalUploads / activeTotal).toFixed(1) : 0;

        const topRig = (hfoStats?.top_rigs && hfoStats.top_rigs.length > 0) ? hfoStats.top_rigs[0] : null;

        return {
            totalHfos,
            activeCount,
            moderateCount,
            inactiveCount,
            activeTotal,
            participationRate,
            totalUploads,
            totalApproved,
            approvalRate,
            avgUploadPerActive,
            topRig,
        };
    }, [hfoStats]);

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

    // ── PER RIG MEMOS & GROUPINGS ────────────────────────────────────────────
    const rigGroupsList = useMemo(() => {
        return hfoStats?.rig_groups || [];
    }, [hfoStats?.rig_groups]);

    const rigSummaryMetrics = useMemo(() => {
        const list = rigGroupsList;
        const totalRigs = list.length || 20;
        const solidRigs = list.filter((r) => r.team_status === "Solid").length;
        const partialRigs = list.filter((r) => r.team_status === "Parsial").length;
        const inactiveRigs = list.filter((r) => r.team_status === "Inaktif").length;
        const totalUploadedAll = list.reduce((acc, r) => acc + (r.total_uploaded || 0), 0);
        const totalApprovedAll = list.reduce((acc, r) => acc + (r.approved_count || 0), 0);
        const overallRigApprovalRate = totalUploadedAll > 0 ? Math.round((totalApprovedAll / totalUploadedAll) * 100) : 0;
        const topContributorRig = [...list].sort((a, b) => (b.total_uploaded || 0) - (a.total_uploaded || 0))[0] || null;

        return {
            totalRigs,
            solidRigs,
            partialRigs,
            inactiveRigs,
            solidPercentage: totalRigs > 0 ? Math.round((solidRigs / totalRigs) * 100) : 0,
            totalUploadedAll,
            totalApprovedAll,
            overallRigApprovalRate,
            topContributorRig,
        };
    }, [rigGroupsList]);

    const filteredRigGroups = useMemo(() => {
        return rigGroupsList
            .filter((rig) => {
                if (selectedRigPill !== "all" && String(rig.rig_id) !== String(selectedRigPill)) {
                    return false;
                }
                if (searchRigHfo) {
                    const q = searchRigHfo.toLowerCase();
                    const matchCode = (rig.rig_code || "").toLowerCase().includes(q);
                    const matchName = (rig.rig_name || "").toLowerCase().includes(q);
                    const matchHfo = (rig.hfos || []).some((h) => (h.name || "").toLowerCase().includes(q));
                    if (!matchCode && !matchName && !matchHfo) return false;
                }
                if (rigStatusFilter === "solid" && rig.team_status !== "Solid") return false;
                if (rigStatusFilter === "partial" && rig.team_status !== "Parsial") return false;
                if (rigStatusFilter === "inactive" && rig.team_status !== "Inaktif") return false;
                return true;
            })
            .sort((a, b) => {
                if (rigSortBy === "uploaded_desc") {
                    return (b.total_uploaded || 0) - (a.total_uploaded || 0) || (a.rig_code || "").localeCompare(b.rig_code || "");
                }
                if (rigSortBy === "rig_code_asc") {
                    return (a.rig_code || "").localeCompare(b.rig_code || "");
                }
                if (rigSortBy === "approval_rate_desc") {
                    return (b.approval_rate || 0) - (a.approval_rate || 0) || (b.total_uploaded || 0) - (a.total_uploaded || 0);
                }
                return 0;
            });
    }, [rigGroupsList, selectedRigPill, searchRigHfo, rigStatusFilter, rigSortBy]);

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
        const targetPath = typeof window !== "undefined" && window.location.pathname.includes("/hfo-stats")
            ? "/admin/csms/hfo-stats"
            : "/admin/csms/compliance";
        router.get(
            targetPath,
            { bulan: month, tahun: year, tab: currentTab, start_date: startDate, end_date: endDate },
            { preserveState: true, preserveScroll: true }
        );
    };

    // Handler perubahan filter rentang tanggal (Date Range Filter)
    const applyDateFilter = (startVal, endVal) => {
        if (!startVal || !endVal) return;
        const targetPath = typeof window !== "undefined" && window.location.pathname.includes("/hfo-stats")
            ? "/admin/csms/hfo-stats"
            : "/admin/csms/compliance";

        router.get(
            targetPath,
            {
                start_date: startVal,
                end_date: endVal,
                tab: currentTab,
                bulan: selectedMonth,
                tahun: selectedYear,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleStartDateChange = (newStart) => {
        setStartDate(newStart);
        if (newStart && endDate) {
            applyDateFilter(newStart, endDate);
        }
    };

    const handleEndDateChange = (newEnd) => {
        setEndDate(newEnd);
        if (startDate && newEnd) {
            applyDateFilter(startDate, newEnd);
        }
    };

    const handleResetDateRange = () => {
        const defStart = getDefaultStartDate();
        const defEnd = getDefaultEndDate();
        setStartDate(defStart);
        setEndDate(defEnd);
        applyDateFilter(defStart, defEnd);
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
                    router.reload({ preserveScroll: true });
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
                    router.reload({ preserveScroll: true });
                },
            }
        );
    };

    // Filter daftar rig berdasarkan pencarian dan status kepatuhan
    const filteredRigMatrix = useMemo(() => {
        return (rigMatrix || []).filter((item) => {
            if (!item || !item.rig) return false;
            const rigName = String(item.rig.name || "").toLowerCase();
            const rigCode = String(item.rig.code || "").toLowerCase();
            const q = searchRig.toLowerCase();
            const matchSearch = rigName.includes(q) || rigCode.includes(q);

            if (!matchSearch) return false;

            const percentage = item.stats?.percentage ?? 0;
            if (statusFilter === "perfect") {
                return percentage >= 100;
            }
            if (statusFilter === "high") {
                return percentage >= 80 && percentage < 100;
            }
            if (statusFilter === "attention") {
                return percentage < 80;
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

            <div className="p-4 sm:p-6 lg:p-8 max-w-[1560px] mx-auto space-y-6 font-sans text-slate-800">

                {/* ═══════════════════════════════════════════════════════════════
                    1. PORTAL HEADER CARD - PUTIH BERSIH & BERWIBAWA (IDENTIK CSMS STORAGE)
                ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs relative">
                    {/* Garis Aksen K3 Emerald Pekat di bagian atas card */}
                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900" />

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Tata Letak Kiri: Judul & Subjudul */}
                        <div className="space-y-2">
                            {/* K3 Slogan / Pill Badge Atas */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                                <Activity size={13} className="text-emerald-600" />
                                <span>REKAPITULASI TERPUSAT • MONITORING HSE & CSMS</span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                                {currentTab === "matrix"
                                    ? "Matriks Statistik & Rekap Kepatuhan RIG"
                                    : currentTab === "hfo_rig"
                                    ? "Statistik Keaktifan HFO Per Unit RIG"
                                    : "Statistik Keaktifan Petugas HFO (Global)"}
                            </h1>
                            <p className="text-slate-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
                                {currentTab === "matrix"
                                    ? "Cross-tabulation status pemenuhan dan verifikasi dokumen K3 seluruh unit RIG operasional (BMS-01 s/d BMS-21) bersanding dengan 22 kategori rekaman wajib."
                                    : currentTab === "hfo_rig"
                                    ? "Evaluasi sinergi dan performa kontribusi dokumen K3 personil HFO pada masing-masing unit RIG operasional (BMS-01 s/d BMS-21). Bandingkan keaktifan 3 personil HFO (Kru A, B, C) per unit dan pantau soliditas tim kerja."
                                    : "Leaderboard performa kontribusi unggahan berkas K3 personil Health & Safety Field Officer (HFO) secara menyeluruh di 20 unit RIG bersanding dengan podium kehormatan Top 3 dan rasio ACC Sah."}
                            </p>
                        </div>

                        {/* Tata Letak Kanan: Kontrol Aksi & Filter Periode */}
                        {currentTab !== "matrix" ? (
                            <div className="flex flex-wrap items-center gap-2.5">
                                <CustomDateRangePicker
                                    startDate={startDate}
                                    endDate={endDate}
                                    onChange={(newStart, newEnd) => {
                                        setStartDate(newStart);
                                        setEndDate(newEnd);
                                        applyDateFilter(newStart, newEnd);
                                    }}
                                    onReset={handleResetDateRange}
                                    align="right"
                                />
                                <button
                                    type="button"
                                    onClick={handleResetDateRange}
                                    title="Segarkan data rentang tanggal"
                                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-emerald-700 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                                >
                                    <RotateCcw size={15} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1.5 shadow-2xs">
                                    <span className="text-xs font-bold text-slate-500 mr-0.5">Periode:</span>
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
                        )}
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    2. TAB NAVIGASI SUB-MODUL (KAPSUL RAMPING & MENEMPEL RAPI)
                ═══════════════════════════════════════════════════════════════ */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5 flex-wrap">
                    {/* Tab 1: Matriks Kepatuhan 20 RIG */}
                    <button
                        type="button"
                        onClick={() => handleTabSwitch("matrix")}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                            currentTab === "matrix"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
                        }`}
                    >
                        <Layers size={14} />
                        <span>Matriks Kepatuhan 20 RIG</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            currentTab === "matrix"
                                ? "bg-emerald-700/80 text-emerald-100"
                                : "bg-slate-100 text-slate-600"
                        }`}>
                            {summaryStats.total_rigs || 20} Unit RIG
                        </span>
                    </button>

                    {/* Tab 2: Statistik Keseluruhan HFO */}
                    <button
                        type="button"
                        onClick={() => handleTabSwitch("hfo")}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                            currentTab === "hfo"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
                        }`}
                    >
                        <Award size={14} />
                        <span>Statistik Keseluruhan HFO</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            currentTab === "hfo"
                                ? "bg-emerald-700/80 text-emerald-100"
                                : "bg-emerald-50 text-emerald-700"
                        }`}>
                            {hfoStats?.total_hfos || 0} Petugas
                        </span>
                    </button>

                    {/* Tab 3: Keaktifan HFO Per Unit RIG */}
                    <button
                        type="button"
                        onClick={() => handleTabSwitch("hfo_rig")}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                            currentTab === "hfo_rig"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
                        }`}
                    >
                        <Building2 size={14} />
                        <span>Keaktifan HFO Per Unit RIG</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            currentTab === "hfo_rig"
                                ? "bg-emerald-700/80 text-emerald-100"
                                : "bg-emerald-50 text-emerald-700"
                        }`}>
                            {rigGroupsList.length || 20} Unit RIG
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

                                <CustomDropdown
                                    value={statusFilter}
                                    onChange={(val) => setStatusFilter(val)}
                                    options={[
                                        { value: "all", label: `Semua Status RIG (${rigMatrix.length})` },
                                        { value: "perfect", label: "Kepatuhan 100%", badge: "100%" },
                                        { value: "high", label: "Kepatuhan 80% - 99%", badge: "80-99%" },
                                        { value: "attention", label: "Kepatuhan < 80%", badge: "<80%" },
                                    ]}
                                    headerLabel="STATUS KEPATUHAN"
                                    size="sm"
                                    minWidth="w-56"
                                />
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
                        HFO ACTIVITY MONITORING & LEADERBOARD MODULE (DESIGN TASTE)
                    ═══════════════════════════════════════════════════════════════ */
                    <div className="space-y-6 animate-fade-in">

                        {/* ── HFO SUB-VIEW SWITCHER PILL BAR & KETERANGAN TOGGLE ── */}
                        <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs flex-wrap">
                            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => handleTabSwitch("hfo")}
                                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        currentTab === "hfo"
                                            ? "bg-white text-emerald-800 shadow-xs"
                                            : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >
                                    <Users size={13} className={currentTab === "hfo" ? "text-emerald-600" : "text-slate-400"} />
                                    <span>Keseluruhan HFO (Global)</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        currentTab === "hfo" ? "bg-emerald-50 text-emerald-700" : "bg-slate-200/80 text-slate-500"
                                    }`}>
                                        {hfoStats?.total_hfos || 0} Petugas
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleTabSwitch("hfo_rig")}
                                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        currentTab === "hfo_rig"
                                            ? "bg-white text-emerald-800 shadow-xs"
                                            : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >
                                    <Building2 size={13} className={currentTab === "hfo_rig" ? "text-emerald-600" : "text-slate-400"} />
                                    <span>Keaktifan Per Unit RIG</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        currentTab === "hfo_rig" ? "bg-emerald-50 text-emerald-700" : "bg-slate-200/80 text-slate-500"
                                    }`}>
                                        {rigGroupsList.length || 20} RIG
                                    </span>
                                </button>
                            </div>

                            {/* Toggle Keterangan & Indikator K3 */}
                            <button
                                type="button"
                                onClick={() => setShowHfoLegend(!showHfoLegend)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 border border-slate-200 transition-colors cursor-pointer"
                            >
                                <HelpCircle size={14} className="text-emerald-600" />
                                <span>{showHfoLegend ? "Sembunyikan Keterangan K3" : "Buka Keterangan & Panduan K3"}</span>
                                <ChevronDown size={13} className={`transition-transform duration-200 ${showHfoLegend ? "rotate-180" : ""}`} />
                            </button>
                        </div>

                        {/* ── KETERANGAN & PANDUAN RINGKAS ── */}
                        {showHfoLegend && (
                            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs animate-in fade-in duration-150">
                                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 mb-3">
                                    <div className="flex items-center gap-2">
                                        <Info size={15} className="text-emerald-700" />
                                        <h4 className="text-xs font-bold text-slate-800">
                                            {currentTab === "hfo_rig"
                                                ? "Keterangan Status Keaktifan HFO Unit RIG"
                                                : "Keterangan Standar Keaktifan HFO Global"}
                                        </h4>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowHfoLegend(false)}
                                        className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>

                                {currentTab === "hfo_rig" ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                                        <div className="flex items-start gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                                            <div>
                                                <strong className="text-slate-800 font-bold block text-xs">Kompak (3/3 HFO Aktif)</strong>
                                                <span className="text-[11.5px] text-slate-500">Seluruh 3 petugas shift (Kru A, B, C) aktif mengunggah dokumen K3 pada rentang tanggal ini.</span>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 mt-1" />
                                            <div>
                                                <strong className="text-slate-800 font-bold block text-xs">Parsial (1-2 HFO Aktif)</strong>
                                                <span className="text-[11.5px] text-slate-500">Hanya sebagian petugas yang aktif. Perlu koordinasi untuk shift kru yang belum menyerahkan rekaman.</span>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0 mt-1" />
                                            <div>
                                                <strong className="text-slate-800 font-bold block text-xs">Belum Ada Berkas (0/3)</strong>
                                                <span className="text-[11.5px] text-slate-500">Belum ada dokumen rekaman K3 yang diunggah dari unit RIG ini selama rentang tanggal ini.</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs text-slate-600">
                                        <div className="flex items-start gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                                            <div>
                                                <strong className="text-slate-800 font-bold block text-xs">Sangat Aktif (≥ 5 Berkas)</strong>
                                                <span className="text-[11px] text-slate-500">Kontribusi pengunggahan dokumen K3 tinggi dan konsisten.</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-1" />
                                            <div>
                                                <strong className="text-slate-800 font-bold block text-xs">Cukup Aktif (1-4 Berkas)</strong>
                                                <span className="text-[11px] text-slate-500">Telah mengunggah berkas, perlu pemenuhan kategori lainnya.</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 mt-1" />
                                            <div>
                                                <strong className="text-slate-800 font-bold block text-xs">Belum Aktif (0 Berkas)</strong>
                                                <span className="text-[11px] text-slate-500">Belum ada berkas K3 terunggah pada rentang ini.</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 mt-1" />
                                            <div>
                                                <strong className="text-slate-800 font-bold block text-xs">ACC Sah</strong>
                                                <span className="text-[11px] text-slate-500">Dokumen telah diverifikasi dan disetujui tanpa revisi.</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {currentTab === "hfo_rig" ? (
                            /* ═══════════════════════════════════════════════════════════════
                                KEAKTIFAN HFO PER UNIT RIG (SEDERHANA, RAPI & MUDAH DIPAHAMI)
                            ═══════════════════════════════════════════════════════════════ */
                            <div className="space-y-4">
                                {/* 1. Ringkasan Singkat 3 Metrik (Bersih & Elegan) */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
                                        <div>
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Berkas RIG</span>
                                            <div className="text-2xl font-black text-slate-900 mt-0.5 flex items-baseline gap-1.5">
                                                <span>{rigSummaryMetrics.totalUploadedAll}</span>
                                                <span className="text-xs font-semibold text-slate-400">Berkas</span>
                                            </div>
                                            <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">
                                                {rigSummaryMetrics.totalApprovedAll} Berkas ACC Sah ({rigSummaryMetrics.overallRigApprovalRate}%)
                                            </span>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                                            <FileText size={18} />
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
                                        <div>
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Unit RIG Kompak</span>
                                            <div className="text-2xl font-black text-emerald-700 mt-0.5 flex items-baseline gap-1.5">
                                                <span>{rigSummaryMetrics.solidRigs}</span>
                                                <span className="text-xs font-semibold text-slate-400">/ {rigSummaryMetrics.totalRigs} Unit RIG</span>
                                            </div>
                                            <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                                                Seluruh 3 HFO aktif mengunggah ({rigSummaryMetrics.solidPercentage}%)
                                            </span>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                                            <CheckCircle2 size={18} />
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
                                        <div>
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Perlu Perhatian</span>
                                            <div className="text-2xl font-black text-amber-600 mt-0.5 flex items-baseline gap-1.5">
                                                <span>{rigSummaryMetrics.partialRigs + rigSummaryMetrics.inactiveRigs}</span>
                                                <span className="text-xs font-semibold text-slate-400">Unit RIG</span>
                                            </div>
                                            <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                                                {rigSummaryMetrics.partialRigs} Parsial • {rigSummaryMetrics.inactiveRigs} Belum Unggah
                                            </span>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                                            <AlertTriangle size={18} />
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Bar Kontrol Rapi & Praktis */}
                                <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                                    {/* Pencarian */}
                                    <div className="relative w-full sm:w-80">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={searchRigHfo}
                                            onChange={(e) => setSearchRigHfo(e.target.value)}
                                            placeholder="Cari nama RIG atau petugas HFO..."
                                            className="w-full text-xs font-medium pl-8 pr-7 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs placeholder-slate-400"
                                        />
                                        {searchRigHfo && (
                                            <button
                                                type="button"
                                                onClick={() => setSearchRigHfo("")}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                            >
                                                <X size={13} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Filter Status & Sortir */}
                                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                                        <CustomDropdown
                                            value={rigStatusFilter}
                                            onChange={(val) => setRigStatusFilter(val)}
                                            options={[
                                                { value: "all", label: `Semua Status (${rigGroupsList.length})` },
                                                { value: "solid", label: `Kompak • 3/3 HFO Aktif (${rigSummaryMetrics.solidRigs})` },
                                                { value: "partial", label: `Parsial • 1-2 HFO Aktif (${rigSummaryMetrics.partialRigs})` },
                                                { value: "inactive", label: `Belum Ada Berkas (${rigSummaryMetrics.inactiveRigs})` },
                                            ]}
                                            headerLabel="STATUS RIG"
                                            size="sm"
                                            minWidth="w-52"
                                        />

                                        <CustomDropdown
                                            value={rigSortBy}
                                            onChange={(val) => setRigSortBy(val)}
                                            options={[
                                                { value: "rig_code_asc", label: "Kode RIG (BMS-01 - BMS-21)" },
                                                { value: "uploaded_desc", label: "Unggahan Terbanyak ↓" },
                                                { value: "approval_rate_desc", label: "Rasio ACC Tertinggi" },
                                            ]}
                                            headerLabel="URUTKAN"
                                            size="sm"
                                            minWidth="w-56"
                                        />
                                    </div>
                                </div>

                                {/* 3. Daftar Kartu Unit RIG (Rapi, Sejajar, & Tidak Rame) */}
                                {filteredRigGroups.length === 0 ? (
                                    <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">
                                        <Building2 size={32} className="mx-auto text-slate-300 mb-2" />
                                        <p className="font-bold text-slate-700 text-xs">Tidak ada Unit RIG yang cocok</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Silakan sesuaikan kata kunci pencarian atau ubah filter status.</p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchRigHfo("");
                                                setRigStatusFilter("all");
                                                setRigSortBy("rig_code_asc");
                                            }}
                                            className="mt-3 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs hover:bg-emerald-100 cursor-pointer"
                                        >
                                            Reset Filter
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filteredRigGroups.map((rig) => {
                                            const isSolid = rig.team_status === "Solid";
                                            const isPartial = rig.team_status === "Parsial";

                                            return (
                                                <div
                                                    key={rig.rig_id}
                                                    className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
                                                >
                                                    <div>
                                                        {/* Header Kartu: Kode RIG, Status, dan Total */}
                                                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-base font-black text-slate-900 tracking-tight">
                                                                        RIG {rig.rig_code}
                                                                    </span>
                                                                    <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
                                                                        isSolid
                                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                                            : isPartial
                                                                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                                                                            : "bg-slate-50 text-slate-500 border border-slate-200"
                                                                    }`}>
                                                                        {isSolid ? "Kompak (3/3 Aktif)" : isPartial ? `${rig.active_hfos}/3 HFO Aktif` : "Belum Ada Berkas"}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[11.5px] text-slate-400 truncate block mt-0.5 max-w-[260px]" title={rig.rig_name}>
                                                                    {rig.rig_name}
                                                                </span>
                                                            </div>

                                                            {/* Total Berkas Ringkas */}
                                                            <div className="text-right shrink-0">
                                                                <span className="text-sm font-black text-slate-900 block">
                                                                    {rig.total_uploaded} <span className="text-xs font-semibold text-slate-400">Berkas</span>
                                                                </span>
                                                                <span className="text-[10.5px] font-semibold text-emerald-700">
                                                                    {rig.approved_count} ACC ({rig.approval_rate}%)
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Daftar 3 Personil HFO (Bersih, Sejajar, & Teratur) */}
                                                        <div className="py-2.5 divide-y divide-slate-100 text-xs">
                                                            {rig.hfos && rig.hfos.length > 0 ? (
                                                                rig.hfos.map((hfo, hIdx) => {
                                                                    const hasUploaded = (hfo.total_uploaded || 0) > 0;
                                                                    return (
                                                                        <div key={hfo.name + hIdx} className="py-2 flex items-center justify-between gap-2">
                                                                            {/* Kiri: Label Kru & Nama Petugas */}
                                                                            <div className="flex items-center gap-2 min-w-0">
                                                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 shrink-0">
                                                                                    {hfo.crew_label || `Kru ${String.fromCharCode(65 + hIdx)}`}
                                                                                </span>
                                                                                <span className="font-bold text-slate-800 text-xs truncate" title={hfo.name}>
                                                                                    {hfo.name}
                                                                                </span>
                                                                            </div>

                                                                            {/* Kanan: Rekap Berkas & Tombol Detail */}
                                                                            <div className="flex items-center gap-2 shrink-0">
                                                                                {hasUploaded ? (
                                                                                    <span className="text-[11.5px] font-bold text-emerald-700">
                                                                                        {hfo.total_uploaded} Berkas <span className="text-[10px] font-medium text-slate-400">({hfo.approved_count} ACC)</span>
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="text-[11px] text-slate-400 italic">
                                                                                        Belum unggah
                                                                                    </span>
                                                                                )}

                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setSelectedHfoDetail(hfo)}
                                                                                    className="p-1 rounded text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                                                                    title={`Lihat riwayat berkas ${hfo.name}`}
                                                                                >
                                                                                    <Eye size={13} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })
                                                            ) : (
                                                                <div className="py-3 text-center text-slate-400 text-xs italic">
                                                                    Belum ada penugasan HFO pada unit ini
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Footer Kartu: Keterangan Singkat & Tautan Matriks */}
                                                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                                                        <span className="text-[11px] text-slate-500 truncate mr-2">
                                                            {isSolid
                                                                ? "Seluruh 3 petugas HFO aktif mengunggah berkas K3."
                                                                : isPartial
                                                                ? `${rig.active_hfos} dari 3 petugas aktif. Perlu koordinasi kru.`
                                                                : "Belum ada berkas K3 terunggah dari unit ini."}
                                                        </span>

                                                        <Link
                                                            href={`/csms/rig/${rig.rig_id}?bulan=${selectedMonth}&tahun=${selectedYear}`}
                                                            className="text-[11.5px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline shrink-0 flex items-center gap-1"
                                                        >
                                                            <span>Buka RIG</span>
                                                            <ArrowUpRight size={12} />
                                                        </Link>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* ═══════════════════════════════════════════════════════════════
                                STATISTIK KESELURUHAN HFO (GLOBAL LEADERBOARD & PODIUM)
                            ═══════════════════════════════════════════════════════════════ */
                            <div className="space-y-8">
                                {/* ── 1. PODIUM KEHORMATAN K3 (OLYMPIC TIERED 2 - 1 - 3) ── */}
                        {!top3Hfos.hasAnyUploads ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center shadow-xs">
                                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                                    <Trophy size={32} />
                                </div>
                                <h3 className="text-lg font-black text-slate-800 tracking-tight">
                                    Podium Kehormatan K3 Belum Terisi
                                </h3>
                                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                                    Belum ada personil HFO yang mengunggah berkas K3 pada rentang tanggal yang dipilih ({startDate && endDate ? `${formatDateDisplay(startDate)} s/d ${formatDateDisplay(endDate)}` : "periode ini"}). Sesuaikan rentang tanggal atau klik tombol reset filter.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleResetDateRange}
                                    className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
                                >
                                    <RotateCcw size={13} />
                                    <span>Reset Rentang Tanggal</span>
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-3">
                                {/* PODIUM 2: RUNNER-UP 1 (SILVER, KIRI) */}
                                {top3Hfos.rank2 ? (
                                    <div className="order-2 md:order-1 bg-gradient-to-b from-slate-50/90 via-white to-slate-50/40 rounded-2xl border-2 border-slate-300/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300" />

                                        {/* Header Badge */}
                                        <div className="flex items-center justify-between gap-2 mb-4">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-xs font-black uppercase tracking-wider shadow-2xs">
                                                <Medal size={14} className="text-slate-600" />
                                                <span>RUNNER-UP 1 • PERAK</span>
                                            </span>
                                            <span className="text-xs font-mono font-bold text-slate-400">#2 PODIUM</span>
                                        </div>

                                        {/* Profile Info */}
                                        <div className="flex items-center gap-3.5 mb-4">
                                            <div className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${getHfoAvatarGradient(top3Hfos.rank2.name)} text-white font-black text-base flex items-center justify-center shrink-0 shadow-md ring-2 ring-slate-200`}>
                                                {getHfoInitials(top3Hfos.rank2.name)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg truncate group-hover:text-emerald-700 transition-colors">
                                                    {top3Hfos.rank2.name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                        {top3Hfos.rank2.rig_code}
                                                    </span>
                                                    <span className="text-xs text-slate-400 truncate">{top3Hfos.rank2.rig_name}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Honorary Title & Narrative */}
                                        <div className="bg-slate-100/70 border border-slate-200/80 rounded-xl p-3.5 mb-4">
                                            <div className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-1">
                                                <Award size={13} className="text-slate-600" />
                                                <span>Distinguished Safety Specialist</span>
                                            </div>
                                            <p className="text-xs text-slate-600 leading-relaxed italic">
                                                &ldquo;Menunjukkan dedikasi tinggi dan konsistensi teruji dalam pelaporan 21 kategori dokumen rekaman K3 berkala. Menjadi pilar kestabilan kepatuhan lapangan yang tangguh.&rdquo;
                                            </p>
                                        </div>

                                        {/* Stat Numbers */}
                                        <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-xl bg-white border border-slate-200/70 mb-4 text-center">
                                            <div>
                                                <div className="text-xl font-black text-slate-900">{top3Hfos.rank2.total_uploaded}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase">Berkas</div>
                                            </div>
                                            <div className="border-x border-slate-100">
                                                <div className="text-xl font-black text-emerald-700">{top3Hfos.rank2.approved_count}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase">ACC Sah</div>
                                            </div>
                                            <div>
                                                <div className="text-xl font-black text-amber-700">{top3Hfos.rank2.pending_count}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase">Pending</div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            type="button"
                                            onClick={() => setSelectedHfoDetail(top3Hfos.rank2)}
                                            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                                        >
                                            <Eye size={14} />
                                            <span>Lihat Profil & Riwayat Audit</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="order-2 md:order-1 hidden md:block" />
                                )}

                                {/* PODIUM 1: GRAND CHAMPION (GOLD, TENGAH ELEVATED) */}
                                {top3Hfos.rank1 && (
                                    <div className="order-1 md:order-2 md:-translate-y-4 bg-gradient-to-b from-amber-50/70 via-white to-amber-50/30 rounded-2xl border-2 border-amber-400/80 p-6 sm:p-7 shadow-xl ring-4 ring-amber-400/20 hover:shadow-2xl transition-all flex flex-col justify-between relative overflow-hidden group z-10">
                                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

                                        {/* Watermark Icon */}
                                        <Crown size={96} className="absolute -right-4 -bottom-4 text-amber-200/25 pointer-events-none" />

                                        {/* Header Badge */}
                                        <div className="flex items-center justify-between gap-2 mb-4">
                                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 text-xs font-black uppercase tracking-wider shadow-sm">
                                                <Crown size={14} className="text-amber-950 fill-amber-950" />
                                                <span>JUARA 1 • GOLD CHAMPION</span>
                                            </span>
                                            <div className="flex items-center gap-1 text-xs font-mono font-black text-amber-800">
                                                <Trophy size={14} className="text-amber-500" />
                                                <span>TERBAIK #1</span>
                                            </div>
                                        </div>

                                        {/* Profile Info */}
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getHfoAvatarGradient(top3Hfos.rank1.name)} text-white font-black text-xl flex items-center justify-center shrink-0 shadow-lg ring-4 ring-amber-300/80`}>
                                                {getHfoInitials(top3Hfos.rank1.name)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-black text-slate-900 text-lg sm:text-xl truncate group-hover:text-amber-700 transition-colors">
                                                    {top3Hfos.rank1.name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <span className="px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                                                        {top3Hfos.rank1.rig_code}
                                                    </span>
                                                    <span className="text-xs text-slate-500 font-medium truncate">{top3Hfos.rank1.rig_name}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Honorary Title & Narrative */}
                                        <div className="bg-amber-100/60 border border-amber-300/80 rounded-xl p-3.5 mb-4">
                                            <div className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5 mb-1">
                                                <Sparkles size={14} className="text-amber-600" />
                                                <span>Grand HSE Vanguard of the Period</span>
                                            </div>
                                            <p className="text-xs text-slate-700 leading-relaxed font-medium italic">
                                                &ldquo;Menempati puncak performa dengan kontribusi dokumen K3 terbanyak dan rasio persetujuan (ACC Sah) tertinggi tanpa cela. Menjadi teladan disiplin zero-incident di seluruh unit RIG BMS.&rdquo;
                                            </p>
                                        </div>

                                        {/* Stat Numbers */}
                                        <div className="grid grid-cols-3 gap-2 py-3.5 px-4 rounded-xl bg-white border border-amber-200/90 mb-4 text-center shadow-xs">
                                            <div>
                                                <div className="text-2xl font-black text-slate-900">{top3Hfos.rank1.total_uploaded}</div>
                                                <div className="text-[10px] font-bold text-slate-500 uppercase">Total Berkas</div>
                                            </div>
                                            <div className="border-x border-slate-100">
                                                <div className="text-2xl font-black text-emerald-700">{top3Hfos.rank1.approved_count}</div>
                                                <div className="text-[10px] font-bold text-slate-500 uppercase">ACC Sah</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-black text-amber-700">{top3Hfos.rank1.pending_count}</div>
                                                <div className="text-[10px] font-bold text-slate-500 uppercase">Pending</div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            type="button"
                                            onClick={() => setSelectedHfoDetail(top3Hfos.rank1)}
                                            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-amber-950 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                                        >
                                            <Eye size={14} />
                                            <span>Lihat Profil & Riwayat Audit Juara</span>
                                        </button>
                                    </div>
                                )}

                                {/* PODIUM 3: RUNNER-UP 2 (BRONZE, KANAN) */}
                                {top3Hfos.rank3 ? (
                                    <div className="order-3 md:order-3 bg-gradient-to-b from-amber-50/20 via-white to-amber-50/10 rounded-2xl border-2 border-amber-700/30 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800" />

                                        {/* Header Badge */}
                                        <div className="flex items-center justify-between gap-2 mb-4">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wider shadow-2xs">
                                                <Medal size={14} className="text-amber-700" />
                                                <span>RUNNER-UP 2 • PERUNGGU</span>
                                            </span>
                                            <span className="text-xs font-mono font-bold text-slate-400">#3 PODIUM</span>
                                        </div>

                                        {/* Profile Info */}
                                        <div className="flex items-center gap-3.5 mb-4">
                                            <div className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${getHfoAvatarGradient(top3Hfos.rank3.name)} text-white font-black text-base flex items-center justify-center shrink-0 shadow-md ring-2 ring-amber-200`}>
                                                {getHfoInitials(top3Hfos.rank3.name)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg truncate group-hover:text-amber-800 transition-colors">
                                                    {top3Hfos.rank3.name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                                                        {top3Hfos.rank3.rig_code}
                                                    </span>
                                                    <span className="text-xs text-slate-400 truncate">{top3Hfos.rank3.rig_name}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Honorary Title & Narrative */}
                                        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 mb-4">
                                            <div className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5 mb-1">
                                                <ShieldCheck size={13} className="text-amber-700" />
                                                <span>Vigilant Safety Guardian</span>
                                            </div>
                                            <p className="text-xs text-slate-600 leading-relaxed italic">
                                                &ldquo;Memiliki kepekaan tinggi dalam inspeksi harian dan pengawalan berkas keselamatan lintas kru. Menjaga kontinuitas pelaporan K3 tetap berjalan prima tanpa henti.&rdquo;
                                            </p>
                                        </div>

                                        {/* Stat Numbers */}
                                        <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-xl bg-white border border-slate-200/70 mb-4 text-center">
                                            <div>
                                                <div className="text-xl font-black text-slate-900">{top3Hfos.rank3.total_uploaded}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase">Berkas</div>
                                            </div>
                                            <div className="border-x border-slate-100">
                                                <div className="text-xl font-black text-emerald-700">{top3Hfos.rank3.approved_count}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase">ACC Sah</div>
                                            </div>
                                            <div>
                                                <div className="text-xl font-black text-amber-700">{top3Hfos.rank3.pending_count}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase">Pending</div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            type="button"
                                            onClick={() => setSelectedHfoDetail(top3Hfos.rank3)}
                                            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                                        >
                                            <Eye size={14} />
                                            <span>Lihat Profil & Riwayat Audit</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="order-3 md:order-3 hidden md:block" />
                                )}
                            </div>
                        )}

                        {/* ── 2. BENTO GRID PERFORMANCE INTELLIGENCE ── */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* Card A: Indeks Partisipasi HFO Global */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                            <Users size={12} className="text-emerald-700" />
                                            <span>PARTISIPASI LAPANGAN</span>
                                        </span>
                                        <span className="text-xs font-extrabold text-emerald-700">
                                            {bentoMetrics.participationRate}% Aktif
                                        </span>
                                    </div>
                                    <div className="text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-1.5">
                                        <span>{bentoMetrics.activeTotal}</span>
                                        <span className="text-sm font-semibold text-slate-400">/ {bentoMetrics.totalHfos} Petugas</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Petugas HFO yang telah mengunggah rekaman K3 periode ini
                                    </p>
                                </div>

                                <div className="mt-5 space-y-2">
                                    {/* Stacked Progress Bar */}
                                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                                        <div
                                            className="bg-emerald-500 h-full transition-all duration-500"
                                            style={{ width: `${bentoMetrics.totalHfos > 0 ? (bentoMetrics.activeCount / bentoMetrics.totalHfos) * 100 : 0}%` }}
                                            title={`${bentoMetrics.activeCount} Sangat Aktif`}
                                        />
                                        <div
                                            className="bg-blue-400 h-full transition-all duration-500"
                                            style={{ width: `${bentoMetrics.totalHfos > 0 ? (bentoMetrics.moderateCount / bentoMetrics.totalHfos) * 100 : 0}%` }}
                                            title={`${bentoMetrics.moderateCount} Cukup Aktif`}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-1">
                                        <span className="flex items-center gap-1 text-emerald-700">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                            {bentoMetrics.activeCount} Sangat Aktif (≥5)
                                        </span>
                                        <span className="flex items-center gap-1 text-blue-700">
                                            <span className="w-2 h-2 rounded-full bg-blue-400" />
                                            {bentoMetrics.moderateCount} Cukup Aktif (1-4)
                                        </span>
                                        <span className="flex items-center gap-1 text-slate-400">
                                            <span className="w-2 h-2 rounded-full bg-slate-200" />
                                            {bentoMetrics.inactiveCount} Belum Aktif
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card B: Integritas Berkas & Rasio ACC Sah */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                            <ShieldCheck size={12} className="text-blue-700" />
                                            <span>KUALITAS & ACC SAH</span>
                                        </span>
                                        <span className="text-xs font-extrabold text-blue-700">
                                            {bentoMetrics.approvalRate}% Tingkat ACC
                                        </span>
                                    </div>
                                    <div className="text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-1.5">
                                        <span>{bentoMetrics.totalApproved}</span>
                                        <span className="text-sm font-semibold text-slate-400">/ {bentoMetrics.totalUploads} Berkas</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Dokumen K3 yang telah diverifikasi dan disetujui (ACC Sah)
                                    </p>
                                </div>

                                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Rata-rata Unggahan</span>
                                        <strong className="text-slate-800 font-black text-sm">{bentoMetrics.avgUploadPerActive} Berkas</strong>
                                        <span className="text-slate-400 text-[10px]"> / petugas aktif</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-slate-400 block text-[11px]">Audit Pending</span>
                                        <strong className="text-amber-600 font-black text-sm">
                                            {Math.max(0, bentoMetrics.totalUploads - bentoMetrics.totalApproved)} Berkas
                                        </strong>
                                        <span className="text-slate-400 text-[10px]"> menanti verifikasi</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card C: Unit RIG Terdisiplin */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                                            <Flame size={12} className="text-amber-700" />
                                            <span>UNIT RIG TERAKTIF</span>
                                        </span>
                                        {bentoMetrics.topRig && (
                                            <span className="text-xs font-extrabold text-amber-800">
                                                Top Contributor
                                            </span>
                                        )}
                                    </div>

                                    {bentoMetrics.topRig ? (
                                        <div>
                                            <div className="text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
                                                <span>{bentoMetrics.topRig.code}</span>
                                                <span className="text-sm font-semibold text-slate-500 truncate max-w-[150px]">{bentoMetrics.topRig.name}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Menghimpun kontribusi terbesar dengan total <strong>{bentoMetrics.topRig.total_uploaded} dokumen K3</strong> ({bentoMetrics.topRig.approved_count} ACC Sah).
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="text-xl font-bold text-slate-700">Belum Ada Aktivitas RIG</div>
                                            <p className="text-xs text-slate-400 mt-1">Belum ada dokumen yang terunggah pada rentang ini.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                                    {bentoMetrics.topRig ? (
                                        <Link
                                            href={`/csms/rig/${bentoMetrics.topRig.id}?bulan=${selectedMonth}&tahun=${selectedYear}`}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline"
                                        >
                                            <span>Buka Matriks RIG {bentoMetrics.topRig.code}</span>
                                            <ArrowUpRight size={13} />
                                        </Link>
                                    ) : (
                                        <span className="text-xs text-slate-400">Pilih rentang tanggal lain</span>
                                    )}
                                    <span className="text-[11px] font-mono text-slate-400">20 Unit Rig CSMS</span>
                                </div>
                            </div>
                        </div>

                        {/* ── 3. DIREKTORI & SKALA KEAKTIFAN SELURUH PERSONIL HFO ── */}
                        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                            {/* Header Kontrol di Atas Tabel */}
                            <div className="p-5 border-b border-slate-100 bg-slate-50/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                                            <BarChart3 size={17} />
                                        </div>
                                        <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                                            <span>Direktori & Skala Keaktifan Personil HFO</span>
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                {filteredHfoList.length} Petugas
                                            </span>
                                        </h3>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Distribusi performa seluruh personil HFO bersanding dengan skala visual volume dokumen dan audit trail verifikasi ACC.
                                    </p>
                                </div>

                                {/* Controls: Search, Rig Filter, Status Filter, Sorting, Per-Page */}
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    {/* Search Input */}
                                    <div className="relative min-w-[180px] sm:min-w-[200px] flex-1 sm:flex-none">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={searchHfo}
                                            onChange={(e) => setSearchHfo(e.target.value)}
                                            placeholder="Cari nama HFO / RIG..."
                                            className="w-full text-xs font-semibold pl-8 pr-7 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-2xs placeholder-slate-400"
                                        />
                                        {searchHfo && (
                                            <button
                                                type="button"
                                                onClick={() => setSearchHfo("")}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                            >
                                                <X size={13} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Filter Unit RIG */}
                                    <CustomDropdown
                                        value={selectedHfoRig}
                                        onChange={(val) => setSelectedHfoRig(val)}
                                        options={[
                                            { value: "all", label: `Semua RIG (${uniqueHfoRigs.length} Unit)` },
                                            ...uniqueHfoRigs.map((rig) => ({
                                                value: rig.id,
                                                label: `RIG ${rig.code}`,
                                            })),
                                        ]}
                                        headerLabel="FILTER UNIT RIG"
                                        size="sm"
                                        minWidth="w-56"
                                    />

                                    {/* Filter Status Keaktifan */}
                                    <CustomDropdown
                                        value={hfoStatusFilter}
                                        onChange={(val) => setHfoStatusFilter(val)}
                                        options={[
                                            { value: "all", label: "Semua Keaktifan" },
                                            { value: "sangat_aktif", label: "Sangat Aktif (≥ 5)", badge: "≥ 5" },
                                            { value: "cukup_aktif", label: "Cukup Aktif (1 - 4)", badge: "1-4" },
                                            { value: "belum_aktif", label: "Belum Aktif (0)", badge: "0" },
                                        ]}
                                        headerLabel="STATUS KEAKTIFAN"
                                        size="sm"
                                        minWidth="w-48"
                                    />

                                    {/* Filter Sorting */}
                                    <CustomDropdown
                                        value={hfoSortBy}
                                        onChange={(val) => setHfoSortBy(val)}
                                        options={[
                                            { value: "uploaded_desc", label: "Unggahan Terbanyak ↓" },
                                            { value: "uploaded_asc", label: "Unggahan Tersedikit ↑" },
                                            { value: "name_asc", label: "Nama Petugas (A - Z)" },
                                            { value: "rig_asc", label: "Unit RIG Penugasan" },
                                        ]}
                                        headerLabel="URUTKAN"
                                        size="sm"
                                        minWidth="w-56"
                                    />

                                    {/* Paginasi Per Halaman */}
                                    <CustomDropdown
                                        value={hfoPerPage}
                                        onChange={(val) => setHfoPerPage(Number(val))}
                                        options={[
                                            { value: 15, label: "15 / hal" },
                                            { value: 30, label: "30 / hal" },
                                            { value: -1, label: "Semua" },
                                        ]}
                                        headerLabel="DATA PER HALAMAN"
                                        size="sm"
                                        minWidth="w-36"
                                        align="right"
                                        searchable={false}
                                    />
                                </div>
                            </div>

                            {/* Table of HFOs */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-black uppercase tracking-wider text-slate-600">
                                            <th className="py-3.5 px-4 text-center w-12">#</th>
                                            <th className="py-3.5 px-4 min-w-[220px]">Personil HFO & Penugasan</th>
                                            <th className="py-3.5 px-4 min-w-[240px]">Skala Volume Unggahan (0 - {maxHfoUploads})</th>
                                            <th className="py-3.5 px-4 min-w-[190px]">Status Verifikasi ACC</th>
                                            <th className="py-3.5 px-4 min-w-[190px]">Aktivitas Terakhir</th>
                                            <th className="py-3.5 px-4 text-center w-36">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {paginatedHfoList.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="text-center py-12 text-slate-400">
                                                    <Users size={32} className="mx-auto text-slate-300 mb-2" />
                                                    <p className="font-bold text-slate-700 text-xs">Tidak ada personil HFO yang cocok</p>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                                        Coba sesuaikan filter Unit RIG atau bersihkan kata kunci pencarian.
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSearchHfo("");
                                                            setSelectedHfoRig("all");
                                                            setHfoStatusFilter("all");
                                                            setHfoSortBy("uploaded_desc");
                                                        }}
                                                        className="mt-2.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 cursor-pointer"
                                                    >
                                                        Reset Filter
                                                    </button>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedHfoList.map((item, idx) => {
                                                const rank = hfoPerPage === -1 ? idx + 1 : (hfoPage - 1) * hfoPerPage + idx + 1;
                                                const isZero = (item.total_uploaded || 0) === 0;
                                                const barWidthPercent = maxHfoUploads > 0
                                                    ? Math.min(100, Math.round(((item.total_uploaded || 0) / maxHfoUploads) * 100))
                                                    : 0;

                                                return (
                                                    <tr key={item.name + idx} className="hover:bg-slate-50/80 transition-colors group">
                                                        {/* Rank */}
                                                        <td className="py-3.5 px-4 text-center text-slate-400 font-mono font-semibold">
                                                            {rank === 1 && item.total_uploaded > 0 ? (
                                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-black bg-amber-400 text-amber-950 shadow-2xs">
                                                                    1
                                                                </span>
                                                            ) : rank === 2 && item.total_uploaded > 0 ? (
                                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-black bg-slate-300 text-slate-800">
                                                                    2
                                                                </span>
                                                            ) : rank === 3 && item.total_uploaded > 0 ? (
                                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                                                                    3
                                                                </span>
                                                            ) : (
                                                                rank
                                                            )}
                                                        </td>

                                                        {/* Name & RIG */}
                                                        <td className="py-3.5 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getHfoAvatarGradient(item.name)} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs`}>
                                                                    {getHfoInitials(item.name)}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="font-extrabold text-slate-900 truncate">
                                                                        {item.name}
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                                        <Link
                                                                            href={`/csms/rig/${item.rig_id}?bulan=${selectedMonth}&tahun=${selectedYear}`}
                                                                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                                                                            title={`Buka Matriks ${item.rig_code}`}
                                                                        >
                                                                            <span>{item.rig_code}</span>
                                                                            <ExternalLink size={9} />
                                                                        </Link>
                                                                        <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{item.rig_name}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Visual Scale Progress Bar */}
                                                        <td className="py-3.5 px-4">
                                                            <div className="space-y-1">
                                                                <div className="flex items-center justify-between text-[11px]">
                                                                    <span className={`font-bold ${item.total_uploaded >= 5 ? "text-emerald-700" : item.total_uploaded >= 1 ? "text-amber-700" : "text-slate-400"}`}>
                                                                        {item.total_uploaded} Berkas
                                                                    </span>
                                                                    <span className="text-slate-400 font-mono text-[10px]">
                                                                        {barWidthPercent}%
                                                                    </span>
                                                                </div>
                                                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-300 ${
                                                                            item.total_uploaded >= 5
                                                                                ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                                                                                : item.total_uploaded >= 1
                                                                                ? "bg-gradient-to-r from-amber-400 to-amber-500"
                                                                                : "bg-slate-200"
                                                                        }`}
                                                                        style={{ width: isZero ? "0%" : `${Math.max(4, barWidthPercent)}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Status ACC Breakdown */}
                                                        <td className="py-3.5 px-4">
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                    <CheckCircle2 size={11} />
                                                                    <span>{item.approved_count} ACC</span>
                                                                </span>
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                                    <Clock size={11} />
                                                                    <span>{item.pending_count} Pend</span>
                                                                </span>
                                                                {item.revision_count > 0 && (
                                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                                        <RotateCcw size={10} />
                                                                        <span>{item.revision_count} Rev</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Last Activity */}
                                                        <td className="py-3.5 px-4">
                                                            {item.last_activity_date ? (
                                                                <div>
                                                                    <div className="font-bold text-slate-800 text-[11px]">
                                                                        {item.last_activity_date}
                                                                    </div>
                                                                    <div className="text-[10.5px] text-slate-400 truncate max-w-[180px]" title={item.last_activity_doc}>
                                                                        {item.last_activity_doc}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-400 italic text-[11px]">
                                                                    Belum ada unggahan
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Action Button */}
                                                        <td className="py-3.5 px-4 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedHfoDetail(item)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all cursor-pointer shadow-2xs"
                                                                title="Buka Riwayat Berkas & Audit Trail"
                                                            >
                                                                <Eye size={12} />
                                                                <span>Audit Detail</span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer Paginasi */}
                            <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                                <div>
                                    Menampilkan <strong className="text-slate-700">{filteredHfoList.length === 0 ? 0 : (hfoPage - 1) * hfoPerPage + 1}</strong> - <strong className="text-slate-700">{hfoPerPage === -1 ? filteredHfoList.length : Math.min(hfoPage * hfoPerPage, filteredHfoList.length)}</strong> dari <strong className="text-slate-700">{filteredHfoList.length}</strong> personil HFO
                                </div>

                                {totalHfoPages > 1 && (
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setHfoPage((p) => Math.max(1, p - 1))}
                                            disabled={hfoPage <= 1}
                                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 cursor-pointer shadow-2xs"
                                            title="Sebelumnya"
                                        >
                                            <ChevronLeft size={13} />
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
                                            title="Berikutnya"
                                        >
                                            <ChevronRight size={13} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── 4. MODAL IN-APP HFO AUDIT DETAIL (selectedHfoDetail) ── */}
                        {selectedHfoDetail && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
                                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 my-8 overflow-hidden relative">
                                    {/* Green K3 Top Accent */}
                                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900" />

                                    {/* Modal Header */}
                                    <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
                                        <div className="flex items-center gap-3.5">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getHfoAvatarGradient(selectedHfoDetail.name)} text-white font-black text-base flex items-center justify-center shrink-0 shadow-md`}>
                                                {getHfoInitials(selectedHfoDetail.name)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-black text-slate-900">
                                                        {selectedHfoDetail.name}
                                                    </h3>
                                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                        {selectedHfoDetail.rig_code}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                                    HSE Field Officer • {selectedHfoDetail.rig_name}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setSelectedHfoDetail(null)}
                                            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>

                                    {/* Stat Summary Row */}
                                    <div className="grid grid-cols-3 gap-3 p-5 bg-slate-50/70 border-b border-slate-100 text-center">
                                        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                                            <div className="text-xl font-black text-slate-900">{selectedHfoDetail.total_uploaded}</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Total Dokumen</div>
                                        </div>
                                        <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                                            <div className="text-xl font-black text-emerald-700">{selectedHfoDetail.approved_count}</div>
                                            <div className="text-[10px] font-bold text-emerald-600 uppercase mt-0.5">ACC Sah</div>
                                        </div>
                                        <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs">
                                            <div className="text-xl font-black text-amber-700">{selectedHfoDetail.pending_count}</div>
                                            <div className="text-[10px] font-bold text-amber-600 uppercase mt-0.5">Menunggu ACC</div>
                                        </div>
                                    </div>

                                    {/* Document List */}
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                                <FileText size={14} className="text-emerald-700" />
                                                <span>Riwayat 10 Berkas Terakhir</span>
                                            </h4>
                                            <span className="text-[11px] text-slate-400">
                                                {startDate && endDate ? `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}` : `Periode Aktif`}
                                            </span>
                                        </div>

                                        {selectedHfoDetail.recent_documents && selectedHfoDetail.recent_documents.length > 0 ? (
                                            <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1">
                                                {selectedHfoDetail.recent_documents.map((doc, dIdx) => {
                                                    const isApproved = (doc.approval_status || "").toLowerCase() === "approved";
                                                    const isPending = (doc.approval_status || "").toLowerCase() === "pending";
                                                    const isRev = ["revision", "revisi", "rejected", "ditolak"].includes((doc.approval_status || "").toLowerCase());

                                                    return (
                                                        <div
                                                            key={doc.id || dIdx}
                                                            className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
                                                        >
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-200 text-slate-800">
                                                                        Crew {doc.crew || "-"}
                                                                    </span>
                                                                    <span className="font-bold text-slate-900 text-xs truncate" title={doc.file_name}>
                                                                        {doc.file_name}
                                                                    </span>
                                                                </div>
                                                                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                                                                    <span className="font-semibold text-emerald-800">{doc.category_name}</span>
                                                                    {doc.created_at && (
                                                                        <span className="text-slate-400">• {doc.created_at}</span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 shrink-0">
                                                                {isApproved && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                                        <CheckCircle2 size={10} />
                                                                        <span>ACC</span>
                                                                    </span>
                                                                )}
                                                                {isPending && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                                                        <Clock size={10} />
                                                                        <span>Pending</span>
                                                                    </span>
                                                                )}
                                                                {isRev && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                                                        <RotateCcw size={10} />
                                                                        <span>Revisi</span>
                                                                    </span>
                                                                )}

                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setViewerState({
                                                                            isOpen: true,
                                                                            record: doc,
                                                                            category: { nama_dokumen: doc.category_name },
                                                                            crew: doc.crew,
                                                                            initialIndex: 0,
                                                                        });
                                                                    }}
                                                                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer"
                                                                    title="Pratinjau Berkas"
                                                                >
                                                                    <Eye size={13} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="py-8 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                                <FileText size={28} className="mx-auto text-slate-300 mb-1.5" />
                                                <p className="text-xs font-semibold text-slate-600">Belum ada rekaman berkas diunggah</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">Petugas ini belum mengunggah dokumen pada periode yang dipilih.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Modal Footer */}
                                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                                        <Link
                                            href={`/csms/rig/${selectedHfoDetail.rig_id}?bulan=${selectedMonth}&tahun=${selectedYear}`}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline"
                                        >
                                            <span>Buka Seluruh Matriks Unit RIG {selectedHfoDetail.rig_code}</span>
                                            <ArrowUpRight size={13} />
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => setSelectedHfoDetail(null)}
                                            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                                        >
                                            Tutup
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
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
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "HF";
    if (parts.length === 1) return (parts[0].substring(0, 2) || "HF").toUpperCase();
    return ((parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "")).toUpperCase() || "HF";
}

function strtolower(str) {
    return String(str || "").toLowerCase();
}
