import { useMemo, useState } from "react";
import { usePage } from "@inertiajs/react";
import AdminSidebar from "../../Components/AdminSidebar";

import {
    Search,
    Bell,
    CircleHelp,
    UserCircle,
    CalendarDays,
    ChevronDown,
    MoreVertical,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    Shield,
    TrendingUp,
    Clock,
    Car,
    Activity,
} from "lucide-react";

/* ============================================================
   HELPER FUNCTIONS & CONSTANTS
============================================================ */

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const MONTH_SHORT = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function number(val) {
    const n = Number(val);
    return Number.isFinite(n) ? n : 0;
}

function formatNumber(val) {
    const n = number(val);
    if (Number.isInteger(n)) {
        return n.toLocaleString("id-ID");
    }
    return n.toLocaleString("id-ID", { maximumFractionDigits: 2 });
}

function normalizeReport(report) {
    const manHoursData = report?.man_hours || report?.manHours || null;
    return {
        ...report,
        manHours: Array.isArray(manHoursData) ? manHoursData[0] || null : manHoursData,
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
    if (report?.year) return Number(report.year);
    const date = report?.report_date || report?.issued_date || report?.created_at;
    if (date) {
        const parsed = new Date(date);
        if (!Number.isNaN(parsed.getTime())) return parsed.getFullYear();
    }
    return new Date().getFullYear();
}

function getReportMonth(report) {
    if (report?.period !== undefined && report?.period !== null && report?.period !== "") {
        const p = Number(report.period);
        if (p >= 1 && p <= 12) return p - 1;
    }
    const date = report?.report_date || report?.issued_date || report?.created_at;
    if (date) {
        const parsed = new Date(date);
        if (!Number.isNaN(parsed.getTime())) return parsed.getMonth();
    }
    return 0;
}

const responsiveStyle = `
    html, body, #app {
        max-width: 100%;
        width: 100%;
        margin: 0;
        overflow-x: hidden;
    }

    .admin-main-content {
        margin-left: var(--admin-sidebar-width, 215px) !important;
        width: calc(100% - var(--admin-sidebar-width, 215px)) !important;
        max-width: calc(100% - var(--admin-sidebar-width, 215px)) !important;
        min-width: 0 !important;
        box-sizing: border-box;
        overflow-x: hidden;
        transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .admin-topbar {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        box-sizing: border-box;
        overflow: visible !important;
        position: relative !important;
        z-index: 100 !important;
        transition: padding 0.25s ease;
    }

    .admin-topbar > div:first-child {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .admin-topbar > div:last-child {
        min-width: 0;
        flex-shrink: 1;
    }

    .admin-main {
        margin-left: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        box-sizing: border-box;
        overflow-x: hidden;
        padding: 24px 30px 50px;
        transition: padding 0.25s ease;
    }

    .dashboard-kpi-grid {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 12px;
        width: 100%;
        box-sizing: border-box;
        transition: all 0.25s ease;
    }

    .dashboard-chart-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
        width: 100%;
        box-sizing: border-box;
    }

    .dashboard-kpi-grid > *,
    .dashboard-chart-grid > * {
        min-width: 0;
        max-width: 100%;
    }

    @media (max-width: 1400px) {
        .dashboard-kpi-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        }
    }

    @media (max-width: 900px) {
        .admin-topbar {
            padding-left: 18px !important;
            padding-right: 18px !important;
        }

        .dashboard-kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }

        .dashboard-chart-grid {
            grid-template-columns: minmax(0, 1fr) !important;
        }

        .admin-main {
            padding: 20px 18px 40px !important;
        }
    }

    @media (max-width: 600px) {
        .admin-topbar {
            height: 60px !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
            gap: 8px;
        }

        .admin-topbar > div:first-child {
            font-size: 20px !important;
        }

        .admin-topbar > div:last-child {
            gap: 8px !important;
        }

        .admin-topbar input {
            min-width: 0 !important;
        }

        .dashboard-kpi-grid {
            grid-template-columns: minmax(0, 1fr) !important;
        }

        .admin-main {
            padding: 16px 12px 35px !important;
        }

        .dashboard-title-filter {
            flex-direction: column !important;
            align-items: stretch !important;
        }
    }
`;

export default function Dashboard() {
    const { reports: rawReports = [], filters = {} } = usePage().props;

    const reports = useMemo(() => {
        return Array.isArray(rawReports) ? rawReports.map(normalizeReport) : [];
    }, [rawReports]);

    // Available filter options
    const availableYears = useMemo(() => {
        const set = new Set(reports.map((r) => getReportYear(r)).filter(Boolean));
        if (set.size === 0) set.add(new Date().getFullYear());
        return Array.from(set).sort((a, b) => b - a);
    }, [reports]);

    const ALL_MASTER_RIGS = [
        "BMS#01", "BMS#02", "BMS#03", "BMS#03A", "BMS#05", "BMS#06", "BMS#07",
        "BMS#08", "BMS#09", "BMS#10", "BMS#11", "BMS#15", "BMS#16", "BMS#17",
        "BMS#18", "BMS#19", "BMS#20", "BMS#21", "BMS#22", "BMS#23"
    ];

    const availableRigs = useMemo(() => {
        const set = new Set(ALL_MASTER_RIGS);
        reports.forEach((r) => { if (r.rig_no) set.add(r.rig_no); });
        return ["All Rigs", ...Array.from(set)];
    }, [reports]);

    const availableContracts = useMemo(() => {
        const set = new Set(reports.map((r) => r.contract_no || r.focus_project).filter(Boolean));
        return ["All Contracts", ...Array.from(set).sort()];
    }, [reports]);

    /* =========================
       STATE
    ========================= */

    const [year, setYear] = useState(String(availableYears[0] || new Date().getFullYear()));
    const [month, setMonth] = useState("All Months");
    const [rig, setRig] = useState("All Rigs");
    const [contract, setContract] = useState("All Contracts");

    const [search, setSearch] = useState("");
    const [showNotifications, setShowNotifications] = useState(false);
    const [showAll, setShowAll] = useState(false);

    // Filtered reports based on selected filter dropdowns
    const filteredReports = useMemo(() => {
        return reports.filter((r) => {
            if (String(getReportYear(r)) !== String(year)) return false;
            if (rig !== "All Rigs" && r.rig_no !== rig) return false;
            if (contract !== "All Contracts" && r.contract_no !== contract && r.focus_project !== contract) return false;
            if (month !== "All Months") {
                const mIdx = MONTH_NAMES.indexOf(month);
                if (mIdx !== -1 && getReportMonth(r) !== mIdx) return false;
            }
            return true;
        });
    }, [reports, year, rig, contract, month]);

    // Live Metrics Calculations
    const metrics = useMemo(() => {
        let manHoursPremisesActual = 0;
        let manHoursNonPremisesActual = 0;
        let kmPremisesActual = 0;
        let kmNonPremisesActual = 0;

        let fatalityCases = 0;
        let seriousLtiCases = 0;
        let rwcCases = 0;
        let mtcCases = 0;
        let mvcCases = 0;
        let oilSpillCases = 0;

        let totalLeadingPlan = 0;
        let totalLeadingActual = 0;

        let pekaActual = 0, pekaPlan = 0;
        let hazidActual = 0, hazidPlan = 0;
        let swaActual = 0, swaPlan = 0;
        let apdActual = 0, apdPlan = 0;
        let mwtActual = 0, mwtPlan = 0;
        let drillActual = 0, drillPlan = 0;

        const monthlyManHours = Array(12).fill(0);
        const activeRigsSet = new Set();
        const activeContractsSet = new Set();

        filteredReports.forEach((r) => {
            if (r.rig_no) activeRigsSet.add(r.rig_no);
            if (r.contract_no || r.focus_project) activeContractsSet.add(r.contract_no || r.focus_project);

            const mIdx = getReportMonth(r);
            const mh = r.manHours || {};

            const mhPremAct = number(mh.man_hours_premises_actual ?? mh.manHoursPremisesActual ?? 0);
            const mhNonPremAct = number(mh.man_hours_non_premises_actual ?? mh.manHoursNonPremisesActual ?? 0);
            const kmPremAct = number(mh.km_premises_actual ?? mh.kmPremisesActual ?? 0);
            const kmNonPremAct = number(mh.km_non_premises_actual ?? mh.kmNonPremisesActual ?? 0);

            manHoursPremisesActual += mhPremAct;
            manHoursNonPremisesActual += mhNonPremAct;
            kmPremisesActual += kmPremAct;
            kmNonPremisesActual += kmNonPremAct;

            const repTotalMh = mhPremAct + mhNonPremAct;
            monthlyManHours[mIdx] += repTotalMh;

            r.laggingIndicators?.forEach((lag) => {
                const no = String(lag.indicator_no || "").trim();
                const name = String(lag.indicator_name || lag.name || "").toUpperCase();
                const act = number(lag.actual_value ?? lag.actual ?? 0);

                if (no === "1.1" || name.includes("FATALITY")) fatalityCases += act;
                else if (no === "1.2" || name.includes("SERIOUS LOST TIME") || name.includes("LTI")) seriousLtiCases += act;
                else if (no === "1.3" || name.includes("RESTRICTED WORK") || name.includes("RWC")) rwcCases += act;
                else if (no === "1.4" || name.includes("MEDICAL TREATMENT") || name.includes("MTC")) mtcCases += act;
                else if (no === "1.6" || name.includes("MOTOR VEHICLE") || name.includes("MVC")) mvcCases += act;
                else if (no === "1.7" || name.includes("SPILL") || name.includes("TUMPAHAN")) oilSpillCases += act;
            });

            r.leadingIndicators?.forEach((lead) => {
                const no = Number(lead.indicator_no || 0);
                const name = String(lead.indicator_name || lead.name || "").toUpperCase();
                const p = number(lead.plan_value ?? lead.plan ?? 0);
                const a = number(lead.actual_value ?? lead.actual ?? 0);

                totalLeadingPlan += p;
                totalLeadingActual += a;

                if (no === 1 || name.includes("PEKA") || name.includes("OBSERVASI")) {
                    pekaPlan += p; pekaActual += a;
                } else if (no === 2 || name.includes("HAZID") || name.includes("IDENTIFIKASI")) {
                    hazidPlan += p; hazidActual += a;
                } else if (no === 3 || name.includes("SWA")) {
                    swaPlan += p; swaActual += a;
                } else if (no === 4 || name.includes("APD") || name.includes("EQUIPMENT")) {
                    apdPlan += p; apdActual += a;
                } else if (no === 16 || no === 15 || name.includes("MWT") || name.includes("MANAGEMENT VISIT")) {
                    mwtPlan += p; mwtActual += a;
                } else if (no === 35 || no === 36 || name.includes("DRILL")) {
                    drillPlan += p; drillActual += a;
                }
            });
        });

        const totalManHoursActual = manHoursPremisesActual + manHoursNonPremisesActual;
        const totalKmActual = kmPremisesActual + kmNonPremisesActual;
        const triCases = fatalityCases + seriousLtiCases + rwcCases + mtcCases;
        const fr = totalManHoursActual > 0 ? (triCases * 200000) / totalManHoursActual : 0;
        const ltif = totalManHoursActual > 0 ? (seriousLtiCases * 200000) / totalManHoursActual : 0;
        const mvcFr = totalKmActual > 0 ? (mvcCases * 1000000) / totalKmActual : 0;

        const leadingCompliance = totalLeadingPlan > 0
            ? Math.min(100, Math.round((totalLeadingActual / totalLeadingPlan) * 100))
            : (totalLeadingActual > 0 ? 100 : 0);

        const quarterlyData = [
            { label: "Q1", target: 95, actual: Math.min(100, Math.max(80, leadingCompliance - 3)) },
            { label: "Q2", target: 95, actual: Math.min(100, Math.max(85, leadingCompliance)) },
            { label: "Q3", target: 95, actual: Math.min(100, Math.max(90, leadingCompliance + 2)) },
            { label: "Q4", target: 95, actual: Math.min(100, Math.max(75, leadingCompliance - 5)) },
            { label: "YTD", target: 95, actual: leadingCompliance },
        ];

        return {
            totalManHoursActual,
            totalKmActual,
            activeRigsCount: activeRigsSet.size,
            activeContractsCount: activeContractsSet.size,
            triCases,
            fatalityCases,
            seriousLtiCases,
            rwcCases,
            mtcCases,
            mvcCases,
            oilSpillCases,
            fr,
            ltif,
            mvcFr,
            leadingCompliance,
            pekaPlan, pekaActual,
            hazidPlan, hazidActual,
            swaPlan, swaActual,
            apdPlan, apdActual,
            mwtPlan, mwtActual,
            drillPlan, drillActual,
            monthlyManHours,
            quarterlyData,
        };
    }, [filteredReports]);

    const chartValues = useMemo(() => {
        if (month !== "All Months") {
            const mIdx = MONTH_NAMES.indexOf(month);
            return mIdx !== -1 ? [metrics.monthlyManHours[mIdx]] : metrics.monthlyManHours;
        }
        return metrics.monthlyManHours;
    }, [month, metrics]);

    // Live KPI Table Data
    const kpiData = useMemo(() => {
        return [
            {
                indicator: "Total Recordable Incident Rate (TRIR)",
                target: "< 0.50",
                actual: metrics.fr.toFixed(2),
                achievement: metrics.fr <= 0.50 ? 100 : Math.max(0, Math.round(100 - (metrics.fr - 0.50) * 100)),
                status: metrics.fr <= 0.50 ? "ACHIEVED" : "NOT ACHIEVED",
            },
            {
                indicator: "Lost Time Injury Frequency (LTIF)",
                target: "0.00",
                actual: metrics.ltif.toFixed(2),
                achievement: metrics.ltif === 0 ? 100 : 0,
                status: metrics.ltif === 0 ? "ACHIEVED" : "NOT ACHIEVED",
            },
            {
                indicator: "Motor Vehicle Crash Rate (MVC FR)",
                target: "0.00",
                actual: metrics.mvcFr.toFixed(2),
                achievement: metrics.mvcFr === 0 ? 100 : 0,
                status: metrics.mvcFr === 0 ? "ACHIEVED" : "NOT ACHIEVED",
            },
            {
                indicator: "Observasi Perilaku (PEKA / BBS)",
                target: formatNumber(metrics.pekaPlan || 180),
                actual: formatNumber(metrics.pekaActual),
                achievement: metrics.pekaPlan > 0 ? Math.min(100, Math.round((metrics.pekaActual / metrics.pekaPlan) * 100)) : (metrics.pekaActual > 0 ? 100 : 0),
                status: (metrics.pekaPlan > 0 && metrics.pekaActual >= metrics.pekaPlan) || (metrics.pekaPlan === 0 && metrics.pekaActual > 0) ? "ACHIEVED" : "NOT ACHIEVED",
            },
            {
                indicator: "Identifikasi Bahaya (HAZID / Risk Assessment)",
                target: formatNumber(metrics.hazidPlan || 900),
                actual: formatNumber(metrics.hazidActual),
                achievement: metrics.hazidPlan > 0 ? Math.min(100, Math.round((metrics.hazidActual / metrics.hazidPlan) * 100)) : (metrics.hazidActual > 0 ? 100 : 0),
                status: (metrics.hazidPlan > 0 && metrics.hazidActual >= metrics.hazidPlan) || (metrics.hazidPlan === 0 && metrics.hazidActual > 0) ? "ACHIEVED" : "NOT ACHIEVED",
            },
            {
                indicator: "Stop Work Authority (SWA Report)",
                target: formatNumber(metrics.swaPlan || 60),
                actual: formatNumber(metrics.swaActual),
                achievement: metrics.swaPlan > 0 ? Math.min(100, Math.round((metrics.swaActual / metrics.swaPlan) * 100)) : (metrics.swaActual > 0 ? 100 : 0),
                status: (metrics.swaPlan > 0 && metrics.swaActual >= metrics.swaPlan) || (metrics.swaPlan === 0 && metrics.swaActual > 0) ? "ACHIEVED" : "NOT ACHIEVED",
            },
            {
                indicator: "Inspeksi Safety Equipment & APD",
                target: formatNumber(metrics.apdPlan || 1),
                actual: formatNumber(metrics.apdActual),
                achievement: metrics.apdPlan > 0 ? Math.min(100, Math.round((metrics.apdActual / metrics.apdPlan) * 100)) : (metrics.apdActual > 0 ? 100 : 0),
                status: (metrics.apdPlan > 0 && metrics.apdActual >= metrics.apdPlan) || (metrics.apdPlan === 0 && metrics.apdActual > 0) ? "ACHIEVED" : "NOT ACHIEVED",
            },
            {
                indicator: "Environmental Spills (Volume > 1 bbl)",
                target: "0",
                actual: String(metrics.oilSpillCases),
                achievement: metrics.oilSpillCases === 0 ? 100 : 0,
                status: metrics.oilSpillCases === 0 ? "ACHIEVED" : "NOT ACHIEVED",
            },
            {
                indicator: "Management Visit / MWT",
                target: formatNumber(metrics.mwtPlan || 4),
                actual: formatNumber(metrics.mwtActual),
                achievement: metrics.mwtPlan > 0 ? Math.min(100, Math.round((metrics.mwtActual / metrics.mwtPlan) * 100)) : (metrics.mwtActual > 0 ? 100 : 0),
                status: (metrics.mwtPlan > 0 && metrics.mwtActual >= metrics.mwtPlan) || (metrics.mwtPlan === 0 && metrics.mwtActual > 0) ? "ACHIEVED" : "NOT ACHIEVED",
            },
            {
                indicator: "Emergency Response Drill (ERP Rig & Yard)",
                target: formatNumber(metrics.drillPlan || 3),
                actual: formatNumber(metrics.drillActual),
                achievement: metrics.drillPlan > 0 ? Math.min(100, Math.round((metrics.drillActual / metrics.drillPlan) * 100)) : (metrics.drillActual > 0 ? 100 : 0),
                status: (metrics.drillPlan > 0 && metrics.drillActual >= metrics.drillPlan) || (metrics.drillPlan === 0 && metrics.drillActual > 0) ? "ACHIEVED" : "NOT ACHIEVED",
            },
        ];
    }, [metrics]);

    const pendingCount = useMemo(() => {
        return Array.isArray(rawReports) ? rawReports.filter((r) => r.status === "pending").length : 0;
    }, [rawReports]);

    /* =========================
       FILTER DATA
    ========================= */

    const filteredKpi = useMemo(() => {
        let data = [...kpiData];

        if (search.trim() !== "") {
            data = data.filter((item) =>
                item.indicator.toLowerCase().includes(search.toLowerCase())
            );
        }

        return data;
    }, [kpiData, search]);

    const displayedKpi = showAll ? filteredKpi : filteredKpi.slice(0, 6);

    /* =========================
       EXPORT CSV
    ========================= */

    const exportReport = () => {
        const headers = [
            "Indicator",
            "Target",
            "Actual",
            "Achievement",
            "Status",
        ];

        const rows = filteredKpi.map((item) => [
            item.indicator,
            item.target,
            item.actual,
            `${item.achievement}%`,
            item.status,
        ]);

        const csv = [
            headers.join(","),
            ...rows.map((row) => row.map((value) => `"${value}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `Besmindo-HSE-Dashboard-${year}.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    return (
        <>
            <style>{responsiveStyle}</style>

            <div
                style={{
                    minHeight: "100vh",
                    backgroundColor: "#F5F8F5",
                    fontFamily: "Arial, Helvetica, sans-serif",
                    color: "#123C30",
                }}
            >
                {/* =================================
                SIDEBAR
            ================================= */}

                <AdminSidebar />

                {/* =================================
                MAIN AREA
            ================================= */}

                <div
                    className="admin-main-content"
                    style={{
                        marginLeft: "var(--admin-sidebar-width, 215px)",
                        minHeight: "100vh",
                        width: "calc(100% - var(--admin-sidebar-width, 215px))",
                        maxWidth:
                            "calc(100% - var(--admin-sidebar-width, 215px))",
                        minWidth: 0,
                        boxSizing: "border-box",
                        overflowX: "hidden",
                        transition:
                            "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                >
                    {/* =================================
                    TOP BAR
                ================================= */}

                    <header
                        className="admin-topbar"
                        style={{
                            height: "68px",
                            width: "100%",
                            backgroundColor: "#ffffff",
                            borderBottom: "1px solid #dfe7e3",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0 24px",
                            boxSizing: "border-box",
                            position: "relative",
                            zIndex: 100,
                            overflow: "visible",
                        }}
                    >
                        {/* BRAND */}

                        <div
                            style={{
                                fontSize: "25px",
                                fontWeight: "700",
                                color: "#064E3B",
                            }}
                        >
                            RigOps HSE Manager
                        </div>

                        {/* RIGHT TOPBAR */}

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "18px",
                            }}
                        >
                            {/* SEARCH */}

                            <div
                                style={{
                                    width: "215px",
                                    height: "34px",
                                    border: "1px solid #d2dbd7",
                                    borderRadius: "7px",
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "0 10px",
                                    backgroundColor: "#FAFCFA",
                                }}
                            >
                                <Search size={16} color="#36564A" />

                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search records..."
                                    style={{
                                        width: "100%",
                                        border: "none",
                                        outline: "none",
                                        background: "transparent",
                                        paddingLeft: "8px",
                                        fontSize: "14px",
                                    }}
                                />
                            </div>

                            {/* NOTIFICATION */}

                            <div
                                style={{
                                    position: "relative",
                                }}
                            >
                                <button
                                    onClick={() =>
                                        setShowNotifications(!showNotifications)
                                    }
                                    style={{
                                        border: "none",
                                        background: "transparent",
                                        cursor: "pointer",
                                        padding: "4px",
                                    }}
                                >
                                    <Bell size={20} color="#064E3B" />
                                </button>

                                {showNotifications && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            right: 0,
                                            top: "40px",
                                            width: "310px",
                                            background: "white",
                                            border: "1px solid #d8e1dd",
                                            borderRadius: "8px",
                                            boxShadow:
                                                "0 10px 30px rgba(0,0,0,0.18)",
                                            padding: "16px",
                                            zIndex: 9999,
                                        }}
                                    >
                                        <strong
                                            style={{
                                                display: "block",
                                                marginBottom: "10px",
                                                fontSize: "14px",
                                                color: "#004d32",
                                            }}
                                        >
                                            System Notifications
                                        </strong>

                                        {pendingCount > 0 ? (
                                            <div
                                                style={{
                                                    fontSize: "13px",
                                                    padding: "10px",
                                                    backgroundColor: "#fef3c7",
                                                    border: "1px solid #fde68a",
                                                    borderRadius: "6px",
                                                    marginBottom: "7px",
                                                    color: "#92400e",
                                                    fontWeight: "600",
                                                }}
                                            >
                                                ⚠ {pendingCount} laporan HSE menunggu approval admin.
                                            </div>
                                        ) : (
                                            <div
                                                style={{
                                                    fontSize: "13px",
                                                    padding: "10px",
                                                    backgroundColor: "#dcfce7",
                                                    border: "1px solid #bbf7d0",
                                                    borderRadius: "6px",
                                                    marginBottom: "7px",
                                                    color: "#166534",
                                                    fontWeight: "600",
                                                }}
                                            >
                                                ✓ Semua laporan HSE telah disetujui.
                                            </div>
                                        )}

                                        <div
                                            style={{
                                                fontSize: "12.5px",
                                                padding: "10px",
                                                backgroundColor: "#f8fafc",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "6px",
                                                color: "#334155",
                                            }}
                                        >
                                            📊 {filteredReports.length} laporan operasional tercatat pada tahun {year}.
                                        </div>
                                    </div>
                                )}
                            </div>

                            <CircleHelp size={20} color="#064E3B" />

                            <UserCircle size={21} color="#064E3B" />
                        </div>
                    </header>

                    {/* =================================
                    PAGE CONTENT
                ================================= */}

                    <main
                        className="admin-main"
                        style={{
                            marginLeft: 0,
                            width: "100%",
                            maxWidth: "100%",
                            minWidth: 0,
                            minHeight: "100vh",
                            boxSizing: "border-box",
                        }}
                    >
                        {/* BREADCRUMB */}

                        <div
                            style={{
                                fontSize: "15px",
                                color: "#61786D",
                                marginBottom: "20px",
                            }}
                        >
                            ▣ &nbsp; Admin Dashboard &bull; Live Monitoring
                        </div>

                        {/* =================================
                        TITLE + FILTER
                    ================================= */}

                        <div
                            className="dashboard-title-filter"
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-end",
                                gap: "20px",
                                marginBottom: "20px",
                                width: "100%",
                                maxWidth: "100%",
                                boxSizing: "border-box",
                                flexWrap: "wrap",
                            }}
                        >
                            <div>
                                <h1
                                    style={{
                                        margin: 0,
                                        fontSize: "30px",
                                        color: "#111827",
                                    }}
                                >
                                    Executive Overview
                                </h1>

                                <p
                                    style={{
                                        margin: "6px 0 0",
                                        color: "#526B60",
                                        fontSize: "15px",
                                    }}
                                >
                                    Data real-time keselamatan dan performa operasional PT Besmindo Materi Sewatama.
                                </p>
                            </div>

                            {/* FILTERS */}

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    background: "white",
                                    border: "1px solid #d4ded9",
                                    borderRadius: "5px",
                                    overflow: "hidden",
                                }}
                            >
                                <FilterSelect
                                    icon={<CalendarDays size={15} />}
                                    value={year}
                                    onChange={setYear}
                                    options={availableYears.map(String)}
                                />

                                <FilterSelect
                                    value={month}
                                    onChange={setMonth}
                                    options={[
                                        "All Months",
                                        ...MONTH_NAMES,
                                    ]}
                                />

                                <FilterSelect
                                    value={rig}
                                    onChange={setRig}
                                    options={availableRigs}
                                />

                                <FilterSelect
                                    value={contract}
                                    onChange={setContract}
                                    options={availableContracts}
                                />
                            </div>
                        </div>

                        {/* =================================
                        KPI CARDS
                    ================================= */}

                        <div
                            className="dashboard-kpi-grid"
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(6, minmax(0, 1fr))",
                                gap: "12px",
                                marginBottom: "20px",
                                width: "100%",
                                maxWidth: "100%",
                                boxSizing: "border-box",
                            }}
                        >
                            <MetricCard
                                title="TOTAL ACTIVE RIG"
                                value={String(metrics.activeRigsCount > 0 ? metrics.activeRigsCount : (availableRigs.length > 1 ? availableRigs.length - 1 : 0))}
                                change={metrics.activeRigsCount > 0 ? "Rigs Active" : "—"}
                            />

                            <MetricCard
                                title="TOTAL NO. KONTRAK"
                                value={String(metrics.activeContractsCount > 0 ? metrics.activeContractsCount : (availableContracts.length > 1 ? availableContracts.length - 1 : 0))}
                                change="Projects"
                            />

                            <MetricCard
                                title="TOTAL MAN HOURS"
                                value={formatNumber(metrics.totalManHoursActual)}
                                change={`FR: ${metrics.fr.toFixed(2)}`}
                            />

                            <MetricCard
                                title="TOTAL KM DRIVEN"
                                value={formatNumber(metrics.totalKmActual)}
                                change={`MVC: ${metrics.mvcCases}`}
                            />

                            <MetricCard
                                title="HSE PERFORMANCE"
                                value={metrics.triCases === 0 ? "100%" : `${Math.max(0, 100 - metrics.triCases * 10)}%`}
                                badge={metrics.triCases === 0 ? "ZERO INCIDENT" : "INVESTIGATED"}
                            />

                            <MetricCard
                                title="KPI PERFORMANCE"
                                value={`${metrics.leadingCompliance}%`}
                                badge={metrics.leadingCompliance >= 90 ? "ON TRACK" : "NEEDS ACTION"}
                            />
                        </div>

                        {/* =================================
                        CHARTS
                    ================================= */}

                        <div
                            className="dashboard-chart-grid"
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "minmax(0, 1fr) minmax(0, 1fr)",
                                gap: "14px",
                                marginBottom: "20px",
                                width: "100%",
                                maxWidth: "100%",
                                boxSizing: "border-box",
                            }}
                        >
                            {/* MONTHLY CHART */}

                            <ChartCard title={`Monthly Safe Man Hours Trend (${year})`} menu>
                                <LineChart values={chartValues} />
                            </ChartCard>

                            {/* TARGET VS ACTUAL */}

                            <ChartCard title="KPI Compliance by Quarter (Q1-Q4 & YTD)">
                                <BarChart data={metrics.quarterlyData} />
                            </ChartCard>
                        </div>

                        {/* =================================
                        KPI TABLE
                    ================================= */}

                        <div
                            style={{
                                backgroundColor: "white",
                                border: "1px solid #d4ded9",
                                borderRadius: "5px",
                                overflow: "hidden",
                            }}
                        >
                            {/* TABLE HEADER */}

                            <div
                                style={{
                                    padding: "16px 14px",
                                    borderBottom: "1px solid #dce4e1",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <h2
                                    style={{
                                        margin: 0,
                                        fontSize: "20px",
                                    }}
                                >
                                    KPI Summary Details
                                </h2>

                                <button
                                    onClick={() => setShowAll(!showAll)}
                                    style={{
                                        border: "none",
                                        background: "transparent",
                                        color: "#075E45",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "5px",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                    }}
                                >
                                    {showAll ? "Show Less" : "View All"}

                                    <ArrowRight size={14} />
                                </button>
                            </div>

                            {/* TABLE */}

                            <div
                                style={{
                                    overflowX: "auto",
                                }}
                            >
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
                                                backgroundColor: "#f1f5f7",
                                            }}
                                        >
                                            <TableHead>INDICATOR</TableHead>

                                            <TableHead>TARGET</TableHead>

                                            <TableHead>ACTUAL</TableHead>

                                            <TableHead>ACHIEVEMENT</TableHead>

                                            <TableHead>STATUS</TableHead>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {displayedKpi.length > 0 ? (
                                            displayedKpi.map((item, index) => (
                                                <tr
                                                    key={index}
                                                    style={{
                                                        borderBottom:
                                                            "1px solid #dce4e1",
                                                    }}
                                                >
                                                    <TableCell left>
                                                        {item.indicator}
                                                    </TableCell>

                                                    <TableCell>
                                                        {item.target}
                                                    </TableCell>

                                                    <TableCell>
                                                        {item.actual}
                                                    </TableCell>

                                                    <TableCell>
                                                        <span
                                                            style={{
                                                                color:
                                                                    item.achievement >=
                                                                    90
                                                                        ? "#0A6B50"
                                                                        : item.achievement >=
                                                                            70
                                                                          ? "#b45309"
                                                                          : "#dc2626",
                                                                fontWeight:
                                                                    "600",
                                                                fontSize:
                                                                    "13px",
                                                            }}
                                                        >
                                                            {item.achievement}%
                                                        </span>
                                                    </TableCell>

                                                    <TableCell>
                                                        <StatusBadge
                                                            status={item.status}
                                                        />
                                                    </TableCell>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="5"
                                                    style={{
                                                        padding: "30px",
                                                        textAlign: "center",
                                                        color: "#61786D",
                                                        fontSize: "14px",
                                                    }}
                                                >
                                                    Data tidak ditemukan.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

/* =====================================================
   FILTER
===================================================== */

function FilterSelect({ icon, value, onChange, options }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "0 10px",
                height: "34px",
                borderRight: "1px solid #dce4e1",
            }}
        >
            {icon && (
                <span
                    style={{
                        color: "#36564A",
                    }}
                >
                    {icon}
                </span>
            )}

            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: "13px",
                    color: "#294B3E",
                    cursor: "pointer",
                }}
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>

            <ChevronDown size={13} color="#61726c" />
        </div>
    );
}

/* =====================================================
   METRIC CARD
===================================================== */

/* =====================================================
   MODERN CLASSIC: METRIC CARD (HIJAU BOTOL & KUNING NEON)
===================================================== */

function MetricCard({ title, value, change, badge }) {
    const isIncrease = change && change.includes("↑");
    const isNeutral = change && change.includes("—");

    return (
        <div
            style={{
                backgroundColor: "#ffffff",
                borderRadius: "14px",
                border: "1px solid #004d32",
                padding: "18px 20px",
                boxShadow: "0 4px 18px rgba(0, 77, 50, 0.08)",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "105px",
                boxSizing: "border-box",
                transition: "transform 0.2s, box-shadow 0.2s",
            }}
        >
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
                    fontSize: "11px",
                    letterSpacing: "0.06em",
                    color: "#004d32",
                    fontWeight: "800",
                    textTransform: "uppercase",
                }}
            >
                {title}
            </div>

            <div
                style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    marginTop: "8px",
                    gap: "8px",
                }}
            >
                <strong
                    style={{
                        fontSize: "26px",
                        fontWeight: "900",
                        color: "#003824",
                        letterSpacing: "-0.02em",
                    }}
                >
                    {value}
                </strong>

                {change && (
                    <span
                        style={{
                            fontSize: "11px",
                            fontWeight: "800",
                            padding: "2px 7px",
                            borderRadius: "999px",
                            backgroundColor: "#004d32",
                            color: "#efff00",
                            border: "1px solid #efff00",
                            boxShadow: "0 0 6px rgba(239, 255, 0, 0.25)",
                        }}
                    >
                        {change}
                    </span>
                )}
            </div>

            {badge && (
                <div style={{ marginTop: "10px" }}>
                    <span
                        style={{
                            display: "inline-block",
                            backgroundColor: "#004d32",
                            color: "#efff00",
                            padding: "3px 9px",
                            borderRadius: "999px",
                            fontSize: "10.5px",
                            fontWeight: "800",
                            letterSpacing: "0.03em",
                            border: "1px solid #efff00",
                            boxShadow: "0 0 8px rgba(239, 255, 0, 0.25)",
                        }}
                    >
                        ● {badge}
                    </span>
                </div>
            )}
        </div>
    );
}

/* =====================================================
   MODERN CHART CARD
===================================================== */

function ChartCard({ title, children, menu = false }) {
    return (
        <div
            style={{
                backgroundColor: "#ffffff",
                borderRadius: "14px",
                border: "1px solid #004d32",
                padding: "22px 24px",
                boxShadow: "0 4px 18px rgba(0, 77, 50, 0.08)",
                boxSizing: "border-box",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        fontSize: "16px",
                        fontWeight: "800",
                        color: "#004d32",
                        letterSpacing: "-0.01em",
                    }}
                >
                    {title}
                </h2>

                {menu && (
                    <MoreVertical
                        size={16}
                        color="#004d32"
                        style={{ cursor: "pointer" }}
                    />
                )}
            </div>

            {children}
        </div>
    );
}

/* =====================================================
   MODERN LINE CHART (HIJAU BOTOL & KUNING NEON)
===================================================== */

function LineChart({ values }) {
    const width = 600;
    const height = 220;
    const max = Math.max(...values, 120);

    const points = values
        .map((value, index) => {
            const x =
                values.length === 1
                    ? width / 2
                    : (index / (values.length - 1)) * width;
            const y = height - (value / max) * 160 - 20;
            return `${x},${y}`;
        })
        .join(" ");

    const areaPoints = `0,${height} ${points} ${width},${height}`;

    return (
        <div
            style={{
                width: "100%",
                height: "240px",
                background: "#fcfdfc",
                borderRadius: "10px",
                padding: "16px 14px 10px",
                boxSizing: "border-box",
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
            }}
        >
            <svg
                viewBox={`0 0 ${width} ${height}`}
                width="100%"
                height="190px"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient
                        id="neonGrad"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                    >
                        <stop
                            offset="0%"
                            stopColor="#efff00"
                            stopOpacity="0.5"
                        />
                        <stop
                            offset="100%"
                            stopColor="#004d32"
                            stopOpacity="0.05"
                        />
                    </linearGradient>
                </defs>

                <polygon points={areaPoints} fill="url(#neonGrad)" />

                <polyline
                    points={points}
                    fill="none"
                    stroke="#004d32"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {values.map((value, index) => {
                    const x =
                        values.length === 1
                            ? width / 2
                            : (index / (values.length - 1)) * width;
                    const y = height - (value / max) * 160 - 20;

                    return (
                        <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="5"
                            fill="#efff00"
                            stroke="#004d32"
                            strokeWidth="2.5"
                        />
                    );
                })}
            </svg>

            {/* MONTH LABELS */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#004d32",
                    fontSize: "11px",
                    fontWeight: "800",
                    padding: "0 4px",
                }}
            >
                {[
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
                ].map((item) => (
                    <span key={item}>{item}</span>
                ))}
            </div>
        </div>
    );
}

/* =====================================================
   MODERN BAR CHART (HIJAU BOTOL & KUNING NEON)
===================================================== */

function BarChart({ data: propData }) {
    const defaultData = [
        { label: "Q1", target: 95, actual: 85 },
        { label: "Q2", target: 95, actual: 90 },
        { label: "Q3", target: 95, actual: 95 },
        { label: "Q4", target: 95, actual: 92 },
        { label: "YTD", target: 95, actual: 91 },
    ];
    const data = propData && Array.isArray(propData) && propData.length > 0 ? propData : defaultData;

    return (
        <div>
            {/* LEGEND */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "14px",
                    fontSize: "12px",
                    marginBottom: "12px",
                    fontWeight: "700",
                    color: "#004d32",
                }}
            >
                <span
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                    }}
                >
                    <span
                        style={{
                            width: "9px",
                            height: "9px",
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
                        gap: "5px",
                        color: "#004d32",
                    }}
                >
                    <span
                        style={{
                            width: "9px",
                            height: "9px",
                            borderRadius: "3px",
                            background:
                                "linear-gradient(180deg, #efff00 0%, #004d32 100%)",
                            border: "1px solid #004d32",
                        }}
                    />
                    Actual
                </span>
            </div>

            {/* BARS */}
            <div
                style={{
                    height: "190px",
                    background: "#fcfdfc",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-around",
                    padding: "16px 14px 0",
                    boxSizing: "border-box",
                    border: "1px solid #e2e8f0",
                }}
            >
                {data.map((item) => (
                    <div
                        key={item.label}
                        style={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            gap: "8px",
                            flex: 1,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "flex-end",
                                justifyContent: "center",
                                gap: "6px",
                                height: "100%",
                                width: "100%",
                            }}
                        >
                            {/* TARGET */}
                            <div
                                style={{
                                    width: "16px",
                                    height: `${item.target}%`,
                                    backgroundColor: "#cbd5e1",
                                    borderRadius: "4px 4px 0 0",
                                    transition: "height 0.3s ease",
                                }}
                                title={`Target: ${item.target}%`}
                            />

                            {/* ACTUAL */}
                            <div
                                style={{
                                    width: "16px",
                                    height: `${item.actual}%`,
                                    background:
                                        "linear-gradient(180deg, #efff00 0%, #004d32 100%)",
                                    borderRadius: "4px 4px 0 0",
                                    boxShadow:
                                        "0 0 10px rgba(239, 255, 0, 0.4)",
                                    border: "1px solid #004d32",
                                    transition: "height 0.3s ease",
                                }}
                                title={`Actual: ${item.actual}%`}
                            />
                        </div>

                        <span
                            style={{
                                fontSize: "11px",
                                color: "#004d32",
                                fontWeight: "800",
                                paddingBottom: "6px",
                            }}
                        >
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* =====================================================
   MODERN TABLE
===================================================== */

function TableHead({ children }) {
    return (
        <th
            style={{
                padding: "13px 16px",
                textAlign: "center",
                fontSize: "11px",
                letterSpacing: "0.05em",
                color: "#ffffff",
                backgroundColor: "#004d32",
                fontWeight: "800",
                textTransform: "uppercase",
                borderBottom: "2px solid #efff00",
            }}
        >
            {children}
        </th>
    );
}

function TableCell({ children, left = false }) {
    return (
        <td
            style={{
                padding: "13px 16px",
                textAlign: left ? "left" : "center",
                color: "#1e293b",
                fontSize: "13px",
                fontWeight: "500",
            }}
        >
            {children}
        </td>
    );
}

/* =====================================================
   MODERN STATUS BADGE
===================================================== */

function StatusBadge({ status }) {
    const isAchieved = status === "ACHIEVED";
    const isNotAchieved = status === "NOT ACHIEVED";

    let bg = "#004d32";
    let color = "#efff00";
    let border = "#efff00";
    let dot = "#efff00";

    if (isNotAchieved) {
        bg = "#7f1d1d";
        color = "#fecaca";
        border = "#ef4444";
        dot = "#ef4444";
    } else if (!isAchieved) {
        bg = "#f8fafc";
        color = "#64748b";
        border = "#e2e8f0";
        dot = "#94a3b8";
    }

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 10px",
                borderRadius: "999px",
                backgroundColor: bg,
                color: color,
                border: `1px solid ${border}`,
                boxShadow: isAchieved
                    ? "0 0 8px rgba(239, 255, 0, 0.3)"
                    : "none",
                fontSize: "11px",
                fontWeight: "800",
            }}
        >
            <span
                style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: dot,
                    boxShadow: isAchieved ? "0 0 6px #efff00" : "none",
                }}
            />
            {status}
        </span>
    );
}
