import React, { useMemo, useState } from "react";
import AdminSidebar from "../../Components/AdminSidebar";

export default function ContractManagement() {
    // =====================================================
    // DATA RIG & CONTRACT
    // =====================================================

    const [contracts, setContracts] = useState([
        {
            id: 1,
            contractNo: "CNT-2024-01",
            contractName: "HSE Management Contract",
            rigNo: "Rig-01",
            rigName: "Rig Alpha",
            location: "Sector Alpha",
            contractor: "PT Besmindo",
            startDate: "2024-01-01",
            endDate: "2024-12-31",
            value: "Rp 2.5 M",
            status: "Active",
        },
        {
            id: 2,
            contractNo: "CNT-2024-02",
            contractName: "Drilling Operation Contract",
            rigNo: "Rig-02",
            rigName: "Rig Bravo",
            location: "Sector Bravo",
            contractor: "PT Besmindo",
            startDate: "2024-02-01",
            endDate: "2024-12-31",
            value: "Rp 2.1 M",
            status: "Active",
        },
        {
            id: 3,
            contractNo: "CNT-2024-03",
            contractName: "Safety Inspection Contract",
            rigNo: "Rig-03",
            rigName: "Rig Charlie",
            location: "Sector Charlie",
            contractor: "PT Rigindo",
            startDate: "2024-03-01",
            endDate: "2024-10-31",
            value: "Rp 1.8 M",
            status: "Expired",
        },
        {
            id: 4,
            contractNo: "CNT-2024-04",
            contractName: "Environmental Monitoring",
            rigNo: "Rig-04",
            rigName: "Rig Delta",
            location: "Sector Alpha",
            contractor: "PT Besmindo",
            startDate: "2024-04-01",
            endDate: "2025-03-31",
            value: "Rp 3.2 M",
            status: "Active",
        },
        {
            id: 5,
            contractNo: "CNT-2024-05",
            contractName: "Maintenance Support Contract",
            rigNo: "Rig-05",
            rigName: "Rig Echo",
            location: "Sector Delta",
            contractor: "PT Petro Energy",
            startDate: "2024-05-01",
            endDate: "2025-04-30",
            value: "Rp 2.7 M",
            status: "Draft",
        },
    ]);

    // =====================================================
    // SEARCH
    // =====================================================

    const [search, setSearch] = useState("");

    // =====================================================
    // FILTER
    // =====================================================

    const [statusFilter, setStatusFilter] = useState("All");

    const filteredContracts = useMemo(() => {
        return contracts.filter((contract) => {
            const keyword = search.toLowerCase();

            const matchSearch =
                contract.contractNo
                    .toLowerCase()
                    .includes(keyword) ||
                contract.contractName
                    .toLowerCase()
                    .includes(keyword) ||
                contract.rigNo
                    .toLowerCase()
                    .includes(keyword) ||
                contract.rigName
                    .toLowerCase()
                    .includes(keyword) ||
                contract.location
                    .toLowerCase()
                    .includes(keyword) ||
                contract.contractor
                    .toLowerCase()
                    .includes(keyword);

            const matchStatus =
                statusFilter === "All" ||
                contract.status === statusFilter;

            return matchSearch && matchStatus;
        });
    }, [contracts, search, statusFilter]);

    // =====================================================
    // MODAL
    // =====================================================

    const [showModal, setShowModal] = useState(false);

    const [editingContract, setEditingContract] =
        useState(null);

    // =====================================================
    // FORM
    // =====================================================

    const [form, setForm] = useState({
        contractNo: "",
        contractName: "",
        rigNo: "",
        rigName: "",
        location: "",
        contractor: "",
        startDate: "",
        endDate: "",
        value: "",
        status: "Draft",
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
    // ADD CONTRACT
    // =====================================================

    const handleAddContract = () => {
        setEditingContract(null);

        setForm({
            contractNo: "",
            contractName: "",
            rigNo: "",
            rigName: "",
            location: "",
            contractor: "",
            startDate: "",
            endDate: "",
            value: "",
            status: "Draft",
        });

        setShowModal(true);
    };

    // =====================================================
    // EDIT CONTRACT
    // =====================================================

    const handleEditContract = (contract) => {
        setEditingContract(contract);

        setForm({
            contractNo: contract.contractNo,
            contractName: contract.contractName,
            rigNo: contract.rigNo,
            rigName: contract.rigName,
            location: contract.location,
            contractor: contract.contractor,
            startDate: contract.startDate,
            endDate: contract.endDate,
            value: contract.value,
            status: contract.status,
        });

        setShowModal(true);
    };

    // =====================================================
    // SAVE CONTRACT
    // =====================================================

    const handleSaveContract = () => {
        if (
            !form.contractNo.trim() ||
            !form.contractName.trim() ||
            !form.rigNo.trim() ||
            !form.rigName.trim() ||
            !form.location.trim() ||
            !form.contractor.trim()
        ) {
            showMessage(
                "Contract No, Contract Name, Rig, Location dan Contractor wajib diisi."
            );

            return;
        }

        if (editingContract) {
            setContracts((currentContracts) =>
                currentContracts.map((contract) =>
                    contract.id === editingContract.id
                        ? {
                              ...contract,
                              ...form,
                          }
                        : contract
                )
            );

            showMessage(
                "Data contract berhasil diperbarui."
            );
        } else {
            const newContract = {
                id: Date.now(),
                ...form,
            };

            setContracts((currentContracts) => [
                ...currentContracts,
                newContract,
            ]);

            showMessage(
                "Contract baru berhasil ditambahkan."
            );
        }

        setShowModal(false);
    };

    // =====================================================
    // DELETE CONTRACT
    // =====================================================

    const handleDeleteContract = (contract) => {
        const confirmed = window.confirm(
            `Apakah kamu yakin ingin menghapus ${contract.contractNo}?`
        );

        if (!confirmed) {
            return;
        }

        setContracts((currentContracts) =>
            currentContracts.filter(
                (item) => item.id !== contract.id
            )
        );

        showMessage(
            "Data contract berhasil dihapus."
        );
    };

    // =====================================================
    // CHANGE STATUS
    // =====================================================

    const handleChangeStatus = (
        contract,
        newStatus
    ) => {
        setContracts((currentContracts) =>
            currentContracts.map((item) =>
                item.id === contract.id
                    ? {
                          ...item,
                          status: newStatus,
                      }
                    : item
            )
        );

        showMessage(
            `${contract.contractNo} sekarang ${newStatus}.`
        );
    };

    // =====================================================
    // SUMMARY
    // =====================================================

    const totalContract = contracts.length;

    const activeContract = contracts.filter(
        (item) => item.status === "Active"
    ).length;

    const draftContract = contracts.filter(
        (item) => item.status === "Draft"
    ).length;

    const expiredContract = contracts.filter(
        (item) => item.status === "Expired"
    ).length;

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f4f7fb",
                fontFamily: "Arial, sans-serif",
                color: "#102033",
            }}
        >
            {/* SIDEBAR */}

            <AdminSidebar />

            {/* MAIN CONTENT */}

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
                    <div
                        style={{
                            fontSize: "22px",
                            fontWeight: "700",
                            color: "#00583b",
                        }}
                    >
                        Rig & Contract
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
                                    "Halaman Rig & Contract."
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

                {/* CONTENT */}

                <div
                    style={{
                        padding: "18px",
                    }}
                >
                    {/* TITLE */}

                    <div
                        style={{
                            marginBottom: "18px",
                        }}
                    >
                        <h1
                            style={{
                                margin: 0,
                                fontSize: "28px",
                                color: "#101828",
                            }}
                        >
                            Rig & Contract
                        </h1>

                        <p
                            style={{
                                margin:
                                    "7px 0 0",
                                fontSize: "14px",
                                color: "#667085",
                            }}
                        >
                            Manage rig assignments, contracts,
                            contractors, and contract status.
                        </p>
                    </div>

                    {/* SUMMARY */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(4, 1fr)",
                            gap: "12px",
                            marginBottom: "18px",
                        }}
                    >
                        <SummaryCard
                            title="Total Contract"
                            number={totalContract}
                        />

                        <SummaryCard
                            title="Active Contract"
                            number={activeContract}
                            border="#18b77a"
                            numberColor="#087443"
                        />

                        <SummaryCard
                            title="Draft Contract"
                            number={draftContract}
                            border="#f79009"
                            numberColor="#b54708"
                        />

                        <SummaryCard
                            title="Expired Contract"
                            number={expiredContract}
                            border="#d11a2a"
                            numberColor="#b42318"
                        />
                    </div>

                    {/* FILTER */}

                    <section
                        style={{
                            backgroundColor:
                                "#ffffff",
                            border:
                                "1px solid #d9e1e8",
                            borderRadius: "5px",
                            padding: "15px",
                            marginBottom: "15px",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "space-between",
                                gap: "10px",
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
                                    height: "38px",
                                    width: "300px",
                                    padding:
                                        "0 10px",
                                    boxSizing:
                                        "border-box",
                                }}
                            >
                                <span
                                    style={{
                                        color:
                                            "#667085",
                                        fontSize:
                                            "18px",
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
                                    placeholder="Search contract or rig..."
                                    style={{
                                        border:
                                            "none",
                                        outline:
                                            "none",
                                        width:
                                            "100%",
                                        marginLeft:
                                            "8px",
                                        fontSize:
                                            "13px",
                                    }}
                                />
                            </div>

                            {/* FILTER + ADD */}

                            <div
                                style={{
                                    display:
                                        "flex",
                                    gap: "8px",
                                }}
                            >
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
                                            "38px",
                                        border:
                                            "1px solid #d0d5dd",
                                        borderRadius:
                                            "4px",
                                        padding:
                                            "0 10px",
                                        fontSize:
                                            "13px",
                                        backgroundColor:
                                            "#ffffff",
                                    }}
                                >
                                    <option value="All">
                                        All Status
                                    </option>

                                    <option value="Active">
                                        Active
                                    </option>

                                    <option value="Draft">
                                        Draft
                                    </option>

                                    <option value="Expired">
                                        Expired
                                    </option>
                                </select>

                                <button
                                    onClick={
                                        handleAddContract
                                    }
                                    style={
                                        primaryButton
                                    }
                                >
                                    ＋ Add Contract
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* TABLE */}

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
                        <div
                            style={{
                                padding:
                                    "15px 16px",
                                borderBottom:
                                    "1px solid #e1e6eb",
                            }}
                        >
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize:
                                        "20px",
                                    color:
                                        "#101828",
                                }}
                            >
                                Rig & Contract List
                            </h2>

                            <p
                                style={{
                                    margin:
                                        "5px 0 0",
                                    fontSize:
                                        "13px",
                                    color:
                                        "#667085",
                                }}
                            >
                                Contract assignment and rig
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
                                        "1100px",
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
                                            Contract
                                        </th>

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
                                            Contractor
                                        </th>

                                        <th
                                            style={
                                                tableHeader
                                            }
                                        >
                                            Period
                                        </th>

                                        <th
                                            style={
                                                tableHeader
                                            }
                                        >
                                            Value
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
                                    {filteredContracts.length >
                                    0 ? (
                                        filteredContracts.map(
                                            (contract) => (
                                                <tr
                                                    key={
                                                        contract.id
                                                    }
                                                    style={{
                                                        borderBottom:
                                                            "1px solid #e1e6eb",
                                                    }}
                                                >
                                                    {/* CONTRACT */}

                                                    <td
                                                        style={
                                                            tableCell
                                                        }
                                                    >
                                                        <strong
                                                            style={{
                                                                fontSize:
                                                                    "13px",
                                                                color:
                                                                    "#101828",
                                                            }}
                                                        >
                                                            {
                                                                contract.contractNo
                                                            }
                                                        </strong>

                                                        <div
                                                            style={{
                                                                marginTop:
                                                                    "4px",
                                                                fontSize:
                                                                    "11px",
                                                                color:
                                                                    "#667085",
                                                            }}
                                                        >
                                                            {
                                                                contract.contractName
                                                            }
                                                        </div>
                                                    </td>

                                                    {/* RIG */}

                                                    <td
                                                        style={
                                                            tableCell
                                                        }
                                                    >
                                                        <div
                                                            style={{
                                                                fontWeight:
                                                                    "700",
                                                                fontSize:
                                                                    "13px",
                                                            }}
                                                        >
                                                            {
                                                                contract.rigNo
                                                            }
                                                        </div>

                                                        <div
                                                            style={{
                                                                marginTop:
                                                                    "4px",
                                                                fontSize:
                                                                    "11px",
                                                                color:
                                                                    "#667085",
                                                            }}
                                                        >
                                                            {
                                                                contract.rigName
                                                            }
                                                        </div>
                                                    </td>

                                                    {/* LOCATION */}

                                                    <td
                                                        style={
                                                            tableCell
                                                        }
                                                    >
                                                        {
                                                            contract.location
                                                        }
                                                    </td>

                                                    {/* CONTRACTOR */}

                                                    <td
                                                        style={
                                                            tableCell
                                                        }
                                                    >
                                                        {
                                                            contract.contractor
                                                        }
                                                    </td>

                                                    {/* PERIOD */}

                                                    <td
                                                        style={
                                                            tableCell
                                                        }
                                                    >
                                                        <div>
                                                            {
                                                                contract.startDate
                                                            }
                                                        </div>

                                                        <div
                                                            style={{
                                                                marginTop:
                                                                    "3px",
                                                                color:
                                                                    "#667085",
                                                                fontSize:
                                                                    "11px",
                                                            }}
                                                        >
                                                            to{" "}
                                                            {
                                                                contract.endDate
                                                            }
                                                        </div>
                                                    </td>

                                                    {/* VALUE */}

                                                    <td
                                                        style={
                                                            tableCell
                                                        }
                                                    >
                                                        {
                                                            contract.value
                                                        }
                                                    </td>

                                                    {/* STATUS */}

                                                    <td
                                                        style={
                                                            tableCell
                                                        }
                                                    >
                                                        <select
                                                            value={
                                                                contract.status
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                handleChangeStatus(
                                                                    contract,
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
                                                                    "12px",
                                                                padding:
                                                                    "5px 9px",
                                                                fontSize:
                                                                    "11px",
                                                                fontWeight:
                                                                    "700",
                                                                cursor:
                                                                    "pointer",
                                                                backgroundColor:
                                                                    contract.status ===
                                                                    "Active"
                                                                        ? "#d1fadf"
                                                                        : contract.status ===
                                                                          "Draft"
                                                                        ? "#fef0c7"
                                                                        : "#fee4e2",
                                                                color:
                                                                    contract.status ===
                                                                    "Active"
                                                                        ? "#027a48"
                                                                        : contract.status ===
                                                                          "Draft"
                                                                        ? "#b54708"
                                                                        : "#b42318",
                                                            }}
                                                        >
                                                            <option>
                                                                Active
                                                            </option>

                                                            <option>
                                                                Draft
                                                            </option>

                                                            <option>
                                                                Expired
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
                                                                    handleEditContract(
                                                                        contract
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
                                                                    handleDeleteContract(
                                                                        contract
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
                                                colSpan="8"
                                                style={{
                                                    padding:
                                                        "35px",
                                                    textAlign:
                                                        "center",
                                                    color:
                                                        "#667085",
                                                    fontSize:
                                                        "13px",
                                                }}
                                            >
                                                Data contract
                                                tidak ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* FOOTER */}

                        <div
                            style={{
                                display:
                                    "flex",
                                justifyContent:
                                    "space-between",
                                alignItems:
                                    "center",
                                padding:
                                    "11px 15px",
                                backgroundColor:
                                    "#fafbfc",
                            }}
                        >
                            <span
                                style={{
                                    fontSize:
                                        "12px",
                                    color:
                                        "#667085",
                                }}
                            >
                                Showing{" "}
                                {
                                    filteredContracts.length
                                }{" "}
                                of{" "}
                                {contracts.length}{" "}
                                contracts
                            </span>
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
                        position:
                            "fixed",
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
                            width: "460px",
                            maxHeight:
                                "90vh",
                            overflowY:
                                "auto",
                            backgroundColor:
                                "#ffffff",
                            borderRadius:
                                "7px",
                            padding: "22px",
                            boxSizing:
                                "border-box",
                            boxShadow:
                                "0 15px 40px rgba(0,0,0,0.2)",
                        }}
                    >
                        <h2
                            style={{
                                margin:
                                    "0 0 6px",
                                fontSize:
                                    "21px",
                                color:
                                    "#101828",
                            }}
                        >
                            {editingContract
                                ? "Edit Contract"
                                : "Add New Contract"}
                        </h2>

                        <p
                            style={{
                                margin:
                                    "0 0 20px",
                                fontSize:
                                    "13px",
                                color:
                                    "#667085",
                            }}
                        >
                            Manage rig contract information.
                        </p>

                        {/* CONTRACT NO */}

                        <label
                            style={
                                modalLabel
                            }
                        >
                            Contract No *
                        </label>

                        <input
                            value={
                                form.contractNo
                            }
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    contractNo:
                                        e.target
                                            .value,
                                })
                            }
                            placeholder="CNT-2024-06"
                            style={
                                modalInput
                            }
                        />

                        {/* CONTRACT NAME */}

                        <label
                            style={
                                modalLabel
                            }
                        >
                            Contract Name *
                        </label>

                        <input
                            value={
                                form.contractName
                            }
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    contractName:
                                        e.target
                                            .value,
                                })
                            }
                            placeholder="HSE Management Contract"
                            style={
                                modalInput
                            }
                        />

                        {/* RIG NO */}

                        <label
                            style={
                                modalLabel
                            }
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
                            placeholder="Rig-06"
                            style={
                                modalInput
                            }
                        />

                        {/* RIG NAME */}

                        <label
                            style={
                                modalLabel
                            }
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
                            placeholder="Rig Foxtrot"
                            style={
                                modalInput
                            }
                        />

                        {/* LOCATION */}

                        <label
                            style={
                                modalLabel
                            }
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
                            placeholder="Sector Alpha"
                            style={
                                modalInput
                            }
                        />

                        {/* CONTRACTOR */}

                        <label
                            style={
                                modalLabel
                            }
                        >
                            Contractor *
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
                            placeholder="PT Besmindo"
                            style={
                                modalInput
                            }
                        />

                        {/* START DATE */}

                        <label
                            style={
                                modalLabel
                            }
                        >
                            Start Date
                        </label>

                        <input
                            type="date"
                            value={
                                form.startDate
                            }
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    startDate:
                                        e.target
                                            .value,
                                })
                            }
                            style={
                                modalInput
                            }
                        />

                        {/* END DATE */}

                        <label
                            style={
                                modalLabel
                            }
                        >
                            End Date
                        </label>

                        <input
                            type="date"
                            value={
                                form.endDate
                            }
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    endDate:
                                        e.target
                                            .value,
                                })
                            }
                            style={
                                modalInput
                            }
                        />

                        {/* VALUE */}

                        <label
                            style={
                                modalLabel
                            }
                        >
                            Contract Value
                        </label>

                        <input
                            value={
                                form.value
                            }
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    value:
                                        e.target
                                            .value,
                                })
                            }
                            placeholder="Rp 2.5 M"
                            style={
                                modalInput
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
                                modalInput
                            }
                        >
                            <option>
                                Draft
                            </option>

                            <option>
                                Active
                            </option>

                            <option>
                                Expired
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
                                    "10px",
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
                                    handleSaveContract
                                }
                                style={
                                    primaryButton
                                }
                            >
                                {editingContract
                                    ? "Save Changes"
                                    : "Add Contract"}
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
                            "13px 19px",
                        borderRadius:
                            "5px",
                        fontSize: "13px",
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
// MODERN CLASSIC: SUMMARY CARD (HIJAU BOTOL & KUNING NEON)
// =====================================================

function SummaryCard({
    title,
    number,
    border,
    numberColor,
}) {
    return (
        <div
            style={{
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
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background: "linear-gradient(90deg, #004d32 0%, #efff00 100%)",
                }}
            />

            <span
                style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: "800",
                    color: "#004d32",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                }}
            >
                {title}
            </span>

            <strong
                style={{
                    display: "block",
                    fontSize: "26px",
                    fontWeight: "900",
                    color: numberColor || "#003824",
                    letterSpacing: "-0.02em",
                    marginTop: "8px",
                }}
            >
                {number}
            </strong>
        </div>
    );
}

// =====================================================
// MODERN CLASSIC: STYLES
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