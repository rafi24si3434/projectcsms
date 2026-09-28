import React, { useMemo, useState } from "react";
import AdminSidebar from "../../Components/AdminSidebar";
import {
    CheckCircle2,
    XCircle,
    Clock,
    Eye,
    ShieldCheck,
    Search,
    Filter,
    AlertTriangle,
    FileText,
    UserCheck,
    Calendar,
    ChevronRight,
    Sparkles,
    Info,
    Layers,
    Activity,
    TrendingUp,
    MapPin,
    Hash,
    Building2,
    User,
} from "lucide-react";

export default function Approval({ reports: initialReports = [] }) {
    const [reports, setReports] = useState(initialReports);
    const [filterStatus, setFilterStatus] = useState("all"); // all | pending | approved | rejected
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedReport, setSelectedReport] = useState(null);
    const [activeDetailTab, setActiveDetailTab] = useState("summary"); // summary | lagging | leading | remarks
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [rejectionModal, setRejectionModal] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");

    // Statistics
    const stats = useMemo(() => {
        const total = reports.length;
        const pending = reports.filter((r) => r.status === "pending" || r.status === "draft").length;
        const approved = reports.filter((r) => r.status === "approved").length;
        const rejected = reports.filter((r) => r.status === "rejected").length;
        return { total, pending, approved, rejected };
    }, [reports]);

    // Filtered Reports
    const filteredReports = useMemo(() => {
        return reports.filter((r) => {
            const matchesStatus =
                filterStatus === "all" ||
                (filterStatus === "pending" && (r.status === "pending" || r.status === "draft")) ||
                r.status === filterStatus;

            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                !searchTerm.trim() ||
                (r.rig_no && r.rig_no.toLowerCase().includes(searchLower)) ||
                (r.contract_no && r.contract_no.toLowerCase().includes(searchLower)) ||
                (r.location_district && r.location_district.toLowerCase().includes(searchLower)) ||
                (r.period && r.period.toLowerCase().includes(searchLower));

            return matchesStatus && matchesSearch;
        });
    }, [reports, filterStatus, searchTerm]);

    // Update Status Handler
    const handleUpdateStatus = async (reportId, newStatus, reason = null) => {
        setIsActionLoading(true);
        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");

            const response = await fetch(`/admin/approval/${reportId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": csrfToken || "",
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify({
                    status: newStatus,
                    rejection_reason: reason,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || "Gagal mengubah status approval.");
                return;
            }

            setReports((prev) =>
                prev.map((r) =>
                    r.id === reportId
                        ? {
                              ...r,
                              status: newStatus,
                              rejection_reason: reason,
                              approved_at: newStatus === "approved" ? new Date().toISOString() : r.approved_at,
                          }
                        : r
                )
            );

            if (selectedReport && selectedReport.id === reportId) {
                setSelectedReport((prev) => ({
                    ...prev,
                    status: newStatus,
                    rejection_reason: reason,
                }));
            }

            setRejectionModal(null);
            setRejectionReason("");
            alert(`Laporan berhasil diubah menjadi: ${newStatus.toUpperCase()}`);
        } catch (error) {
            console.error("Error updating approval:", error);
            alert("Terjadi kendala saat memproses approval.");
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f8fafc",
                fontFamily:
                    "'Instrument Sans', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
                color: "#1e293b",
            }}
        >
            <AdminSidebar />

            <main
                style={{
                    marginLeft: "var(--admin-sidebar-width, 215px)",
                    width: "calc(100% - var(--admin-sidebar-width, 215px))",
                    transition:
                        "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    minHeight: "100vh",
                }}
            >
                {/* TOPBAR */}
                <header
                    style={{
                        height: "64px",
                        backgroundColor: "#ffffff",
                        borderBottom: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 32px",
                        boxSizing: "border-box",
                        position: "sticky",
                        top: 0,
                        zIndex: 90,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                            style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                backgroundColor: "#004d32",
                                border: "1px solid #efff00",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#efff00",
                                boxShadow: "0 0 8px rgba(239, 255, 0, 0.25)",
                            }}
                        >
                            <ShieldCheck size={18} strokeWidth={2.5} />
                        </div>
                        <span
                            style={{
                                fontSize: "16px",
                                fontWeight: "800",
                                color: "#004d32",
                                letterSpacing: "-0.01em",
                            }}
                        >
                            Pusat Approval Data HSE Lapangan
                        </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
                            Status Sinkronisasi Email:
                        </span>
                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "4px 10px",
                                borderRadius: "16px",
                                backgroundColor: "#ecfdf5",
                                border: "1px solid #a7f3d0",
                                color: "#004d32",
                                fontSize: "11px",
                                fontWeight: "800",
                            }}
                        >
                            <span
                                style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    backgroundColor: "#10b981",
                                    boxShadow: "0 0 4px #10b981",
                                }}
                            />
                            Email Gateway Terhubung
                        </span>
                    </div>
                </header>

                {/* CONTENT AREA */}
                <div style={{ padding: "28px 32px 60px", maxWidth: "1500px", margin: "0 auto" }}>
                    {/* PAGE HEADER */}
                    <div style={{ marginBottom: "24px" }}>
                        <h1
                            style={{
                                margin: "0 0 6px",
                                fontSize: "22px",
                                fontWeight: "900",
                                color: "#004d32",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            Verifikasi & Persetujuan Laporan HSE
                        </h1>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "13.5px" }}>
                            Tinjau seluruh penginputan data HSE dari kru/PIC lapangan. Data yang disetujui (*Approved*) akan langsung masuk dan mengaktifkan perhitungan KPI per Rig serta Laporan HSE.
                        </p>
                    </div>

                    {/* SUMMARY METRIC CARDS */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: "16px",
                            marginBottom: "24px",
                        }}
                    >
                        {/* CARD 1: TOTAL */}
                        <div style={cardStyle}>
                            <div style={cardTopStripe} />
                            <div style={{ color: "#64748b", fontSize: "12px", fontWeight: "700" }}>
                                Total Pengajuan
                            </div>
                            <div style={{ fontSize: "28px", fontWeight: "900", color: "#004d32", marginTop: "4px" }}>
                                {stats.total}
                            </div>
                            <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>
                                Dari seluruh rig & periode
                            </div>
                        </div>

                        {/* CARD 2: PENDING */}
                        <div style={cardStyle}>
                            <div style={{ ...cardTopStripe, background: "linear-gradient(90deg, #f59e0b 0%, #efff00 100%)" }} />
                            <div style={{ color: "#b45309", fontSize: "12px", fontWeight: "700" }}>
                                Menunggu Persetujuan
                            </div>
                            <div style={{ fontSize: "28px", fontWeight: "900", color: "#d97706", marginTop: "4px" }}>
                                {stats.pending}
                            </div>
                            <div style={{ fontSize: "11.5px", color: "#b45309", marginTop: "2px" }}>
                                Butuh verifikasi admin
                            </div>
                        </div>

                        {/* CARD 3: APPROVED */}
                        <div style={cardStyle}>
                            <div style={{ ...cardTopStripe, background: "linear-gradient(90deg, #004d32 0%, #10b981 100%)" }} />
                            <div style={{ color: "#047857", fontSize: "12px", fontWeight: "700" }}>
                                Disetujui (Approved)
                            </div>
                            <div style={{ fontSize: "28px", fontWeight: "900", color: "#004d32", marginTop: "4px" }}>
                                {stats.approved}
                            </div>
                            <div style={{ fontSize: "11.5px", color: "#047857", marginTop: "2px" }}>
                                Aktif di KPI & Report
                            </div>
                        </div>

                        {/* CARD 4: REJECTED */}
                        <div style={cardStyle}>
                            <div style={{ ...cardTopStripe, background: "linear-gradient(90deg, #dc2626 0%, #f87171 100%)" }} />
                            <div style={{ color: "#b91c1c", fontSize: "12px", fontWeight: "700" }}>
                                Ditolak (Rejected)
                            </div>
                            <div style={{ fontSize: "28px", fontWeight: "900", color: "#dc2626", marginTop: "4px" }}>
                                {stats.rejected}
                            </div>
                            <div style={{ fontSize: "11.5px", color: "#b91c1c", marginTop: "2px" }}>
                                Perlu revisi kru lapangan
                            </div>
                        </div>
                    </div>

                    {/* TABLE TOOLBAR & FILTERS */}
                    <div
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "14px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 4px 18px rgba(0, 77, 50, 0.04)",
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                padding: "16px 20px",
                                borderBottom: "1px solid #e2e8f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: "12px",
                            }}
                        >
                            {/* FILTER TABS */}
                            <div style={{ display: "flex", gap: "6px" }}>
                                {[
                                    { key: "all", label: "Semua Data" },
                                    { key: "pending", label: `Pending (${stats.pending})` },
                                    { key: "approved", label: `Approved (${stats.approved})` },
                                    { key: "rejected", label: `Rejected (${stats.rejected})` },
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setFilterStatus(tab.key)}
                                        style={{
                                            padding: "6px 14px",
                                            borderRadius: "8px",
                                            border: filterStatus === tab.key ? "1px solid #efff00" : "1px solid #e2e8f0",
                                            backgroundColor: filterStatus === tab.key ? "#004d32" : "#f8fafc",
                                            color: filterStatus === tab.key ? "#efff00" : "#64748b",
                                            fontSize: "12px",
                                            fontWeight: filterStatus === tab.key ? "800" : "600",
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* SEARCH BOX */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    backgroundColor: "#f8fafc",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "8px",
                                    padding: "0 12px",
                                    height: "36px",
                                }}
                            >
                                <Search size={14} color="#64748b" />
                                <input
                                    type="text"
                                    placeholder="Cari Rig / Kontrak / Lokasi..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        border: "none",
                                        outline: "none",
                                        background: "transparent",
                                        fontSize: "12.5px",
                                        paddingLeft: "8px",
                                        color: "#1e293b",
                                        width: "220px",
                                    }}
                                />
                            </div>
                        </div>

                        {/* TABLE CONTENT */}
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                <thead>
                                    <tr
                                        style={{
                                            backgroundColor: "#004d32",
                                            color: "#ffffff",
                                            borderBottom: "2px solid #efff00",
                                        }}
                                    >
                                        <th style={thStyle}>No</th>
                                        <th style={{ ...thStyle, textAlign: "left" }}>Rig & Kontrak</th>
                                        <th style={thStyle}>Periode</th>
                                        <th style={{ ...thStyle, textAlign: "left" }}>Lokasi Wilayah</th>
                                        <th style={thStyle}>Tgl Input</th>
                                        <th style={{ ...thStyle, textAlign: "left" }}>Penginput (User / PIC)</th>
                                        <th style={thStyle}>Status Approval</th>
                                        <th style={thStyle}>Aksi Verifikasi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReports.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                style={{
                                                    textAlign: "center",
                                                    padding: "40px",
                                                    color: "#94a3b8",
                                                    fontSize: "13.5px",
                                                }}
                                            >
                                                Belum ada data pengajuan laporan HSE pada filter ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredReports.map((report, idx) => {
                                            const isPending = report.status === "pending" || report.status === "draft";
                                            const isApproved = report.status === "approved";
                                            const isRejected = report.status === "rejected";
                                            const creatorName = report.submitter_name || report.creator?.name || (report.submitter_role === "admin" ? "HSE Administrator" : "User / PIC Lapangan");
                                            const creatorEmail = report.submitter_email || report.creator?.email || "";

                                            return (
                                                <tr
                                                    key={report.id}
                                                    style={{
                                                        backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fcfdfd",
                                                        borderBottom: "1px solid #f1f5f9",
                                                    }}
                                                >
                                                    <td style={{ ...tdStyle, fontWeight: "700", color: "#004d32" }}>
                                                        {idx + 1}
                                                    </td>
                                                    <td style={{ ...tdStyle, textAlign: "left" }}>
                                                        <div style={{ fontWeight: "800", color: "#004d32" }}>
                                                            {report.rig_no || "Rig -"}
                                                        </div>
                                                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                                                            {report.contract_no || "-"}
                                                        </div>
                                                    </td>
                                                    <td style={tdStyle}>
                                                        <span
                                                            style={{
                                                                padding: "3px 8px",
                                                                borderRadius: "6px",
                                                                backgroundColor: "#f1f5f9",
                                                                color: "#334155",
                                                                fontWeight: "700",
                                                                fontSize: "11.5px",
                                                            }}
                                                        >
                                                            Bulan {report.period} - {report.year}
                                                        </span>
                                                    </td>
                                                    <td style={{ ...tdStyle, textAlign: "left", color: "#334155" }}>
                                                        {report.location_district || "-"}
                                                    </td>
                                                    <td style={{ ...tdStyle, fontSize: "12px", color: "#64748b" }}>
                                                        {report.report_date ? new Date(report.report_date).toLocaleDateString("id-ID") : "-"}
                                                    </td>
                                                    <td style={{ ...tdStyle, textAlign: "left" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                            <div
                                                                style={{
                                                                    width: "24px",
                                                                    height: "24px",
                                                                    borderRadius: "50%",
                                                                    backgroundColor: "#004d32",
                                                                    color: "#efff00",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    fontSize: "10.5px",
                                                                    fontWeight: "800",
                                                                    flexShrink: 0,
                                                                }}
                                                            >
                                                                {creatorName.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: "700", color: "#004d32", fontSize: "12px", lineHeight: "1.2" }}>
                                                                    {creatorName}
                                                                </div>
                                                                <div style={{ fontSize: "10.5px", color: "#64748b" }}>
                                                                    {creatorEmail || (report.submitter_role === "admin" ? "Role: Admin" : "Role: Field User")}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={tdStyle}>
                                                        {isPending && (
                                                            <span style={badgePending}>
                                                                <Clock size={12} />
                                                                Pending
                                                            </span>
                                                        )}
                                                        {isApproved && (
                                                            <span style={badgeApproved}>
                                                                <CheckCircle2 size={12} />
                                                                Approved
                                                            </span>
                                                        )}
                                                        {isRejected && (
                                                            <span style={badgeRejected}>
                                                                <XCircle size={12} />
                                                                Rejected
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={tdStyle}>
                                                        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                                                            <button
                                                                onClick={() => setSelectedReport(report)}
                                                                style={{
                                                                    padding: "5px 10px",
                                                                    borderRadius: "6px",
                                                                    border: "1px solid #cbd5e1",
                                                                    backgroundColor: "#ffffff",
                                                                    color: "#004d32",
                                                                    fontSize: "11.5px",
                                                                    fontWeight: "700",
                                                                    cursor: "pointer",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "4px",
                                                                }}
                                                                title="Lihat Rincian Laporan"
                                                            >
                                                                <Eye size={13} />
                                                                Detail
                                                            </button>

                                                            {isPending && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(report.id, "approved")}
                                                                        disabled={isActionLoading}
                                                                        style={{
                                                                            padding: "5px 10px",
                                                                            borderRadius: "6px",
                                                                            border: "1px solid #efff00",
                                                                            backgroundColor: "#004d32",
                                                                            color: "#efff00",
                                                                            fontSize: "11.5px",
                                                                            fontWeight: "800",
                                                                            cursor: "pointer",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            gap: "4px",
                                                                            boxShadow: "0 0 8px rgba(239, 255, 0, 0.2)",
                                                                        }}
                                                                    >
                                                                        <CheckCircle2 size={13} />
                                                                        Setujui
                                                                    </button>

                                                                    <button
                                                                        onClick={() => setRejectionModal(report)}
                                                                        disabled={isActionLoading}
                                                                        style={{
                                                                            padding: "5px 10px",
                                                                            borderRadius: "6px",
                                                                            border: "1px solid #fecaca",
                                                                            backgroundColor: "#fee2e2",
                                                                            color: "#991b1b",
                                                                            fontSize: "11.5px",
                                                                            fontWeight: "700",
                                                                            cursor: "pointer",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            gap: "4px",
                                                                        }}
                                                                    >
                                                                        <XCircle size={13} />
                                                                        Tolak
                                                                    </button>
                                                                </>
                                                            )}
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
            </main>

            {/* DETAIL MODAL */}
            {selectedReport && (() => {
                const manHours = selectedReport.man_hours || selectedReport.manHours || {};
                const laggingList = selectedReport.lagging_indicators || selectedReport.laggingIndicators || [];
                const leadingList = selectedReport.leading_indicators || selectedReport.leadingIndicators || [];

                return (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: "rgba(0, 0, 0, 0.65)",
                            backdropFilter: "blur(3px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 1000,
                            padding: "16px",
                            boxSizing: "border-box",
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: "#ffffff",
                                borderRadius: "16px",
                                maxWidth: "860px",
                                width: "100%",
                                maxHeight: "92vh",
                                display: "flex",
                                flexDirection: "column",
                                boxShadow: "0 24px 50px rgba(0, 0, 0, 0.35)",
                                border: "2px solid #004d32",
                                position: "relative",
                                overflow: "hidden",
                            }}
                        >
                            {/* MODAL HEADER */}
                            <div
                                style={{
                                    backgroundColor: "#004d32",
                                    color: "#ffffff",
                                    padding: "16px 24px",
                                    borderBottom: "3px solid #efff00",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    flexShrink: 0,
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                            borderRadius: "8px",
                                            backgroundColor: "rgba(239, 255, 0, 0.15)",
                                            border: "1px solid #efff00",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#efff00",
                                        }}
                                    >
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "900", color: "#efff00" }}>
                                            Rincian Laporan HSE: {selectedReport.rig_no}
                                        </h3>
                                        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#d1fae5" }}>
                                            Periode Bulan {selectedReport.period} - Tahun {selectedReport.year} | Kontrak: {selectedReport.contract_no}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        color: "#efff00",
                                        fontSize: "22px",
                                        fontWeight: "800",
                                        cursor: "pointer",
                                        padding: "4px 8px",
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* TAB BUTTONS */}
                            <div
                                style={{
                                    display: "flex",
                                    backgroundColor: "#f8fafc",
                                    borderBottom: "1px solid #e2e8f0",
                                    padding: "6px 16px 0",
                                    gap: "6px",
                                    flexShrink: 0,
                                }}
                            >
                                {[
                                    { id: "summary", label: "Ringkasan & Exposure", icon: Layers },
                                    { id: "lagging", label: `Indikator Lagging (${laggingList.length})`, icon: Activity },
                                    { id: "leading", label: `Indikator Leading (${leadingList.length})`, icon: TrendingUp },
                                    { id: "remarks", label: "Catatan & Log", icon: Info },
                                ].map((tab) => {
                                    const IconComponent = tab.icon;
                                    const isActive = activeDetailTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveDetailTab(tab.id)}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                padding: "10px 14px",
                                                borderTopLeftRadius: "8px",
                                                borderTopRightRadius: "8px",
                                                border: isActive ? "1px solid #e2e8f0" : "1px solid transparent",
                                                borderBottom: isActive ? "2px solid #004d32" : "none",
                                                backgroundColor: isActive ? "#ffffff" : "transparent",
                                                color: isActive ? "#004d32" : "#64748b",
                                                fontWeight: isActive ? "800" : "600",
                                                fontSize: "12.5px",
                                                cursor: "pointer",
                                                transition: "all 0.15s ease",
                                            }}
                                        >
                                            <IconComponent size={14} />
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* MODAL BODY (SCROLLABLE) */}
                            <div style={{ padding: "20px 24px", overflowY: "auto", flexGrow: 1 }}>
                                {/* STATUS BADGE BANNER */}
                                <div
                                    style={{
                                        padding: "10px 16px",
                                        borderRadius: "8px",
                                        backgroundColor:
                                            selectedReport.status === "approved"
                                                ? "#ecfdf5"
                                                : selectedReport.status === "rejected"
                                                ? "#fee2e2"
                                                : "#fef3c7",
                                        border: `1px solid ${
                                            selectedReport.status === "approved"
                                                ? "#a7f3d0"
                                                : selectedReport.status === "rejected"
                                                ? "#fca5a5"
                                                : "#fde68a"
                                        }`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginBottom: "18px",
                                        fontSize: "13px",
                                        fontWeight: "700",
                                        color:
                                            selectedReport.status === "approved"
                                                ? "#065f46"
                                                : selectedReport.status === "rejected"
                                                ? "#991b1b"
                                                : "#92400e",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <Info size={16} />
                                        <span>
                                            Status: <strong>{selectedReport.status.toUpperCase()}</strong>
                                            {selectedReport.approved_at && ` (Disetujui: ${new Date(selectedReport.approved_at).toLocaleString("id-ID")})`}
                                            {selectedReport.rejection_reason && ` - Alasan: ${selectedReport.rejection_reason}`}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                                        Submitter: {selectedReport.submitter_role === "admin" ? "HSE Admin" : "Field User / PIC"}
                                    </span>
                                </div>

                                {/* TAB 1: RINGKASAN & EXPOSURE */}
                                {activeDetailTab === "summary" && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                                        {/* GENERAL INFO CARDS */}
                                        <div>
                                            <h4 style={{ margin: "0 0 8px", fontSize: "13px", color: "#004d32", fontWeight: "800", textTransform: "uppercase" }}>
                                                Data Umum Laporan
                                            </h4>
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                                                <div style={detailBoxStyle}>
                                                    <div style={detailLabel}>Nomor Rig</div>
                                                    <div style={detailVal}>{selectedReport.rig_no}</div>
                                                </div>
                                                <div style={detailBoxStyle}>
                                                    <div style={detailLabel}>Nomor Kontrak</div>
                                                    <div style={detailVal}>{selectedReport.contract_no}</div>
                                                </div>
                                                <div style={detailBoxStyle}>
                                                    <div style={detailLabel}>Lokasi / Distrik</div>
                                                    <div style={detailVal}>{selectedReport.location_district || "-"}</div>
                                                </div>
                                                <div style={detailBoxStyle}>
                                                    <div style={detailLabel}>Tanggal Laporan</div>
                                                    <div style={detailVal}>{selectedReport.report_date ? new Date(selectedReport.report_date).toLocaleDateString("id-ID") : "-"}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* MAN HOURS SECTION */}
                                        <div>
                                            <h4 style={{ margin: "0 0 8px", fontSize: "13px", color: "#004d32", fontWeight: "800", textTransform: "uppercase" }}>
                                                Jam Kerja (Man Hours) & Tenaga Kerja
                                            </h4>
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                                                <div style={detailBoxStyle}>
                                                    <div style={detailLabel}>Premises (Plan / Actual)</div>
                                                    <div style={detailVal}>
                                                        {Number(manHours.premises_plan || 0).toLocaleString()} / {Number(manHours.premises_actual || 0).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div style={detailBoxStyle}>
                                                    <div style={detailLabel}>Non-Premises (Plan / Actual)</div>
                                                    <div style={detailVal}>
                                                        {Number(manHours.non_premises_plan || 0).toLocaleString()} / {Number(manHours.non_premises_actual || 0).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div style={detailBoxStyle}>
                                                    <div style={detailLabel}>Total Man Hours Actual</div>
                                                    <div style={{ ...detailVal, color: "#004d32" }}>
                                                        {(Number(manHours.premises_actual || 0) + Number(manHours.non_premises_actual || 0)).toLocaleString()} Jam
                                                    </div>
                                                </div>
                                                <div style={detailBoxStyle}>
                                                    <div style={detailLabel}>Total Karyawan</div>
                                                    <div style={detailVal}>{Number(manHours.total_employees || 0).toLocaleString()} Orang</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* KILOMETER SECTION */}
                                        <div>
                                            <h4 style={{ margin: "0 0 8px", fontSize: "13px", color: "#004d32", fontWeight: "800", textTransform: "uppercase" }}>
                                                Jarak Tempuh (Kilometer) & Kendaraan
                                            </h4>
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                                                <div style={detailBoxStyle}>
                                                    <div style={detailLabel}>KM Premises (Plan / Actual)</div>
                                                    <div style={detailVal}>
                                                        {Number(manHours.kilometer_premises_plan || 0).toLocaleString()} / {Number(manHours.kilometer_premises_actual || 0).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div style={detailBoxStyle}>
                                                    <div style={detailLabel}>KM Non-Premises (Plan / Act)</div>
                                                    <div style={detailVal}>
                                                        {Number(manHours.kilometer_non_premises_plan || 0).toLocaleString()} / {Number(manHours.kilometer_non_premises_actual || 0).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div style={detailBoxStyle}>
                                                    <div style={detailLabel}>Total KM Actual</div>
                                                    <div style={{ ...detailVal, color: "#004d32" }}>
                                                        {(Number(manHours.kilometer_premises_actual || 0) + Number(manHours.kilometer_non_premises_actual || 0)).toLocaleString()} KM
                                                    </div>
                                                </div>
                                                <div style={detailBoxStyle}>
                                                    <div style={detailLabel}>Total Unit Kendaraan</div>
                                                    <div style={detailVal}>{Number(manHours.total_vehicles || 0).toLocaleString()} Unit</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 2: LAGGING INDICATORS */}
                                {activeDetailTab === "lagging" && (
                                    <div>
                                        <h4 style={{ margin: "0 0 10px", fontSize: "13px", color: "#004d32", fontWeight: "800", textTransform: "uppercase" }}>
                                            Daftar Indikator Kinerja Lagging
                                        </h4>
                                        <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                                                <thead>
                                                    <tr style={{ backgroundColor: "#004d32", color: "#ffffff" }}>
                                                        <th style={{ padding: "9px 12px", textAlign: "center", width: "40px" }}>No</th>
                                                        <th style={{ padding: "9px 12px", textAlign: "left" }}>Nama Indikator Lagging</th>
                                                        <th style={{ padding: "9px 12px", textAlign: "center", width: "100px", color: "#efff00" }}>Plan</th>
                                                        <th style={{ padding: "9px 12px", textAlign: "center", width: "100px", color: "#efff00" }}>Actual</th>
                                                        <th style={{ padding: "9px 12px", textAlign: "center", width: "90px" }}>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {laggingList.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={5} style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>
                                                                Tidak ada rincian indikator lagging tercatat.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        laggingList.map((item, idx) => {
                                                            const planVal = Number(item.plan || 0);
                                                            const actVal = Number(item.actual || 0);
                                                            const isOver = actVal > planVal && planVal === 0;
                                                            return (
                                                                <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fcfdfc" }}>
                                                                    <td style={{ padding: "8px 12px", textAlign: "center", color: "#64748b", fontWeight: "700" }}>{idx + 1}</td>
                                                                    <td style={{ padding: "8px 12px", fontWeight: "600", color: "#1e293b" }}>{item.indicator_name}</td>
                                                                    <td style={{ padding: "8px 12px", textAlign: "center", color: "#004d32", fontWeight: "700" }}>{planVal}</td>
                                                                    <td style={{ padding: "8px 12px", textAlign: "center", fontWeight: "800", color: actVal > 0 ? "#b91c1c" : "#059669" }}>{actVal}</td>
                                                                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                                                                        <span
                                                                            style={{
                                                                                display: "inline-block",
                                                                                padding: "2px 8px",
                                                                                borderRadius: "10px",
                                                                                fontSize: "11px",
                                                                                fontWeight: "800",
                                                                                backgroundColor: actVal === 0 ? "#ecfdf5" : "#fee2e2",
                                                                                color: actVal === 0 ? "#059669" : "#991b1b",
                                                                            }}
                                                                        >
                                                                            {actVal === 0 ? "Normal (0)" : `${actVal} Kejadian`}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 3: LEADING INDICATORS */}
                                {activeDetailTab === "leading" && (
                                    <div>
                                        <h4 style={{ margin: "0 0 10px", fontSize: "13px", color: "#004d32", fontWeight: "800", textTransform: "uppercase" }}>
                                            Daftar Indikator Kinerja Leading
                                        </h4>
                                        <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                                                <thead>
                                                    <tr style={{ backgroundColor: "#004d32", color: "#ffffff" }}>
                                                        <th style={{ padding: "9px 12px", textAlign: "center", width: "40px" }}>No</th>
                                                        <th style={{ padding: "9px 12px", textAlign: "left" }}>Nama Indikator Leading</th>
                                                        <th style={{ padding: "9px 12px", textAlign: "center", width: "100px", color: "#efff00" }}>Plan</th>
                                                        <th style={{ padding: "9px 12px", textAlign: "center", width: "100px", color: "#efff00" }}>Actual</th>
                                                        <th style={{ padding: "9px 12px", textAlign: "center", width: "100px" }}>Pencapaian</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {leadingList.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={5} style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>
                                                                Tidak ada rincian indikator leading tercatat.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        leadingList.map((item, idx) => {
                                                            const planVal = Number(item.plan || 0);
                                                            const actVal = Number(item.actual || 0);
                                                            const percent = planVal > 0 ? Math.round((actVal / planVal) * 100) : (actVal > 0 ? 100 : 0);
                                                            return (
                                                                <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fcfdfc" }}>
                                                                    <td style={{ padding: "8px 12px", textAlign: "center", color: "#64748b", fontWeight: "700" }}>{idx + 1}</td>
                                                                    <td style={{ padding: "8px 12px", fontWeight: "600", color: "#1e293b" }}>{item.indicator_name}</td>
                                                                    <td style={{ padding: "8px 12px", textAlign: "center", color: "#004d32", fontWeight: "700" }}>{planVal}</td>
                                                                    <td style={{ padding: "8px 12px", textAlign: "center", fontWeight: "800", color: actVal >= planVal ? "#059669" : "#d97706" }}>{actVal}</td>
                                                                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                                                                        <span
                                                                            style={{
                                                                                display: "inline-block",
                                                                                padding: "2px 8px",
                                                                                borderRadius: "10px",
                                                                                fontSize: "11px",
                                                                                fontWeight: "800",
                                                                                backgroundColor: percent >= 100 ? "#ecfdf5" : "#fef3c7",
                                                                                color: percent >= 100 ? "#059669" : "#b45309",
                                                                            }}
                                                                        >
                                                                            {percent}%
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 4: REMARKS & LOG */}
                                {activeDetailTab === "remarks" && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                        <div>
                                            <h4 style={{ margin: "0 0 6px", fontSize: "13px", color: "#004d32", fontWeight: "800", textTransform: "uppercase" }}>
                                                Catatan Lapangan (Remarks Kru / PIC):
                                            </h4>
                                            <div
                                                style={{
                                                    padding: "14px",
                                                    backgroundColor: "#f8fafc",
                                                    borderRadius: "8px",
                                                    border: "1px solid #e2e8f0",
                                                    fontSize: "13px",
                                                    lineHeight: "1.6",
                                                    color: "#334155",
                                                    minHeight: "60px",
                                                }}
                                            >
                                                {selectedReport.remarks || "Tidak ada catatan khusus yang dilampirkan oleh kru lapangan."}
                                            </div>
                                        </div>

                                        {selectedReport.rejection_reason && (
                                            <div>
                                                <h4 style={{ margin: "0 0 6px", fontSize: "13px", color: "#991b1b", fontWeight: "800", textTransform: "uppercase" }}>
                                                    Alasan Penolakan dari Administrator:
                                                </h4>
                                                <div
                                                    style={{
                                                        padding: "14px",
                                                        backgroundColor: "#fef2f2",
                                                        borderRadius: "8px",
                                                        border: "1px solid #fecaca",
                                                        fontSize: "13px",
                                                        lineHeight: "1.6",
                                                        color: "#991b1b",
                                                    }}
                                                >
                                                    {selectedReport.rejection_reason}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <h4 style={{ margin: "0 0 8px", fontSize: "13px", color: "#004d32", fontWeight: "800", textTransform: "uppercase" }}>
                                                Informasi Penginput & Riwayat Verifikasi
                                            </h4>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                                <div style={detailBoxStyle}>
                                                    <div style={detailLabel}>Diinput Oleh (PIC / Creator)</div>
                                                    <div style={{ ...detailVal, display: "flex", alignItems: "center", gap: "6px" }}>
                                                        <div
                                                            style={{
                                                                width: "20px",
                                                                height: "20px",
                                                                borderRadius: "50%",
                                                                backgroundColor: "#004d32",
                                                                color: "#efff00",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                fontSize: "10px",
                                                                fontWeight: "800",
                                                            }}
                                                        >
                                                            {(selectedReport.submitter_name || selectedReport.creator?.name || "U").charAt(0).toUpperCase()}
                                                        </div>
                                                        <span>
                                                            {selectedReport.submitter_name || selectedReport.creator?.name || (selectedReport.submitter_role === "admin" ? "HSE Administrator" : "User Lapangan")}
                                                            {(selectedReport.submitter_email || selectedReport.creator?.email) ? ` (${selectedReport.submitter_email || selectedReport.creator?.email})` : ""}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div style={detailBoxStyle}>
                                                    <div style={detailLabel}>Dibuat / Dikirim Pada</div>
                                                    <div style={detailVal}>
                                                        {selectedReport.created_at ? new Date(selectedReport.created_at).toLocaleString("id-ID") : "-"}
                                                    </div>
                                                </div>
                                                <div style={detailBoxStyle}>
                                                    <div style={detailLabel}>Disetujui Oleh (Approver)</div>
                                                    <div style={detailVal}>
                                                        {selectedReport.approver?.name || (selectedReport.approved_at ? "HSE Administrator" : "Belum Disetujui")}
                                                        {selectedReport.approver?.email ? ` (${selectedReport.approver.email})` : ""}
                                                    </div>
                                                </div>
                                                <div style={detailBoxStyle}>
                                                    <div style={detailLabel}>Waktu Disetujui</div>
                                                    <div style={detailVal}>
                                                        {selectedReport.approved_at ? new Date(selectedReport.approved_at).toLocaleString("id-ID") : (selectedReport.status === "rejected" ? "Ditolak" : "Menunggu Approval")}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* MODAL FOOTER ACTIONS */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "14px 24px",
                                    borderTop: "1px solid #e2e8f0",
                                    backgroundColor: "#f8fafc",
                                    flexShrink: 0,
                                }}
                            >
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    style={{
                                        padding: "8px 18px",
                                        borderRadius: "8px",
                                        backgroundColor: "#ffffff",
                                        border: "1px solid #cbd5e1",
                                        color: "#475569",
                                        fontWeight: "700",
                                        fontSize: "13px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Tutup
                                </button>

                                <div style={{ display: "flex", gap: "10px" }}>
                                    {(selectedReport.status === "pending" || selectedReport.status === "draft") && (
                                        <>
                                            <button
                                                onClick={() => setRejectionModal(selectedReport)}
                                                style={{
                                                    padding: "9px 18px",
                                                    borderRadius: "8px",
                                                    backgroundColor: "#fee2e2",
                                                    border: "1px solid #f87171",
                                                    color: "#991b1b",
                                                    fontWeight: "800",
                                                    fontSize: "13px",
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                }}
                                            >
                                                <XCircle size={15} />
                                                Tolak Laporan
                                            </button>

                                            <button
                                                onClick={() => handleUpdateStatus(selectedReport.id, "approved")}
                                                style={{
                                                    padding: "9px 24px",
                                                    borderRadius: "8px",
                                                    backgroundColor: "#004d32",
                                                    border: "1px solid #efff00",
                                                    color: "#efff00",
                                                    fontWeight: "800",
                                                    fontSize: "13px",
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                    boxShadow: "0 0 12px rgba(239, 255, 0, 0.3)",
                                                }}
                                            >
                                                <CheckCircle2 size={15} />
                                                Setujui Laporan
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* REJECTION REASON MODAL */}
            {rejectionModal && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.65)",
                        backdropFilter: "blur(2px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1100,
                        padding: "20px",
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "14px",
                            maxWidth: "480px",
                            width: "100%",
                            padding: "24px",
                            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                            border: "1px solid #fecaca",
                        }}
                    >
                        <h3 style={{ margin: "0 0 10px", fontSize: "16px", fontWeight: "800", color: "#991b1b" }}>
                            Alasan Penolakan Laporan HSE
                        </h3>
                        <p style={{ margin: "0 0 14px", fontSize: "13px", color: "#64748b" }}>
                            Mohon berikan catatan alasan mengapa laporan Rig <strong>{rejectionModal.rig_no}</strong> periode ini ditolak agar kru lapangan dapat merevisi data:
                        </p>

                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Contoh: Jam kerja actual non-premises melebihi batas plan, mohon dicek kembali."
                            rows={3}
                            style={{
                                width: "100%",
                                boxSizing: "border-box",
                                border: "1px solid #cbd5e1",
                                borderRadius: "8px",
                                padding: "10px",
                                fontSize: "13px",
                                outline: "none",
                                marginBottom: "18px",
                            }}
                        />

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                            <button
                                onClick={() => {
                                    setRejectionModal(null);
                                    setRejectionReason("");
                                }}
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    border: "1px solid #cbd5e1",
                                    backgroundColor: "#ffffff",
                                    color: "#475569",
                                    fontSize: "12.5px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                }}
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(rejectionModal.id, "rejected", rejectionReason)}
                                style={{
                                    padding: "8px 18px",
                                    borderRadius: "8px",
                                    backgroundColor: "#dc2626",
                                    border: "none",
                                    color: "#ffffff",
                                    fontSize: "12.5px",
                                    fontWeight: "800",
                                    cursor: "pointer",
                                }}
                            >
                                Konfirmasi Tolak
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ============================================================
   STYLES
============================================================ */
const cardStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 4px 18px rgba(0, 77, 50, 0.04)",
};

const cardTopStripe = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "3px",
    background: "linear-gradient(90deg, #004d32 0%, #efff00 100%)",
};

const thStyle = {
    padding: "11px 14px",
    fontSize: "11.5px",
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
};

const tdStyle = {
    padding: "10px 14px",
    border: "1px solid #f1f5f9",
    textAlign: "center",
    verticalAlign: "middle",
};

const badgePending = {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 10px",
    borderRadius: "14px",
    backgroundColor: "#fef3c7",
    color: "#b45309",
    border: "1px solid #fcd34d",
    fontSize: "11.5px",
    fontWeight: "800",
};

const badgeApproved = {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 10px",
    borderRadius: "14px",
    backgroundColor: "#004d32",
    color: "#efff00",
    border: "1px solid #efff00",
    boxShadow: "0 0 8px rgba(239, 255, 0, 0.2)",
    fontSize: "11.5px",
    fontWeight: "800",
};

const badgeRejected = {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 10px",
    borderRadius: "14px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fca5a5",
    fontSize: "11.5px",
    fontWeight: "800",
};

const detailBoxStyle = {
    backgroundColor: "#f8fafc",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
};

const detailLabel = {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "600",
    marginBottom: "4px",
};

const detailVal = {
    fontSize: "14px",
    fontWeight: "800",
    color: "#004d32",
};
