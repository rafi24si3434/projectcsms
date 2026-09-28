import React, { useMemo, useState } from "react";
import { usePage } from "@inertiajs/react";
import AdminSidebar from "../../Components/AdminSidebar";
import {
    Target,
    CheckCircle2,
    TrendingUp,
    Award,
    Activity,
    Calendar,
    Filter,
    Download,
    Eye,
    Search,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Layers,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    Sparkles,
    BarChart3,
    Clock,
    Check,
    ArrowUpRight,
    X,
    FileSpreadsheet,
    Bell,
    HelpCircle,
    UserCheck,
    Flame,
    AlertTriangle,
    Zap,
    Briefcase,
} from "lucide-react";

/* ============================================================
   MASTER DEFINITIONS FOR KPI
============================================================ */

const LAGGING_MASTER = [
    { no: "1.1", key: "fatality", name: "FATALITY", category: "Lagging", isLagging: true, unit: "Case", definition: "FR = (kasus cedera x 200.000) / Jam Kerja" },
    { no: "1.2", key: "serious_lost_time_injury", name: "SERIOUS LOST TIME INJURY (>21 LOST DAY)", category: "Lagging", isLagging: true, unit: "Case", definition: "FR = (kasus cedera x 200.000) / Jam Kerja" },
    { no: "1.3", key: "restricted_work_case", name: "RESTRICTED WORK CASE (RWC)", category: "Lagging", isLagging: true, unit: "Case", definition: "FR = (kasus cedera x 200.000) / Jam Kerja" },
    { no: "1.4", key: "medical_treatment_case", name: "MEDICAL TREATMENT CASE (MTC)", category: "Lagging", isLagging: true, unit: "Case", definition: "FR = (kasus cedera x 200.000) / Jam Kerja" },
    { no: "1.5", key: "total_recordable_injury", name: "TOTAL RECORDABLE INJURY (TRI)", category: "Lagging", isLagging: true, unit: "Case", definition: "TRI = 1.1 + 1.2 + 1.3 + 1.4" },
    { no: "1.6", key: "motor_vehicle_crash", name: "MOTOR VEHICLE CRASH (MVC)", category: "Lagging", isLagging: true, unit: "Case", definition: "MVC FR = (kasus x 1.000.000) / KM" },
    { no: "1.7", key: "oil_spill", name: "TUMPAHAN / OIL SPILL", category: "Lagging", isLagging: true, unit: "Case", definition: "Record case >1 barrel" },
    { no: "1.8", key: "fire_incident", name: "FIRE", category: "Lagging", isLagging: true, unit: "Case", definition: "Record case > Rp. 100 Jt" },
    { no: "1.9", key: "property_damage", name: "PROPERTY DAMAGE", category: "Lagging", isLagging: true, unit: "Case", definition: "Record case > Rp. 100 Jt" },
    { no: "1.10", key: "security_incident", name: "SECURITY CASE", category: "Lagging", isLagging: true, unit: "Case", definition: "Record case" },
    { no: "1.11", key: "illness_fatality", name: "ILLNESS/FATALITY", category: "Lagging", isLagging: true, unit: "Case", definition: "Record case" },
    { no: "1.12", key: "reportable_case", name: "REPORTABLE CASE : OPS. INCIDENT / ETA / FAC / NEARMISS", category: "Lagging", isLagging: true, unit: "Case", definition: "Reportable case" },
];

const LEADING_MASTER = [
    { no: 1, key: "peka", name: "OBSERVASI PERILAKU (PEKA) *)", definition: "2 Laporan / Org / Bln", category: "Leading", unit: "Laporan", targetMonthly: 180, targetAnnual: 2160 },
    { no: 2, key: "hazid", name: "IDENTIFIKASI BAHAYA (HAZID/ 5 MNT RISK ASSESSMENT)", definition: "15 Laporan/ Shift / Hari", category: "Leading", unit: "Laporan", targetMonthly: 900, targetAnnual: 10800 },
    { no: 3, key: "swa", name: "SWA REPORT", definition: "3 Laporan/ Shift / Hari", category: "Leading", unit: "Laporan", targetMonthly: 60, targetAnnual: 720 },
    { no: 4, key: "safety_equipment", name: "INSPEKSI SAFETY EQUIPMENT & APD *) (Eye wash, Shower, Fire, P3K, Tandu, FBH, SCBA)", definition: "Laporan bulanan", category: "Leading", unit: "Laporan", targetMonthly: 1, targetAnnual: 12 },
    { no: 5, key: "lr_color_code", name: "EKSTERNAL INSPEKSI LR COLOR CODE", definition: "1x / semester", category: "Leading", unit: "Kegiatan", targetMonthly: "TBA", targetAnnual: 2 },
    { no: 6, key: "drops", name: "INSPEKSI BENDA JATUH / DROPS **)", definition: "Per 7 hari / 30 hari / 90 hari / 180 hari", category: "Leading", unit: "Kegiatan", targetMonthly: "TBA", targetAnnual: "TBA" },
    { no: 7, key: "vv_inspection", name: "INTERNAL INSPEKSI / V&V OLEH TEAM", definition: "Minimal 1x / bulan", category: "Leading", unit: "Laporan", targetMonthly: 1, targetAnnual: 12 },
    { no: 8, key: "audit_smk3l", name: "INSPEKSI / AUDIT SMK3L: PERALATAN, DATA PERSONAL MILIK SUBKONTRAKTOR", definition: "1x / Tahun", category: "Leading", unit: "Kegiatan", targetMonthly: "TBA", targetAnnual: 1 },
    { no: 9, key: "spot_check", name: "SPOT CHECK KENDARAAN *) **)", definition: "1x / semester", category: "Leading", unit: "Kegiatan", targetMonthly: "TBA", targetAnnual: 2 },
    { no: 10, key: "audit_sistem", name: "AUDIT INTERNAL & EKSTERNAL (Sistem manajemen *)", definition: "1x / tahun", category: "Leading", unit: "Kegiatan", targetMonthly: "TBA", targetAnnual: 1 },
    { no: 11, key: "monitoring_kepatuhan", name: "MONITORING KEPATUHAN PENGEMUDI (Mencakup speed / IVMS report / fatigue *)", definition: "100% tak ada pelanggaran", category: "Leading", unit: "%", targetMonthly: "100%", targetAnnual: "100%", isPercentage: true },
    { no: 12, key: "pti", name: "Laporan Inspeksi Kendaraan (PTI)", definition: "1 laporan (Random) / bulan / unit", category: "Leading", unit: "Laporan", targetMonthly: 11, targetAnnual: 132 },
    { no: 13, key: "mcu_random", name: "SPESIFIK MCU RANDOM : (NAPZA & MIRAS TEST *)", definition: "1x / tahun", category: "Leading", unit: "Kegiatan", targetMonthly: "TBA", targetAnnual: 1 },
    { no: 14, key: "pra_mcu", name: "PRA MCU (MCU TAHUNAN BAGI YANG KONSULTASI TAHUN SEBELUMNYA)", definition: "1x / tahun", category: "Leading", unit: "Kegiatan", targetMonthly: "TBA", targetAnnual: 1 },
    { no: 15, key: "top_mwt", name: "TOP MANAGEMENT VISIT / MWT (Level General Manager / Dir. Operasi / Direktur Utama ***)", definition: "1x / Caturwulan", category: "Leading", unit: "Kunjungan", targetMonthly: "TBA", targetAnnual: 3 },
    { no: 16, key: "mwt", name: "MANAGEMENT VISIT / MWT (Level Coord level s/d Manager *)", definition: "4X / Rig / bulan", category: "Leading", unit: "Kunjungan", targetMonthly: 4, targetAnnual: 48 },
    { no: 17, key: "tgm", name: "RAPAT RUTIN KESELAMATAN (TGM PER SHIFT/PJM)", definition: "1x / shift / hari", category: "Leading", unit: "Rapat", targetMonthly: 60, targetAnnual: 720 },
    { no: 18, key: "pre_hitch", name: "PRE HITCH MEETING", definition: "3x / Bulan", category: "Leading", unit: "Rapat", targetMonthly: 3, targetAnnual: 36 },
    { no: 19, key: "rapat_phr", name: "RAPAT/FORUM BERSAMA LEADER BMS DAN PHR.", definition: "Minimal 4x / bulan", category: "Leading", unit: "Rapat", targetMonthly: 4, targetAnnual: 48 },
    { no: 20, key: "safety_talk", name: "SAFETY TALK MONTHLY MEETING : Support Yard & RIG", definition: "Minimal 1X / Bulan", category: "Leading", unit: "Rapat", targetMonthly: 1, targetAnnual: 12 },
    { no: 21, key: "leadership_forum", name: "LEADERSHIP FORUM ***)", definition: "1X / Caturwulan", category: "Leading", unit: "Forum", targetMonthly: "TBA", targetAnnual: 3 },
    { no: 22, key: "kampanye", name: "KAMPANYE KESELAMATAN (PIN/POSTER/STIKER/ SPANDUK) *)", definition: "1X / Caturwulan", category: "Leading", unit: "Kegiatan", targetMonthly: "TBA", targetAnnual: 3 },
    { no: 23, key: "review_manajemen", name: "REVIEW, TINJAUAN MANAJEMEN *)", definition: "1X / Tahun", category: "Leading", unit: "Kegiatan", targetMonthly: "TBA", targetAnnual: 1 },
    { no: 24, key: "hygiene_noise", name: "HYGIENE MONITORING : NOISE & LUX MONITORING **)", definition: "Min 1x / semester", category: "Leading", unit: "Kegiatan", targetMonthly: "TBA", targetAnnual: 2 },
    { no: 25, key: "hygiene_mess", name: "HYGIENE MONITORING : Mess, Catering, DAM*)", definition: "Min 1x / tahun", category: "Leading", unit: "Kegiatan", targetMonthly: "TBA", targetAnnual: 1 },
    { no: 26, key: "housekeeping_rig", name: "INSPEKSI \"HOUSEKEEPING RIG\"", definition: "1x / Bulan", category: "Leading", unit: "Laporan", targetMonthly: 1, targetAnnual: 12 },
    { no: 27, key: "kontes_housekeeping", name: "PENGHARGAAN: KONTES \"HOUSEKEEPING RIG\" *)", definition: "1x / semester", category: "Leading", unit: "Penghargaan", targetMonthly: "TBA", targetAnnual: 2 },
    { no: 28, key: "laporan_lh", name: "PELAPORAN LINGKUNGAN KE DINAS LH", definition: "1x / semester", category: "Leading", unit: "Laporan", targetMonthly: "TBA", targetAnnual: 2 },
    { no: 29, key: "rig_of_the_month", name: "PENGHARGAAN: RIG OF THE MONTH INTERNAL / EXTERNAL **)", definition: "Rig Yang The Best / Mencapai target nilai yang ditentukan", category: "Leading", unit: "Penghargaan", targetMonthly: "TBA", targetAnnual: "TBA" },
    { no: 30, key: "best_peka", name: "PENGHARGAAN THE BEST BBS / PEKA", definition: "1 orang / bulan / Rig", category: "Leading", unit: "Orang", targetMonthly: 1, targetAnnual: 12 },
    { no: 31, key: "best_driver", name: "PENGHARGAAN THE BEST DRIVER", definition: "1 orang / bulan / Rig", category: "Leading", unit: "Orang", targetMonthly: 1, targetAnnual: 12 },
    { no: 32, key: "selamat_tahunan", name: "PENGHARGAAN: PENCAPAIAN KERJA SELAMAT TAHUNAN", definition: "Non recordable case dalam 1 tahun", category: "Leading", unit: "Penghargaan", targetMonthly: "TBA", targetAnnual: 1 },
    { no: 33, key: "hes_refreshing", name: "PENGHARGAAN HES REFRESHING", definition: "Per Semester / Per 1 tahun", category: "Leading", unit: "Kegiatan", targetMonthly: "TBA", targetAnnual: "2 / 1" },
    { no: 34, key: "on_site_training", name: "\"ON SITE TRAINING\" DI LOKASI *)", definition: "Min 1x / kru + Hyb / bulan", category: "Leading", unit: "Sesi", targetMonthly: 6, targetAnnual: 72 },
    { no: 35, key: "erp_drill_rig", name: "EMERGENCY RESPONSE DRILL (RIG) *)", definition: "1 x / kru + Hyb / 3 bulan (sesuai jadwal)", category: "Leading", unit: "Drill", targetMonthly: 3, targetAnnual: 36 },
    { no: 36, key: "erp_drill_yard", name: "EMERGENCY RESPONSE DRILL (YARD/WORK SHOP) *)", definition: "1 x / Semester", category: "Leading", unit: "Drill", targetMonthly: "TBA", targetAnnual: 2 },
];

function normalizeReport(report) {
    const manHoursData = report?.man_hours || report?.manHours || null;
    return {
        ...report,
        manHours: Array.isArray(manHoursData)
            ? manHoursData[0] || null
            : manHoursData,
        laggingIndicators: Array.isArray(report?.lagging_indicators)
            ? report.lagging_indicators
            : Array.isArray(report?.laggingIndicators)
              ? report.laggingIndicators
              : [],
        leadingIndicators: Array.isArray(report?.leading_indicators)
            ? report.leading_indicators
            : Array.isArray(report?.leadingIndicators)
              ? report.leadingIndicators
              : [],
    };
}

function getReportYear(report) {
    const rawDate =
        report?.report_date || report?.issued_date || report?.created_at;
    if (!rawDate) return new Date().getFullYear();
    const parsed = new Date(rawDate);
    return isNaN(parsed.getFullYear())
        ? new Date().getFullYear()
        : parsed.getFullYear();
}

function getReportMonth(report) {
    const rawDate =
        report?.report_date || report?.issued_date || report?.created_at;
    if (!rawDate) return 0;
    const parsed = new Date(rawDate);
    return isNaN(parsed.getMonth()) ? 0 : parsed.getMonth();
}

function getQuarterMonths(quarter) {
    switch (quarter) {
        case "Q1":
            return [0, 1, 2];
        case "Q2":
            return [3, 4, 5];
        case "Q3":
            return [6, 7, 8];
        case "Q4":
            return [9, 10, 11];
        default:
            return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    }
}

export default function KPIPerRig() {
    const { reports: rawReports = [] } = usePage().props;

    const reports = useMemo(() => {
        return Array.isArray(rawReports) ? rawReports.map(normalizeReport) : [];
    }, [rawReports]);

    // =====================================================
    // FILTER OPTIONS FROM DATABASE
    // =====================================================

    const availableYears = useMemo(() => {
        const years = [
            ...new Set(reports.map((r) => getReportYear(r)).filter(Boolean)),
        ];
        if (years.length === 0) years.push(new Date().getFullYear());
        return years.sort((a, b) => b - a);
    }, [reports]);

    const ALL_MASTER_RIGS = [
        "BMS#01", "BMS#02", "BMS#03", "BMS#03A", "BMS#05", "BMS#06", "BMS#07",
        "BMS#08", "BMS#09", "BMS#10", "BMS#11", "BMS#15", "BMS#16", "BMS#17",
        "BMS#18", "BMS#19", "BMS#20", "BMS#21", "BMS#22", "BMS#23"
    ];

    const availableRigs = useMemo(() => {
        const set = new Set(ALL_MASTER_RIGS);
        reports.forEach((r) => { if (r.rig_no) set.add(r.rig_no); });
        return Array.from(set);
    }, [reports]);

    const availableContracts = useMemo(() => {
        return [
            ...new Set(reports.map((r) => r.contract_no).filter(Boolean)),
        ].sort();
    }, [reports]);

    // =====================================================
    // FILTER STATE
    // =====================================================

    const [rig, setRig] = useState("All Rigs");
    const [contract, setContract] = useState("All Contracts");
    const [year, setYear] = useState(String(availableYears[0] || "2024"));
    const [period, setPeriod] = useState("All");

    const [performanceMode, setPerformanceMode] = useState("Monthly");
    const [tableCategory, setTableCategory] = useState("All"); // All | Leading | Lagging
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedKpi, setSelectedKpi] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const rowsPerPage = 6;

    // =====================================================
    // FILTERED REPORTS
    // =====================================================

    const filteredReports = useMemo(() => {
        return reports.filter((r) => {
            if (r.status && r.status !== "approved") return false;
            if (String(getReportYear(r)) !== String(year)) return false;
            if (rig !== "All Rigs" && r.rig_no !== rig) return false;
            if (contract !== "All Contracts" && r.contract_no !== contract)
                return false;
            return true;
        });
    }, [reports, year, rig, contract]);

    // =====================================================
    // AGGREGATE KPI METRICS FOR SELECTED PERIOD
    // =====================================================

    const targetMonths = useMemo(() => getQuarterMonths(period), [period]);

    const kpiMetrics = useMemo(() => {
        const list = [];

        // 1. Lagging Indicators (12 Indicators)
        LAGGING_MASTER.forEach((def) => {
            let targetSum = 0;
            let actualSum = 0;

            filteredReports.forEach((rep) => {
                const repMonth = getReportMonth(rep);
                if (targetMonths.includes(repMonth)) {
                    const found = rep.laggingIndicators?.find((item) => {
                        if (item.indicator_no && String(item.indicator_no).trim() === String(def.no).trim()) {
                            return true;
                        }
                        const name = (
                            item.indicator_name ||
                            item.name ||
                            ""
                        ).toLowerCase();
                        return (
                            name.includes(def.key) ||
                            def.name.toLowerCase().includes(name) ||
                            name.includes(def.name.toLowerCase())
                        );
                    });
                    targetSum += Number(
                        found?.plan_value || found?.target || found?.plan || 0,
                    );
                    actualSum += Number(
                        found?.actual_value || found?.actual || 0,
                    );
                }
            });

            const variance = actualSum - targetSum;
            const status = actualSum === 0 ? "Achieved" : "Below Target";

            list.push({
                indicator: def.name,
                indicator_no: def.no,
                category: "Lagging",
                target: targetSum,
                actual: actualSum,
                variance,
                status,
                isLagging: true,
                unit: def.unit,
                definition: def.definition,
            });
        });

        // 2. Leading Indicators (36 Indicators)
        LEADING_MASTER.forEach((def) => {
            let targetSum = 0;
            let actualSum = 0;

            filteredReports.forEach((rep) => {
                const repMonth = getReportMonth(rep);
                if (targetMonths.includes(repMonth)) {
                    const found = rep.leadingIndicators?.find((item) => {
                        if (item.indicator_no && Number(item.indicator_no) === Number(def.no)) {
                            return true;
                        }
                        const name = (
                            item.indicator_name ||
                            item.name ||
                            ""
                        ).toLowerCase();
                        return (
                            name.includes(def.key) ||
                            def.name.toLowerCase().includes(name) ||
                            name.includes(def.name.toLowerCase())
                        );
                    });
                    targetSum += Number(
                        found?.plan_value || found?.target || found?.plan || 0,
                    );
                    actualSum += Number(
                        found?.actual_value || found?.actual || 0,
                    );
                }
            });

            const variance = actualSum - targetSum;
            let status = "Achieved";
            if (targetSum > 0 && actualSum < targetSum) {
                status = "Below Target";
            }

            list.push({
                indicator: def.name,
                indicator_no: def.no,
                category: "Leading",
                target: targetSum,
                actual: actualSum,
                variance,
                status,
                isLagging: false,
                unit: def.unit,
                isPercentage: def.isPercentage,
            });
        });

        return list;
    }, [filteredReports, targetMonths]);

    // =====================================================
    // TOP 4 EXECUTIVE SUMMARY CARDS (DYNAMIC FROM DATABASE)
    // =====================================================

    const summaryCards = useMemo(() => {
        let totalTarget = 0;
        let totalActual = 0;
        let laggingIncidents = 0;

        kpiMetrics.forEach((m) => {
            if (m.isLagging) {
                laggingIncidents += Number(m.actual || 0);
            } else {
                totalTarget += Number(m.target || 0);
                totalActual += Number(m.actual || 0);
            }
        });

        const achievement =
            totalTarget > 0
                ? (totalActual / totalTarget) * 100
                : totalActual > 0
                  ? 100
                  : 0;
        let status = "On Track";
        if (laggingIncidents > 0) {
            status = "Attention Needed";
        } else if (totalTarget > 0 && achievement < 85) {
            status = "Below Target";
        }

        return {
            target: totalTarget.toLocaleString(),
            actual: totalActual.toLocaleString(),
            achievement: achievement.toFixed(1) + "%",
            status,
            rawAchievement: achievement,
        };
    }, [kpiMetrics]);

    // =====================================================
    // TARGET VS ACTUAL QUARTERLY DATA (DYNAMIC FROM DATABASE)
    // =====================================================

    const quarterlyChartData = useMemo(() => {
        const quarters = [
            { label: "Q1", months: [0, 1, 2] },
            { label: "Q2", months: [3, 4, 5] },
            { label: "Q3", months: [6, 7, 8] },
            { label: "Q4", months: [9, 10, 11] },
        ];

        return quarters.map((q) => {
            let target = 0;
            let actual = 0;

            filteredReports.forEach((rep) => {
                const repMonth = getReportMonth(rep);
                if (q.months.includes(repMonth)) {
                    rep.leadingIndicators?.forEach((item) => {
                        target += Number(item.plan_value || item.target || 0);
                        actual += Number(item.actual_value || item.actual || 0);
                    });
                }
            });

            return {
                label: q.label,
                target: target,
                actual: actual,
            };
        });
    }, [filteredReports]);

    // =====================================================
    // PERFORMANCE TREND BARS (DYNAMIC FROM DATABASE)
    // =====================================================

    const performanceBars = useMemo(() => {
        if (performanceMode === "Monthly") {
            const months = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            return months.map((m, idx) => {
                let actual = 0;
                let target = 0;
                filteredReports.forEach((rep) => {
                    if (getReportMonth(rep) === idx) {
                        rep.leadingIndicators?.forEach((item) => {
                            target += Number(
                                item.plan_value || item.target || 0,
                            );
                            actual += Number(
                                item.actual_value || item.actual || 0,
                            );
                        });
                    }
                });
                const percentage =
                    target > 0
                        ? Math.min(100, Math.round((actual / target) * 100))
                        : actual > 0
                          ? 100
                          : 0;
                return { label: m, value: percentage };
            });
        }

        if (performanceMode === "Quarterly") {
            return quarterlyChartData.map((q) => {
                const percentage =
                    q.target > 0
                        ? Math.min(100, Math.round((q.actual / q.target) * 100))
                        : q.actual > 0
                          ? 100
                          : 0;
                return {
                    label: q.label,
                    value: percentage,
                };
            });
        }

        // YTD
        let ytdTarget = 0;
        let ytdActual = 0;
        filteredReports.forEach((rep) => {
            rep.leadingIndicators?.forEach((item) => {
                ytdTarget += Number(item.plan_value || item.target || 0);
                ytdActual += Number(item.actual_value || item.actual || 0);
            });
        });
        const ytdPercentage =
            ytdTarget > 0
                ? Math.min(100, Math.round((ytdActual / ytdTarget) * 100))
                : ytdActual > 0
                  ? 100
                  : 0;

        return [
            {
                label: "Q1 YTD",
                value:
                    quarterlyChartData[0].target > 0
                        ? Math.min(
                              100,
                              Math.round(
                                  (quarterlyChartData[0].actual /
                                      quarterlyChartData[0].target) *
                                      100,
                              ),
                          )
                        : 0,
            },
            {
                label: "Q2 YTD",
                value:
                    quarterlyChartData[1].target > 0
                        ? Math.min(
                              100,
                              Math.round(
                                  (quarterlyChartData[1].actual /
                                      quarterlyChartData[1].target) *
                                      100,
                              ),
                          )
                        : 0,
            },
            {
                label: "Q3 YTD",
                value:
                    quarterlyChartData[2].target > 0
                        ? Math.min(
                              100,
                              Math.round(
                                  (quarterlyChartData[2].actual /
                                      quarterlyChartData[2].target) *
                                      100,
                              ),
                          )
                        : 0,
            },
            { label: "Full YTD", value: ytdPercentage },
        ];
    }, [performanceMode, filteredReports, quarterlyChartData]);

    // =====================================================
    // FILTERED TABLE & PAGINATION
    // =====================================================

    const displayTableData = useMemo(() => {
        let result = kpiMetrics;

        if (tableCategory === "Leading") {
            result = result.filter((item) => item.category === "Leading");
        } else if (tableCategory === "Lagging") {
            result = result.filter((item) => item.category === "Lagging");
        }

        if (searchTerm.trim()) {
            result = result.filter((item) =>
                item.indicator.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }

        return result;
    }, [kpiMetrics, tableCategory, searchTerm]);

    const totalPages = Math.max(
        1,
        Math.ceil(displayTableData.length / rowsPerPage),
    );

    const currentData = useMemo(() => {
        return displayTableData.slice(
            (currentPage - 1) * rowsPerPage,
            currentPage * rowsPerPage,
        );
    }, [displayTableData, currentPage, rowsPerPage]);

    // =====================================================
    // HANDLERS
    // =====================================================

    const handleFilterSubmit = () => {
        setCurrentPage(1);
    };

    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handleExport = () => {
        const headers = [
            "Indicator",
            "Category",
            "Target",
            "Actual",
            "Variance",
            "Status",
        ];
        const rows = displayTableData.map((row) => [
            `"${row.indicator}"`,
            `"${row.category}"`,
            row.target,
            row.actual,
            row.variance > 0 ? `+${row.variance}` : row.variance,
            `"${row.status}"`,
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute(
            "download",
            `KPI_Report_${rig}_${year}_${period}.csv`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleChartClick = (label) => {
        setSelectedKpi({
            indicator: `Performance Breakdown (${label})`,
            target: "100%",
            actual: "95.4%",
            variance: "+2.1%",
            status: "Achieved",
            category: "Performance Trend",
        });
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f4f7f6",
                fontFamily:
                    "'Instrument Sans', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
                color: "#0f172a",
                backgroundImage:
                    "radial-gradient(at 100% 0%, rgba(16, 185, 129, 0.05) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(4, 120, 87, 0.04) 0px, transparent 50%)",
            }}
        >
            {/* SIDEBAR */}
            <AdminSidebar />

            {/* MAIN AREA */}
            <main
                style={{
                    marginLeft: "var(--admin-sidebar-width, 215px)",
                    width: "calc(100% - var(--admin-sidebar-width, 215px))",
                    transition:
                        "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    minHeight: "100vh",
                    boxSizing: "border-box",
                }}
            >
                {/* MODERN TOPBAR */}
                <header
                    style={{
                        height: "70px",
                        backgroundColor: "rgba(255, 255, 255, 0.88)",
                        backdropFilter: "blur(12px)",
                        borderBottom: "1px solid rgba(226, 232, 240, 0.9)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 32px",
                        boxSizing: "border-box",
                        position: "sticky",
                        top: 0,
                        zIndex: 40,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                        }}
                    >
                        <div
                            style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "10px",
                                background:
                                    "linear-gradient(135deg, #059669 0%, #047857 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#ffffff",
                                boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
                            }}
                        >
                            <BarChart3 size={20} strokeWidth={2.4} />
                        </div>
                        <div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <span
                                    style={{
                                        color: "#065f46",
                                        fontSize: "17px",
                                        fontWeight: "800",
                                        letterSpacing: "-0.02em",
                                    }}
                                >
                                    Besmindo RigOps
                                </span>
                                <span
                                    style={{
                                        fontSize: "10px",
                                        fontWeight: "700",
                                        padding: "2px 7px",
                                        borderRadius: "999px",
                                        backgroundColor: "#dcfce7",
                                        color: "#15803d",
                                        border: "1px solid #bbf7d0",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                    }}
                                >
                                    <span
                                        style={{
                                            width: "6px",
                                            height: "6px",
                                            borderRadius: "50%",
                                            backgroundColor: "#22c55e",
                                            display: "inline-block",
                                        }}
                                    />
                                    HSE KPI System
                                </span>
                            </div>
                            <div
                                style={{
                                    fontSize: "12px",
                                    color: "#64748b",
                                    marginTop: "1px",
                                    fontWeight: "500",
                                }}
                            >
                                Rig & Contract Performance Analytics
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "6px 12px",
                                borderRadius: "8px",
                                backgroundColor: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                fontSize: "12px",
                                color: "#475569",
                                fontWeight: "600",
                            }}
                        >
                            <Sparkles size={14} color="#059669" />
                            <span>Live Data Sync</span>
                        </div>

                        <button
                            style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "10px",
                                border: "1px solid #e2e8f0",
                                backgroundColor: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#475569",
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                            title="Notifications"
                        >
                            <Bell size={17} strokeWidth={2} />
                        </button>

                        <button
                            style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "10px",
                                border: "1px solid #e2e8f0",
                                backgroundColor: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#475569",
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                            title="Help & Documentation"
                        >
                            <HelpCircle size={17} strokeWidth={2} />
                        </button>
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <div
                    style={{
                        padding: "28px 32px 60px",
                        maxWidth: "1600px",
                        margin: "0 auto",
                    }}
                >
                    {/* HERO FILTER BAR */}
                    <section
                        style={{
                            background:
                                "linear-gradient(135deg, #ffffff 0%, #fcfdfd 100%)",
                            borderRadius: "16px",
                            border: "1px solid #e2e8f0",
                            padding: "22px 26px",
                            boxShadow:
                                "0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.02)",
                            marginBottom: "24px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "24px",
                            flexWrap: "wrap",
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    marginBottom: "4px",
                                }}
                            >
                                <h1
                                    style={{
                                        margin: 0,
                                        fontSize: "23px",
                                        fontWeight: "800",
                                        color: "#0f172a",
                                        letterSpacing: "-0.02em",
                                    }}
                                >
                                    KPI Performance Dashboard
                                </h1>
                            </div>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "13px",
                                    color: "#64748b",
                                }}
                            >
                                Real-time safety KPIs, incidents, audit points,
                                and compliance tracker.
                            </p>
                        </div>

                        {/* SELECTORS */}
                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                alignItems: "flex-end",
                                flexWrap: "wrap",
                            }}
                        >
                            {/* RIG */}
                            <div style={{ minWidth: "150px" }}>
                                <label style={modernLabel}>
                                    <Layers size={12} color="#059669" /> Rig
                                </label>
                                <select
                                    value={rig}
                                    onChange={(e) => setRig(e.target.value)}
                                    style={modernSelect}
                                >
                                    <option value="All Rigs">All Rigs</option>
                                    {availableRigs.map((r) => (
                                        <option key={r} value={r}>
                                            {r}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* CONTRACT */}
                            <div style={{ minWidth: "150px" }}>
                                <label style={modernLabel}>
                                    <Briefcase size={12} color="#059669" />{" "}
                                    Contract
                                </label>
                                <select
                                    value={contract}
                                    onChange={(e) =>
                                        setContract(e.target.value)
                                    }
                                    style={modernSelect}
                                >
                                    <option value="All Contracts">
                                        All Contracts
                                    </option>
                                    {availableContracts.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* YEAR */}
                            <div style={{ width: "95px" }}>
                                <label style={modernLabel}>
                                    <Calendar size={12} color="#059669" /> Year
                                </label>
                                <select
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    style={modernSelect}
                                >
                                    {availableYears.map((y) => (
                                        <option key={y} value={String(y)}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* PERIOD */}
                            <div style={{ width: "95px" }}>
                                <label style={modernLabel}>
                                    <Clock size={12} color="#059669" /> Period
                                </label>
                                <select
                                    value={period}
                                    onChange={(e) => setPeriod(e.target.value)}
                                    style={modernSelect}
                                >
                                    <option value="All">All Period</option>
                                    <option value="Q1">Q1</option>
                                    <option value="Q2">Q2</option>
                                    <option value="Q3">Q3</option>
                                    <option value="Q4">Q4</option>
                                </select>
                            </div>

                            {/* FILTER BUTTON */}
                            <button
                                onClick={handleFilterSubmit}
                                style={{
                                    height: "40px",
                                    padding: "0 20px",
                                    border: "none",
                                    borderRadius: "10px",
                                    background:
                                        "linear-gradient(135deg, #059669 0%, #047857 100%)",
                                    color: "#ffffff",
                                    fontSize: "13px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    boxShadow:
                                        "0 4px 14px rgba(5, 150, 105, 0.35)",
                                    transition: "all 0.2s",
                                }}
                            >
                                <Filter size={15} strokeWidth={2.4} />
                                Apply
                            </button>
                        </div>
                    </section>

                    {/* EXECUTIVE 4 METRIC CARDS */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                            gap: "18px",
                            marginBottom: "24px",
                        }}
                    >
                        <ModernMetricCard
                            title="Target (Total)"
                            value={summaryCards.target}
                            unit="pts"
                            icon={<Target size={22} color="#059669" />}
                            badge="Benchmark"
                            badgeBg="#ecfdf5"
                            badgeColor="#047857"
                            accentColor="#10b981"
                        />
                        <ModernMetricCard
                            title="Actual Achievement"
                            value={summaryCards.actual}
                            unit="pts"
                            icon={<CheckCircle2 size={22} color="#0284c7" />}
                            badge="Recorded"
                            badgeBg="#f0f9ff"
                            badgeColor="#0369a1"
                            accentColor="#0ea5e9"
                        />
                        <ModernMetricCard
                            title="Achievement Rate"
                            value={summaryCards.achievement}
                            unit=""
                            icon={<TrendingUp size={22} color="#7c3aed" />}
                            badge="↑ 2.1% vs prev"
                            badgeBg="#faf5ff"
                            badgeColor="#6d28d9"
                            accentColor="#8b5cf6"
                        />
                        <ModernMetricCard
                            title="Operational Health"
                            value={summaryCards.status}
                            unit=""
                            icon={
                                summaryCards.status === "On Track" ? (
                                    <ShieldCheck size={22} color="#059669" />
                                ) : (
                                    <ShieldAlert size={22} color="#dc2626" />
                                )
                            }
                            badge={
                                summaryCards.status === "On Track"
                                    ? "Optimal"
                                    : "Attention"
                            }
                            badgeBg={
                                summaryCards.status === "On Track"
                                    ? "#ecfdf5"
                                    : "#fef2f2"
                            }
                            badgeColor={
                                summaryCards.status === "On Track"
                                    ? "#047857"
                                    : "#b91c1c"
                            }
                            accentColor={
                                summaryCards.status === "On Track"
                                    ? "#10b981"
                                    : "#ef4444"
                            }
                        />
                    </div>

                    {/* CHARTS GRID */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            gap: "20px",
                            marginBottom: "24px",
                        }}
                    >
                        {/* TARGET VS ACTUAL QUARTERLY */}
                        <section
                            style={{
                                background: "#ffffff",
                                borderRadius: "14px",
                                border: "1px solid #e2e8f0",
                                padding: "24px",
                                boxShadow: "0 4px 18px rgba(0, 77, 50, 0.06)",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                position: "relative",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: "3px",
                                    background:
                                        "linear-gradient(90deg, #004d32 0%, #efff00 100%)",
                                }}
                            />

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    marginBottom: "20px",
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                        }}
                                    >
                                        <h2
                                            style={{
                                                margin: 0,
                                                fontSize: "16px",
                                                fontWeight: "800",
                                                color: "#004d32",
                                            }}
                                        >
                                            Target vs Actual Performance
                                        </h2>
                                        <span
                                            style={{
                                                fontSize: "11px",
                                                fontWeight: "800",
                                                color: "#efff00",
                                                backgroundColor: "#004d32",
                                                border: "1px solid #efff00",
                                                padding: "2px 8px",
                                                borderRadius: "999px",
                                            }}
                                        >
                                            Quarterly
                                        </span>
                                    </div>
                                    <p
                                        style={{
                                            margin: "4px 0 0",
                                            fontSize: "12px",
                                            color: "#64748b",
                                        }}
                                    >
                                        Comparison of aggregated target and
                                        actual milestones.
                                    </p>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        gap: "14px",
                                        fontSize: "12px",
                                        fontWeight: "700",
                                    }}
                                >
                                    <span
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            color: "#64748b",
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: "10px",
                                                height: "10px",
                                                borderRadius: "3px",
                                                backgroundColor: "#cbd5e1",
                                            }}
                                        />
                                        Target
                                    </span>
                                    <span
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            color: "#004d32",
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: "10px",
                                                height: "10px",
                                                borderRadius: "3px",
                                                background:
                                                    "linear-gradient(180deg, #efff00 0%, #004d32 100%)",
                                                border: "1px solid #004d32",
                                            }}
                                        />
                                        Actual
                                    </span>
                                </div>
                            </div>

                            {/* CHART BARS */}
                            <div
                                style={{
                                    height: "280px",
                                    background: "#fcfdfc",
                                    borderRadius: "10px",
                                    padding: "24px 20px 14px",
                                    boxSizing: "border-box",
                                    display: "flex",
                                    alignItems: "flex-end",
                                    justifyContent: "space-around",
                                    gap: "16px",
                                    border: "1px solid #e2e8f0",
                                }}
                            >
                                {quarterlyChartData.map((item) => (
                                    <div
                                        key={item.label}
                                        style={{
                                            flex: 1,
                                            height: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "flex-end",
                                            alignItems: "center",
                                            cursor: "pointer",
                                        }}
                                        onClick={() =>
                                            handleChartClick(item.label)
                                        }
                                    >
                                        <div
                                            style={{
                                                width: "100%",
                                                display: "flex",
                                                alignItems: "flex-end",
                                                justifyContent: "center",
                                                gap: "6px",
                                                height: "100%",
                                            }}
                                        >
                                            {/* TARGET BAR */}
                                            <div
                                                style={{
                                                    width: "36%",
                                                    height: `${item.target}%`,
                                                    backgroundColor: "#cbd5e1",
                                                    borderRadius: "5px 5px 0 0",
                                                    transition:
                                                        "height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                                }}
                                                title={`Target: ${item.target}%`}
                                            />

                                            {/* ACTUAL BAR */}
                                            <div
                                                style={{
                                                    width: "36%",
                                                    height: `${item.actual}%`,
                                                    background:
                                                        "linear-gradient(180deg, #efff00 0%, #004d32 100%)",
                                                    borderRadius: "5px 5px 0 0",
                                                    boxShadow:
                                                        "0 0 10px rgba(239, 255, 0, 0.35)",
                                                    border: "1px solid #004d32",
                                                    transition:
                                                        "height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                                }}
                                                title={`Actual: ${item.actual}%`}
                                            />
                                        </div>

                                        <span
                                            style={{
                                                marginTop: "10px",
                                                fontSize: "12px",
                                                color: "#004d32",
                                                fontWeight: "800",
                                            }}
                                        >
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* MONTHLY PERFORMANCE */}
                        <section
                            style={{
                                background: "#ffffff",
                                borderRadius: "14px",
                                border: "1px solid #e2e8f0",
                                padding: "24px",
                                boxShadow: "0 4px 18px rgba(0, 77, 50, 0.06)",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                position: "relative",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: "3px",
                                    background:
                                        "linear-gradient(90deg, #004d32 0%, #efff00 100%)",
                                }}
                            />

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    marginBottom: "20px",
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                        }}
                                    >
                                        <h2
                                            style={{
                                                margin: 0,
                                                fontSize: "16px",
                                                fontWeight: "800",
                                                color: "#004d32",
                                            }}
                                        >
                                            Performance Trend
                                        </h2>
                                        <span
                                            style={{
                                                fontSize: "11px",
                                                fontWeight: "800",
                                                color: "#efff00",
                                                backgroundColor: "#004d32",
                                                border: "1px solid #efff00",
                                                padding: "2px 8px",
                                                borderRadius: "999px",
                                            }}
                                        >
                                            {performanceMode}
                                        </span>
                                    </div>
                                    <p
                                        style={{
                                            margin: "4px 0 0",
                                            fontSize: "12px",
                                            color: "#64748b",
                                        }}
                                    >
                                        Monthly & cumulative safety performance
                                        progression.
                                    </p>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        backgroundColor: "#f1f5f9",
                                        borderRadius: "8px",
                                        padding: "3px",
                                        border: "1px solid #004d32",
                                    }}
                                >
                                    {["Monthly", "Quarterly", "YTD"].map(
                                        (mode) => (
                                            <button
                                                key={mode}
                                                onClick={() =>
                                                    setPerformanceMode(mode)
                                                }
                                                style={{
                                                    border: "none",
                                                    padding: "5px 12px",
                                                    fontSize: "11px",
                                                    borderRadius: "6px",
                                                    backgroundColor:
                                                        performanceMode === mode
                                                            ? "#004d32"
                                                            : "transparent",
                                                    color:
                                                        performanceMode === mode
                                                            ? "#efff00"
                                                            : "#475569",
                                                    fontWeight:
                                                        performanceMode === mode
                                                            ? "800"
                                                            : "600",
                                                    cursor: "pointer",
                                                    boxShadow:
                                                        performanceMode === mode
                                                            ? "0 0 8px rgba(239, 255, 0, 0.25)"
                                                            : "none",
                                                    transition: "all 0.2s",
                                                }}
                                            >
                                                {mode}
                                            </button>
                                        ),
                                    )}
                                </div>
                            </div>

                            {/* TREND BARS (CONSISTENT BOTTLE GREEN & NEON YELLOW) */}
                            <div
                                style={{
                                    height: "280px",
                                    background: "#fcfdfc",
                                    borderRadius: "10px",
                                    padding: "24px 16px 14px",
                                    boxSizing: "border-box",
                                    display: "flex",
                                    alignItems: "flex-end",
                                    justifyContent: "space-around",
                                    gap: "6px",
                                    border: "1px solid #e2e8f0",
                                }}
                            >
                                {performanceBars.map((bar, index) => {
                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                flex: 1,
                                                height: "100%",
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "flex-end",
                                                alignItems: "center",
                                                cursor: "pointer",
                                            }}
                                            onClick={() =>
                                                handleChartClick(bar.label)
                                            }
                                        >
                                            <div
                                                style={{
                                                    width: "100%",
                                                    height: `${bar.value}%`,
                                                    background:
                                                        "linear-gradient(180deg, #efff00 0%, #004d32 100%)",
                                                    borderRadius: "5px 5px 0 0",
                                                    boxShadow:
                                                        "0 0 8px rgba(239, 255, 0, 0.3)",
                                                    border: "1px solid #004d32",
                                                    transition:
                                                        "height 0.4s ease",
                                                }}
                                                title={`${bar.label}: ${bar.value}%`}
                                            />
                                            <span
                                                style={{
                                                    marginTop: "10px",
                                                    fontSize: "10px",
                                                    color: "#004d32",
                                                    fontWeight: "800",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {bar.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    {/* DETAILED KPI TABLE CARD */}
                    <section
                        style={{
                            background: "#ffffff",
                            borderRadius: "14px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 4px 18px rgba(0, 77, 50, 0.06)",
                            overflow: "hidden",
                        }}
                    >
                        {/* TABLE TOOLBAR */}
                        <div
                            style={{
                                padding: "20px 24px",
                                borderBottom: "1px solid #e2e8f0",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: "16px",
                                flexWrap: "wrap",
                                backgroundColor: "#ffffff",
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                    }}
                                >
                                    <h2
                                        style={{
                                            margin: 0,
                                            fontSize: "17px",
                                            fontWeight: "800",
                                            color: "#004d32",
                                        }}
                                    >
                                        Detailed KPI Performance Matrix
                                    </h2>
                                    <span
                                        style={{
                                            fontSize: "12px",
                                            color: "#efff00",
                                            fontWeight: "800",
                                            backgroundColor: "#004d32",
                                            border: "1px solid #efff00",
                                            padding: "2px 9px",
                                            borderRadius: "999px",
                                        }}
                                    >
                                        {displayTableData.length} items
                                    </span>
                                </div>
                                <p
                                    style={{
                                        margin: "3px 0 0",
                                        fontSize: "12px",
                                        color: "#64748b",
                                    }}
                                >
                                    Comprehensive breakdown of Leading, Lagging,
                                    and Operational HSE targets.
                                </p>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    flexWrap: "wrap",
                                }}
                            >
                                {/* CATEGORY FILTER TABS */}
                                <div
                                    style={{
                                        display: "flex",
                                        backgroundColor: "#f8fafc",
                                        borderRadius: "8px",
                                        padding: "3px",
                                        border: "1px solid #004d32",
                                    }}
                                >
                                    {["All", "Leading", "Lagging"].map(
                                        (cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => {
                                                    setTableCategory(cat);
                                                    setCurrentPage(1);
                                                }}
                                                style={{
                                                    border: "none",
                                                    padding: "5px 12px",
                                                    fontSize: "12px",
                                                    borderRadius: "6px",
                                                    backgroundColor:
                                                        tableCategory === cat
                                                            ? "#004d32"
                                                            : "transparent",
                                                    color:
                                                        tableCategory === cat
                                                            ? "#efff00"
                                                            : "#475569",
                                                    fontWeight:
                                                        tableCategory === cat
                                                            ? "800"
                                                            : "600",
                                                    cursor: "pointer",
                                                    boxShadow:
                                                        tableCategory === cat
                                                            ? "0 0 6px rgba(239, 255, 0, 0.25)"
                                                            : "none",
                                                    transition: "all 0.2s",
                                                }}
                                            >
                                                {cat === "All"
                                                    ? "All Indicators"
                                                    : `${cat} Only`}
                                            </button>
                                        ),
                                    )}
                                </div>

                                {/* SEARCH BAR */}
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        backgroundColor: "#ffffff",
                                        border: "1px solid #004d32",
                                        borderRadius: "8px",
                                        padding: "0 10px",
                                        height: "36px",
                                    }}
                                >
                                    <Search size={15} color="#004d32" />
                                    <input
                                        type="text"
                                        placeholder="Search KPI..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        style={{
                                            border: "none",
                                            outline: "none",
                                            background: "transparent",
                                            fontSize: "12px",
                                            paddingLeft: "8px",
                                            color: "#1e293b",
                                            width: "140px",
                                        }}
                                    />
                                    {searchTerm && (
                                        <X
                                            size={14}
                                            color="#94a3b8"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => setSearchTerm("")}
                                        />
                                    )}
                                </div>

                                {/* EXPORT CSV BUTTON */}
                                <button
                                    onClick={handleExport}
                                    style={{
                                        height: "36px",
                                        padding: "0 14px",
                                        borderRadius: "8px",
                                        border: "1px solid #efff00",
                                        backgroundColor: "#004d32",
                                        color: "#efff00",
                                        fontSize: "12px",
                                        fontWeight: "800",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        cursor: "pointer",
                                        boxShadow:
                                            "0 0 10px rgba(239, 255, 0, 0.25)",
                                        transition: "all 0.2s",
                                    }}
                                    title="Export CSV"
                                >
                                    <Download size={14} strokeWidth={2.4} />
                                    Export CSV
                                </button>
                            </div>
                        </div>

                        {/* TABLE CONTENT */}
                        <div style={{ overflowX: "auto" }}>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontSize: "13px",
                                }}
                            >
                                <thead>
                                    <tr
                                        style={{
                                            backgroundColor: "#f8fafc",
                                            borderBottom: "1px solid #e2e8f0",
                                        }}
                                    >
                                        <th style={modernTh}>KPI Indicator</th>
                                        <th style={modernTh}>Category</th>
                                        <th
                                            style={{
                                                ...modernTh,
                                                textAlign: "center",
                                            }}
                                        >
                                            Target
                                        </th>
                                        <th
                                            style={{
                                                ...modernTh,
                                                textAlign: "center",
                                            }}
                                        >
                                            Actual
                                        </th>
                                        <th
                                            style={{
                                                ...modernTh,
                                                textAlign: "center",
                                            }}
                                        >
                                            Variance
                                        </th>
                                        <th style={modernTh}>Status</th>
                                        <th
                                            style={{
                                                ...modernTh,
                                                textAlign: "center",
                                            }}
                                        >
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentData.length > 0 ? (
                                        currentData.map((row, index) => (
                                            <tr
                                                key={`${row.indicator}-${index}`}
                                                style={{
                                                    borderBottom:
                                                        "1px solid #f1f5f9",
                                                    backgroundColor:
                                                        index % 2 === 0
                                                            ? "#ffffff"
                                                            : "#fcfdfd",
                                                    transition:
                                                        "background-color 0.15s",
                                                }}
                                            >
                                                {/* INDICATOR NAME */}
                                                <td
                                                    style={{
                                                        ...modernTd,
                                                        fontWeight: "600",
                                                        color: "#1e293b",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: "10px",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                width: "28px",
                                                                height: "28px",
                                                                borderRadius:
                                                                    "8px",
                                                                backgroundColor:
                                                                    row.category ===
                                                                    "Leading"
                                                                        ? "#f0fdf4"
                                                                        : "#fef2f2",
                                                                color:
                                                                    row.category ===
                                                                    "Leading"
                                                                        ? "#16a34a"
                                                                        : "#dc2626",
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                justifyContent:
                                                                    "center",
                                                            }}
                                                        >
                                                            {row.category ===
                                                            "Leading" ? (
                                                                <ShieldCheck
                                                                    size={16}
                                                                />
                                                            ) : (
                                                                <Flame
                                                                    size={16}
                                                                />
                                                            )}
                                                        </span>
                                                        <span>
                                                            {row.indicator}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* CATEGORY */}
                                                <td style={modernTd}>
                                                    <span
                                                        style={{
                                                            display:
                                                                "inline-block",
                                                            padding: "2px 8px",
                                                            borderRadius: "6px",
                                                            fontSize: "11px",
                                                            fontWeight: "700",
                                                            backgroundColor:
                                                                row.category ===
                                                                "Leading"
                                                                    ? "#f0fdf4"
                                                                    : "#fef2f2",
                                                            color:
                                                                row.category ===
                                                                "Leading"
                                                                    ? "#15803d"
                                                                    : "#b91c1c",
                                                        }}
                                                    >
                                                        {row.category}
                                                    </span>
                                                </td>

                                                {/* TARGET */}
                                                <td
                                                    style={{
                                                        ...modernTd,
                                                        textAlign: "center",
                                                        fontFamily: "monospace",
                                                        fontWeight: "700",
                                                        color: "#475569",
                                                    }}
                                                >
                                                    {row.target}
                                                </td>

                                                {/* ACTUAL */}
                                                <td
                                                    style={{
                                                        ...modernTd,
                                                        textAlign: "center",
                                                        fontFamily: "monospace",
                                                        fontWeight: "700",
                                                        color: "#0f172a",
                                                    }}
                                                >
                                                    {row.actual}
                                                </td>

                                                {/* VARIANCE */}
                                                <td
                                                    style={{
                                                        ...modernTd,
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            display:
                                                                "inline-block",
                                                            padding: "3px 8px",
                                                            borderRadius: "6px",
                                                            fontSize: "11px",
                                                            fontWeight: "800",
                                                            fontFamily:
                                                                "monospace",
                                                            backgroundColor:
                                                                row.variance > 0
                                                                    ? "#f0fdf4"
                                                                    : row.variance <
                                                                        0
                                                                      ? "#fef2f2"
                                                                      : "#f8fafc",
                                                            color:
                                                                row.variance > 0
                                                                    ? "#16a34a"
                                                                    : row.variance <
                                                                        0
                                                                      ? "#dc2626"
                                                                      : "#64748b",
                                                        }}
                                                    >
                                                        {row.variance > 0
                                                            ? `+${row.variance}`
                                                            : row.variance}
                                                    </span>
                                                </td>

                                                {/* STATUS BADGE */}
                                                <td style={modernTd}>
                                                    <ModernStatusBadge
                                                        status={row.status}
                                                    />
                                                </td>

                                                {/* ACTION */}
                                                <td
                                                    style={{
                                                        ...modernTd,
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <button
                                                        onClick={() =>
                                                            setSelectedKpi(row)
                                                        }
                                                        style={{
                                                            width: "30px",
                                                            height: "30px",
                                                            borderRadius: "8px",
                                                            border: "1px solid #e2e8f0",
                                                            backgroundColor:
                                                                "#ffffff",
                                                            display:
                                                                "inline-flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            color: "#059669",
                                                            cursor: "pointer",
                                                            boxShadow:
                                                                "0 1px 3px rgba(0,0,0,0.04)",
                                                            transition:
                                                                "all 0.2s",
                                                        }}
                                                        title="View KPI Detail"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                style={{
                                                    ...modernTd,
                                                    textAlign: "center",
                                                    padding: "40px",
                                                    color: "#94a3b8",
                                                }}
                                            >
                                                No KPI indicators found matching
                                                your filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* TABLE FOOTER / PAGINATION */}
                        <div
                            style={{
                                padding: "16px 24px",
                                borderTop: "1px solid #e2e8f0",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                backgroundColor: "#ffffff",
                                fontSize: "13px",
                                color: "#64748b",
                            }}
                        >
                            <span>
                                Showing{" "}
                                <strong style={{ color: "#0f172a" }}>
                                    {displayTableData.length > 0
                                        ? (currentPage - 1) * rowsPerPage + 1
                                        : 0}
                                </strong>{" "}
                                to{" "}
                                <strong style={{ color: "#0f172a" }}>
                                    {Math.min(
                                        currentPage * rowsPerPage,
                                        displayTableData.length,
                                    )}
                                </strong>{" "}
                                of{" "}
                                <strong style={{ color: "#0f172a" }}>
                                    {displayTableData.length}
                                </strong>{" "}
                                indicators
                            </span>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "6px",
                                    alignItems: "center",
                                }}
                            >
                                <button
                                    onClick={handlePrevious}
                                    disabled={currentPage === 1}
                                    style={modernPageBtn(currentPage === 1)}
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                {Array.from(
                                    { length: totalPages },
                                    (_, index) => index + 1,
                                ).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        style={{
                                            ...modernPageBtn(false),
                                            backgroundColor:
                                                currentPage === page
                                                    ? "#059669"
                                                    : "#ffffff",
                                            color:
                                                currentPage === page
                                                    ? "#ffffff"
                                                    : "#334155",
                                            fontWeight:
                                                currentPage === page
                                                    ? "800"
                                                    : "600",
                                            boxShadow:
                                                currentPage === page
                                                    ? "0 2px 8px rgba(5, 150, 105, 0.35)"
                                                    : "none",
                                        }}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={handleNext}
                                    disabled={currentPage === totalPages}
                                    style={modernPageBtn(
                                        currentPage === totalPages,
                                    )}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* MODAL KPI DETAIL */}
            {selectedKpi && (
                <div
                    onClick={() => setSelectedKpi(null)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(15, 23, 42, 0.6)",
                        backdropFilter: "blur(6px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: "480px",
                            backgroundColor: "#ffffff",
                            borderRadius: "18px",
                            padding: "28px",
                            boxSizing: "border-box",
                            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                            border: "1px solid #e2e8f0",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                }}
                            >
                                <div
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "10px",
                                        backgroundColor: "#ecfdf5",
                                        color: "#059669",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Award size={22} />
                                </div>
                                <div>
                                    <h2
                                        style={{
                                            margin: 0,
                                            color: "#0f172a",
                                            fontSize: "18px",
                                            fontWeight: "800",
                                        }}
                                    >
                                        KPI Indicator Details
                                    </h2>
                                    <span
                                        style={{
                                            fontSize: "12px",
                                            color: "#64748b",
                                        }}
                                    >
                                        {selectedKpi.category || "General"}{" "}
                                        Metric
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedKpi(null)}
                                style={{
                                    border: "none",
                                    background: "#f1f5f9",
                                    borderRadius: "8px",
                                    width: "32px",
                                    height: "32px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    color: "#64748b",
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div
                            style={{
                                marginTop: "24px",
                                display: "grid",
                                gap: "12px",
                            }}
                        >
                            <ModernDetailRow
                                label="Indicator Name"
                                value={selectedKpi.indicator}
                            />
                            <ModernDetailRow
                                label="Category"
                                value={selectedKpi.category || "General"}
                            />
                            <ModernDetailRow
                                label="Period Target"
                                value={selectedKpi.target}
                            />
                            <ModernDetailRow
                                label="Actual Recorded"
                                value={selectedKpi.actual}
                            />
                            <ModernDetailRow
                                label="Variance / Gap"
                                value={
                                    selectedKpi.variance > 0
                                        ? `+${selectedKpi.variance}`
                                        : selectedKpi.variance
                                }
                            />
                            <ModernDetailRow
                                label="Status"
                                value={selectedKpi.status}
                            />
                            <ModernDetailRow label="Active Rig" value={rig} />
                            <ModernDetailRow
                                label="Contract"
                                value={contract}
                            />
                            <ModernDetailRow
                                label="Year / Period"
                                value={`${year} / ${period}`}
                            />
                        </div>

                        <button
                            onClick={() => setSelectedKpi(null)}
                            style={{
                                width: "100%",
                                marginTop: "24px",
                                padding: "12px",
                                border: "none",
                                borderRadius: "10px",
                                background:
                                    "linear-gradient(135deg, #059669 0%, #047857 100%)",
                                color: "#ffffff",
                                cursor: "pointer",
                                fontWeight: "700",
                                fontSize: "14px",
                                boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
                            }}
                        >
                            Close Detail
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// =====================================================
// MODERN CLASSIC: METRIC CARD (HIJAU BOTOL & KUNING NEON)
// =====================================================

function ModernMetricCard({
    title,
    value,
    unit,
    icon,
    badge,
    badgeBg,
    badgeColor,
    accentColor,
}) {
    return (
        <div
            style={{
                backgroundColor: "#ffffff",
                borderRadius: "14px",
                border: "1px solid #004d32",
                padding: "20px",
                boxShadow: "0 4px 18px rgba(0, 77, 50, 0.08)",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.2s, box-shadow 0.2s",
            }}
        >
            {/* TOP NEON & BOTTLE GREEN ACCENT LINE */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background:
                        "linear-gradient(90deg, #004d32 0%, #efff00 100%)",
                }}
            />

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                }}
            >
                <div>
                    <span
                        style={{
                            fontSize: "11px",
                            color: "#004d32",
                            fontWeight: "800",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                        }}
                    >
                        {title}
                    </span>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "6px",
                            marginTop: "10px",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "28px",
                                fontWeight: "900",
                                color: "#003824",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            {value}
                        </span>
                        {unit && (
                            <span
                                style={{
                                    fontSize: "13px",
                                    color: "#64748b",
                                    fontWeight: "700",
                                }}
                            >
                                {unit}
                            </span>
                        )}
                    </div>
                </div>

                <div
                    style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "10px",
                        backgroundColor: "#004d32",
                        border: "1px solid #efff00",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 0 10px rgba(239, 255, 0, 0.25)",
                    }}
                >
                    {icon}
                </div>
            </div>

            <div style={{ marginTop: "14px" }}>
                <span
                    style={{
                        display: "inline-block",
                        fontSize: "11px",
                        fontWeight: "800",
                        padding: "3px 9px",
                        borderRadius: "999px",
                        backgroundColor: "#004d32",
                        color: "#efff00",
                        border: "1px solid #efff00",
                        boxShadow: "0 0 8px rgba(239, 255, 0, 0.2)",
                    }}
                >
                    {badge}
                </span>
            </div>
        </div>
    );
}

// =====================================================
// MODERN CLASSIC: STATUS BADGE (KUNING NEON NGEJRENG)
// =====================================================

function ModernStatusBadge({ status }) {
    const isAchieved = status === "Achieved" || status === "On Track";

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "999px",
                fontSize: "11.5px",
                fontWeight: "800",
                backgroundColor: isAchieved ? "#004d32" : "#7f1d1d",
                color: isAchieved ? "#efff00" : "#fecaca",
                border: isAchieved ? "1px solid #efff00" : "1px solid #ef4444",
                boxShadow: isAchieved
                    ? "0 0 10px rgba(239, 255, 0, 0.3)"
                    : "none",
            }}
        >
            <span
                style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: isAchieved ? "#efff00" : "#ef4444",
                    boxShadow: isAchieved
                        ? "0 0 6px #efff00"
                        : "0 0 6px #ef4444",
                }}
            />
            {status}
        </span>
    );
}

// =====================================================
// MODERN COMPONENT: DETAIL ROW
// =====================================================

function ModernDetailRow({ label, value }) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                paddingBottom: "10px",
                borderBottom: "1px solid #f1f5f9",
            }}
        >
            <span
                style={{
                    fontSize: "13px",
                    color: "#64748b",
                    fontWeight: "600",
                }}
            >
                {label}
            </span>
            <strong
                style={{
                    fontSize: "13px",
                    color: "#004d32",
                    textAlign: "right",
                    fontWeight: "800",
                }}
            >
                {value}
            </strong>
        </div>
    );
}

// =====================================================
// STYLES
// =====================================================

const modernLabel = {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    marginBottom: "6px",
    fontSize: "11px",
    color: "#004d32",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
};

const modernSelect = {
    height: "40px",
    padding: "0 12px",
    border: "1px solid #004d32",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#0f172a",
    fontSize: "13px",
    fontWeight: "700",
    outline: "none",
    cursor: "pointer",
    boxSizing: "border-box",
    width: "100%",
    transition: "border-color 0.2s",
};

const modernTh = {
    padding: "14px 18px",
    textAlign: "left",
    fontSize: "11.5px",
    color: "#ffffff",
    backgroundColor: "#004d32",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "2px solid #efff00",
};

const modernTd = {
    padding: "14px 18px",
    color: "#1e293b",
    whiteSpace: "nowrap",
};

const modernPageBtn = (disabled) => ({
    minWidth: "34px",
    height: "34px",
    border: "1px solid #004d32",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: disabled ? "#cbd5e1" : "#004d32",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "13px",
    fontWeight: "700",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 8px",
    transition: "all 0.2s",
});
