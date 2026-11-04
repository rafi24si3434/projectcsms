import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    Settings,
    User,
    Lock,
    Server,
    Save,
    CheckCircle2,
    AlertCircle,
    KeyRound,
} from "lucide-react";

export default function SettingsPage({
    currentUser = {
        name: "HSE Administrator",
        email: "admin@besmindo.com",
        role: "admin",
        status: "active",
        created_at: "-",
    },
    systemInfo = {
        appName: "Besmindo HSE Portal",
        companyName: "PT BESMINDO MATERI SEWATAMA",
        appVersion: "v2.4.0 (Enterprise)",
        environment: "local",
        phpVersion: "8.3",
        database: "mysql (besmindo_hse)",
        emailNotification: true,
        autoBackup: true,
    },
}) {
    const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'password' | 'system'
    const [hoveredTab, setHoveredTab] = useState(null);

    // Form Profile (Nama Lengkap)
    const [profileForm, setProfileForm] = useState({
        name: currentUser.name || "",
    });

    // Form Password
    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState({ type: "", text: "" });

    const showNotif = (type, text) => {
        setNotification({ type, text });
        setTimeout(() => setNotification({ type: "", text: "" }), 3500);
    };

    const getCsrfToken = () => {
        return (
            document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        );
    };

    // Handle Profile Update (hanya nama lengkap)
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!profileForm.name.trim()) {
            showNotif("error", "Nama lengkap wajib diisi.");
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch("/admin/settings/profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": getCsrfToken(),
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "same-origin",
                body: JSON.stringify({ name: profileForm.name }),
            });

            const result = await response.json();

            if (!response.ok) {
                showNotif("error", result.message || "Gagal memperbarui profil.");
                return;
            }

            showNotif("success", result.message || "Profil berhasil diperbarui!");
        } catch (error) {
            console.error("Error updating profile:", error);
            showNotif("error", "Terjadi kendala saat menghubungkan ke server.");
        } finally {
            setIsSaving(false);
        }
    };

    // Handle Password Update
    const handleSavePassword = async (e) => {
        e.preventDefault();
        if (!passwordForm.current_password || !passwordForm.password) {
            showNotif("error", "Silakan lengkapi seluruh kolom kata sandi.");
            return;
        }
        if (passwordForm.password.length < 6) {
            showNotif("error", "Kata sandi baru minimal 6 karakter.");
            return;
        }
        if (passwordForm.password !== passwordForm.password_confirmation) {
            showNotif("error", "Konfirmasi kata sandi baru tidak sesuai.");
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch("/admin/settings/password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": getCsrfToken(),
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "same-origin",
                body: JSON.stringify(passwordForm),
            });

            const result = await response.json();

            if (!response.ok) {
                showNotif("error", result.message || "Gagal memperbarui kata sandi.");
                return;
            }

            setPasswordForm({
                current_password: "",
                password: "",
                password_confirmation: "",
            });
            showNotif("success", result.message || "Kata sandi berhasil diperbarui!");
        } catch (error) {
            console.error("Error updating password:", error);
            showNotif("error", "Terjadi kendala saat memperbarui kata sandi.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AdminLayout>
            <Head title="Pengaturan Sistem — Portal HSE CSMS" />

            <div style={{ padding: "28px 32px 60px", maxWidth: "1280px", margin: "0 auto", fontFamily: "'Instrument Sans', -apple-system, sans-serif" }}>
                {/* 1. PORTAL HEADER CARD (DENGAN AKSEN K3) */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs relative overflow-hidden mb-6">
                    {/* Garis Aksen K3 Emerald Pekat di bagian atas card */}
                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            {/* Badge Pill Atas */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                                <Settings size={14} className="text-emerald-700" />
                                <span>KONFIGURASI SISTEM &amp; KEAMANAN</span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                                Pengaturan Sistem
                            </h1>
                            <p className="text-slate-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
                                Kelola profil akun admin, pembaruan kata sandi keamanan, dan pantau status koneksi server aplikasi.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shrink-0">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Server Online &amp; Terhubung</span>
                        </div>
                    </div>
                </div>

                {/* NOTIFICATION BANNER */}
                    {notification.text && (
                        <div
                            style={{
                                backgroundColor: notification.type === "success" ? "#ecfdf5" : "#fee2e2",
                                border: `1px solid ${notification.type === "success" ? "#a7f3d0" : "#f87171"}`,
                                borderRadius: "10px",
                                padding: "12px 18px",
                                marginBottom: "20px",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                color: notification.type === "success" ? "#065f46" : "#991b1b",
                                fontSize: "13px",
                                fontWeight: "700",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                            }}
                        >
                            {notification.type === "success" ? (
                                <CheckCircle2 size={18} color="#059669" />
                            ) : (
                                <AlertCircle size={18} color="#dc2626" />
                            )}
                            <span>{notification.text}</span>
                        </div>
                    )}

                    {/* HERO CARD */}
                    <div
                        style={{
                            background: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
                            borderRadius: "16px",
                            padding: "24px 28px",
                            color: "#ffffff",
                            marginBottom: "24px",
                            boxShadow: "0 10px 25px rgba(6,78,59,0.25)",
                            border: "1px solid rgba(52,211,153,0.3)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "16px",
                        }}
                    >
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                                <span
                                    style={{
                                        padding: "3px 8px",
                                        borderRadius: "4px",
                                        backgroundColor: "rgba(16,185,129,0.2)",
                                        border: "1px solid #34d399",
                                        color: "#6ee7b7",
                                        fontSize: "11px",
                                        fontWeight: "800",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    Control Panel
                                </span>
                                <span style={{ color: "#a7f3d0", fontSize: "12px", fontWeight: "600" }}>
                                    PT BESMINDO MATERI SEWATAMA
                                </span>
                            </div>
                            <h1 style={{ margin: "0 0 6px", fontSize: "22px", fontWeight: "900" }}>
                                Pusat Pengaturan Sistem & Profil
                            </h1>
                            <p style={{ margin: 0, color: "#d1fae5", fontSize: "13px" }}>
                                Kelola identitas akun Anda, keamanan kata sandi, serta konfigurasi operasional aplikasi HSE.
                            </p>
                        </div>

                        {/* PROFILE BADGE */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                backgroundColor: "rgba(0,0,0,0.2)",
                                border: "1px solid rgba(52,211,153,0.35)",
                                padding: "10px 16px",
                                borderRadius: "12px",
                            }}
                        >
                            <div
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "50%",
                                    backgroundColor: "#10b981",
                                    color: "#ffffff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "900",
                                    fontSize: "15px",
                                    boxShadow: "0 0 10px rgba(16,185,129,0.4)",
                                }}
                            >
                                {(currentUser.name || "A").charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontSize: "13px", fontWeight: "800", color: "#ffffff" }}>
                                    {currentUser.name}
                                </div>
                                <div style={{ fontSize: "11.5px", color: "#a7f3d0", fontWeight: "700" }}>
                                    Role: {currentUser.role ? currentUser.role.toUpperCase() : "ADMIN"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SETTING TABS */}
                    <div
                        style={{
                            display: "flex",
                            gap: "8px",
                            marginBottom: "20px",
                            borderBottom: "1px solid #cbd5e1",
                            paddingBottom: "10px",
                        }}
                    >
                        {[
                            { id: "profile", label: "Profil Administrator", icon: User },
                            { id: "password", label: "Keamanan & Kata Sandi", icon: KeyRound },
                            { id: "system", label: "Informasi & Parameter Sistem", icon: Server },
                        ].map((tab) => {
                            const TabIcon = tab.icon;
                            const isActive = activeTab === tab.id;
                            const isHovered = hoveredTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    onMouseEnter={() => setHoveredTab(tab.id)}
                                    onMouseLeave={() => setHoveredTab(null)}
                                    style={{
                                        padding: "9px 18px",
                                        borderRadius: "8px",
                                        border: isActive
                                            ? "1px solid #059669"
                                            : isHovered
                                            ? "1px solid #a7f3d0"
                                            : "1px solid #e2e8f0",
                                        background: isActive
                                            ? "linear-gradient(135deg, #22c55e 0%, #059669 45%, #064e3b 100%)"
                                            : isHovered
                                            ? "#f0fdf4"
                                            : "#ffffff",
                                        color: isActive
                                            ? "#ffffff"
                                            : isHovered
                                            ? "#065f46"
                                            : "#475569",
                                        fontSize: "13px",
                                        fontWeight: "800",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        transition: "all 0.2s ease",
                                        boxShadow: isActive ? "0 4px 12px rgba(5,150,105,0.25)" : "none",
                                    }}
                                >
                                    <TabIcon size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* TAB CONTENT 1: PROFIL */}
                    {activeTab === "profile" && (
                        <div
                            style={{
                                backgroundColor: "#ffffff",
                                borderRadius: "14px",
                                border: "1px solid #e2e8f0",
                                padding: "28px",
                                boxShadow: "0 4px 18px rgba(0,0,0,0.03)",
                            }}
                        >
                            <div style={{ marginBottom: "20px" }}>
                                <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                                    Informasi Profil Pengguna
                                </h3>
                                <p style={{ margin: 0, color: "#64748b", fontSize: "12.5px" }}>
                                    Perbarui nama lengkap akun resmi Anda yang terdaftar pada sistem portal HSE Besmindo.
                                </p>
                            </div>

                            <form onSubmit={handleSaveProfile}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "20px" }}>
                                    <div style={{ gridColumn: "1 / -1" }}>
                                        <label style={labelStyle}>Nama Lengkap</label>
                                        <input
                                            type="text"
                                            value={profileForm.name}
                                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                            placeholder="Nama lengkap"
                                            required
                                            style={inputStyle}
                                        />
                                    </div>

                                    <div>
                                        <label style={labelStyle}>Peran Pengguna (Role)</label>
                                        <input
                                            type="text"
                                            value={currentUser.role === "admin" ? "HSE Administrator (Full Access)" : "Field User / PIC Lapangan"}
                                            disabled
                                            style={{ ...inputStyle, backgroundColor: "#f1f5f9", cursor: "not-allowed", color: "#64748b" }}
                                        />
                                    </div>

                                    <div>
                                        <label style={labelStyle}>Tanggal Terdaftar</label>
                                        <input
                                            type="text"
                                            value={currentUser.created_at || "-"}
                                            disabled
                                            style={{ ...inputStyle, backgroundColor: "#f1f5f9", cursor: "not-allowed", color: "#64748b" }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        style={saveBtnStyle}
                                    >
                                        <Save size={15} />
                                        {isSaving ? "Menyimpan..." : "Simpan Perubahan Profil"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TAB CONTENT 2: PASSWORD */}
                    {activeTab === "password" && (
                        <div
                            style={{
                                backgroundColor: "#ffffff",
                                borderRadius: "14px",
                                border: "1px solid #e2e8f0",
                                padding: "28px",
                                boxShadow: "0 4px 18px rgba(0,0,0,0.03)",
                            }}
                        >
                            <div style={{ marginBottom: "20px" }}>
                                <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                                    Ganti Kata Sandi Akun
                                </h3>
                                <p style={{ margin: 0, color: "#64748b", fontSize: "12.5px" }}>
                                    Pastikan kata sandi baru Anda kuat dan tidak mudah ditebak oleh orang lain.
                                </p>
                            </div>

                            <form onSubmit={handleSavePassword}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "540px", marginBottom: "24px" }}>
                                    <div>
                                        <label style={labelStyle}>Kata Sandi Saat Ini</label>
                                        <input
                                            type="password"
                                            value={passwordForm.current_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                            placeholder="Masukkan kata sandi lama Anda"
                                            required
                                            style={inputStyle}
                                        />
                                    </div>

                                    <div>
                                        <label style={labelStyle}>Kata Sandi Baru</label>
                                        <input
                                            type="password"
                                            value={passwordForm.password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                                            placeholder="Minimal 6 karakter"
                                            required
                                            style={inputStyle}
                                        />
                                    </div>

                                    <div>
                                        <label style={labelStyle}>Konfirmasi Kata Sandi Baru</label>
                                        <input
                                            type="password"
                                            value={passwordForm.password_confirmation}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                                            placeholder="Ulangi kata sandi baru"
                                            required
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        style={saveBtnStyle}
                                    >
                                        <Lock size={15} />
                                        {isSaving ? "Memproses..." : "Perbarui Kata Sandi"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TAB CONTENT 3: SYSTEM INFO */}
                    {activeTab === "system" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {/* SYSTEM SPECS */}
                            <div
                                style={{
                                    backgroundColor: "#ffffff",
                                    borderRadius: "14px",
                                    border: "1px solid #e2e8f0",
                                    padding: "24px 28px",
                                    boxShadow: "0 4px 18px rgba(0,0,0,0.03)",
                                }}
                            >
                                <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                                    Informasi Server & Lingkungan Aplikasi
                                </h3>

                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
                                    <div style={infoBoxStyle}>
                                        <div style={infoLabel}>Nama Aplikasi</div>
                                        <div style={infoVal}>{systemInfo.appName}</div>
                                    </div>

                                    <div style={infoBoxStyle}>
                                        <div style={infoLabel}>Perusahaan</div>
                                        <div style={infoVal}>{systemInfo.companyName}</div>
                                    </div>

                                    <div style={infoBoxStyle}>
                                        <div style={infoLabel}>Versi Sistem</div>
                                        <div style={{ ...infoVal, color: "#059669", fontWeight: "900" }}>{systemInfo.appVersion}</div>
                                    </div>

                                    <div style={infoBoxStyle}>
                                        <div style={infoLabel}>Lingkungan (Environment)</div>
                                        <div style={{ ...infoVal, textTransform: "uppercase" }}>{systemInfo.environment}</div>
                                    </div>

                                    <div style={infoBoxStyle}>
                                        <div style={infoLabel}>Versi PHP Runtime</div>
                                        <div style={infoVal}>PHP {systemInfo.phpVersion}</div>
                                    </div>

                                    <div style={infoBoxStyle}>
                                        <div style={infoLabel}>Database Driver</div>
                                        <div style={infoVal}>{systemInfo.database}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
        </AdminLayout>
    );
}

const labelStyle = {
    display: "block",
    fontSize: "12.5px",
    fontWeight: "700",
    color: "#334155",
    marginBottom: "6px",
};

const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "13px",
    color: "#1e293b",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
};

const saveBtnStyle = {
    padding: "10px 22px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #22c55e 0%, #059669 45%, #064e3b 100%)",
    color: "#ffffff",
    fontWeight: "800",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 14px rgba(5,150,105,0.3)",
    transition: "all 0.2s ease",
};

const infoBoxStyle = {
    padding: "12px 14px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
};

const infoLabel = {
    fontSize: "11px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: "4px",
};

const infoVal = {
    fontSize: "13px",
    fontWeight: "800",
    color: "#1e293b",
};
