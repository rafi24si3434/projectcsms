import React, { useState, useMemo } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    Users, UserCheck, UserX, Search, Plus, Edit2, Trash2,
    Shield, HardHat, X, Eye, EyeOff, ChevronDown,
    Clock, CheckCircle, XCircle, AlertTriangle, ShieldCheck,
    RefreshCw, Filter, Info,
} from "lucide-react";

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
    return (
        <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999, display: "flex", flexDirection: "column", gap: "8px", pointerEvents: "none" }}>
            {toasts.map(t => (
                <div key={t.id} style={{
                    padding: "12px 18px", borderRadius: "12px", fontSize: "13px", fontWeight: "700",
                    color: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                    background: t.type === "success" ? "linear-gradient(135deg,#059669,#10b981)"
                        : t.type === "error" ? "linear-gradient(135deg,#dc2626,#ef4444)"
                        : "linear-gradient(135deg,#d97706,#f59e0b)",
                    display: "flex", alignItems: "center", gap: "8px",
                    animation: "slideIn 0.3s ease",
                    pointerEvents: "auto",
                }}>
                    {t.type === "success" ? <CheckCircle size={16} /> : t.type === "error" ? <XCircle size={16} /> : <Info size={16} />}
                    {t.message}
                </div>
            ))}
        </div>
    );
}

// ─── STATUS BADGE ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const s = (status || "").toLowerCase();
    const cfg = {
        active:   { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0", label: "Aktif",   icon: CheckCircle },
        inactive: { bg: "#fee2e2", color: "#b91c1c", border: "#fecaca", label: "Nonaktif",icon: XCircle },
        pending:  { bg: "#fef3c7", color: "#b45309", border: "#fde68a", label: "Pending", icon: Clock },
        rejected: { bg: "#f3e8ff", color: "#7c3aed", border: "#e9d5ff", label: "Ditolak", icon: AlertTriangle },
    }[s] || { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0", label: status, icon: Info };
    const Icon = cfg.icon;
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "800",
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
        }}>
            <Icon size={11} strokeWidth={2.5} />
            {cfg.label}
        </span>
    );
}

// ─── ROLE BADGE ───────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
    const isAdmin = role === "admin";
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "800",
            background: isAdmin ? "#dbeafe" : "#dcfce7",
            color: isAdmin ? "#1d4ed8" : "#15803d",
            border: `1px solid ${isAdmin ? "#bfdbfe" : "#bbf7d0"}`,
        }}>
            {isAdmin ? <Shield size={11} strokeWidth={2.5} /> : <HardHat size={11} strokeWidth={2.5} />}
            {isAdmin ? "HSE Admin" : "Field User"}
        </span>
    );
}

// ─── REJECT MODAL ─────────────────────────────────────────────────────────────
function RejectModal({ user, onClose, onConfirm, processing }) {
    const [reason, setReason] = useState("");
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
            <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", maxWidth: "440px", width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <XCircle size={22} color="#dc2626" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>Tolak Permintaan Akun</h3>
                        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>{user?.name} — {user?.email}</p>
                    </div>
                    <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={20} /></button>
                </div>

                <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#374151", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                        Alasan Penolakan (opsional)
                    </label>
                    <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="Contoh: Data tidak lengkap, email tidak valid, dll..."
                        rows={3}
                        style={{
                            width: "100%", padding: "10px 14px", borderRadius: "10px",
                            border: "1.5px solid #e2e8f0", fontSize: "13px",
                            boxSizing: "border-box", resize: "vertical", outline: "none", fontFamily: "inherit",
                        }}
                    />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                        Batal
                    </button>
                    <button onClick={() => onConfirm(reason)} disabled={processing} style={{
                        flex: 1, padding: "11px", borderRadius: "10px", border: "none",
                        background: "linear-gradient(135deg,#dc2626,#ef4444)",
                        color: "#fff", fontSize: "13px", fontWeight: "800", cursor: processing ? "not-allowed" : "pointer",
                        opacity: processing ? 0.7 : 1,
                    }}>
                        {processing ? "Memproses..." : "Tolak Akun"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── DELETE MODAL ─────────────────────────────────────────────────────────────
function DeleteModal({ user, onClose, onConfirm, processing }) {
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
            <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", maxWidth: "420px", width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                        <Trash2 size={26} color="#dc2626" />
                    </div>
                    <h3 style={{ margin: "0 0 6px", fontSize: "17px", fontWeight: "900", color: "#0f172a" }}>Hapus Pengguna?</h3>
                    <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: "1.5" }}>
                        Akun <strong>{user?.name}</strong> akan dihapus permanen dari database. Tindakan ini tidak dapat dibatalkan.
                    </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>Batal</button>
                    <button onClick={onConfirm} disabled={processing} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#dc2626,#ef4444)", color: "#fff", fontSize: "13px", fontWeight: "800", cursor: processing ? "not-allowed" : "pointer", opacity: processing ? 0.7 : 1 }}>
                        {processing ? "Menghapus..." : "Ya, Hapus"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── ADD/EDIT MODAL ───────────────────────────────────────────────────────────
function UserModal({ user, rigs, onClose, onSave, processing, errors }) {
    const isEdit = !!user?.id;
    const [form, setForm] = useState({
        name:        user?.name || "",
        email:       user?.email || "",
        role:        user?.role || "user",
        status:      user?.status || "Active",
        password:    "",
        csms_rig_id: user?.csms_rig_id || "",
    });
    const [showPw, setShowPw] = useState(false);

    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const labelStyle = { display: "block", fontSize: "11px", fontWeight: "800", color: "#374151", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "5px" };
    const inputStyle = (err) => ({
        width: "100%", padding: "9px 13px", borderRadius: "9px",
        border: `1.5px solid ${err ? "#ef4444" : "#e2e8f0"}`,
        fontSize: "13px", boxSizing: "border-box", outline: "none",
        background: "#f8fafc", fontFamily: "inherit",
    });

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", overflowY: "auto" }}>
            <div style={{ background: "#fff", borderRadius: "20px", maxWidth: "520px", width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.3)", overflow: "hidden", margin: "auto" }}>
                {/* Header */}
                <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: isEdit ? "#dbeafe" : "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {isEdit ? <Edit2 size={20} color="#1d4ed8" /> : <Plus size={20} color="#15803d" />}
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "900", color: "#0f172a" }}>{isEdit ? "Edit Pengguna" : "Tambah Pengguna Baru"}</h3>
                        <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "#64748b" }}>{isEdit ? `ID: ${user.id} — ${user.email}` : "Akun baru langsung aktif (dibuat oleh Admin)"}</p>
                    </div>
                    <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={20} /></button>
                </div>

                <div style={{ padding: "20px 24px" }}>
                    {/* Nama & Email */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                        <div>
                            <label style={labelStyle}>Nama Lengkap *</label>
                            <input type="text" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ahmad Fadilah" style={inputStyle(errors?.name)} />
                            {errors?.name && <p style={{ color: "#dc2626", fontSize: "11px", marginTop: "3px", fontWeight: "600" }}>{errors.name}</p>}
                        </div>
                        <div>
                            <label style={labelStyle}>Email *</label>
                            <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="nama@besmindo.com" style={inputStyle(errors?.email)} />
                            {errors?.email && <p style={{ color: "#dc2626", fontSize: "11px", marginTop: "3px", fontWeight: "600" }}>{errors.email}</p>}
                        </div>
                    </div>

                    {/* Role & Status */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                        <div>
                            <label style={labelStyle}>Role Akun *</label>
                            <div style={{ position: "relative" }}>
                                <select value={form.role} onChange={e => set("role", e.target.value)} style={{ ...inputStyle(errors?.role), paddingRight: "32px", appearance: "none" }}>
                                    <option value="user">Field User / PIC</option>
                                    <option value="admin">HSE Admin</option>
                                </select>
                                <ChevronDown size={15} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Status *</label>
                            <div style={{ position: "relative" }}>
                                <select value={form.status} onChange={e => set("status", e.target.value)} style={{ ...inputStyle(errors?.status), paddingRight: "32px", appearance: "none" }}>
                                    <option value="Active">Aktif</option>
                                    <option value="Inactive">Nonaktif</option>
                                </select>
                                <ChevronDown size={15} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                            </div>
                        </div>
                    </div>

                    {/* Rig Assignment */}
                    {form.role === "user" && (
                        <div style={{ marginBottom: "12px" }}>
                            <label style={labelStyle}>Unit Rig Ditugaskan</label>
                            <div style={{ position: "relative" }}>
                                <select value={form.csms_rig_id} onChange={e => set("csms_rig_id", e.target.value)} style={{ ...inputStyle(errors?.csms_rig_id), paddingRight: "32px", appearance: "none" }}>
                                    <option value="">— Belum Ditugaskan —</option>
                                    {rigs.map(r => <option key={r.id} value={r.id}>{r.code} — {r.name}</option>)}
                                </select>
                                <ChevronDown size={15} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                            </div>
                        </div>
                    )}

                    {/* Password */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={labelStyle}>{isEdit ? "Kata Sandi Baru (kosongkan jika tidak diubah)" : "Kata Sandi *"}</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPw ? "text" : "password"}
                                value={form.password}
                                onChange={e => set("password", e.target.value)}
                                placeholder={isEdit ? "••••••  (opsional)" : "Min. 6 karakter"}
                                style={{ ...inputStyle(errors?.password), paddingRight: "42px" }}
                            />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                                style={{ position: "absolute", right: "11px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "3px", display: "flex", alignItems: "center" }}>
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors?.password && <p style={{ color: "#dc2626", fontSize: "11px", marginTop: "3px", fontWeight: "600" }}>{errors.password}</p>}
                    </div>

                    {/* Buttons */}
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>Batal</button>
                        <button onClick={() => onSave(form)} disabled={processing} style={{
                            flex: 2, padding: "11px", borderRadius: "10px", border: "none",
                            background: processing ? "#94a3b8" : "linear-gradient(135deg,#065f46,#10b981)",
                            color: "#fff", fontSize: "13px", fontWeight: "800", cursor: processing ? "not-allowed" : "pointer",
                        }}>
                            {processing ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Pengguna"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function UserManagement({ users = [], rigs = [], pendingCount = 0 }) {
    const { props } = usePage();
    const currentUser = props.auth?.user;

    const [activeTab, setActiveTab] = useState("all");
    const [search, setSearch]       = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [toasts, setToasts]       = useState([]);
    const [processing, setProcessing] = useState(false);
    const [modalErrors, setModalErrors] = useState({});

    const [showAddModal, setShowAddModal]     = useState(false);
    const [editUser, setEditUser]             = useState(null);
    const [deleteUser, setDeleteUser]         = useState(null);
    const [rejectUser, setRejectUser]         = useState(null);
    const [userList, setUserList]             = useState(users);
    const [pendingBadge, setPendingBadge]     = useState(pendingCount);

    const addToast = (message, type = "success") => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };

    // ── STATS ──────────────────────────────────────────────────────────────────
    const stats = useMemo(() => ({
        total:    userList.length,
        active:   userList.filter(u => (u.status || "").toLowerCase() === "active").length,
        pending:  userList.filter(u => (u.status || "").toLowerCase() === "pending").length,
        inactive: userList.filter(u => ["inactive", "rejected"].includes((u.status || "").toLowerCase())).length,
    }), [userList]);

    // ── FILTERED LIST ──────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        return userList.filter(u => {
            const s      = (u.status || "").toLowerCase();
            const tabOk  = activeTab === "all"
                ? true
                : activeTab === "pending"   ? s === "pending"
                : activeTab === "active"    ? s === "active"
                : activeTab === "inactive"  ? ["inactive", "rejected"].includes(s)
                : true;
            const roleOk = roleFilter === "all" || u.role === roleFilter;
            const q      = search.toLowerCase();
            const srchOk = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.rig?.name?.toLowerCase().includes(q);
            return tabOk && roleOk && srchOk;
        });
    }, [userList, activeTab, search, roleFilter]);

    // ── API HELPERS ────────────────────────────────────────────────────────────
    const apiCall = (url, method, body, onSuccess) => {
        setProcessing(true);
        setModalErrors({});

        const options = {
            preserveScroll: true,
            onSuccess: (page) => {
                if (onSuccess) onSuccess(page);
                setProcessing(false);
            },
            onError: (errs) => {
                setModalErrors(errs || {});
                const first = Object.values(errs || {})[0];
                addToast(first || "Terjadi kesalahan.", "error");
                setProcessing(false);
            },
            onFinish: () => {
                setProcessing(false);
            },
        };

        if (method === "delete") {
            router.delete(url, options);
        } else {
            router[method](url, body, options);
        }
    };

    const handleSave = (form) => {
        const isEdit = !!editUser?.id;
        const url    = isEdit ? `/admin/users/${editUser.id}` : "/admin/users";
        const method = isEdit ? "put" : "post";
        apiCall(url, method, form, (page) => {
            const updated = page?.props?.users || [];
            setUserList(updated);
            setPendingBadge(updated.filter(u => (u.status||"").toLowerCase() === "pending").length);
            setShowAddModal(false);
            setEditUser(null);
            addToast(isEdit ? `Data ${form.name} berhasil diperbarui.` : `Pengguna ${form.name} berhasil ditambahkan.`, "success");
        });
    };

    const handleApprove = (user) => {
        setProcessing(true);
        router.post(`/admin/users/${user.id}/approve`, {}, {
            preserveScroll: true,
            onSuccess: (page) => {
                const updated = page?.props?.users || [];
                setUserList(updated);
                setPendingBadge(updated.filter(u => (u.status||"").toLowerCase() === "pending").length);
                addToast(`✅ Akun ${user.name} berhasil di-ACC! Pengguna sekarang dapat login.`, "success");
            },
            onError: () => {
                addToast("Gagal menyetujui akun. Coba lagi.", "error");
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const handleRejectConfirm = (reason) => {
        const user = rejectUser;
        setProcessing(true);
        router.post(`/admin/users/${user.id}/reject`, { reason }, {
            preserveScroll: true,
            onSuccess: (page) => {
                const updated = page?.props?.users || [];
                setUserList(updated);
                setPendingBadge(updated.filter(u => (u.status||"").toLowerCase() === "pending").length);
                setRejectUser(null);
                addToast(`Akun ${user.name} telah ditolak.`, "warning");
            },
            onError: () => {
                addToast("Gagal menolak akun. Coba lagi.", "error");
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const handleDelete = () => {
        if (!deleteUser) return;
        const user = deleteUser;
        apiCall(`/admin/users/${user.id}`, "delete", {}, (page) => {
            const updated = page?.props?.users || [];
            setUserList(updated);
            setPendingBadge(updated.filter(u => (u.status||"").toLowerCase() === "pending").length);
            setDeleteUser(null);
            addToast(`Pengguna ${user.name} berhasil dihapus.`, "success");
        });
    };

    const handleToggle = (user) => {
        router.patch(`/admin/users/${user.id}/toggle-status`, {}, {
            preserveScroll: true,
            onSuccess: (page) => {
                const updated = page.props.users || [];
                setUserList(updated);
            },
            onError: () => addToast("Gagal mengubah status.", "error"),
        });
    };

    // ── STYLES ─────────────────────────────────────────────────────────────────
    const tabBtn = (tab) => ({
        padding: "8px 16px", borderRadius: "10px", fontSize: "12px", fontWeight: "800",
        border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
        transition: "all 0.18s ease",
        background: activeTab === tab ? "#0f172a" : "transparent",
        color: activeTab === tab ? "#fff" : "#64748b",
    });

    // ── RENDER ─────────────────────────────────────────────────────────────────
    return (
        <AdminLayout>
            <Head title="User Management — Portal HSE CSMS" />
            <style>{`@keyframes slideIn{from{transform:translateX(40px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
            <Toast toasts={toasts} />

            {/* Modals */}
            {(showAddModal || editUser) && (
                <UserModal
                    user={editUser}
                    rigs={rigs}
                    onClose={() => { setShowAddModal(false); setEditUser(null); setModalErrors({}); }}
                    onSave={handleSave}
                    processing={processing}
                    errors={modalErrors}
                />
            )}
            {deleteUser && (
                <DeleteModal user={deleteUser} onClose={() => setDeleteUser(null)} onConfirm={handleDelete} processing={processing} />
            )}
            {rejectUser && (
                <RejectModal user={rejectUser} onClose={() => setRejectUser(null)} onConfirm={handleRejectConfirm} processing={processing} />
            )}

            <div style={{ padding: "28px", maxWidth: "1280px", margin: "0 auto", fontFamily: "'Instrument Sans', -apple-system, sans-serif" }}>

                {/* ── PAGE HEADER ────────────────────────────────────────── */}
                <div style={{ marginBottom: "24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{
                            width: "52px", height: "52px", borderRadius: "14px",
                            background: "linear-gradient(135deg,#065f46,#10b981)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 6px 20px rgba(16,185,129,0.35)",
                        }}>
                            <Users size={24} color="#fff" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.02em" }}>
                                User Management
                            </h1>
                            <p style={{ margin: "3px 0 0", fontSize: "13px", color: "#64748b" }}>
                                Kelola akun & persetujuan pengguna Portal HSE CSMS
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "11px 20px", borderRadius: "12px", border: "none",
                            background: "linear-gradient(135deg,#065f46,#10b981)",
                            color: "#fff", fontSize: "13px", fontWeight: "800", cursor: "pointer",
                            boxShadow: "0 4px 14px rgba(16,185,129,0.4)",
                        }}
                    >
                        <Plus size={17} />
                        Tambah Pengguna
                    </button>
                </div>

                {/* ── BENTO STATS ────────────────────────────────────────── */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: "14px", marginBottom: "24px" }}>
                    {[
                        { label: "Total Pengguna",  value: stats.total,    color: "#1d4ed8", bg: "#dbeafe", icon: Users },
                        { label: "Akun Aktif",      value: stats.active,   color: "#15803d", bg: "#dcfce7", icon: UserCheck },
                        {
                            label: "Menunggu ACC",
                            value: pendingBadge,
                            color: pendingBadge > 0 ? "#b45309" : "#64748b",
                            bg:    pendingBadge > 0 ? "#fef3c7" : "#f1f5f9",
                            icon: Clock,
                            pulse: pendingBadge > 0,
                        },
                        { label: "Nonaktif/Ditolak",value: stats.inactive, color: "#b91c1c", bg: "#fee2e2", icon: UserX },
                    ].map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <div key={i} style={{
                                background: "#fff", borderRadius: "16px", padding: "18px 20px",
                                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                                border: s.pulse ? "1.5px solid #fde68a" : "1px solid #f1f5f9",
                                display: "flex", alignItems: "center", gap: "14px",
                            }}>
                                <div style={{
                                    width: "42px", height: "42px", borderRadius: "11px", background: s.bg,
                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                }}>
                                    <Icon size={20} color={s.color} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <div style={{ fontSize: "24px", fontWeight: "900", color: s.color, lineHeight: 1 }}>
                                        {s.pulse && s.value > 0 ? (
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                                {s.value}
                                                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b", display: "inline-block", animation: "slideIn 1s ease infinite alternate" }} />
                                            </span>
                                        ) : s.value}
                                    </div>
                                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", marginTop: "3px" }}>{s.label}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── PENDING APPROVAL ALERT ──────────────────────────────── */}
                {pendingBadge > 0 && (
                    <div style={{
                        background: "linear-gradient(135deg,#fffbeb,#fef3c7)",
                        border: "1.5px solid #fde68a",
                        borderRadius: "14px",
                        padding: "14px 18px",
                        marginBottom: "20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                    }}>
                        <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#fef08a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Clock size={20} color="#b45309" strokeWidth={2.5} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontWeight: "900", fontSize: "13.5px", color: "#92400e" }}>
                                {pendingBadge} akun menunggu persetujuan HSE Admin
                            </p>
                            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#b45309" }}>
                                Tinjau dan ACC/Tolak permintaan akun baru di tab <strong>"Menunggu ACC"</strong> di bawah.
                            </p>
                        </div>
                        <button
                            onClick={() => setActiveTab("pending")}
                            style={{
                                padding: "8px 16px", borderRadius: "9px", border: "none",
                                background: "#b45309", color: "#fff", fontSize: "12px", fontWeight: "800", cursor: "pointer",
                            }}
                        >
                            Lihat Sekarang
                        </button>
                    </div>
                )}

                {/* ── FILTER & SEARCH ─────────────────────────────────────── */}
                <div style={{
                    background: "#fff", borderRadius: "16px", padding: "16px 20px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", marginBottom: "16px",
                    display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
                }}>
                    {/* Tabs */}
                    <div style={{ display: "flex", gap: "4px", background: "#f8fafc", borderRadius: "12px", padding: "4px", flexWrap: "wrap" }}>
                        {[
                            { key: "all",      label: "Semua", count: stats.total },
                            { key: "active",   label: "Aktif", count: stats.active },
                            { key: "pending",  label: "Menunggu ACC", count: pendingBadge },
                            { key: "inactive", label: "Nonaktif/Ditolak", count: stats.inactive },
                        ].map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={tabBtn(tab.key)}>
                                {tab.label}
                                <span style={{
                                    padding: "1px 7px", borderRadius: "10px", fontSize: "10px", fontWeight: "900",
                                    background: activeTab === tab.key ? "rgba(255,255,255,0.2)" : "#e2e8f0",
                                    color: activeTab === tab.key ? "#fff" : "#64748b",
                                }}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
                        <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Cari nama, email, atau rig..."
                            style={{
                                width: "100%", padding: "9px 13px 9px 36px",
                                borderRadius: "10px", border: "1.5px solid #e2e8f0",
                                fontSize: "13px", boxSizing: "border-box", outline: "none",
                            }}
                        />
                    </div>

                    <div style={{ position: "relative" }}>
                        <Filter size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ padding: "9px 32px 9px 30px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "13px", outline: "none", appearance: "none", background: "#f8fafc", fontFamily: "inherit", cursor: "pointer" }}>
                            <option value="all">Semua Role</option>
                            <option value="admin">Admin</option>
                            <option value="user">Field User</option>
                        </select>
                        <ChevronDown size={14} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                    </div>
                </div>

                {/* ── TABLE ───────────────────────────────────────────────── */}
                <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "linear-gradient(135deg,#f8fafc,#f1f5f9)", borderBottom: "2px solid #e2e8f0" }}>
                                {["No", "Pengguna", "Role", "Rig Ditugaskan", "Status", "Aksi"].map(h => (
                                    <th key={h} style={{ padding: "13px 14px", textAlign: "left", fontSize: "11px", fontWeight: "900", color: "#374151", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: "48px", color: "#94a3b8", fontSize: "14px", fontWeight: "600" }}>
                                        <Users size={32} style={{ margin: "0 auto 8px", display: "block", opacity: 0.3 }} />
                                        Tidak ada pengguna ditemukan.
                                    </td>
                                </tr>
                            ) : filtered.map((u, idx) => {
                                const isPending  = (u.status || "").toLowerCase() === "pending";
                                const isRejected = (u.status || "").toLowerCase() === "rejected";
                                const isMe       = u.id === currentUser?.id;
                                return (
                                    <tr key={u.id} style={{
                                        borderBottom: "1px solid #f8fafc",
                                        background: isPending ? "rgba(254,243,199,0.4)" : "transparent",
                                        transition: "background 0.15s",
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = isPending ? "rgba(254,243,199,0.7)" : "#f8fafc"}
                                        onMouseLeave={e => e.currentTarget.style.background = isPending ? "rgba(254,243,199,0.4)" : "transparent"}
                                    >
                                        <td style={{ padding: "13px 14px", fontSize: "12px", fontWeight: "700", color: "#94a3b8" }}>{idx + 1}</td>

                                        <td style={{ padding: "13px 14px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <div style={{
                                                    width: "34px", height: "34px", borderRadius: "9px",
                                                    background: isPending ? "#fef3c7" : isRejected ? "#f3e8ff" : u.role === "admin" ? "#dbeafe" : "#dcfce7",
                                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                                    fontSize: "13px", fontWeight: "900",
                                                    color: isPending ? "#b45309" : isRejected ? "#7c3aed" : u.role === "admin" ? "#1d4ed8" : "#15803d",
                                                }}>
                                                    {isPending ? <Clock size={15} /> : u.name?.[0]?.toUpperCase() || "?"}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                                                        {u.name}
                                                        {isMe && <span style={{ padding: "1px 7px", borderRadius: "8px", background: "#dbeafe", color: "#1d4ed8", fontSize: "9px", fontWeight: "900" }}>ANDA</span>}
                                                    </div>
                                                    <div style={{ fontSize: "11.5px", color: "#94a3b8", fontWeight: "500" }}>{u.email}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td style={{ padding: "13px 14px" }}><RoleBadge role={u.role} /></td>

                                        <td style={{ padding: "13px 14px", fontSize: "12px", color: "#475569", fontWeight: "600" }}>
                                            {u.rig ? (
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "8px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", fontSize: "11px", fontWeight: "800" }}>
                                                    <HardHat size={11} /> {u.rig.code}
                                                </span>
                                            ) : (
                                                <span style={{ color: "#cbd5e1", fontSize: "11px", fontStyle: "italic" }}>—</span>
                                            )}
                                        </td>

                                        <td style={{ padding: "13px 14px" }}><StatusBadge status={u.status} /></td>

                                        <td style={{ padding: "13px 14px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                                {/* ── PENDING: Tampilkan tombol ACC & Tolak ── */}
                                                {isPending ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(u)}
                                                            disabled={processing}
                                                            title="ACC — Setujui akun ini"
                                                            style={{
                                                                display: "inline-flex", alignItems: "center", gap: "5px",
                                                                padding: "6px 12px", borderRadius: "8px", border: "none",
                                                                background: "linear-gradient(135deg,#059669,#10b981)",
                                                                color: "#fff", fontSize: "11.5px", fontWeight: "800",
                                                                cursor: processing ? "not-allowed" : "pointer",
                                                                boxShadow: "0 2px 8px rgba(16,185,129,0.35)",
                                                            }}
                                                        >
                                                            <ShieldCheck size={13} />
                                                            ACC
                                                        </button>
                                                        <button
                                                            onClick={() => setRejectUser(u)}
                                                            title="Tolak permintaan akun"
                                                            style={{
                                                                display: "inline-flex", alignItems: "center", gap: "5px",
                                                                padding: "6px 12px", borderRadius: "8px", border: "none",
                                                                background: "linear-gradient(135deg,#dc2626,#ef4444)",
                                                                color: "#fff", fontSize: "11.5px", fontWeight: "800",
                                                                cursor: "pointer",
                                                                boxShadow: "0 2px 8px rgba(220,38,38,0.3)",
                                                            }}
                                                        >
                                                            <XCircle size={13} />
                                                            Tolak
                                                        </button>
                                                    </>
                                                ) : (
                                                    /* ── NON-PENDING: Toggle aktif/nonaktif ── */
                                                    !isMe && !isRejected && (
                                                        <button
                                                            onClick={() => handleToggle(u)}
                                                            title={(u.status || "").toLowerCase() === "active" ? "Nonaktifkan" : "Aktifkan"}
                                                            style={{
                                                                width: "28px", height: "28px", borderRadius: "7px",
                                                                border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                                                background: (u.status || "").toLowerCase() === "active" ? "#fef3c7" : "#dcfce7",
                                                                color: (u.status || "").toLowerCase() === "active" ? "#b45309" : "#15803d",
                                                            }}
                                                        >
                                                            <RefreshCw size={13} />
                                                        </button>
                                                    )
                                                )}

                                                {/* Edit */}
                                                <button
                                                    onClick={() => setEditUser(u)}
                                                    title="Edit"
                                                    style={{ width: "28px", height: "28px", borderRadius: "7px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: "#dbeafe", color: "#1d4ed8" }}
                                                >
                                                    <Edit2 size={13} />
                                                </button>

                                                {/* Hapus */}
                                                {!isMe && (
                                                    <button
                                                        onClick={() => setDeleteUser(u)}
                                                        title="Hapus"
                                                        style={{ width: "28px", height: "28px", borderRadius: "7px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: "#fee2e2", color: "#dc2626" }}
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Table footer */}
                    <div style={{ padding: "12px 20px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>
                            Menampilkan {filtered.length} dari {userList.length} pengguna
                        </span>
                        {pendingBadge > 0 && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11.5px", color: "#b45309", fontWeight: "800" }}>
                                <Clock size={13} />
                                {pendingBadge} akun menunggu persetujuan
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}