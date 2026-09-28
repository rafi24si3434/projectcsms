import React, { useMemo, useState } from "react";
import AdminSidebar from "../../Components/AdminSidebar";
import { usePage } from "@inertiajs/react";

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

export default function HSEPerformance() {
    const { reports: rawReports = [], filters = {} } = usePage().props;

    const reports = useMemo(() => {
        return Array.isArray(rawReports) ? rawReports.map(normalizeReport) : [];
    }, [rawReports]);

    // Available filters
    const availableYears = useMemo(() => {
        const set = new Set(reports.map(r => getReportYear(r)).filter(Boolean));
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
        return Array.from(set);
    }, [reports]);

    const availableProjects = useMemo(() => {
        const set = new Set(reports.map(r => r.contract_no || r.focus_project).filter(Boolean));
        return Array.from(set).sort();
    }, [reports]);

    // Filter States
    const [year, setYear] = useState(String(availableYears[0] || new Date().getFullYear()));
    const [month, setMonth] = useState("All");
    const [rig, setRig] = useState("All Rigs");
    const [project, setProject] = useState("All");

    const [currentPage, setCurrentPage] = useState(1);
    const [selectedLog, setSelectedLog] = useState(null);
    const rowsPerPage = 6;

    // Filtered reports
    const filteredReports = useMemo(() => {
        return reports.filter(r => {
            if (String(getReportYear(r)) !== String(year)) return false;
            if (rig !== "All Rigs" && r.rig_no !== rig) return false;
            if (project !== "All" && (r.contract_no !== project && r.focus_project !== project)) return false;
            if (month !== "All") {
                const mIdx = MONTH_NAMES.indexOf(month);
                if (mIdx !== -1 && getReportMonth(r) !== mIdx) return false;
            }
            return true;
        });
    }, [reports, year, rig, project, month]);

    // =========================================================
    // CALCULATION METRICS ACCORDING TO MASTER EXCEL FORMULAS
    // =========================================================

    const metrics = useMemo(() => {
        let manHoursPremisesPlan = 0;
        let manHoursPremisesActual = 0;
        let manHoursNonPremisesPlan = 0;
        let manHoursNonPremisesActual = 0;
        let totalEmployees = 0;
        let kmPremisesPlan = 0;
        let kmPremisesActual = 0;
        let kmNonPremisesPlan = 0;
        let kmNonPremisesActual = 0;

        let fatalityCases = 0;
        let seriousLtiCases = 0;
        let rwcCases = 0;
        let mtcCases = 0;
        let mvcCases = 0;
        let oilSpillCases = 0;
        let fireCases = 0;
        let propertyDamageCases = 0;
        let securityCases = 0;
        let illnessFatalityCases = 0;
        let reportableCases = 0;

        let totalLeadingPlan = 0;
        let totalLeadingActual = 0;

        // Specific leading categories
        let pekaActual = 0, pekaPlan = 0;
        let hazidActual = 0, hazidPlan = 0;
        let swaActual = 0, swaPlan = 0;
        let apdActual = 0, apdPlan = 0;
        let mwtActual = 0, mwtPlan = 0;
        let auditActual = 0, auditPlan = 0;

        // Monthly trends (12 months)
        const monthlyManHours = Array(12).fill(0);
        const monthlyLagging = Array(12).fill(0);

        // Quarterly lagging
        const quarterlyLagging = { Q1: { incidents: 0, nearMiss: 0 }, Q2: { incidents: 0, nearMiss: 0 }, Q3: { incidents: 0, nearMiss: 0 }, Q4: { incidents: 0, nearMiss: 0 } };

        filteredReports.forEach(r => {
            const mIdx = getReportMonth(r);
            const mh = r.manHours || {};

            const mhPremAct = number(mh.man_hours_premises_actual ?? mh.manHoursPremisesActual ?? 0);
            const mhNonPremAct = number(mh.man_hours_non_premises_actual ?? mh.manHoursNonPremisesActual ?? 0);
            const mhPremPlan = number(mh.man_hours_premises_plan ?? mh.manHoursPremisesPlan ?? 0);
            const mhNonPremPlan = number(mh.man_hours_non_premises_plan ?? mh.manHoursNonPremisesPlan ?? 0);

            const kmPremAct = number(mh.km_premises_actual ?? mh.kmPremisesActual ?? 0);
            const kmNonPremAct = number(mh.km_non_premises_actual ?? mh.kmNonPremisesActual ?? 0);
            const kmPremPlan = number(mh.km_premises_plan ?? mh.kmPremisesPlan ?? 0);
            const kmNonPremPlan = number(mh.km_non_premises_plan ?? mh.kmNonPremisesPlan ?? 0);

            const empCount = number(mh.total_employees ?? mh.totalEmployees ?? 0);

            manHoursPremisesPlan += mhPremPlan;
            manHoursPremisesActual += mhPremAct;
            manHoursNonPremisesPlan += mhNonPremPlan;
            manHoursNonPremisesActual += mhNonPremAct;

            kmPremisesPlan += kmPremPlan;
            kmPremisesActual += kmPremAct;
            kmNonPremisesPlan += kmNonPremPlan;
            kmNonPremisesActual += kmNonPremAct;

            totalEmployees += empCount;

            const repTotalMh = mhPremAct + mhNonPremAct;
            monthlyManHours[mIdx] += repTotalMh;

            // Lagging Indicators
            r.laggingIndicators?.forEach(lag => {
                const no = String(lag.indicator_no || "").trim();
                const name = String(lag.indicator_name || lag.name || "").toUpperCase();
                const act = number(lag.actual_value ?? lag.actual ?? 0);

                if (no === "1.1" || name.includes("FATALITY")) fatalityCases += act;
                else if (no === "1.2" || name.includes("SERIOUS LOST TIME") || name.includes("LTI")) seriousLtiCases += act;
                else if (no === "1.3" || name.includes("RESTRICTED WORK") || name.includes("RWC")) rwcCases += act;
                else if (no === "1.4" || name.includes("MEDICAL TREATMENT") || name.includes("MTC")) mtcCases += act;
                else if (no === "1.6" || name.includes("MOTOR VEHICLE") || name.includes("MVC")) mvcCases += act;
                else if (no === "1.7" || name.includes("SPILL") || name.includes("TUMPAHAN")) oilSpillCases += act;
                else if (no === "1.8" || name.includes("FIRE")) fireCases += act;
                else if (no === "1.9" || name.includes("PROPERTY DAMAGE")) propertyDamageCases += act;
                else if (no === "1.10" || name.includes("SECURITY")) securityCases += act;
                else if (no === "1.11" || name.includes("ILLNESS")) illnessFatalityCases += act;
                else if (no === "1.12" || name.includes("REPORTABLE") || name.includes("NEARMISS")) reportableCases += act;

                // Quarterly aggregation
                const qKey = mIdx <= 2 ? "Q1" : mIdx <= 5 ? "Q2" : mIdx <= 8 ? "Q3" : "Q4";
                if (no === "1.12" || name.includes("NEARMISS") || name.includes("REPORTABLE")) {
                    quarterlyLagging[qKey].nearMiss += act;
                } else if (act > 0) {
                    quarterlyLagging[qKey].incidents += act;
                }

                monthlyLagging[mIdx] += act;
            });

            // Leading Indicators
            r.leadingIndicators?.forEach(lead => {
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
                } else if (no === 8 || no === 10 || name.includes("AUDIT")) {
                    auditPlan += p; auditActual += a;
                }
            });
        });

        const totalManHoursActual = manHoursPremisesActual + manHoursNonPremisesActual;
        const totalKmActual = kmPremisesActual + kmNonPremisesActual;

        // Total Recordable Injury (TRI = 1.1 + 1.2 + 1.3 + 1.4)
        const triCases = fatalityCases + seriousLtiCases + rwcCases + mtcCases;

        // Frequency Rate = (TRI x 200,000) / Total Man Hours
        const fr = totalManHoursActual > 0 ? (triCases * 200000) / totalManHoursActual : 0;

        // MVC FR = (MVC x 1,000,000) / Total KM
        const mvcFr = totalKmActual > 0 ? (mvcCases * 1000000) / totalKmActual : 0;

        // Compliance %
        const complianceRate = totalLeadingPlan > 0 ? Math.min(100, Math.round((totalLeadingActual / totalLeadingPlan) * 100)) : (totalLeadingActual > 0 ? 100 : 0);
        const targetRate = 95;
        const varianceRate = complianceRate - targetRate;

        // Max manhour for trend normalization
        const maxMh = Math.max(...monthlyManHours, 1);

        return {
            totalManHoursActual,
            totalKmActual,
            totalEmployees,
            fatalityCases,
            seriousLtiCases,
            rwcCases,
            mtcCases,
            triCases,
            mvcCases,
            oilSpillCases,
            fireCases,
            propertyDamageCases,
            securityCases,
            illnessFatalityCases,
            reportableCases,
            fr,
            mvcFr,
            complianceRate,
            targetRate,
            varianceRate,
            leadingBars: [
                { label: "PEKA", value: pekaPlan > 0 ? Math.min(100, Math.round((pekaActual / pekaPlan) * 100)) : (pekaActual > 0 ? 100 : 0) },
                { label: "HAZID", value: hazidPlan > 0 ? Math.min(100, Math.round((hazidActual / hazidPlan) * 100)) : (hazidActual > 0 ? 100 : 0) },
                { label: "SWA", value: swaPlan > 0 ? Math.min(100, Math.round((swaActual / swaPlan) * 100)) : (swaActual > 0 ? 100 : 0) },
                { label: "Inspeksi APD", value: apdPlan > 0 ? Math.min(100, Math.round((apdActual / apdPlan) * 100)) : (apdActual > 0 ? 100 : 0) },
                { label: "MWT Visit", value: mwtPlan > 0 ? Math.min(100, Math.round((mwtActual / mwtPlan) * 100)) : (mwtActual > 0 ? 100 : 0) },
                { label: "Audit SMK3L", value: auditPlan > 0 ? Math.min(100, Math.round((auditActual / auditPlan) * 100)) : (auditActual > 0 ? 100 : 0) },
            ],
            monthlyTrend: monthlyManHours.map((val, idx) => ({
                month: MONTH_SHORT[idx],
                value: val,
                percentage: Math.max(15, Math.round((val / maxMh) * 100)),
            })),
            quarterlyLagging,
        };
    }, [filteredReports]);

    // =========================================================
    // ACTIVITY LOGS FROM REPORTS
    // =========================================================

    const activityLogs = useMemo(() => {
        const list = [];

        filteredReports.forEach(r => {
            const mh = r.manHours || {};
            const repMh = number(mh.man_hours_premises_actual ?? 0) + number(mh.man_hours_non_premises_actual ?? 0);

            // Add lagging cases if any
            r.laggingIndicators?.forEach(lag => {
                const act = number(lag.actual_value ?? lag.actual ?? 0);
                if (act > 0) {
                    const name = lag.indicator_name || lag.name || "Incident";
                    const isHigh = name.toUpperCase().includes("FATALITY") || name.toUpperCase().includes("LTI");
                    list.push({
                        id: `lag-${lag.id || Math.random()}`,
                        date: r.report_date || r.issued_date || `${year}-01-01`,
                        location: `${r.rig_no || "General"} (${r.location_district || "Area"})`,
                        event: `${name} (${act} Case)`,
                        category: "Lagging Indicator",
                        severity: isHigh ? "High" : "Medium",
                        manHours: formatNumber(repMh),
                        status: r.status === "approved" ? "Verified" : "Pending Review",
                        contract: r.contract_no || "SPHR00108C",
                        submitter: r.submitter_name || "HSE Officer",
                        notes: lag.notes || r.program_reference || "Formulir BMSD/03/FO/HSE/02/17",
                    });
                }
            });

            // Add leading observation summary for this report
            const leadingCount = r.leadingIndicators?.reduce((sum, item) => sum + number(item.actual_value ?? item.actual ?? 0), 0) || 0;
            if (leadingCount > 0) {
                list.push({
                    id: `lead-sum-${r.id}`,
                    date: r.report_date || r.issued_date || `${year}-01-01`,
                    location: `${r.rig_no || "General"} (${r.location_district || "Area"})`,
                    event: `Leading Safety Program (${leadingCount} Activities)`,
                    category: "Leading Indicator",
                    severity: "Low",
                    manHours: formatNumber(repMh),
                    status: r.status === "approved" ? "Completed" : "Actioned",
                    contract: r.contract_no || "SPHR00108C",
                    submitter: r.submitter_name || "HSE Officer",
                    notes: `Rig ${r.rig_no} safety activities: PEKA, HAZID, SWA, inspections, & toolbox meetings.`,
                });
            }
        });

        // If list is empty, supply default indicator records from filtered reports
        if (list.length === 0 && filteredReports.length > 0) {
            filteredReports.forEach(r => {
                list.push({
                    id: `rep-${r.id}`,
                    date: r.report_date || `${year}-01-01`,
                    location: `${r.rig_no || "General"} (${r.location_district || "Area"})`,
                    event: `Monthly HSE Performance Record - Period ${r.period || "All"}`,
                    category: "HSE Monitoring",
                    severity: "Info",
                    manHours: formatNumber(number(r.manHours?.man_hours_premises_actual ?? 0) + number(r.manHours?.man_hours_non_premises_actual ?? 0)),
                    status: r.status === "approved" ? "Verified" : "Under Review",
                    contract: r.contract_no || "SPHR00108C",
                    submitter: r.submitter_name || "HSE Officer",
                    notes: "Safe Operations - Zero Incident Target Achieved",
                });
            });
        }

        return list.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [filteredReports, year]);

    const totalPages = Math.max(1, Math.ceil(activityLogs.length / rowsPerPage));
    const currentData = activityLogs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const handleFilterChange = (setter, value) => {
        setter(value);
        setCurrentPage(1);
    };

    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handleExport = () => {
        alert(`Export HSE Performance Summary\nTahun: ${year}\nBulan: ${month}\nRig: ${rig}\nProject: ${project}\nTotal Safe Man Hours: ${formatNumber(metrics.totalManHoursActual)}\nTRI: ${metrics.triCases} (FR: ${metrics.fr.toFixed(4)})\nMVC: ${metrics.mvcCases} (MVC FR: ${metrics.mvcFr.toFixed(4)})`);
    };

    // Style constants
    const colors = {
        green: "#004d32",
        green2: "#00583b",
        lightGreen: "#e8f1ed",
        bg: "#f4f7fb",
        border: "#d9e1e8",
        text: "#102033",
        muted: "#64748b",
        red: "#c91f2c",
        yellow: "#efff00",
    };

    const cardStyle = {
        backgroundColor: "#ffffff",
        border: `1px solid ${colors.border}`,
        borderRadius: "10px",
        padding: "18px",
        boxSizing: "border-box",
        boxShadow: "0 2px 4px rgba(0, 77, 50, 0.04)",
    };

    const selectStyle = {
        width: "100%",
        height: "36px",
        padding: "0 10px",
        border: `1px solid ${colors.border}`,
        borderRadius: "6px",
        backgroundColor: "#ffffff",
        color: colors.text,
        fontSize: "13px",
        fontWeight: "600",
        outline: "none",
        cursor: "pointer",
    };

    const labelStyle = {
        display: "block",
        fontSize: "11px",
        fontWeight: "700",
        color: colors.muted,
        marginBottom: "4px",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
    };

    const headerButtonStyle = {
        width: "38px",
        height: "38px",
        borderRadius: "8px",
        border: `1px solid ${colors.border}`,
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: "16px",
        transition: "all 0.2s ease",
    };

    const sectionHeaderStyle = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "14px",
        flexWrap: "wrap",
        gap: "8px",
    };

    const sectionTitleStyle = {
        margin: 0,
        fontSize: "15px",
        fontWeight: "800",
        color: "#0f172a",
        letterSpacing: "-0.01em",
    };

    const thStyle = {
        padding: "11px 14px",
        backgroundColor: "#f8fafc",
        color: "#475569",
        fontSize: "11.5px",
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        borderBottom: "1px solid #e2e8f0",
        whiteSpace: "nowrap",
    };

    const tdStyle = {
        padding: "11px 14px",
        fontSize: "12.5px",
        color: "#334155",
        verticalAlign: "middle",
    };

    const tableButtonStyle = {
        padding: "4px 8px",
        backgroundColor: "#f1f5f9",
        border: "1px solid #cbd5e1",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "13px",
    };

    const exportButtonStyle = {
        padding: "7px 14px",
        backgroundColor: colors.green,
        color: "#ffffff",
        border: "none",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
    };

    const paginationButtonStyle = (disabled) => ({
        padding: "6px 12px",
        border: `1px solid ${colors.border}`,
        borderRadius: "6px",
        backgroundColor: disabled ? "#f1f5f9" : "#ffffff",
        color: disabled ? "#94a3b8" : colors.text,
        fontSize: "12px",
        fontWeight: "700",
        cursor: disabled ? "not-allowed" : "pointer",
    });

    return (
        <div style={{ minHeight: "100vh", backgroundColor: colors.bg, fontFamily: "'Inter', Arial, sans-serif", color: colors.text }}>
            {/* SIDEBAR */}
            <AdminSidebar />

            {/* MAIN CONTENT */}
            <main
                style={{
                    marginLeft: "var(--admin-sidebar-width, 215px)",
                    width: "calc(100% - var(--admin-sidebar-width, 215px))",
                    transition: "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    minHeight: "100vh",
                    boxSizing: "border-box",
                }}
            >
                {/* TOP HEADER */}
                <header
                    style={{
                        height: "70px",
                        backgroundColor: "#ffffff",
                        borderBottom: `1px solid ${colors.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 28px",
                        boxSizing: "border-box",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: colors.green }} />
                        <span style={{ color: colors.green, fontSize: "16px", fontWeight: "800", letterSpacing: "-0.02em" }}>
                            PT BESMINDO MATERI SEWATAMA &bull; HSE Performance
                        </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{ fontSize: "12px", color: colors.muted, fontWeight: "600" }}>
                            Form: <span style={{ color: colors.green, fontWeight: "700" }}>BMSD/03/FO/HSE/02/17 (Rev: #12)</span>
                        </div>
                        <button type="button" onClick={handleExport} style={headerButtonStyle} title="Export Summary">
                            📥
                        </button>
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <div style={{ padding: "28px", boxSizing: "border-box" }}>
                    {/* TITLE + FILTERS */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-end",
                            gap: "20px",
                            marginBottom: "20px",
                            flexWrap: "wrap",
                        }}
                    >
                        <div style={{ flex: 1, minWidth: "260px" }}>
                            <h1 style={{ margin: 0, fontSize: "26px", color: "#0f172a", fontWeight: "800", letterSpacing: "-0.02em" }}>
                                HSE Performance & Statistical Monitoring
                            </h1>
                            <p style={{ marginTop: "6px", marginBottom: 0, fontSize: "13.5px", color: colors.muted, fontWeight: "500" }}>
                                Pemantauan indikator keselamatan kerja, Safe Man Hours, TRI, Frequency Rates, dan kepatuhan leading indicators.
                            </p>
                        </div>

                        {/* FILTER BOX */}
                        <div
                            style={{
                                backgroundColor: "#ffffff",
                                border: `1px solid ${colors.border}`,
                                borderRadius: "8px",
                                padding: "10px 14px",
                                display: "grid",
                                gridTemplateColumns: "repeat(4, minmax(90px, 1fr))",
                                gap: "10px",
                                boxSizing: "border-box",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                            }}
                        >
                            {/* YEAR */}
                            <div>
                                <label style={labelStyle}>Year</label>
                                <select value={year} onChange={(e) => handleFilterChange(setYear, e.target.value)} style={selectStyle}>
                                    {availableYears.map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>

                            {/* MONTH */}
                            <div>
                                <label style={labelStyle}>Month</label>
                                <select value={month} onChange={(e) => handleFilterChange(setMonth, e.target.value)} style={selectStyle}>
                                    <option value="All">All Months</option>
                                    {MONTH_NAMES.map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>

                            {/* RIG */}
                            <div>
                                <label style={labelStyle}>Rig</label>
                                <select value={rig} onChange={(e) => handleFilterChange(setRig, e.target.value)} style={selectStyle}>
                                    <option value="All Rigs">All Rigs</option>
                                    {availableRigs.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            {/* PROJECT / CONTRACT */}
                            <div>
                                <label style={labelStyle}>Contract / Project</label>
                                <select value={project} onChange={(e) => handleFilterChange(setProject, e.target.value)} style={selectStyle}>
                                    <option value="All">All Projects</option>
                                    {availableProjects.map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* KPI CARDS */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                            gap: "14px",
                            marginBottom: "16px",
                        }}
                    >
                        <KpiCard
                            title="Total Safe Man Hours"
                            value={formatNumber(metrics.totalManHoursActual)}
                            subtitle="Premises + Non-Premises"
                            change={`FR: ${metrics.fr.toFixed(4)}`}
                            icon="⏱"
                            isGood={true}
                        />

                        <KpiCard
                            title="Total Distance (KM)"
                            value={formatNumber(metrics.totalKmActual)}
                            subtitle="Premises + Non-Premises"
                            change={`MVC FR: ${metrics.mvcFr.toFixed(4)}`}
                            icon="🚗"
                            isGood={true}
                        />

                        <KpiCard
                            title="Total Recordable Injury (TRI)"
                            value={String(metrics.triCases)}
                            subtitle={`Fatality: ${metrics.fatalityCases} | LTI: ${metrics.seriousLtiCases} | RWC: ${metrics.rwcCases}`}
                            change={metrics.triCases === 0 ? "Zero Incident (Safe)" : "Incident Recorded"}
                            icon="🛡"
                            isGood={metrics.triCases === 0}
                        />

                        <KpiCard
                            title="Leading Compliance"
                            value={`${metrics.complianceRate}%`}
                            subtitle={`Target: ${metrics.targetRate}% | Variance: ${metrics.varianceRate >= 0 ? "+" : ""}${metrics.varianceRate}%`}
                            change={metrics.complianceRate >= metrics.targetRate ? "Target Achieved" : "Needs Attention"}
                            icon="🎯"
                            isGood={metrics.complianceRate >= metrics.targetRate}
                        />
                    </div>

                    {/* SECONDARY ROW: FORMULAS / DETAILS */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                            gap: "14px",
                            marginBottom: "16px",
                        }}
                    >
                        <FormulaBadge label="Frequency Rate Formula" formula="FR = (TRI × 200,000) / Man Hours" value={metrics.fr.toFixed(4)} />
                        <FormulaBadge label="MVC Frequency Rate" formula="MVC FR = (MVC × 1,000,000) / KM" value={metrics.mvcFr.toFixed(4)} />
                        <FormulaBadge label="Total Active Personnel" formula="Employees (Ops + Support)" value={formatNumber(metrics.totalEmployees)} />
                        <FormulaBadge label="Environmental & Fire" formula="Oil Spill (>1bbl) & Fire (>100Jt)" value={`${metrics.oilSpillCases} Spill / ${metrics.fireCases} Fire`} />
                    </div>

                    {/* CHART AREA */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1.8fr 0.9fr",
                            gap: "14px",
                            marginBottom: "16px",
                        }}
                    >
                        {/* HSE TREND */}
                        <section style={cardStyle}>
                            <div style={sectionHeaderStyle}>
                                <div>
                                    <h2 style={sectionTitleStyle}>Monthly Safe Man Hours Trend ({year})</h2>
                                    <span style={{ fontSize: "12px", color: colors.muted }}>Distribusi akumulasi jam kerja selamat per bulan</span>
                                </div>
                                <span style={{ fontSize: "12px", fontWeight: "700", color: colors.green }}>
                                    {month !== "All" ? `Month: ${month}` : "Full Year (12 Months)"}
                                </span>
                            </div>

                            <div
                                style={{
                                    height: "210px",
                                    backgroundColor: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "8px",
                                    padding: "20px 14px 10px",
                                    boxSizing: "border-box",
                                    display: "flex",
                                    alignItems: "flex-end",
                                    gap: "6px",
                                }}
                            >
                                {metrics.monthlyTrend.map((item, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            flex: 1,
                                            height: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "flex-end",
                                            alignItems: "center",
                                            gap: "4px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "100%",
                                                height: `${item.percentage}%`,
                                                backgroundColor: item.value > 0 ? colors.green : "#cbd5e1",
                                                borderTop: `3px solid ${colors.yellow}`,
                                                borderRadius: "4px 4px 0 0",
                                                transition: "all 0.3s ease",
                                                cursor: "pointer",
                                                position: "relative",
                                            }}
                                            title={`${item.month}: ${formatNumber(item.value)} Man Hours`}
                                        />
                                        <span style={{ fontSize: "11px", fontWeight: "700", color: colors.muted }}>
                                            {item.month}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* TARGET VS ACTUAL DONUT */}
                        <section style={cardStyle}>
                            <div style={sectionHeaderStyle}>
                                <h2 style={sectionTitleStyle}>Target vs Actual Compliance</h2>
                            </div>

                            <div
                                style={{
                                    height: "210px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <div
                                    style={{
                                        width: "116px",
                                        height: "116px",
                                        borderRadius: "50%",
                                        background: `conic-gradient(${colors.green} 0deg ${Math.round(metrics.complianceRate * 3.6)}deg, #e2e8f0 ${Math.round(metrics.complianceRate * 3.6)}deg 360deg)`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "90px",
                                            height: "90px",
                                            borderRadius: "50%",
                                            backgroundColor: "#ffffff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexDirection: "column",
                                        }}
                                    >
                                        <strong style={{ fontSize: "24px", color: colors.green, fontWeight: "800" }}>
                                            {metrics.complianceRate}%
                                        </strong>
                                        <span style={{ fontSize: "10px", color: colors.muted, fontWeight: "600" }}>
                                            Achievement
                                        </span>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginTop: "14px",
                                        padding: "0 10px",
                                        boxSizing: "border-box",
                                    }}
                                >
                                    <div>
                                        <small style={{ color: colors.muted, fontSize: "11px", fontWeight: "600" }}>Target KPI</small>
                                        <div style={{ fontWeight: "800", fontSize: "14px", color: "#0f172a" }}>95.0%</div>
                                    </div>

                                    <div style={{ textAlign: "right" }}>
                                        <small style={{ color: colors.muted, fontSize: "11px", fontWeight: "600" }}>Variance</small>
                                        <div
                                            style={{
                                                fontWeight: "800",
                                                fontSize: "14px",
                                                color: metrics.varianceRate >= 0 ? colors.green : colors.red,
                                            }}
                                        >
                                            {metrics.varianceRate >= 0 ? `+${metrics.varianceRate}%` : `${metrics.varianceRate}%`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* LEADING + LAGGING BREAKDOWNS */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "14px",
                            marginBottom: "16px",
                        }}
                    >
                        {/* LEADING BARS */}
                        <section style={cardStyle}>
                            <div style={sectionHeaderStyle}>
                                <h2 style={sectionTitleStyle}>Leading Indicators Breakdown</h2>
                                <span style={{ fontSize: "11px", color: colors.muted }}>% Kepatuhan Program</span>
                            </div>
                            <IndicatorBars data={metrics.leadingBars.map(b => [b.label, b.value])} />
                        </section>

                        {/* LAGGING QUARTERS */}
                        <section style={cardStyle}>
                            <div style={sectionHeaderStyle}>
                                <h2 style={sectionTitleStyle}>Lagging Incidents by Quarter (Q1 - Q4)</h2>
                                <div style={{ fontSize: "11px", color: colors.muted, display: "flex", gap: "10px" }}>
                                    <span><span style={{ color: colors.red }}>●</span> Incidents / Injuries</span>
                                    <span><span style={{ color: colors.muted }}>●</span> Near Miss / SWA</span>
                                </div>
                            </div>

                            <div
                                style={{
                                    height: "150px",
                                    display: "flex",
                                    alignItems: "flex-end",
                                    gap: "15px",
                                    padding: "10px 15px",
                                    boxSizing: "border-box",
                                    backgroundColor: "#f8fafc",
                                    borderRadius: "8px",
                                }}
                            >
                                {["Q1", "Q2", "Q3", "Q4"].map((qKey) => {
                                    const qData = metrics.quarterlyLagging[qKey];
                                    const incHeight = Math.min(100, (qData.incidents + 1) * 25);
                                    const nearMissHeight = Math.min(100, qData.nearMiss * 10);
                                    return (
                                        <div key={qKey} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                                            <div style={{ width: "100%", height: "100px", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "4px" }}>
                                                <div
                                                    style={{
                                                        width: "16px",
                                                        height: qData.incidents > 0 ? `${incHeight}%` : "6px",
                                                        backgroundColor: qData.incidents > 0 ? colors.red : "#cbd5e1",
                                                        borderRadius: "3px 3px 0 0",
                                                    }}
                                                    title={`${qKey} Incidents: ${qData.incidents}`}
                                                />
                                                <div
                                                    style={{
                                                        width: "16px",
                                                        height: qData.nearMiss > 0 ? `${nearMissHeight}%` : "6px",
                                                        backgroundColor: "#64748b",
                                                        borderRadius: "3px 3px 0 0",
                                                    }}
                                                    title={`${qKey} Near Miss: ${qData.nearMiss}`}
                                                />
                                            </div>
                                            <span style={{ fontSize: "11px", fontWeight: "800", color: colors.green }}>{qKey}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    {/* DATA TABLE (LIVE HSE ACTIVITY & OBSERVATION LOG) */}
                    <section style={cardStyle}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "14px",
                                flexWrap: "wrap",
                                gap: "10px",
                            }}
                        >
                            <div>
                                <h2 style={sectionTitleStyle}>Live Incident & HSE Activity Log</h2>
                                <span style={{ fontSize: "12px", color: colors.muted }}>
                                    Menampilkan {activityLogs.length} catatan aktivitas operasional & observasi keselamatan.
                                </span>
                            </div>

                            <button type="button" onClick={handleExport} style={exportButtonStyle}>
                                📑 Export Log to Excel
                            </button>
                        </div>

                        {/* TABLE */}
                        <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                                <thead>
                                    <tr>
                                        <th style={thStyle}>Date</th>
                                        <th style={thStyle}>Rig / Location</th>
                                        <th style={thStyle}>Event / Activity</th>
                                        <th style={thStyle}>Category</th>
                                        <th style={thStyle}>Severity</th>
                                        <th style={thStyle}>Man Hours</th>
                                        <th style={thStyle}>Status</th>
                                        <th style={{ ...thStyle, textAlign: "center" }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" style={{ padding: "24px", textAlign: "center", color: colors.muted, fontSize: "13px" }}>
                                                Tidak ada data HSE log untuk filter yang dipilih.
                                            </td>
                                        </tr>
                                    ) : (
                                        currentData.map((row, index) => (
                                            <tr
                                                key={row.id || index}
                                                style={{
                                                    borderBottom: "1px solid #f1f5f9",
                                                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#fcfdfd",
                                                }}
                                            >
                                                <td style={tdStyle}>{row.date}</td>
                                                <td style={{ ...tdStyle, fontWeight: "700", color: colors.green }}>{row.location}</td>
                                                <td style={tdStyle}>{row.event}</td>
                                                <td style={{ ...tdStyle, color: colors.muted }}>{row.category}</td>
                                                <td style={tdStyle}>
                                                    <SeverityBadge severity={row.severity} />
                                                </td>
                                                <td style={tdStyle}>{row.manHours}</td>
                                                <td style={tdStyle}>
                                                    <span
                                                        style={{
                                                            padding: "3px 8px",
                                                            borderRadius: "4px",
                                                            fontSize: "11px",
                                                            fontWeight: "700",
                                                            backgroundColor: row.status.includes("Verified") || row.status.includes("Completed") ? "#dcfce7" : "#fef3c7",
                                                            color: row.status.includes("Verified") || row.status.includes("Completed") ? "#166534" : "#92400e",
                                                        }}
                                                    >
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: "center" }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedLog(row)}
                                                        style={tableButtonStyle}
                                                        title="View Details"
                                                    >
                                                        👁
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginTop: "14px",
                            }}
                        >
                            <span style={{ fontSize: "12px", color: colors.muted, fontWeight: "600" }}>
                                Showing {activityLogs.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to {Math.min(currentPage * rowsPerPage, activityLogs.length)} of {activityLogs.length} entries
                            </span>

                            <div style={{ display: "flex", gap: "6px" }}>
                                <button
                                    type="button"
                                    onClick={handlePrevious}
                                    disabled={currentPage === 1}
                                    style={paginationButtonStyle(currentPage === 1)}
                                >
                                    &larr; Prev
                                </button>
                                <span style={{ padding: "6px 12px", fontSize: "12px", fontWeight: "700", color: colors.green }}>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={currentPage >= totalPages}
                                    style={paginationButtonStyle(currentPage >= totalPages)}
                                >
                                    Next &rarr;
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* DETAIL MODAL */}
            {selectedLog && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                        padding: "20px",
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "12px",
                            padding: "24px",
                            maxWidth: "500px",
                            width: "100%",
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
                            <h3 style={{ margin: 0, color: colors.green, fontSize: "18px", fontWeight: "800" }}>
                                HSE Record Details
                            </h3>
                            <button
                                type="button"
                                onClick={() => setSelectedLog(null)}
                                style={{ border: "none", background: "none", fontSize: "18px", cursor: "pointer", color: colors.muted }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <DetailRow label="Event / Indicator" value={selectedLog.event} />
                            <DetailRow label="Date" value={selectedLog.date} />
                            <DetailRow label="Rig / Location" value={selectedLog.location} />
                            <DetailRow label="Contract / Project" value={selectedLog.contract} />
                            <DetailRow label="Category" value={selectedLog.category} />
                            <DetailRow label="Severity Level" value={selectedLog.severity} />
                            <DetailRow label="Man Hours" value={selectedLog.manHours} />
                            <DetailRow label="Submitter" value={selectedLog.submitter} />
                            <DetailRow label="Status" value={selectedLog.status} />
                            <div style={{ marginTop: "8px", padding: "10px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                                <small style={{ color: colors.muted, fontWeight: "700" }}>Program & Reference:</small>
                                <div style={{ fontSize: "12.5px", color: "#1e293b", marginTop: "4px" }}>{selectedLog.notes}</div>
                            </div>
                        </div>

                        <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                            <button
                                type="button"
                                onClick={() => setSelectedLog(null)}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: colors.green,
                                    color: "#ffffff",
                                    border: "none",
                                    borderRadius: "6px",
                                    fontWeight: "700",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ============================================================
   SUB-COMPONENTS FOR HSE PERFORMANCE
============================================================ */

function KpiCard({ title, value, subtitle, change, icon, isGood }) {
    return (
        <div
            style={{
                backgroundColor: "#ffffff",
                border: "1px solid #d9e1e8",
                borderRadius: "10px",
                padding: "16px",
                boxShadow: "0 2px 4px rgba(0, 77, 50, 0.04)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {title}
                    </span>
                    <div style={{ fontSize: "22px", fontWeight: "900", color: "#004d32", marginTop: "4px", letterSpacing: "-0.02em" }}>
                        {value}
                    </div>
                </div>
                <div
                    style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        backgroundColor: "#e8f1ed",
                        color: "#004d32",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "17px",
                    }}
                >
                    {icon}
                </div>
            </div>
            <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "10.5px", color: "#64748b", fontWeight: "500" }}>{subtitle}</span>
                <span
                    style={{
                        fontSize: "10.5px",
                        fontWeight: "700",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor: isGood ? "#dcfce7" : "#fee2e2",
                        color: isGood ? "#166534" : "#991b1b",
                    }}
                >
                    {change}
                </span>
            </div>
        </div>
    );
}

function FormulaBadge({ label, formula, value }) {
    return (
        <div
            style={{
                backgroundColor: "#ffffff",
                border: "1px solid #d9e1e8",
                borderRadius: "8px",
                padding: "12px 14px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            }}
        >
            <div style={{ fontSize: "11px", fontWeight: "800", color: "#004d32", marginBottom: "2px" }}>
                {label}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
                {formula}
            </div>
            <div style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", marginTop: "4px" }}>
                {value}
            </div>
        </div>
    );
}

function IndicatorBars({ data }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {data.map(([label, value], idx) => (
                <div key={idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                        <span style={{ color: "#334155" }}>{label}</span>
                        <span style={{ color: "#004d32", fontWeight: "800" }}>{value}%</span>
                    </div>
                    <div style={{ width: "100%", height: "8px", backgroundColor: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                        <div
                            style={{
                                width: `${Math.min(100, Math.max(0, value))}%`,
                                height: "100%",
                                backgroundColor: value >= 90 ? "#004d32" : value >= 60 ? "#d97706" : "#dc2626",
                                borderRadius: "4px",
                                transition: "width 0.3s ease",
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function SeverityBadge({ severity }) {
    const isHigh = severity === "High";
    const isMedium = severity === "Medium";
    const isLow = severity === "Low";
    return (
        <span
            style={{
                padding: "3px 8px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: "700",
                backgroundColor: isHigh ? "#fee2e2" : isMedium ? "#fef3c7" : isLow ? "#dbeafe" : "#f1f5f9",
                color: isHigh ? "#991b1b" : isMedium ? "#92400e" : isLow ? "#1e40af" : "#475569",
            }}
        >
            {severity}
        </span>
    );
}

function DetailRow({ label, value }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
            <span style={{ color: "#64748b", fontWeight: "600" }}>{label}</span>
            <span style={{ color: "#0f172a", fontWeight: "700", textAlign: "right" }}>{value || "-"}</span>
        </div>
    );
}
