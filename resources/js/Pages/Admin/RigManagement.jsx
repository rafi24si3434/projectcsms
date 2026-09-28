import React, { useMemo, useState } from "react";
import AdminSidebar from "../../Components/AdminSidebar";

export default function RigManagement() {
    // =====================================================
    // DATA RIG & CONTRACT BESMINDO MATERI SEWATAMA
    // =====================================================

    const [activeTab, setActiveTab] = useState("rigs"); // "rigs" or "contracts"

    const [rigs, setRigs] = useState([
        { id: 1, rigNo: "BMS#01", rigName: "Rig BMS-01", location: "AREA WK ROKAN - RIAU", contract: "SPHR00108C", contractor: "PT BESMINDO MATERI SEWATAMA", pic: "HSE Superintendent", status: "Active" },
        { id: 2, rigNo: "BMS#02", rigName: "Rig BMS-02", location: "AREA WK ROKAN - RIAU", contract: "SPHR00108C", contractor: "PT BESMINDO MATERI SEWATAMA", pic: "HSE Specialist", status: "Active" },
        { id: 3, rigNo: "BMS#03", rigName: "Rig BMS-03", location: "AREA WK ROKAN - RIAU", contract: "SPHR00108C", contractor: "PT BESMINDO MATERI SEWATAMA", pic: "Toolpusher", status: "Active" },
        { id: 4, rigNo: "BMS#03A", rigName: "Rig BMS-03A", location: "AREA WK ROKAN - RIAU", contract: "SPHR00108C", contractor: "PT BESMINDO MATERI SEWATAMA", pic: "Rig Superintendent", status: "Active" },
        { id: 5, rigNo: "BMS#05", rigName: "Rig BMS-05", location: "AREA WK ROKAN - RIAU", contract: "SPHR00108C", contractor: "PT BESMINDO MATERI SEWATAMA", pic: "HSE Officer", status: "Active" },
        { id: 6, rigNo: "BMS#06", rigName: "Rig BMS-06", location: "AREA WK ROKAN - RIAU", contract: "SPHR00108C", contractor: "PT BESMINDO MATERI SEWATAMA", pic: "Field Engineer", status: "Active" },
        { id: 7, rigNo: "BMS#07", rigName: "Rig BMS-07", location: "AREA WK ROKAN - RIAU", contract: "SPHR00108C", contractor: "PT BESMINDO MATERI SEWATAMA", pic: "HSE Coordinator", status: "Active" },
        { id: 8, rigNo: "BMS#08", rigName: "Rig BMS-08", location: "AREA WK ROKAN - RIAU", contract: "SPHR00108C", contractor: "PT BESMINDO MATERI SEWATAMA", pic: "HSE Inspector", status: "Active" },
        { id: 9, rigNo: "BMS#09", rigName: "Rig BMS-09", location: "AREA WK ROKAN - RIAU", contract: "SPHR00108C", contractor: "PT BESMINDO MATERI SEWATAMA", pic: "HSE Specialist", status: "Active" },
        { id: 10, rigNo: "BMS#10", rigName: "Rig BMS-10", location: "AREA WK ROKAN - RIAU", contract: "SPHR00108C", contractor: "PT BESMINDO MATERI SEWATAMA", pic: "Safety Officer", status: "Active" },
        { id: 11, rigNo: "BMS#11", rigName: "Rig BMS-11", location: "AREA WK ROKAN - RIAU", contract: "SPHR00108C", contractor: "PT BESMINDO MATERI SEWATAMA", pic: "Site Supervisor", status: "Active" },
        { id: 12, rigNo: "BMS#15", rigName: "Rig BMS-15", location: "AREA WK ROKAN - RIAU", contract: "SPHR00108C", contractor: "PT BESMINDO MATERI SEWATAMA", pic: "HSE Supervisor", status: "Active" },
        { id: 13, rigNo: "BMS#16", rigName: "Rig BMS-16", location: "AREA WK ROKAN - RIAU", contract: "SPHR00108C", contractor: "PT BESMINDO MATERI SEWATAMA", pic: "Field Specialist", status: "Active" },
        { id: 14, rigNo: "BMS#17", rigName: "Rig BMS-17", location: "AREA WK ROKAN - RIAU", contract: "SPHR00108C", contractor: "PT BESMINDO MATERI SEWATAMA", pic: "HSE Officer", status: "Active" },
        { id: 15, rigNo: "BMS#18", rigName: "Rig BMS-18", location: "AREA WK ROKAN - RIAU", contract: "SPHR00108C", contractor: "PT BESMINDO MATERI SEWATAMA", pic: "HSE Officer", status: "Active" },
        { id: 16, rigNo: "BMS#19", rigName: "Rig BMS-19", location: "AREA WK ROKAN - RIAU", contract: "SPHR00108C", contractor: "PT BESMINDO MATERI SEWATAMA", pic: "Field Supervisor", status: "Active" },
        { id: 17, rigNo: "BMS#20", rigName: "Rig BMS-20", location: "AREA WK ROKAN - RIAU", contract: "SPHR00108C", contractor: "PT BESMINDO MATERI SEWATAMA", pic: "Rig Superintendent", status: "Active" },
        { id: 18, rigNo: "BMS#21", rigName: "Rig BMS-21", location: "AREA WK ROKAN - RIAU", contract: "SPHR00108C", contractor: "PT BESMINDO MATERI SEWATAMA", pic: "HSE Coordinator", status: "Active" },
        { id: 19, rigNo: "BMS#22", rigName: "Rig BMS-22", location: "AREA WK ROKAN - RIAU", contract: "SPHR00108C", contractor: "PT BESMINDO MATERI SEWATAMA", pic: "HSE Officer", status: "Active" },
        { id: 20, rigNo: "BMS#23", rigName: "Rig BMS-23", location: "AREA WK ROKAN - RIAU", contract: "SPHR00108C", contractor: "PT BESMINDO MATERI SEWATAMA", pic: "Field Supervisor", status: "Active" },
    ]);

    const [contracts, setContracts] = useState([
        {
            id: 1,
            contractNo: "SPHR00108C",
            contractName: "Kontrak Jasa Rig Pengeboran & Workover",
            rigNo: "BMS#07, BMS#15, BMS#18",
            location: "AREA WK ROKAN - RIAU",
            client: "PT Pertamina Hulu Rokan (PHR)",
            startDate: "2026-01-01",
            endDate: "2028-12-31",
            value: "Rp 18.5 M",
            status: "Active",
        },
        {
            id: 2,
            contractNo: "BMS-PHR-WKROKAN-2026",
            contractName: "HSE Management & Operation Support",
            rigNo: "BMS#01, BMS#02, BMS#03",
            location: "Duri & Minas Field",
            client: "PT Pertamina Hulu Rokan (PHR)",
            startDate: "2026-01-01",
            endDate: "2027-12-31",
            value: "Rp 5.2 M",
            status: "Active",
        },
    ]);

    // =====================================================
    // SEARCH
    // =====================================================

    const [search, setSearch] = useState("");

    // =====================================================
    // FILTER STATUS
    // =====================================================

    const [statusFilter, setStatusFilter] = useState("All");

    const filteredRigs = useMemo(() => {
        return rigs.filter((rig) => {
            const keyword = search.toLowerCase();

            const matchSearch =
                rig.rigNo.toLowerCase().includes(keyword) ||
                rig.rigName.toLowerCase().includes(keyword) ||
                rig.location.toLowerCase().includes(keyword) ||
                rig.contract.toLowerCase().includes(keyword) ||
                rig.contractor.toLowerCase().includes(keyword) ||
                rig.pic.toLowerCase().includes(keyword);

            const matchStatus =
                statusFilter === "All" ||
                rig.status === statusFilter;

            return matchSearch && matchStatus;
        });
    }, [rigs, search, statusFilter]);

    // =====================================================
    // MODAL
    // =====================================================

    const [showModal, setShowModal] = useState(false);
    const [editingRig, setEditingRig] = useState(null);

    const [form, setForm] = useState({
        rigNo: "",
        rigName: "",
        location: "",
        contract: "",
        contractor: "",
        pic: "",
        status: "Active",
    });

    // =====================================================
    // MESSAGE
    // =====================================================

    const [message, setMessage] = useState("");

    const showMessage = (text) => {
        setMessage(text);

        setTimeout(() => {
            setMessage("");
        }, 2500);
    };

    // =====================================================
    // ADD RIG
    // =====================================================

    const handleAddRig = () => {
        setEditingRig(null);

        setForm({
            rigNo: "",
            rigName: "",
            location: "",
            contract: "",
            contractor: "",
            pic: "",
            status: "Active",
        });

        setShowModal(true);
    };

    // =====================================================
    // EDIT RIG
    // =====================================================

    const handleEditRig = (rig) => {
        setEditingRig(rig);

        setForm({
            rigNo: rig.rigNo,
            rigName: rig.rigName,
            location: rig.location,
            contract: rig.contract,
            contractor: rig.contractor,
            pic: rig.pic,
            status: rig.status,
        });

        setShowModal(true);
    };

    // =====================================================
    // SAVE RIG
    // =====================================================

    const handleSaveRig = () => {
        if (
            !form.rigNo.trim() ||
            !form.rigName.trim() ||
            !form.location.trim() ||
            !form.contract.trim()
        ) {
            showMessage(
                "Rig No, Rig Name, Location dan Contract wajib diisi."
            );
            return;
        }

        if (editingRig) {
            setRigs((currentRigs) =>
                currentRigs.map((rig) =>
                    rig.id === editingRig.id
                        ? {
                              ...rig,
                              ...form,
                          }
                        : rig
                )
            );

            showMessage("Data rig berhasil diperbarui.");
        } else {
            const newRig = {
                id: Date.now(),
                ...form,
            };

            setRigs((currentRigs) => [
                ...currentRigs,
                newRig,
            ]);

            showMessage("Rig baru berhasil ditambahkan.");
        }

        setShowModal(false);
    };

    // =====================================================
    // DELETE RIG
    // =====================================================

    const handleDeleteRig = (rig) => {
        const confirmed = window.confirm(
            `Apakah kamu yakin ingin menghapus ${rig.rigNo}?`
        );

        if (!confirmed) {
            return;
        }

        setRigs((currentRigs) =>
            currentRigs.filter(
                (item) => item.id !== rig.id
            )
        );

        showMessage("Data rig berhasil dihapus.");
    };

    // =====================================================
    // CHANGE STATUS
    // =====================================================

    const handleChangeStatus = (rig, newStatus) => {
        setRigs((currentRigs) =>
            currentRigs.map((item) =>
                item.id === rig.id
                    ? {
                          ...item,
                          status: newStatus,
                      }
                    : item
            )
        );

        showMessage(
            `${rig.rigNo} sekarang berstatus ${newStatus}.`
        );
    };

    // =====================================================
    // TOTAL DATA
    // =====================================================

    const totalRig = rigs.length;

    const activeRig = rigs.filter(
        (rig) => rig.status === "Active"
    ).length;

    const maintenanceRig = rigs.filter(
        (rig) => rig.status === "Maintenance"
    ).length;

    const inactiveRig = rigs.filter(
        (rig) => rig.status === "Inactive"
    ).length;

    // =====================================================
    // INITIAL
    // =====================================================

    const getInitials = (name) => {
        return name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f4f7fb",
                fontFamily: "Arial, sans-serif",
                color: "#102033",
            }}
        >
            {/* =================================================
                SIDEBAR
            ================================================= */}

            <AdminSidebar />

            {/* =================================================
                MAIN
            ================================================= */}

            <main
                style={{
                    marginLeft: "var(--admin-sidebar-width, 215px)",
                    width: "calc(100% - var(--admin-sidebar-width, 215px))",
                    transition: "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    minHeight: "100vh",
                }}
            >
                {/* =================================================
                    HEADER
                ================================================= */}

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
                    <div
                        style={{
                            fontSize: "24px",
                            fontWeight: "700",
                            color: "#00583b",
                        }}
                    >
                        Rig Management
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                        }}
                    >
                        <button
                            onClick={() =>
                                showMessage(
                                    "Tidak ada notifikasi baru."
                                )
                            }
                            style={iconButton}
                        >
                            ♧
                        </button>

                        <button
                            onClick={() =>
                                showMessage(
                                    "Halaman Rig Management."
                                )
                            }
                            style={iconButton}
                        >
                            ?
                        </button>

                        <button
                            onClick={() =>
                                showMessage(
                                    "Login sebagai Rig HSE Admin."
                                )
                            }
                            style={iconButton}
                        >
                            ◎
                        </button>
                    </div>
                </header>

                {/* =================================================
                    CONTENT
                ================================================= */}

                <div
                    style={{
                        padding: "20px",
                    }}
                >
                    {/* TITLE */}

                    <div
                        style={{
                            marginBottom: "15px",
                        }}
                    >
                        <h1
                            style={{
                                margin: 0,
                                fontSize: "24px",
                                color: "#101828",
                            }}
                        >
                            Rig Management
                        </h1>

                        <p
                            style={{
                                margin:
                                    "5px 0 0",
                                fontSize: "17px",
                                color: "#667085",
                            }}
                        >
                            Manage rig information, contracts,
                            locations, and operational status.
                        </p>
                    </div>

                    {/* =================================================
                        SUMMARY CARDS
                    ================================================= */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(4, 1fr)",
                            gap: "12px",
                            marginBottom: "15px",
                        }}
                    >
                        {/* TOTAL */}

                        <div
                            style={summaryCard}
                        >
                            <span style={summaryTitle}>
                                Total Rig
                            </span>

                            <strong
                                style={summaryNumber}
                            >
                                {totalRig}
                            </strong>
                        </div>

                        {/* ACTIVE */}

                        <div
                            style={{
                                ...summaryCard,
                                borderLeft:
                                    "3px solid #18b77a",
                            }}
                        >
                            <span style={summaryTitle}>
                                Active Rig
                            </span>

                            <strong
                                style={{
                                    ...summaryNumber,
                                    color: "#087443",
                                }}
                            >
                                {activeRig}
                            </strong>
                        </div>

                        {/* MAINTENANCE */}

                        <div
                            style={{
                                ...summaryCard,
                                borderLeft:
                                    "3px solid #f79009",
                            }}
                        >
                            <span style={summaryTitle}>
                                Maintenance
                            </span>

                            <strong
                                style={{
                                    ...summaryNumber,
                                    color: "#b54708",
                                }}
                            >
                                {maintenanceRig}
                            </strong>
                        </div>

                        {/* INACTIVE */}

                        <div
                            style={{
                                ...summaryCard,
                                borderLeft:
                                    "3px solid #d11a2a",
                            }}
                        >
                            <span style={summaryTitle}>
                                Inactive Rig
                            </span>

                            <strong
                                style={{
                                    ...summaryNumber,
                                    color: "#b42318",
                                }}
                            >
                                {inactiveRig}
                            </strong>
                        </div>
                    </div>

                    {/* =================================================
                        FILTER / ACTION
                    ================================================= */}

                    <section
                        style={{
                            backgroundColor:
                                "#ffffff",
                            border:
                                "1px solid #d9e1e8",
                            borderRadius: "5px",
                            padding: "12px",
                            marginBottom: "12px",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "space-between",
                                gap: "14px",
                            }}
                        >
                            {/* SEARCH */}

                            <div
                                style={{
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    border:
                                        "1px solid #d0d5dd",
                                    borderRadius:
                                        "4px",
                                    height: "34px",
                                    width: "260px",
                                    padding:
                                        "0 9px",
                                    boxSizing:
                                        "border-box",
                                }}
                            >
                                <span
                                    style={{
                                        color:
                                            "#667085",
                                        fontSize: "14px",
                                    }}
                                >
                                    ⌕
                                </span>

                                <input
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target
                                                .value
                                        )
                                    }
                                    placeholder="Search rigs..."
                                    style={{
                                        border:
                                            "none",
                                        outline:
                                            "none",
                                        width:
                                            "100%",
                                        marginLeft:
                                            "7px",
                                        fontSize: "14px",
                                    }}
                                />
                            </div>

                            <div
                                style={{
                                    display:
                                        "flex",
                                    gap: "8px",
                                    alignItems:
                                        "center",
                                }}
                            >
                                {/* STATUS */}

                                <select
                                    value={
                                        statusFilter
                                    }
                                    onChange={(e) =>
                                        setStatusFilter(
                                            e.target
                                                .value
                                        )
                                    }
                                    style={{
                                        height:
                                            "34px",
                                        border:
                                            "1px solid #d0d5dd",
                                        borderRadius:
                                            "4px",
                                        padding:
                                            "0 10px",
                                        fontSize: "14px",
                                        background:
                                            "#ffffff",
                                    }}
                                >
                                    <option value="All">
                                        All Status
                                    </option>

                                    <option value="Active">
                                        Active
                                    </option>

                                    <option value="Maintenance">
                                        Maintenance
                                    </option>

                                    <option value="Inactive">
                                        Inactive
                                    </option>
                                </select>

                                {/* ADD */}

                                <button
                                    onClick={
                                        handleAddRig
                                    }
                                    style={
                                        primaryButton
                                    }
                                >
                                    ＋ Add Rig
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* =================================================
                        TABLE
                    ================================================= */}

                    <section
                        style={{
                            backgroundColor:
                                "#ffffff",
                            border:
                                "1px solid #d9e1e8",
                            borderRadius: "5px",
                            overflow:
                                "hidden",
                        }}
                    >
                        <div
                            style={{
                                padding:
                                    "12px 13px",
                                borderBottom:
                                    "1px solid #e1e6eb",
                            }}
                        >
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: "14px",
                                    color:
                                        "#101828",
                                }}
                            >
                                Rig List
                            </h2>

                            <p
                                style={{
                                    margin:
                                        "4px 0 0",
                                    fontSize: "13px",
                                    color:
                                        "#667085",
                                }}
                            >
                                List of rigs and current
                                operational information.
                            </p>
                        </div>

                        <div
                            style={{
                                overflowX:
                                    "auto",
                            }}
                        >
                            <table
                                style={{
                                    width: "100%",
                                    minWidth:
                                        "900px",
                                    borderCollapse:
                                        "collapse",
                                }}
                            >
                                <thead>
                                    <tr
                                        style={{
                                            backgroundColor:
                                                "#eef2f6",
                                        }}
                                    >
                                        <th
                                            style={
                                                tableHeader
                                            }
                                        >
                                            Rig
                                        </th>

                                        <th
                                            style={
                                                tableHeader
                                            }
                                        >
                                            Location
                                        </th>

                                        <th
                                            style={
                                                tableHeader
                                            }
                                        >
                                            Contract
                                        </th>

                                        <th
                                            style={
                                                tableHeader
                                            }
                                        >
                                            Contractor
                                        </th>

                                        <th
                                            style={
                                                tableHeader
                                            }
                                        >
                                            PIC
                                        </th>

                                        <th
                                            style={
                                                tableHeader
                                            }
                                        >
                                            Status
                                        </th>

                                        <th
                                            style={{
                                                ...tableHeader,
                                                textAlign:
                                                    "right",
                                            }}
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredRigs.length >
                                    0 ? (
                                        filteredRigs.map(
                                            (rig) => (
                                                <tr
                                                    key={
                                                        rig.id
                                                    }
                                                    style={{
                                                        borderBottom:
                                                            "1px solid #e1e6eb",
                                                    }}
                                                >
                                                    {/* RIG */}

                                                    <td
                                                        style={
                                                            tableCell
                                                        }
                                                    >
                                                        <div
                                                            style={{
                                                                display:
                                                                    "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap:
                                                                    "8px",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    width:
                                                                        "28px",
                                                                    height:
                                                                        "28px",
                                                                    borderRadius:
                                                                        "5px",
                                                                    backgroundColor:
                                                                        "#dcefe7",
                                                                    color:
                                                                        "#00583b",
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    justifyContent:
                                                                        "center",
                                                                    fontSize: "12px",
                                                                    fontWeight:
                                                                        "700",
                                                                }}
                                                            >
                                                                {getInitials(
                                                                    rig.rigName
                                                                )}
                                                            </div>

                                                            <div>
                                                                <div
                                                                    style={{
                                                                        fontWeight:
                                                                            "700",
                                                                        color:
                                                                            "#101828",
                                                                    }}
                                                                >
                                                                    {
                                                                        rig.rigNo
                                                                    }
                                                                </div>

                                                                <div
                                                                    style={{
                                                                        fontSize: "12px",
                                                                        color:
                                                                            "#667085",
                                                                        marginTop:
                                                                            "2px",
                                                                    }}
                                                                >
                                                                    {
                                                                        rig.rigName
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* LOCATION */}

                                                    <td
                                                        style={
                                                            tableCell
                                                        }
                                                    >
                                                        {
                                                            rig.location
                                                        }
                                                    </td>

                                                    {/* CONTRACT */}

                                                    <td
                                                        style={
                                                            tableCell
                                                        }
                                                    >
                                                        <span
                                                            style={{
                                                                fontSize: "13px",
                                                                fontWeight:
                                                                    "600",
                                                            }}
                                                        >
                                                            {
                                                                rig.contract
                                                            }
                                                        </span>
                                                    </td>

                                                    {/* CONTRACTOR */}

                                                    <td
                                                        style={
                                                            tableCell
                                                        }
                                                    >
                                                        {
                                                            rig.contractor
                                                        }
                                                    </td>

                                                    {/* PIC */}

                                                    <td
                                                        style={
                                                            tableCell
                                                        }
                                                    >
                                                        <div
                                                            style={{
                                                                display:
                                                                    "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap:
                                                                    "7px",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    width:
                                                                        "22px",
                                                                    height:
                                                                        "22px",
                                                                    borderRadius:
                                                                        "50%",
                                                                    backgroundColor:
                                                                        "#edf2f7",
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    justifyContent:
                                                                        "center",
                                                                    fontSize: "12px",
                                                                    color:
                                                                        "#475467",
                                                                    fontWeight:
                                                                        "700",
                                                                }}
                                                            >
                                                                {getInitials(
                                                                    rig.pic
                                                                )}
                                                            </div>

                                                            {
                                                                rig.pic
                                                            }
                                                        </div>
                                                    </td>

                                                    {/* STATUS */}

                                                    <td
                                                        style={
                                                            tableCell
                                                        }
                                                    >
                                                        <select
                                                            value={
                                                                rig.status
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                handleChangeStatus(
                                                                    rig,
                                                                    e
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            style={{
                                                                border:
                                                                    "none",
                                                                outline:
                                                                    "none",
                                                                borderRadius:
                                                                    "14px",
                                                                padding:
                                                                    "4px 8px",
                                                                fontSize: "12px",
                                                                fontWeight:
                                                                    "700",
                                                                cursor:
                                                                    "pointer",
                                                                backgroundColor:
                                                                    rig.status ===
                                                                    "Active"
                                                                        ? "#d1fadf"
                                                                        : rig.status ===
                                                                          "Maintenance"
                                                                        ? "#fef0c7"
                                                                        : "#fee4e2",
                                                                color:
                                                                    rig.status ===
                                                                    "Active"
                                                                        ? "#027a48"
                                                                        : rig.status ===
                                                                          "Maintenance"
                                                                        ? "#b54708"
                                                                        : "#b42318",
                                                            }}
                                                        >
                                                            <option>
                                                                Active
                                                            </option>

                                                            <option>
                                                                Maintenance
                                                            </option>

                                                            <option>
                                                                Inactive
                                                            </option>
                                                        </select>
                                                    </td>

                                                    {/* ACTION */}

                                                    <td
                                                        style={{
                                                            ...tableCell,
                                                            textAlign:
                                                                "right",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display:
                                                                    "flex",
                                                                justifyContent:
                                                                    "flex-end",
                                                                gap:
                                                                    "5px",
                                                            }}
                                                        >
                                                            <button
                                                                onClick={() =>
                                                                    handleEditRig(
                                                                        rig
                                                                    )
                                                                }
                                                                style={
                                                                    actionButton
                                                                }
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteRig(
                                                                        rig
                                                                    )
                                                                }
                                                                style={{
                                                                    ...actionButton,
                                                                    color:
                                                                        "#b42318",
                                                                }}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                style={{
                                                    padding:
                                                        "30px",
                                                    textAlign:
                                                        "center",
                                                    color:
                                                        "#667085",
                                                    fontSize: "14px",
                                                }}
                                            >
                                                Data rig
                                                tidak
                                                ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* =================================================
                            FOOTER
                        ================================================= */}

                        <div
                            style={{
                                display:
                                    "flex",
                                justifyContent:
                                    "space-between",
                                alignItems:
                                    "center",
                                padding:
                                    "10px 13px",
                                backgroundColor:
                                    "#fafbfc",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "13px",
                                    color:
                                        "#667085",
                                }}
                            >
                                Showing{" "}
                                {
                                    filteredRigs.length
                                }{" "}
                                of{" "}
                                {rigs.length}{" "}
                                rigs
                            </span>

                            <div
                                style={{
                                    display:
                                        "flex",
                                    gap: "5px",
                                }}
                            >
                                <button
                                    disabled
                                    style={
                                        paginationButton
                                    }
                                >
                                    Previous
                                </button>

                                <button
                                    style={{
                                        ...paginationButton,
                                        backgroundColor:
                                            "#00583b",
                                        color:
                                            "#ffffff",
                                    }}
                                >
                                    1
                                </button>

                                <button
                                    disabled
                                    style={
                                        paginationButton
                                    }
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* =====================================================
                MODAL ADD / EDIT
            ===================================================== */}

            {showModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor:
                            "rgba(15, 23, 42, 0.35)",
                        display: "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "center",
                        zIndex: 9999,
                    }}
                >
                    <div
                        style={{
                            width: "430px",
                            maxHeight:
                                "90vh",
                            overflowY:
                                "auto",
                            backgroundColor:
                                "#ffffff",
                            borderRadius:
                                "7px",
                            boxShadow:
                                "0 15px 40px rgba(0,0,0,0.2)",
                            padding: "24px",
                            boxSizing:
                                "border-box",
                        }}
                    >
                        <h2
                            style={{
                                margin:
                                    "0 0 5px",
                                fontSize: "17px",
                            }}
                        >
                            {editingRig
                                ? "Edit Rig"
                                : "Add New Rig"}
                        </h2>

                        <p
                            style={{
                                margin:
                                    "0 0 18px",
                                fontSize: "14px",
                                color:
                                    "#667085",
                            }}
                        >
                            {editingRig
                                ? "Update rig information."
                                : "Enter information for the new rig."}
                        </p>

                        {/* RIG NO */}

                        <label
                            style={modalLabel}
                        >
                            Rig No *
                        </label>

                        <input
                            value={
                                form.rigNo
                            }
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    rigNo:
                                        e.target
                                            .value,
                                })
                            }
                            placeholder="e.g. Rig-06"
                            style={
                                modalInput
                            }
                        />

                        {/* RIG NAME */}

                        <label
                            style={modalLabel}
                        >
                            Rig Name *
                        </label>

                        <input
                            value={
                                form.rigName
                            }
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    rigName:
                                        e.target
                                            .value,
                                })
                            }
                            placeholder="e.g. Rig Foxtrot"
                            style={
                                modalInput
                            }
                        />

                        {/* LOCATION */}

                        <label
                            style={modalLabel}
                        >
                            Location *
                        </label>

                        <input
                            value={
                                form.location
                            }
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    location:
                                        e.target
                                            .value,
                                })
                            }
                            placeholder="e.g. Sector Alpha"
                            style={
                                modalInput
                            }
                        />

                        {/* CONTRACT */}

                        <label
                            style={modalLabel}
                        >
                            Contract No *
                        </label>

                        <input
                            value={
                                form.contract
                            }
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    contract:
                                        e.target
                                            .value,
                                })
                            }
                            placeholder="e.g. CNT-2024-06"
                            style={
                                modalInput
                            }
                        />

                        {/* CONTRACTOR */}

                        <label
                            style={modalLabel}
                        >
                            Contractor
                        </label>

                        <input
                            value={
                                form.contractor
                            }
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    contractor:
                                        e.target
                                            .value,
                                })
                            }
                            placeholder="e.g. PT Besmindo"
                            style={
                                modalInput
                            }
                        />

                        {/* PIC */}

                        <label
                            style={modalLabel}
                        >
                            PIC
                        </label>

                        <input
                            value={form.pic}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    pic: e.target
                                        .value,
                                })
                            }
                            placeholder="e.g. John Doe"
                            style={
                                modalInput
                            }
                        />

                        {/* STATUS */}

                        <label
                            style={modalLabel}
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
                                modalInput
                            }
                        >
                            <option>
                                Active
                            </option>

                            <option>
                                Maintenance
                            </option>

                            <option>
                                Inactive
                            </option>
                        </select>

                        {/* BUTTON */}

                        <div
                            style={{
                                display:
                                    "flex",
                                justifyContent:
                                    "flex-end",
                                gap: "8px",
                                marginTop:
                                    "8px",
                            }}
                        >
                            <button
                                onClick={() =>
                                    setShowModal(
                                        false
                                    )
                                }
                                style={
                                    secondaryButton
                                }
                            >
                                Cancel
                            </button>

                            <button
                                onClick={
                                    handleSaveRig
                                }
                                style={
                                    primaryButton
                                }
                            >
                                {editingRig
                                    ? "Save Changes"
                                    : "Add Rig"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================
                NOTIFICATION
            ===================================================== */}

            {message && (
                <div
                    style={{
                        position:
                            "fixed",
                        right: "25px",
                        bottom: "25px",
                        backgroundColor:
                            "#00583b",
                        color: "#ffffff",
                        padding:
                            "11px 17px",
                        borderRadius:
                            "5px",
                        fontSize: "17px",
                        fontWeight:
                            "600",
                        boxShadow:
                            "0 5px 20px rgba(0,0,0,0.2)",
                        zIndex: 10000,
                    }}
                >
                    ✓ {message}
                </div>
            )}
        </div>
    );
}

// =====================================================
// MODERN CLASSIC: STYLES (HIJAU BOTOL & KUNING NEON)
// =====================================================

const iconButton = {
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

const primaryButton = {
    border: "1px solid #efff00",
    background: "#004d32",
    color: "#efff00",
    padding: "0 18px",
    height: "38px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 0 10px rgba(239, 255, 0, 0.25)",
};

const secondaryButton = {
    border: "1px solid #004d32",
    backgroundColor: "#ffffff",
    color: "#004d32",
    padding: "0 18px",
    height: "38px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
};

const summaryCard = {
    backgroundColor: "#ffffff",
    border: "1px solid #004d32",
    borderRadius: "14px",
    padding: "20px",
    minHeight: "105px",
    boxSizing: "border-box",
    boxShadow: "0 4px 18px rgba(0, 77, 50, 0.08)",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    transition: "transform 0.2s, box-shadow 0.2s",
};

const summaryTitle = {
    display: "block",
    fontSize: "11px",
    fontWeight: "800",
    color: "#004d32",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "6px",
};

const summaryNumber = {
    display: "block",
    fontSize: "26px",
    fontWeight: "900",
    color: "#003824",
    letterSpacing: "-0.02em",
};

const tableHeader = {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "11.5px",
    color: "#ffffff",
    backgroundColor: "#004d32",
    fontWeight: "800",
    whiteSpace: "nowrap",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "2px solid #efff00",
};

const tableCell = {
    padding: "14px 16px",
    fontSize: "13px",
    color: "#1e293b",
    whiteSpace: "nowrap",
    fontWeight: "500",
};

const actionButton = {
    border: "1px solid #004d32",
    background: "#004d32",
    color: "#efff00",
    fontSize: "11px",
    borderRadius: "6px",
    cursor: "pointer",
    padding: "5px 10px",
    fontWeight: "800",
    transition: "all 0.15s",
};

const paginationButton = {
    border: "1px solid #004d32",
    backgroundColor: "#ffffff",
    color: "#004d32",
    borderRadius: "8px",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
};

const modalLabel = {
    display: "block",
    fontSize: "11px",
    fontWeight: "800",
    color: "#004d32",
    marginBottom: "5px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
};

const modalInput = {
    width: "100%",
    height: "38px",
    boxSizing: "border-box",
    border: "1px solid #004d32",
    borderRadius: "8px",
    padding: "0 10px",
    marginBottom: "14px",
    outline: "none",
    fontSize: "13px",
    fontWeight: "600",
    backgroundColor: "#ffffff",
};