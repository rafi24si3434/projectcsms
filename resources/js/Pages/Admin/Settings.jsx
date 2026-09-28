import React, { useState } from "react";
import AdminSidebar from "../../Components/AdminSidebar";
import {
    Settings,
    User,
    Lock,
    Shield,
    Server,
    Save,
    CheckCircle2,
    AlertCircle,
    Building2,
    Mail,
    Bell,
    Database,
    Cpu,
    KeyRound,
    RefreshCw,
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

    // Form Profile
    const [profileForm, setProfileForm] = useState({
        name: currentUser.name || "",
        email: currentUser.email || "",
    });

    // Form Password
    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    // System Toggle Settings
    const [systemSettings, setSystemSettings] = useState({
        emailNotification: true,
        autoBackup: true,
        strictValidation: true,
        twoFactorAuth: false,
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

    // Handle Profile Update
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!profileForm.name.trim() || !profileForm.email.trim()) {
            showNotif("error", "Nama dan email wajib diisi.");
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
                body: JSON.stringify(profileForm),
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

    const handleToggleSystemSetting = (key) => {
        setSystemSettings((prev) => {
            const updated = { ...prev, [key]: !prev[key] };
            showNotif("success", `Pengaturan "${key}" berhasil diperbarui.`);
            return updated;
        });
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f4f7fb",
                fontFamily:
                    "'Instrument Sans', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
                color: "#102033",
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
                            <Settings size={18} strokeWidth={2.5} />
                        </div>
                        <span
                            style={{
                                fontSize: "16px",
                                fontWeight: "800",
                                color: "#004d32",
                                letterSpacing: "-0.01em",
                            }}
                        >
                            Pengaturan & Konfigurasi Sistem
                        </span>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 12px",
                            borderRadius: "20px",
                            backgroundColor: "#ecfdf5",
                            border: "1px solid #a7f3d0",
                            color: "#004d32",
                            fontSize: "12px",
                            fontWeight: "700",
                        }}
                    >
                        <span
                            style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor: "#10b981",
                                boxShadow: "0 0 6px #10b981",
                            }}
                        />
                        Server Online
                    </div>
                </header>

                {/* PAGE BODY */}
                <div style={{ padding: "28px 32px 60px", maxWidth: "1200px", margin: "0 auto" }}>
                    {/* NOTIFICATION BANNER */}
                    {notification.text && (
                        <div
                            style={{
                                backgroundColor: notification.type === "success" ? "#ecfdf5" : "#fee2e2",
                                border: `1px solid ${notification.type === "success" ? "#34d399" : "#f87171"}`,
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
                            backgroundColor: "#004d32",
                            borderRadius: "16px",
                            padding: "24px 28px",
                            color: "#ffffff",
                            marginBottom: "24px",
                            boxShadow: "0 10px 25px rgba(0, 77, 50, 0.15)",
                            border: "1px solid rgba(239, 255, 0, 0.3)",
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
                                        backgroundColor: "rgba(239, 255, 0, 0.2)",
                                        border: "1px solid #efff00",
                                        color: "#efff00",
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
                                backgroundColor: "rgba(0,0,0,0.25)",
                                border: "1px solid rgba(239, 255, 0, 0.3)",
                                padding: "10px 16px",
                                borderRadius: "12px",
                            }}
                        >
                            <div
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "50%",
                                    backgroundColor: "#efff00",
                                    color: "#004d32",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "900",
                                    fontSize: "15px",
                                }}
                            >
                                {(currentUser.name || "A").charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontSize: "13px", fontWeight: "800", color: "#ffffff" }}>
                                    {currentUser.name}
                                </div>
                                <div style={{ fontSize: "11.5px", color: "#efff00" }}>
                                    {currentUser.email} • Role: {currentUser.role?.toUpperCase()}
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
                        <button
                            onClick={() => setActiveTab("profile")}
                            style={{
                                padding: "9px 18px",
                                borderRadius: "8px",
                                border: activeTab === "profile" ? "1px solid #004d32" : "1px solid #e2e8f0",
                                backgroundColor: activeTab === "profile" ? "#004d32" : "#ffffff",
                                color: activeTab === "profile" ? "#efff00" : "#475569",
                                fontSize: "13px",
                                fontWeight: "800",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                transition: "all 0.2s ease",
                            }}
                        >
                            <User size={16} />
                            Profil Administrator
                        </button>

                        <button
                            onClick={() => setActiveTab("password")}
                            style={{
                                padding: "9px 18px",
                                borderRadius: "8px",
                                border: activeTab === "password" ? "1px solid #004d32" : "1px solid #e2e8f0",
                                backgroundColor: activeTab === "password" ? "#004d32" : "#ffffff",
                                color: activeTab === "password" ? "#efff00" : "#475569",
                                fontSize: "13px",
                                fontWeight: "800",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                transition: "all 0.2s ease",
                            }}
                        >
                            <KeyRound size={16} />
                            Keamanan & Kata Sandi
                        </button>

                        <button
                            onClick={() => setActiveTab("system")}
                            style={{
                                padding: "9px 18px",
                                borderRadius: "8px",
                                border: activeTab === "system" ? "1px solid #004d32" : "1px solid #e2e8f0",
                                backgroundColor: activeTab === "system" ? "#004d32" : "#ffffff",
                                color: activeTab === "system" ? "#efff00" : "#475569",
                                fontSize: "13px",
                                fontWeight: "800",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                transition: "all 0.2s ease",
                            }}
                        >
                            <Server size={16} />
                            Informasi & Parameter Sistem
                        </button>
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
                                <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: "800", color: "#004d32" }}>
                                    Informasi Profil Pengguna
                                </h3>
                                <p style={{ margin: 0, color: "#64748b", fontSize: "12.5px" }}>
                                    Perbarui nama lengkap dan alamat email resmi Anda yang terdaftar pada database MySQL.
                                </p>
                            </div>

                            <form onSubmit={handleSaveProfile}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "20px" }}>
                                    <div>
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
                                        <label style={labelStyle}>Alamat Email</label>
                                        <input
                                            type="email"
                                            value={profileForm.email}
                                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                            placeholder="email@besmindo.com"
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
                                <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: "800", color: "#004d32" }}>
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

                    {/* TAB CONTENT 3: SYSTEM INFO & TOGGLES */}
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
                                <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "800", color: "#004d32" }}>
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
                                        <div style={{ ...infoVal, color: "#004d32", fontWeight: "900" }}>{systemInfo.appVersion}</div>
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

                            {/* SYSTEM SWITCHES */}
                            <div
                                style={{
                                    backgroundColor: "#ffffff",
                                    borderRadius: "14px",
                                    border: "1px solid #e2e8f0",
                                    padding: "24px 28px",
                                    boxShadow: "0 4px 18px rgba(0,0,0,0.03)",
                                }}
                            >
                                <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "800", color: "#004d32" }}>
                                    Konfigurasi Operasional Portal
                                </h3>

                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    <div style={switchRowStyle}>
                                        <div>
                                            <div style={{ fontWeight: "800", fontSize: "13.5px", color: "#1e293b" }}>
                                                Notifikasi Email Otomatis untuk Approval
                                            </div>
                                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                                                Kirim email persetujuan instan kepada penanggung jawab saat kru lapangan mengirimkan laporan HSE.
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleToggleSystemSetting("emailNotification")}
                                            style={switchBtnStyle(systemSettings.emailNotification)}
                                        >
                                            {systemSettings.emailNotification ? "Aktif" : "Non-Aktif"}
                                        </button>
                                    </div>

                                    <div style={switchRowStyle}>
                                        <div>
                                            <div style={{ fontWeight: "800", fontSize: "13.5px", color: "#1e293b" }}>
                                                Validasi Ketat Matriks KPI per Rig
                                            </div>
                                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                                                Memastikan seluruh angka 15 lagging dan 19 leading indikator terisi lengkap sebelum dikirim ke database.
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleToggleSystemSetting("strictValidation")}
                                            style={switchBtnStyle(systemSettings.strictValidation)}
                                        >
                                            {systemSettings.strictValidation ? "Aktif" : "Non-Aktif"}
                                        </button>
                                    </div>

                                    <div style={switchRowStyle}>
                                        <div>
                                            <div style={{ fontWeight: "800", fontSize: "13.5px", color: "#1e293b" }}>
                                                Auto Database Backup Sync (MySQL)
                                            </div>
                                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                                                Mencadangkan data penginputan dan histori audit approval secara berkala ke penyimpanan server.
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleToggleSystemSetting("autoBackup")}
                                            style={switchBtnStyle(systemSettings.autoBackup)}
                                        >
                                            {systemSettings.autoBackup ? "Aktif" : "Non-Aktif"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
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
    border: "1px solid #efff00",
    backgroundColor: "#004d32",
    color: "#efff00",
    fontWeight: "800",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 0 10px rgba(239, 255, 0, 0.25)",
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

const switchRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    backgroundColor: "#f8fafc",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
};

const switchBtnStyle = (isActive) => ({
    padding: "6px 14px",
    borderRadius: "20px",
    border: isActive ? "1px solid #a7f3d0" : "1px solid #cbd5e1",
    backgroundColor: isActive ? "#004d32" : "#f1f5f9",
    color: isActive ? "#efff00" : "#64748b",
    fontSize: "12px",
    fontWeight: "800",
    cursor: "pointer",
    transition: "all 0.2s ease",
});
