import React, { useMemo, useState } from "react";
import AdminSidebar from "../../Components/AdminSidebar";

export default function UserManagement({ users: initialUsers = [] }) {
    // ==========================================
    // DATA USER DARI MYSQL
    // ==========================================

    const [users, setUsers] = useState(initialUsers);
    const [isLoading, setIsLoading] = useState(false);

    // ==========================================
    // SEARCH
    // ==========================================

    const [search, setSearch] = useState("");

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const keyword = search.toLowerCase();
            const roleName = user.role === "admin" ? "admin" : "user/pic";
            const statusName = user.status ? user.status.toLowerCase() : "active";

            return (
                (user.name && user.name.toLowerCase().includes(keyword)) ||
                (user.email && user.email.toLowerCase().includes(keyword)) ||
                roleName.includes(keyword) ||
                statusName.includes(keyword)
            );
        });
    }, [users, search]);

    // ==========================================
    // MODAL
    // ==========================================

    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        role: "user",
        status: "active",
        password: "",
    });

    // ==========================================
    // NOTIFICATION
    // ==========================================

    const [message, setMessage] = useState("");

    const showMessage = (text) => {
        setMessage(text);

        setTimeout(() => {
            setMessage("");
        }, 3000);
    };

    const getCsrfToken = () => {
        return (
            document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        );
    };

    // ==========================================
    // ADD USER
    // ==========================================

    const handleAddUser = () => {
        setEditingUser(null);

        setForm({
            name: "",
            email: "",
            role: "user",
            status: "active",
            password: "",
        });

        setShowModal(true);
    };

    // ==========================================
    // EDIT USER
    // ==========================================

    const handleEditUser = (user) => {
        setEditingUser(user);

        setForm({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status || "active",
            password: "",
        });

        setShowModal(true);
    };

    // ==========================================
    // SAVE USER (CREATE / UPDATE VIA MYSQL API)
    // ==========================================

    const handleSaveUser = async () => {
        if (!form.name.trim() || !form.email.trim()) {
            showMessage("Nama dan email wajib diisi.");
            return;
        }

        setIsLoading(true);

        try {
            const url = editingUser ? `/admin/users/${editingUser.id}` : "/admin/users";
            const method = editingUser ? "PUT" : "POST";

            const payload = {
                name: form.name,
                email: form.email,
                role: form.role,
                status: form.status,
            };

            if (form.password) {
                payload.password = form.password;
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": getCsrfToken(),
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "same-origin",
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                showMessage(result.message || "Gagal menyimpan data user ke database.");
                setIsLoading(false);
                return;
            }

            if (editingUser) {
                setUsers((currentUsers) =>
                    currentUsers.map((u) => (u.id === editingUser.id ? result.data : u))
                );
                showMessage("Data user di MySQL berhasil diperbarui.");
            } else {
                setUsers((currentUsers) => [result.data, ...currentUsers]);
                showMessage("User baru berhasil ditambahkan ke database MySQL.");
            }

            setShowModal(false);
        } catch (error) {
            console.error("Error saving user:", error);
            showMessage("Terjadi kesalahan sistem saat menyimpan ke database.");
        } finally {
            setIsLoading(false);
        }
    };

    // ==========================================
    // DELETE USER DARI MYSQL
    // ==========================================

    const handleDeleteUser = async (user) => {
        const confirmed = window.confirm(
            `Apakah Anda yakin ingin menghapus user "${user.name}" dari database MySQL?`
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`/admin/users/${user.id}`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                    "X-CSRF-TOKEN": getCsrfToken(),
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "same-origin",
            });

            const result = await response.json();

            if (!response.ok) {
                showMessage(result.message || "Gagal menghapus user.");
                return;
            }

            setUsers((currentUsers) =>
                currentUsers.filter((item) => item.id !== user.id)
            );

            showMessage(`User "${user.name}" berhasil dihapus dari MySQL.`);
        } catch (error) {
            console.error("Error deleting user:", error);
            showMessage("Terjadi kesalahan saat menghapus data user.");
        }
    };

    // ==========================================
    // TOGGLE STATUS DI MYSQL
    // ==========================================

    const handleToggleStatus = async (user) => {
        try {
            const response = await fetch(`/admin/users/${user.id}/toggle-status`, {
                method: "PATCH",
                headers: {
                    Accept: "application/json",
                    "X-CSRF-TOKEN": getCsrfToken(),
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "same-origin",
            });

            const result = await response.json();

            if (!response.ok) {
                showMessage(result.message || "Gagal mengubah status user.");
                return;
            }

            setUsers((currentUsers) =>
                currentUsers.map((item) =>
                    item.id === user.id ? result.data : item
                )
            );

            showMessage(`Status ${user.name} sekarang: ${result.data.status}.`);
        } catch (error) {
            console.error("Error toggling status:", error);
            showMessage("Gagal mengubah status di database.");
        }
    };

    // ==========================================
    // AVATAR
    // ==========================================

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
            {/* =====================================
                SIDEBAR
            ===================================== */}

            <AdminSidebar />

            {/* =====================================
                MAIN CONTENT
            ===================================== */}

            <main
                style={{
                    marginLeft: "var(--admin-sidebar-width, 215px)",
                    width: "calc(100% - var(--admin-sidebar-width, 215px))",
                    transition: "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    minHeight: "100vh",
                }}
            >
                {/* =================================
                    HEADER
                ================================= */}

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
                        User Administration
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "18px",
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
                                    "Halaman User Management."
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

                {/* =================================
                    CONTENT
                ================================= */}

                <div
                    style={{
                        padding: "18px",
                    }}
                >
                    {/* TITLE + ACTION */}

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                                "space-between",
                            marginBottom: "14px",
                        }}
                    >
                        <div>
                            <h1
                                style={{
                                    margin: 0,
                                    fontSize: "25px",
                                    color: "#101828",
                                }}
                            >
                                User Administration
                            </h1>

                            <p
                                style={{
                                    margin:
                                        "5px 0 0",
                                    fontSize: "15px",
                                    color: "#667085",
                                }}
                            >
                                Manage rig personnel access,
                                roles, and system status.
                            </p>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                            }}
                        >
                            {/* SEARCH */}

                            <div
                                style={{
                                    width: "185px",
                                    height: "32px",
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    border:
                                        "1px solid #d0d5dd",
                                    borderRadius: "4px",
                                    backgroundColor:
                                        "#ffffff",
                                    padding:
                                        "0 9px",
                                    boxSizing:
                                        "border-box",
                                }}
                            >
                                <span
                                    style={{
                                        color: "#667085",
                                        fontSize: "17px",
                                    }}
                                >
                                    ⌕
                                </span>

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Search users..."
                                    style={{
                                        border:
                                            "none",
                                        outline:
                                            "none",
                                        width:
                                            "100%",
                                        marginLeft:
                                            "7px",
                                        fontSize: "15px",
                                    }}
                                />
                            </div>

                            {/* ADD USER */}

                            <button
                                onClick={
                                    handleAddUser
                                }
                                style={{
                                    ...primaryButton,
                                    height: "32px",
                                }}
                            >
                                ＋ Add User
                            </button>
                        </div>
                    </div>

                    {/* =================================
                        USER TABLE
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
                                            "#eef2f6",
                                    }}
                                >
                                    <th
                                        style={
                                            tableHeader
                                        }
                                    >
                                        Name
                                    </th>

                                    <th
                                        style={
                                            tableHeader
                                        }
                                    >
                                        Email
                                    </th>

                                    <th
                                        style={
                                            tableHeader
                                        }
                                    >
                                        Role
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
                                {filteredUsers.length >
                                0 ? (
                                    filteredUsers.map(
                                        (user) => (
                                            <tr
                                                key={
                                                    user.id
                                                }
                                                style={{
                                                    borderBottom:
                                                        "1px solid #e1e6eb",
                                                }}
                                            >
                                                {/* NAME */}

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
                                                                "9px",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                width:
                                                                    "24px",
                                                                height:
                                                                    "24px",
                                                                borderRadius:
                                                                    "50%",
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
                                                                user.name
                                                            )}
                                                        </div>

                                                        <span>
                                                            {
                                                                user.name
                                                            }
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* EMAIL */}

                                                <td
                                                    style={{
                                                        ...tableCell,
                                                        color:
                                                            "#475467",
                                                    }}
                                                >
                                                    {
                                                        user.email
                                                    }
                                                </td>

                                                {/* ROLE */}
                                                <td style={tableCell}>
                                                    <span
                                                        style={{
                                                            ...roleBadge,
                                                            backgroundColor: user.role === "admin" ? "#e0e7ff" : "#ecfdf5",
                                                            color: user.role === "admin" ? "#4338ca" : "#047857",
                                                            border: user.role === "admin" ? "1px solid #c7d2fe" : "1px solid #a7f3d0",
                                                            padding: "3px 8px",
                                                            borderRadius: "6px",
                                                            fontSize: "11.5px",
                                                            fontWeight: "700",
                                                        }}
                                                    >
                                                        {user.role === "admin" ? "Admin" : "Field User / PIC"}
                                                    </span>
                                                </td>

                                                {/* STATUS */}
                                                <td style={tableCell}>
                                                    <button
                                                        onClick={() => handleToggleStatus(user)}
                                                        style={{
                                                            border: "none",
                                                            background: "transparent",
                                                            cursor: "pointer",
                                                            padding: "0",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "6px",
                                                        }}
                                                        title="Klik untuk mengubah status aktif/non-aktif"
                                                    >
                                                        <span
                                                            style={{
                                                                width: "7px",
                                                                height: "7px",
                                                                borderRadius: "50%",
                                                                backgroundColor:
                                                                    (user.status || "active").toLowerCase() === "active"
                                                                        ? "#10b981"
                                                                        : "#ef4444",
                                                            }}
                                                        />
                                                        <span
                                                            style={{
                                                                color:
                                                                    (user.status || "active").toLowerCase() === "active"
                                                                        ? "#047857"
                                                                        : "#b91c1c",
                                                                fontSize: "13px",
                                                                fontWeight: "700",
                                                                textTransform: "capitalize",
                                                            }}
                                                        >
                                                            {user.status || "active"}
                                                        </span>
                                                    </button>
                                                </td>

                                                {/* ACTIONS */}

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
                                                                "6px",
                                                        }}
                                                    >
                                                        <button
                                                            onClick={() =>
                                                                handleEditUser(
                                                                    user
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
                                                                handleDeleteUser(
                                                                    user
                                                                )
                                                            }
                                                            style={{
                                                                fontWeight: "700",
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
                                            colSpan="5"
                                            style={{
                                                padding:
                                                    "30px",
                                                textAlign:
                                                    "center",
                                                color:
                                                    "#667085",
                                                fontSize: "16px",
                                            }}
                                        >
                                            User tidak
                                            ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* =================================
                            FOOTER
                        ================================= */}

                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems: "center",
                                padding:
                                    "9px 12px",
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
                                {filteredUsers.length}{" "}
                                to{" "}
                                {filteredUsers.length}{" "}
                                of{" "}
                                {users.length}{" "}
                                entries
                            </span>

                            <div
                                style={{
                                    display:
                                        "flex",
                                    gap:
                                        "4px",
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

            {/* =====================================
                ADD / EDIT MODAL
            ===================================== */}

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
                            width: "390px",
                            backgroundColor:
                                "#ffffff",
                            borderRadius:
                                "7px",
                            boxShadow:
                                "0 15px 40px rgba(0,0,0,0.2)",
                            padding: "20px",
                        }}
                    >
                        <h2
                            style={{
                                margin:
                                    "0 0 5px",
                                fontSize: "22px",
                                color:
                                    "#101828",
                            }}
                        >
                            {editingUser
                                ? "Edit User"
                                : "Add User"}
                        </h2>

                        <p
                            style={{
                                margin:
                                    "0 0 18px",
                                fontSize: "15px",
                                color:
                                    "#667085",
                            }}
                        >
                            {editingUser
                                ? "Update user information."
                                : "Add a new user to the system."}
                        </p>

                        {/* NAME */}

                        <label
                            style={
                                modalLabel
                            }
                        >
                            Name
                        </label>

                        <input
                            value={form.name}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    name:
                                        e.target
                                            .value,
                                })
                            }
                            placeholder="Enter name"
                            style={
                                modalInput
                            }
                        />

                        {/* EMAIL */}

                        <label
                            style={
                                modalLabel
                            }
                        >
                            Email
                        </label>

                        <input
                            value={form.email}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    email:
                                        e.target
                                            .value,
                                })
                            }
                            placeholder="Enter email"
                            style={
                                modalInput
                            }
                        />

                        {/* ROLE */}
                        <label style={modalLabel}>Peran Akun (Role)</label>
                        <select
                            value={form.role}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    role: e.target.value,
                                })
                            }
                            style={modalInput}
                        >
                            <option value="admin">HSE Administrator (Admin)</option>
                            <option value="user">Field User / PIC Lapangan (User)</option>
                        </select>

                        {/* STATUS */}
                        <label style={modalLabel}>Status Akun</label>
                        <select
                            value={form.status}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    status: e.target.value,
                                })
                            }
                            style={modalInput}
                        >
                            <option value="active">Active (Aktif)</option>
                            <option value="inactive">Inactive (Non-Aktif)</option>
                        </select>

                        {/* PASSWORD */}
                        <label style={modalLabel}>
                            {editingUser ? "Kata Sandi Baru (Kosongkan jika tidak ingin mengubah)" : "Kata Sandi"}
                        </label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    password: e.target.value,
                                })
                            }
                            placeholder={editingUser ? "Biarkan kosong untuk tetap memakai sandi lama" : "Minimal 6 karakter"}
                            style={modalInput}
                        />

                        {/* MODAL BUTTON */}

                        <div
                            style={{
                                display:
                                    "flex",
                                justifyContent:
                                    "flex-end",
                                gap:
                                    "8px",
                                marginTop:
                                    "20px",
                            }}
                        >
                            <button
                                onClick={() =>
                                    setShowModal(
                                        false
                                    )
                                }
                                style={{
                                    ...secondaryButton,
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={
                                    handleSaveUser
                                }
                                style={
                                    primaryButton
                                }
                            >
                                {editingUser
                                    ? "Save Changes"
                                    : "Add User"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================
                NOTIFICATION
            ===================================== */}

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
                        borderRadius: "5px",
                        fontSize: "15px",
                        fontWeight: "600",
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

// ==============================================
// MODERN CLASSIC: STYLES (HIJAU BOTOL & KUNING NEON)
// ==============================================

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
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "2px solid #efff00",
};

const tableCell = {
    padding: "14px 16px",
    fontSize: "13px",
    color: "#1e293b",
    fontWeight: "500",
};

const roleBadge = {
    display: "inline-block",
    backgroundColor: "#004d32",
    border: "1px solid #efff00",
    color: "#efff00",
    borderRadius: "6px",
    padding: "3px 8px",
    fontSize: "11px",
    fontWeight: "800",
    boxShadow: "0 0 6px rgba(239, 255, 0, 0.2)",
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