import React, { useState } from "react";
import AdminSidebar from "../../Components/AdminSidebar";

export default function TargetKPIManagement() {
    // ================================
    // FILTER
    // ================================
    const [year, setYear] = useState("2024");
    const [rig, setRig] = useState("All Rigs");
    const [contract, setContract] = useState("All Contracts");

    // ================================
    // DATA KPI MASTER TARGETS (FORM: BMSD/03/FO/HSE/02/17 REV: #12)
    // ================================
    const [categoryFilter, setCategoryFilter] = useState("All");

    const [kpis, setKpis] = useState([
        // LAGGING INDICATORS (1.1 - 1.12)
        { id: 1, category: "Lagging", indicator: "1.1 Fatality Case", monthly: "0 Case", annual: "0 Case", status: "Approved" },
        { id: 2, category: "Lagging", indicator: "1.2 Serious Lost Time Injury (>21 Lost Days)", monthly: "0 Case", annual: "0 Case", status: "Approved" },
        { id: 3, category: "Lagging", indicator: "1.3 Restricted Work Case (RWC)", monthly: "0 Case", annual: "0 Case", status: "Approved" },
        { id: 4, category: "Lagging", indicator: "1.4 Medical Treatment Case (MTC)", monthly: "0 Case", annual: "0 Case", status: "Approved" },
        { id: 5, category: "Lagging", indicator: "1.5 Total Recordable Injury (TRI = 1.1+1.2+1.3+1.4)", monthly: "0 Case", annual: "0 Case", status: "Approved" },
        { id: 6, category: "Lagging", indicator: "1.6 Motor Vehicle Crash (MVC)", monthly: "0 Case", annual: "0 Case", status: "Approved" },
        { id: 7, category: "Lagging", indicator: "1.7 Tumpahan Minyak / Oil Spill (> 1 bbl)", monthly: "0 Case", annual: "0 Case", status: "Approved" },
        { id: 8, category: "Lagging", indicator: "1.8 Fire Incident (> Rp. 100 Jt)", monthly: "0 Case", annual: "0 Case", status: "Approved" },
        { id: 9, category: "Lagging", indicator: "1.9 Property Damage (> Rp. 100 Jt)", monthly: "0 Case", annual: "0 Case", status: "Approved" },
        { id: 10, category: "Lagging", indicator: "1.10 Security Case", monthly: "0 Case", annual: "0 Case", status: "Approved" },
        { id: 11, category: "Lagging", indicator: "1.11 Illness / Fatality", monthly: "0 Case", annual: "0 Case", status: "Approved" },
        { id: 12, category: "Lagging", indicator: "1.12 Reportable Case (Nearmiss / FAC / ETA)", monthly: "Reportable", annual: "Reportable", status: "Approved" },

        // LEADING INDICATORS (1 - 36)
        { id: 13, category: "Leading", indicator: "1. Observasi Perilaku (PEKA / BBS)", monthly: "180 Laporan", annual: "2.160 Laporan", status: "Approved" },
        { id: 14, category: "Leading", indicator: "2. Identifikasi Bahaya (HAZID / 5 Mnt Risk Assessment)", monthly: "900 Laporan", annual: "10.800 Laporan", status: "Approved" },
        { id: 15, category: "Leading", indicator: "3. Stop Work Authority (SWA Report)", monthly: "60 Laporan", annual: "720 Laporan", status: "Approved" },
        { id: 16, category: "Leading", indicator: "4. Inspeksi Safety Equipment & APD", monthly: "1 Laporan", annual: "12 Laporan", status: "Approved" },
        { id: 17, category: "Leading", indicator: "5. Eksternal Inspeksi LR Color Code", monthly: "TBA", annual: "2 Kegiatan", status: "Approved" },
        { id: 18, category: "Leading", indicator: "6. Inspeksi Benda Jatuh / Drops", monthly: "TBA", annual: "TBA", status: "Approved" },
        { id: 19, category: "Leading", indicator: "7. Internal Inspeksi / V&V Oleh Team", monthly: "1 Laporan", annual: "12 Laporan", status: "Approved" },
        { id: 20, category: "Leading", indicator: "8. Inspeksi / Audit SMK3L Subkontraktor", monthly: "TBA", annual: "1 Kegiatan", status: "Approved" },
        { id: 21, category: "Leading", indicator: "9. Spot Check Kendaraan", monthly: "TBA", annual: "2 Kegiatan", status: "Approved" },
        { id: 22, category: "Leading", indicator: "10. Audit Internal & Eksternal Sistem", monthly: "TBA", annual: "1 Kegiatan", status: "Approved" },
        { id: 23, category: "Leading", indicator: "11. Monitoring Kepatuhan Pengemudi (IVMS)", monthly: "100%", annual: "100%", status: "Approved" },
        { id: 24, category: "Leading", indicator: "12. Laporan Inspeksi Kendaraan (PTI)", monthly: "11 Laporan", annual: "132 Laporan", status: "Approved" },
        { id: 25, category: "Leading", indicator: "13. MCU Random (Napza & Miras Test)", monthly: "TBA", annual: "1 Kegiatan", status: "Approved" },
        { id: 26, category: "Leading", indicator: "14. Pra MCU Tahunan", monthly: "TBA", annual: "1 Kegiatan", status: "Approved" },
        { id: 27, category: "Leading", indicator: "15. Top Management Visit / MWT", monthly: "TBA", annual: "3 Kunjungan", status: "Approved" },
        { id: 28, category: "Leading", indicator: "16. Management Visit / MWT Coord-Manager", monthly: "4 Kunjungan", annual: "48 Kunjungan", status: "Approved" },
        { id: 29, category: "Leading", indicator: "17. Rapat Rutin Keselamatan (TGM)", monthly: "60 Rapat", annual: "720 Rapat", status: "Approved" },
        { id: 30, category: "Leading", indicator: "18. Pre Hitch Meeting", monthly: "3 Rapat", annual: "36 Rapat", status: "Approved" },
        { id: 31, category: "Leading", indicator: "19. Rapat Bersama Leader BMS & PHR", monthly: "4 Rapat", annual: "48 Rapat", status: "Approved" },
        { id: 32, category: "Leading", indicator: "20. Safety Talk Monthly Meeting (Yard & Rig)", monthly: "1 Rapat", annual: "12 Rapat", status: "Approved" },
        { id: 33, category: "Leading", indicator: "21. Leadership Forum", monthly: "TBA", annual: "3 Forum", status: "Approved" },
        { id: 34, category: "Leading", indicator: "22. Kampanye Keselamatan", monthly: "TBA", annual: "3 Kegiatan", status: "Approved" },
        { id: 35, category: "Leading", indicator: "23. Review Tinjauan Manajemen", monthly: "TBA", annual: "1 Kegiatan", status: "Approved" },
        { id: 36, category: "Leading", indicator: "24. Hygiene Monitoring (Noise & Lux)", monthly: "TBA", annual: "2 Kegiatan", status: "Approved" },
        { id: 37, category: "Leading", indicator: "25. Hygiene Monitoring (Mess & Catering)", monthly: "TBA", annual: "1 Kegiatan", status: "Approved" },
        { id: 38, category: "Leading", indicator: "26. Inspeksi Housekeeping Rig", monthly: "1 Laporan", annual: "12 Laporan", status: "Approved" },
        { id: 39, category: "Leading", indicator: "27. Penghargaan Kontes Housekeeping", monthly: "TBA", annual: "2 Penghargaan", status: "Approved" },
        { id: 40, category: "Leading", indicator: "28. Pelaporan Lingkungan Dinas LH", monthly: "TBA", annual: "2 Laporan", status: "Approved" },
        { id: 41, category: "Leading", indicator: "29. Penghargaan Rig of The Month", monthly: "TBA", annual: "TBA", status: "Approved" },
        { id: 42, category: "Leading", indicator: "30. Penghargaan The Best BBS/PEKA", monthly: "1 Orang", annual: "12 Orang", status: "Approved" },
        { id: 43, category: "Leading", indicator: "31. Penghargaan The Best Driver", monthly: "1 Orang", annual: "12 Orang", status: "Approved" },
        { id: 44, category: "Leading", indicator: "32. Penghargaan Kerja Selamat Tahunan", monthly: "TBA", annual: "1 Penghargaan", status: "Approved" },
        { id: 45, category: "Leading", indicator: "33. Penghargaan HES Refreshing", monthly: "TBA", annual: "2 Kegiatan", status: "Approved" },
        { id: 46, category: "Leading", indicator: "34. On Site Training di Lokasi", monthly: "6 Sesi", annual: "72 Sesi", status: "Approved" },
        { id: 47, category: "Leading", indicator: "35. Emergency Response Drill (Rig)", monthly: "3 Drill", annual: "36 Drill", status: "Approved" },
        { id: 48, category: "Leading", indicator: "36. Emergency Response Drill (Yard)", monthly: "TBA", annual: "2 Drill", status: "Approved" },
    ]);

    // ================================
    // SELECTED DATA
    // ================================
    const [selected, setSelected] = useState([]);

    // ================================
    // MODAL
    // ================================
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("add");
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        indicator: "",
        monthly: "",
        annual: "",
        status: "Draft",
    });

    // ================================
    // NOTIFICATION
    // ================================
    const [message, setMessage] = useState("");

    const showMessage = (text) => {
        setMessage(text);

        setTimeout(() => {
            setMessage("");
        }, 2500);
    };

    // ================================
    // SELECT CHECKBOX
    // ================================
    const handleSelect = (id) => {
        setSelected((prev) => {
            if (prev.includes(id)) {
                return prev.filter((item) => item !== id);
            }

            return [...prev, id];
        });
    };

    const handleSelectAll = () => {
        if (selected.length === kpis.length) {
            setSelected([]);
        } else {
            setSelected(kpis.map((item) => item.id));
        }
    };

    // ================================
    // FILTER
    // ================================
    const handleApply = () => {
        showMessage(
            `Filter diterapkan: ${year} | ${rig} | ${contract}`
        );
    };

    const handleClear = () => {
        setYear("2024");
        setRig("All Rigs");
        setContract("All Contracts");

        showMessage("Filter berhasil di-reset.");
    };

    // ================================
    // ADD TARGET
    // ================================
    const handleAdd = () => {
        setModalType("add");
        setEditId(null);

        setForm({
            indicator: "",
            monthly: "",
            annual: "",
            status: "Draft",
        });

        setShowModal(true);
    };

    // ================================
    // EDIT TARGET
    // ================================
    const handleEdit = () => {
        if (selected.length !== 1) {
            showMessage(
                "Pilih tepat 1 KPI untuk diedit."
            );
            return;
        }

        const data = kpis.find(
            (item) => item.id === selected[0]
        );

        if (!data) return;

        setModalType("edit");
        setEditId(data.id);

        setForm({
            indicator: data.indicator,
            monthly: data.monthly,
            annual: data.annual,
            status: data.status,
        });

        setShowModal(true);
    };

    // ================================
    // SAVE
    // ================================
    const handleSave = () => {
        if (
            !form.indicator ||
            !form.monthly ||
            !form.annual
        ) {
            showMessage(
                "Semua field harus diisi."
            );
            return;
        }

        if (modalType === "add") {
            const newId =
                Math.max(
                    ...kpis.map((item) => item.id),
                    0
                ) + 1;

            setKpis([
                ...kpis,
                {
                    id: newId,
                    indicator: form.indicator,
                    monthly: form.monthly,
                    annual: form.annual,
                    status: form.status,
                },
            ]);

            showMessage(
                "Target KPI berhasil ditambahkan."
            );
        } else {
            setKpis(
                kpis.map((item) =>
                    item.id === editId
                        ? {
                              ...item,
                              indicator:
                                  form.indicator,
                              monthly:
                                  form.monthly,
                              annual:
                                  form.annual,
                              status:
                                  form.status,
                          }
                        : item
                )
            );

            showMessage(
                "Target KPI berhasil diperbarui."
            );
        }

        setShowModal(false);
        setSelected([]);
    };

    // ================================
    // DELETE
    // ================================
    const handleDelete = () => {
        if (selected.length === 0) {
            showMessage(
                "Pilih KPI yang ingin dihapus."
            );
            return;
        }

        const confirmDelete = window.confirm(
            `Apakah yakin ingin menghapus ${selected.length} KPI?`
        );

        if (!confirmDelete) return;

        setKpis(
            kpis.filter(
                (item) =>
                    !selected.includes(item.id)
            )
        );

        setSelected([]);

        showMessage(
            "Target KPI berhasil dihapus."
        );
    };

    // ================================
    // SUBMIT APPROVAL
    // ================================
    const handleApproval = () => {
        if (selected.length === 0) {
            showMessage(
                "Pilih KPI terlebih dahulu."
            );
            return;
        }

        setKpis(
            kpis.map((item) =>
                selected.includes(item.id)
                    ? {
                          ...item,
                          status:
                              "Waiting Approval",
                      }
                    : item
            )
        );

        setSelected([]);

        showMessage(
            "KPI berhasil dikirim untuk approval."
        );
    };

    // ================================
    // EXPORT
    // ================================
    const handleExport = () => {
        const header =
            "KPI Indicator,Monthly Target,Annual Target,Status\n";

        const rows = kpis
            .map(
                (item) =>
                    `"${item.indicator}","${item.monthly}","${item.annual}","${item.status}"`
            )
            .join("\n");

        const csv =
            header + rows;

        const blob = new Blob(
            [csv],
            {
                type: "text/csv;charset=utf-8;",
            }
        );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;
        link.download =
            "target-kpi-report.csv";

        link.click();

        URL.revokeObjectURL(url);

        showMessage(
            "Report berhasil diexport."
        );
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f4f7fb",
                fontFamily:
                    "Arial, sans-serif",
                color: "#102033",
            }}
        >
            {/* =================================
                SIDEBAR
            ================================= */}

            <AdminSidebar />

            {/* =================================
                MAIN CONTENT
            ================================= */}

            <main
                style={{
                    marginLeft: "var(--admin-sidebar-width, 215px)",
                    width: "calc(100% - var(--admin-sidebar-width, 215px))",
                    transition: "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    minHeight: "100vh",
                }}
            >
                {/* HEADER */}

                <header
                    style={{
                        height: "62px",
                        backgroundColor: "#ffffff",
                        borderBottom:
                            "1px solid #d9e1e8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                            "space-between",
                        padding: "0 18px",
                        boxSizing: "border-box",
                    }}
                >
                    <div>
                        <div
                            style={{
                                color: "#00583b",
                                fontSize: "18px",
                                fontWeight: "700",
                            }}
                        >
                            Admin Target KPI
                        </div>

                        <div
                            style={{
                                fontSize: "12px",
                                color: "#64748b",
                                marginTop: "3px",
                            }}
                        >
                            KPI Target Management
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: "18px",
                            alignItems: "center",
                        }}
                    >
                        <button
                            onClick={() =>
                                showMessage(
                                    "Tidak ada notifikasi baru."
                                )
                            }
                            style={topButton}
                        >
                            🔔
                        </button>

                        <button
                            onClick={() =>
                                showMessage(
                                    "Halaman Target KPI digunakan untuk mengatur target KPI."
                                )
                            }
                            style={topButton}
                        >
                            ?
                        </button>

                        <button
                            onClick={() =>
                                showMessage(
                                    "Login sebagai Rig HSE Admin."
                                )
                            }
                            style={topButton}
                        >
                            ◎
                        </button>
                    </div>
                </header>

                {/* CONTENT */}

                <div
                    style={{
                        padding: "18px",
                    }}
                >
                    {/* =================================
                        FILTER
                    ================================= */}

                    <section
                        style={{
                            backgroundColor: "#ffffff",
                            border:
                                "1px solid #d9e1e8",
                            borderRadius: "5px",
                            padding: "12px",
                            display: "flex",
                            alignItems: "flex-end",
                            gap: "10px",
                            marginBottom: "10px",
                        }}
                    >
                        {/* YEAR */}

                        <div style={{ width: "170px" }}>
                            <label style={label}>
                                Year
                            </label>

                            <select
                                value={year}
                                onChange={(e) =>
                                    setYear(
                                        e.target.value
                                    )
                                }
                                style={select}
                            >
                                <option>
                                    2024
                                </option>

                                <option>
                                    2025
                                </option>

                                <option>
                                    2026
                                </option>
                            </select>
                        </div>

                        {/* RIG */}

                        <div style={{ width: "160px" }}>
                            <label style={label}>
                                Rig
                            </label>

                            <select
                                value={rig}
                                onChange={(e) =>
                                    setRig(
                                        e.target.value
                                    )
                                }
                                style={select}
                            >
                                <option>
                                    All Rigs
                                </option>

                                <option>
                                    Rig-04 Sector Alpha
                                </option>

                                <option>
                                    Rig-12 Sector Delta
                                </option>

                                <option>
                                    Rig-08 Sector Beta
                                </option>
                            </select>
                        </div>

                        {/* CONTRACT */}

                        <div style={{ width: "175px" }}>
                            <label style={label}>
                                Contract
                            </label>

                            <select
                                value={contract}
                                onChange={(e) =>
                                    setContract(
                                        e.target.value
                                    )
                                }
                                style={select}
                            >
                                <option>
                                    All Contracts
                                </option>

                                <option>
                                    CT-2023-XY
                                </option>

                                <option>
                                    CT-2024-AB
                                </option>
                            </select>
                        </div>

                        {/* CLEAR */}

                        <button
                            onClick={handleClear}
                            style={{
                                ...button,
                                backgroundColor:
                                    "#e6eaee",
                                color: "#263445",
                            }}
                        >
                            Clear
                        </button>

                        {/* APPLY */}

                        <button
                            onClick={handleApply}
                            style={{
                                ...button,
                                backgroundColor:
                                    "#00583b",
                                color: "#ffffff",
                            }}
                        >
                            Apply
                        </button>
                    </section>

                    {/* =================================
                        KPI OVERVIEW
                    ================================= */}

                    <section
                        style={{
                            backgroundColor:
                                "#ffffff",
                            border:
                                "1px solid #d9e1e8",
                            borderRadius: "5px",
                            overflow: "hidden",
                        }}
                    >
                        {/* TITLE */}

                        <div
                            style={{
                                display: "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "space-between",
                                padding:
                                    "12px",
                                borderBottom:
                                    "1px solid #d9e1e8",
                            }}
                        >
                            <div>
                                <h2
                                    style={{
                                        margin: 0,
                                        fontSize:
                                            "15px",
                                    }}
                                >
                                    KPI Targets Overview
                                </h2>

                                <p
                                    style={{
                                        margin:
                                            "4px 0 0",
                                        fontSize:
                                            "9px",
                                        color:
                                            "#64748b",
                                    }}
                                >
                                    Manage KPI targets
                                    and approval status
                                </p>
                            </div>

                            {/* ACTION BUTTONS */}

                            <div
                                style={{
                                    display:
                                        "flex",
                                    gap: "7px",
                                }}
                            >
                                <button
                                    onClick={
                                        handleEdit
                                    }
                                    style={{
                                        ...actionButton,
                                        backgroundColor:
                                            "#e5e9ed",
                                        color:
                                            "#263445",
                                    }}
                                >
                                    ✎ Edit
                                </button>

                                <button
                                    onClick={
                                        handleDelete
                                    }
                                    style={{
                                        ...actionButton,
                                        backgroundColor:
                                            "#e5e9ed",
                                        color:
                                            "#c62828",
                                    }}
                                >
                                    🗑 Delete
                                </button>

                                <button
                                    onClick={
                                        handleApproval
                                    }
                                    style={{
                                        ...actionButton,
                                        backgroundColor:
                                            "#00583b",
                                        color:
                                            "#ffffff",
                                    }}
                                >
                                    ▷ Submit for
                                    Approval
                                </button>

                                <button
                                    onClick={
                                        handleAdd
                                    }
                                    style={{
                                        ...actionButton,
                                        backgroundColor:
                                            "#00583b",
                                        color:
                                            "#ffffff",
                                    }}
                                >
                                    + Add Target
                                </button>
                            </div>
                        </div>

                        {/* TABLE */}

                        <div
                            style={{
                                overflowX:
                                    "auto",
                            }}
                        >
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse:
                                        "collapse",
                                }}
                            >
                                <thead>
                                    <tr
                                        style={{
                                            backgroundColor:
                                                "#e8edf2",
                                        }}
                                    >
                                        <th
                                            style={{
                                                ...th,
                                                width:
                                                    "40px",
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={
                                                    selected.length ===
                                                        kpis.length &&
                                                    kpis.length >
                                                        0
                                                }
                                                onChange={
                                                    handleSelectAll
                                                }
                                            />
                                        </th>

                                        <th style={th}>
                                            KPI Indicator
                                        </th>

                                        <th
                                            style={{
                                                ...th,
                                                textAlign:
                                                    "center",
                                            }}
                                        >
                                            Monthly Target
                                        </th>

                                        <th
                                            style={{
                                                ...th,
                                                textAlign:
                                                    "center",
                                            }}
                                        >
                                            Annual Target
                                        </th>

                                        <th
                                            style={{
                                                ...th,
                                                textAlign:
                                                    "center",
                                            }}
                                        >
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {kpis.map(
                                        (item) => (
                                            <tr
                                                key={
                                                    item.id
                                                }
                                                style={{
                                                    borderBottom:
                                                        "1px solid #d9e1e8",
                                                }}
                                            >
                                                <td
                                                    style={
                                                        td
                                                    }
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selected.includes(
                                                            item.id
                                                        )}
                                                        onChange={() =>
                                                            handleSelect(
                                                                item.id
                                                            )
                                                        }
                                                    />
                                                </td>

                                                <td
                                                    style={
                                                        td
                                                    }
                                                >
                                                    {
                                                        item.indicator
                                                    }
                                                </td>

                                                <td
                                                    style={{
                                                        ...td,
                                                        textAlign:
                                                            "center",
                                                    }}
                                                >
                                                    {
                                                        item.monthly
                                                    }
                                                </td>

                                                <td
                                                    style={{
                                                        ...td,
                                                        textAlign:
                                                            "center",
                                                    }}
                                                >
                                                    {
                                                        item.annual
                                                    }
                                                </td>

                                                <td
                                                    style={{
                                                        ...td,
                                                        textAlign:
                                                            "center",
                                                    }}
                                                >
                                                    <Status
                                                        status={
                                                            item.status
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* FOOTER */}

                        <div
                            style={{
                                padding:
                                    "10px 12px",
                                fontSize: "12px",
                                color:
                                    "#64748b",
                            }}
                        >
                            Showing {kpis.length} KPI
                            targets
                        </div>
                    </section>

                    {/* =================================
                        EXPORT
                    ================================= */}

                    <div
                        style={{
                            marginTop: "180px",
                            borderTop:
                                "1px solid #d9e1e8",
                            paddingTop: "12px",
                        }}
                    >
                        <button
                            onClick={
                                handleExport
                            }
                            style={{
                                ...button,
                                backgroundColor:
                                    "#00583b",
                                color:
                                    "#ffffff",
                                width:
                                    "160px",
                            }}
                        >
                            ↓ Export Report
                        </button>
                    </div>
                </div>
            </main>

            {/* =================================
                NOTIFICATION
            ================================= */}

            {message && (
                <div
                    style={{
                        position: "fixed",
                        right: "25px",
                        bottom: "25px",
                        backgroundColor:
                            "#00583b",
                        color: "#ffffff",
                        padding:
                            "12px 18px",
                        borderRadius: "5px",
                        fontSize: "14px",
                        fontWeight: "600",
                        boxShadow:
                            "0 5px 20px rgba(0,0,0,0.2)",
                        zIndex: 99999,
                    }}
                >
                    ✓ {message}
                </div>
            )}

            {/* =================================
                MODAL ADD / EDIT
            ================================= */}

            {showModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor:
                            "rgba(0,0,0,0.4)",
                        display: "flex",
                        justifyContent:
                            "center",
                        alignItems:
                            "center",
                        zIndex: 9999,
                    }}
                >
                    <div
                        style={{
                            width: "440px",
                            backgroundColor:
                                "#ffffff",
                            borderRadius:
                                "7px",
                            padding:
                                "22px",
                            boxShadow:
                                "0 10px 40px rgba(0,0,0,0.25)",
                        }}
                    >
                        {/* MODAL HEADER */}

                        <div
                            style={{
                                display:
                                    "flex",
                                justifyContent:
                                    "space-between",
                                alignItems:
                                    "center",
                                marginBottom:
                                    "18px",
                            }}
                        >
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize:
                                        "18px",
                                    color:
                                        "#00583b",
                                }}
                            >
                                {modalType ===
                                "add"
                                    ? "Add Target KPI"
                                    : "Edit Target KPI"}
                            </h2>

                            <button
                                onClick={() =>
                                    setShowModal(
                                        false
                                    )
                                }
                                style={{
                                    border:
                                        "none",
                                    background:
                                        "transparent",
                                    fontSize:
                                        "22px",
                                    cursor:
                                        "pointer",
                                    color:
                                        "#64748b",
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* INDICATOR */}

                        <label
                            style={
                                modalLabel
                            }
                        >
                            KPI Indicator
                        </label>

                        <input
                            value={
                                form.indicator
                            }
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    indicator:
                                        e.target
                                            .value,
                                })
                            }
                            placeholder="Contoh: Safety Audit Completed"
                            style={
                                input
                            }
                        />

                        {/* MONTHLY */}

                        <label
                            style={
                                modalLabel
                            }
                        >
                            Monthly Target
                        </label>

                        <input
                            value={
                                form.monthly
                            }
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    monthly:
                                        e.target
                                            .value,
                                })
                            }
                            placeholder="Contoh: 100%"
                            style={
                                input
                            }
                        />

                        {/* ANNUAL */}

                        <label
                            style={
                                modalLabel
                            }
                        >
                            Annual Target
                        </label>

                        <input
                            value={
                                form.annual
                            }
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    annual:
                                        e.target
                                            .value,
                                })
                            }
                            placeholder="Contoh: 100%"
                            style={
                                input
                            }
                        />

                        {/* STATUS */}

                        <label
                            style={
                                modalLabel
                            }
                        >
                            Status
                        </label>

                        <select
                            value={
                                form.status
                            }
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    status:
                                        e.target
                                            .value,
                                })
                            }
                            style={
                                input
                            }
                        >
                            <option>
                                Draft
                            </option>

                            <option>
                                Waiting Approval
                            </option>

                            <option>
                                Approved
                            </option>

                            <option>
                                Rejected
                            </option>
                        </select>

                        {/* MODAL BUTTON */}

                        <div
                            style={{
                                display:
                                    "flex",
                                justifyContent:
                                    "flex-end",
                                gap: "8px",
                                marginTop:
                                    "22px",
                            }}
                        >
                            <button
                                onClick={() =>
                                    setShowModal(
                                        false
                                    )
                                }
                                style={{
                                    ...button,
                                    backgroundColor:
                                        "#e6eaee",
                                    color:
                                        "#263445",
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={
                                    handleSave
                                }
                                style={{
                                    ...button,
                                    backgroundColor:
                                        "#00583b",
                                    color:
                                        "#ffffff",
                                }}
                            >
                                Save Target
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// =====================================================
// MODERN STATUS COMPONENT (HIJAU BOTOL & KUNING NEON)
// =====================================================

function Status({ status }) {
    let background = "#f8fafc";
    let color = "#64748b";
    let border = "#e2e8f0";
    let dot = "#94a3b8";
    let shadow = "none";

    if (status === "Approved") {
        background = "#004d32";
        color = "#efff00";
        border = "#efff00";
        dot = "#efff00";
        shadow = "0 0 8px rgba(239, 255, 0, 0.3)";
    } else if (status === "Waiting Approval") {
        background = "#78350f";
        color = "#fef3c7";
        border = "#f59e0b";
        dot = "#f59e0b";
    } else if (status === "Rejected") {
        background = "#7f1d1d";
        color = "#fecaca";
        border = "#ef4444";
        dot = "#ef4444";
    }

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 9px",
                borderRadius: "999px",
                backgroundColor: background,
                color: color,
                border: `1px solid ${border}`,
                boxShadow: shadow,
                fontSize: "11px",
                fontWeight: "800",
                whiteSpace: "nowrap",
            }}
        >
            <span
                style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: dot,
                    boxShadow: status === "Approved" ? "0 0 6px #efff00" : "none",
                }}
            />
            {status}
        </span>
    );
}

// =====================================================
// MODERN STYLES
// =====================================================

const topButton = {
    width: "36px",
    height: "36px",
    border: "1px solid #004d32",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#004d32",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};

const label = {
    display: "block",
    fontSize: "11px",
    fontWeight: "800",
    color: "#004d32",
    marginBottom: "5px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
};

const select = {
    width: "100%",
    height: "38px",
    boxSizing: "border-box",
    border: "1px solid #004d32",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    padding: "0 10px",
    fontSize: "13px",
    fontWeight: "700",
    color: "#0f172a",
    outline: "none",
};

const button = {
    height: "38px",
    padding: "0 18px",
    border: "1px solid #efff00",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#004d32",
    color: "#efff00",
    boxShadow: "0 0 10px rgba(239, 255, 0, 0.25)",
};

const actionButton = {
    border: "1px solid #004d32",
    borderRadius: "6px",
    padding: "5px 10px",
    fontSize: "11px",
    fontWeight: "800",
    cursor: "pointer",
    backgroundColor: "#004d32",
    color: "#efff00",
    transition: "all 0.15s",
};

const th = {
    padding: "14px 16px",
    fontSize: "11.5px",
    color: "#ffffff",
    backgroundColor: "#004d32",
    fontWeight: "800",
    textAlign: "left",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "2px solid #efff00",
};

const td = {
    padding: "14px 16px",
    fontSize: "13px",
    color: "#1e293b",
    whiteSpace: "nowrap",
    fontWeight: "500",
};

const modalLabel = {
    display: "block",
    marginTop: "14px",
    marginBottom: "5px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: "0.02em",
};

const input = {
    width: "100%",
    height: "38px",
    border: "1px solid #004d32",
    borderRadius: "8px",
    padding: "0 10px",
    fontSize: "13px",
    fontWeight: "600",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "#ffffff",
};