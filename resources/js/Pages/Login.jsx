import React, { useState } from "react";
import { useForm, Head, Link } from "@inertiajs/react";
import {
    ShieldCheck,
    ClipboardList,
    Lock,
    Mail,
    Eye,
    EyeOff,
    CheckCircle2,
    ArrowRight,
    Activity,
    AlertTriangle,
    HardHat,
} from "lucide-react";

export default function Login({ status }) {
    const [selectedRole, setSelectedRole] = useState("admin"); // "admin" | "user"
    const [showPassword, setShowPassword] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: "admin@besmindo.com",
        password: "password",
        role: "admin",
        remember: true,
    });

    const [selectedRigPreset, setSelectedRigPreset] = useState("bms01");

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        if (role === "admin") {
            setData({
                email: "admin@besmindo.com",
                password: "password",
                role: "admin",
                remember: true,
            });
        } else {
            setData({
                email: "bms01@besmindo.com",
                password: "password",
                role: "user",
                remember: true,
            });
        }
    };

    const selectRigPreset = (email, key) => {
        setSelectedRigPreset(key);
        setData({
            email: email,
            password: "password",
            role: "user",
            remember: true,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/login", {
            onFinish: () => reset("password"),
        });
    };

    return (
        <>
            <Head title="Portal HSE & CSMS - PT Besmindo Materi Sewatama" />

            <div
                style={{
                    height: "100vh",
                    backgroundColor: "#f4f7f6",
                    backgroundImage: `
                        radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16, 185, 129, 0.15), transparent 70%),
                        radial-gradient(circle at 15% 85%, rgba(245, 158, 11, 0.1) 0%, transparent 45%),
                        linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)
                    `,
                    fontFamily:
                        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 16px",
                    boxSizing: "border-box",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* DECORATIVE SAFETY ACCENTS */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "6px",
                        background:
                            "repeating-linear-gradient(45deg, #f59e0b, #f59e0b 20px, #1e293b 20px, #1e293b 40px)",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                        zIndex: 20,
                    }}
                />

                <div
                    style={{
                        position: "absolute",
                        top: "-120px",
                        right: "-100px",
                        width: "500px",
                        height: "500px",
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }}
                />

                {/* MAIN CONTAINER */}
                <div
                    style={{
                        width: "100%",
                        maxWidth: "460px",
                        zIndex: 10,
                        position: "relative",
                    }}
                >
                    {/* BRANDING HEADER */}
                    <div style={{ textAlign: "center", marginBottom: "16px" }}>
                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                maxWidth: "380px",
                                padding: "12px 16px",
                                borderRadius: "16px",
                                backgroundColor: "#ffffff",
                                border: "1px solid rgba(16, 185, 129, 0.2)",
                                boxShadow:
                                    "0 6px 20px rgba(0, 0, 0, 0.05)",
                                marginBottom: "14px",
                                boxSizing: "border-box",
                            }}
                        >
                            <img
                                src="/images/logo-besmindo.png"
                                alt="PT BESMINDO MATERI SEWATAMA"
                                style={{
                                    height: "auto",
                                    maxHeight: "60px",
                                    width: "100%",
                                    maxWidth: "280px",
                                    objectFit: "contain",
                                    display: "block",
                                    imageRendering: "auto",
                                }}
                            />
                        </div>

                        <div>
                            <div
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "6px 16px",
                                    borderRadius: "24px",
                                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                                    border: "1px solid rgba(16, 185, 129, 0.3)",
                                    color: "#059669",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    letterSpacing: "0.05em",
                                    textTransform: "uppercase",
                                }}
                            >
                                <HardHat size={14} />
                                Safety First - Zero Accident
                            </div>
                            <p
                                style={{
                                    marginTop: "6px",
                                    color: "#64748b",
                                    fontSize: "13px",
                                    fontWeight: "500",
                                }}
                            >
                                Sistem Informasi Terpadu K3 & Manajemen Kontraktor
                            </p>
                        </div>
                    </div>

                    {/* LOGIN CARD - CLEAN NEUMORPHIC / K3 THEME */}
                    <div
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "20px",
                            padding: "24px 28px",
                            boxShadow:
                                "0 20px 40px -15px rgba(0, 0, 0, 0.05), 0 0 25px rgba(16, 185, 129, 0.05)",
                            border: "1px solid #e2e8f0",
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        {/* TOP GREEN ACCENT LINE */}
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                height: "4px",
                                background:
                                    "linear-gradient(90deg, #10b981 0%, #34d399 50%, #f59e0b 100%)",
                            }}
                        />

                        {/* ROLE SELECTOR TITLE */}
                        <div style={{ marginBottom: "16px" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "11.5px",
                                    fontWeight: "700",
                                    color: "#475569",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    marginBottom: "10px",
                                }}
                            >
                                Masuk Sebagai
                            </label>

                            {/* 2 ROLE SELECTOR TABS */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "10px",
                                }}
                            >
                                {/* TAB 1: ADMIN */}
                                <button
                                    type="button"
                                    onClick={() => handleRoleSelect("admin")}
                                    style={{
                                        padding: "10px",
                                        borderRadius: "12px",
                                        border:
                                            selectedRole === "admin"
                                                ? "2px solid #10b981"
                                                : "1px solid #e2e8f0",
                                        backgroundColor:
                                            selectedRole === "admin"
                                                ? "#ecfdf5"
                                                : "#ffffff",
                                        color:
                                            selectedRole === "admin"
                                                ? "#065f46"
                                                : "#64748b",
                                        cursor: "pointer",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "4px",
                                        boxShadow:
                                            selectedRole === "admin"
                                                ? "0 4px 12px rgba(16, 185, 129, 0.15)"
                                                : "none",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            fontWeight: "700",
                                            fontSize: "12.5px",
                                        }}
                                    >
                                        <ShieldCheck
                                            size={16}
                                            color={
                                                selectedRole === "admin"
                                                    ? "#10b981"
                                                    : "#94a3b8"
                                            }
                                        />
                                        HSE Admin
                                    </div>
                                    <span
                                        style={{
                                            fontSize: "10.5px",
                                            color:
                                                selectedRole === "admin"
                                                    ? "#047857"
                                                    : "#94a3b8",
                                            fontWeight: "500",
                                        }}
                                    >
                                        Validator & Pengawas
                                    </span>
                                </button>

                                {/* TAB 2: FIELD USER */}
                                <button
                                    type="button"
                                    onClick={() => handleRoleSelect("user")}
                                    style={{
                                        padding: "10px",
                                        borderRadius: "12px",
                                        border:
                                            selectedRole === "user"
                                                ? "2px solid #10b981"
                                                : "1px solid #e2e8f0",
                                        backgroundColor:
                                            selectedRole === "user"
                                                ? "#ecfdf5"
                                                : "#ffffff",
                                        color:
                                            selectedRole === "user"
                                                ? "#065f46"
                                                : "#64748b",
                                        cursor: "pointer",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "4px",
                                        boxShadow:
                                            selectedRole === "user"
                                                ? "0 4px 12px rgba(16, 185, 129, 0.15)"
                                                : "none",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            fontWeight: "700",
                                            fontSize: "12.5px",
                                        }}
                                    >
                                        <Activity
                                            size={16}
                                            color={
                                                selectedRole === "user"
                                                    ? "#10b981"
                                                    : "#94a3b8"
                                            }
                                        />
                                        HSE Officer
                                    </div>
                                    <span
                                        style={{
                                            fontSize: "10.5px",
                                            color:
                                                selectedRole === "user"
                                                    ? "#047857"
                                                    : "#94a3b8",
                                            fontWeight: "500",
                                        }}
                                    >
                                        Pelapor Data Rig
                                    </span>
                                </button>
                            </div>

                            {/* PRESET PILIHAN RIG UNTUK USER */}
                            {selectedRole === "user" && (
                                <div style={{ marginTop: "10px", padding: "8px 10px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                    <div style={{ fontSize: "10.5px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                                        Pilih Akun Rig Lapangan:
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                                        {[
                                            { key: "bms01", label: "RIG BMS 01", email: "bms01@besmindo.com" },
                                            { key: "bms02", label: "RIG BMS 02", email: "bms02@besmindo.com" },
                                            { key: "bms03", label: "RIG BMS 03", email: "bms03@besmindo.com" },
                                        ].map((item) => (
                                            <button
                                                key={item.key}
                                                type="button"
                                                onClick={() => selectRigPreset(item.email, item.key)}
                                                style={{
                                                    padding: "6px 4px",
                                                    fontSize: "11px",
                                                    fontWeight: "700",
                                                    borderRadius: "8px",
                                                    border: selectedRigPreset === item.key ? "1.5px solid #10b981" : "1px solid #cbd5e1",
                                                    backgroundColor: selectedRigPreset === item.key ? "#ecfdf5" : "#ffffff",
                                                    color: selectedRigPreset === item.key ? "#047857" : "#475569",
                                                    cursor: "pointer",
                                                    transition: "all 0.15s ease",
                                                }}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* SUCCESS STATUS ALERT */}
                        {status && (
                            <div
                                style={{
                                    backgroundColor: "#ecfdf5",
                                    border: "1px solid #a7f3d0",
                                    borderRadius: "8px",
                                    padding: "8px 12px",
                                    marginBottom: "14px",
                                    color: "#059669",
                                    fontSize: "12.5px",
                                    fontWeight: "600",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <CheckCircle2 size={16} />
                                <span>{status}</span>
                            </div>
                        )}

                        {/* ERROR ALERT */}
                        {errors.email && (
                            <div
                                style={{
                                    backgroundColor: "#fef2f2",
                                    border: "1px solid #fecaca",
                                    borderRadius: "8px",
                                    padding: "8px 12px",
                                    marginBottom: "14px",
                                    color: "#dc2626",
                                    fontSize: "12.5px",
                                    fontWeight: "600",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <AlertTriangle size={16} />
                                <span>{errors.email}</span>
                            </div>
                        )}

                        {/* FORM */}
                        <form onSubmit={handleSubmit}>
                            {/* EMAIL FIELD */}
                            <div style={{ marginBottom: "14px" }}>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "12.5px",
                                        fontWeight: "600",
                                        color: "#334155",
                                        marginBottom: "6px",
                                    }}
                                >
                                    Alamat Email / ID Pegawai
                                </label>
                                <div
                                    style={{
                                        position: "relative",
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: "14px",
                                            color:
                                                focusedInput === "email"
                                                    ? "#10b981"
                                                    : "#94a3b8",
                                            display: "flex",
                                            alignItems: "center",
                                            transition: "color 0.2s",
                                        }}
                                    >
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={data.email}
                                        onFocus={() => setFocusedInput("email")}
                                        onBlur={() => setFocusedInput(null)}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        placeholder="nama@besmindo.com"
                                        style={{
                                            width: "100%",
                                            height: "44px",
                                            padding: "0 14px 0 40px",
                                            borderRadius: "10px",
                                            border:
                                                focusedInput === "email"
                                                    ? "2px solid #10b981"
                                                    : "1px solid #cbd5e1",
                                            boxShadow:
                                                focusedInput === "email"
                                                    ? "0 0 0 3px rgba(16, 185, 129, 0.1)"
                                                    : "none",
                                            outline: "none",
                                            fontSize: "13.5px",
                                            color: "#0f172a",
                                            backgroundColor: "#f8fafc",
                                            boxSizing: "border-box",
                                            transition: "all 0.2s ease",
                                        }}
                                    />
                                </div>
                            </div>

                            {/* PASSWORD FIELD */}
                            <div style={{ marginBottom: "16px" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "6px",
                                    }}
                                >
                                    <label
                                        style={{
                                            fontSize: "12.5px",
                                            fontWeight: "600",
                                            color: "#334155",
                                        }}
                                    >
                                        Kata Sandi (Password)
                                    </label>
                                    <Link
                                        href="/forgot-password"
                                        style={{
                                            fontSize: "12px",
                                            color: "#10b981",
                                            fontWeight: "600",
                                            textDecoration: "none",
                                            transition: "color 0.15s ease",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color =
                                                "#059669";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color =
                                                "#10b981";
                                        }}
                                    >
                                        Lupa kata sandi?
                                    </Link>
                                </div>
                                <div
                                    style={{
                                        position: "relative",
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: "14px",
                                            color:
                                                focusedInput === "password"
                                                    ? "#10b981"
                                                    : "#94a3b8",
                                            display: "flex",
                                            alignItems: "center",
                                            transition: "color 0.2s",
                                        }}
                                    >
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        required
                                        value={data.password}
                                        onFocus={() =>
                                            setFocusedInput("password")
                                        }
                                        onBlur={() => setFocusedInput(null)}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        placeholder="Masukkan kata sandi aman..."
                                        style={{
                                            width: "100%",
                                            height: "44px",
                                            padding: "0 40px 0 40px",
                                            borderRadius: "10px",
                                            border:
                                                focusedInput === "password"
                                                    ? "2px solid #10b981"
                                                    : "1px solid #cbd5e1",
                                            boxShadow:
                                                focusedInput === "password"
                                                    ? "0 0 0 3px rgba(16, 185, 129, 0.1)"
                                                    : "none",
                                            outline: "none",
                                            fontSize: "13.5px",
                                            color: "#0f172a",
                                            backgroundColor: "#f8fafc",
                                            boxSizing: "border-box",
                                            transition: "all 0.2s ease",
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        style={{
                                            position: "absolute",
                                            right: "14px",
                                            background: "none",
                                            border: "none",
                                            color: "#94a3b8",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        {showPassword ? (
                                            <EyeOff size={16} />
                                        ) : (
                                            <Eye size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* REMEMBER ME & ROLE HINT */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: "18px",
                                    fontSize: "12.5px",
                                }}
                            >
                                <label
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        color: "#475569",
                                        cursor: "pointer",
                                        fontWeight: "500",
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) =>
                                            setData(
                                                "remember",
                                                e.target.checked,
                                            )
                                        }
                                        style={{
                                            accentColor: "#10b981",
                                            width: "14px",
                                            height: "14px",
                                        }}
                                    />
                                    Ingat sesi masuk
                                </label>

                                <span
                                    style={{
                                        fontSize: "11.5px",
                                        color: "#f59e0b",
                                        fontWeight: "700",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                    }}
                                >
                                    <ClipboardList size={13} />
                                    {selectedRole === "admin"
                                        ? "Akses Approval HSE"
                                        : "Akses Pelaporan K3"}
                                </span>
                            </div>

                            {/* SUBMIT BUTTON */}
                            <button
                                type="submit"
                                disabled={processing}
                                style={{
                                    width: "100%",
                                    height: "46px",
                                    borderRadius: "10px",
                                    background:
                                        "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                    color: "#ffffff",
                                    border: "none",
                                    fontWeight: "700",
                                    fontSize: "14px",
                                    letterSpacing: "0.02em",
                                    cursor: processing
                                        ? "not-allowed"
                                        : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                    boxShadow:
                                        "0 4px 12px rgba(16, 185, 129, 0.25)",
                                    opacity: processing ? 0.7 : 1,
                                    transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                    if (!processing) {
                                        e.currentTarget.style.transform =
                                            "translateY(-1px)";
                                        e.currentTarget.style.boxShadow =
                                            "0 6px 16px rgba(16, 185, 129, 0.35)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!processing) {
                                        e.currentTarget.style.transform =
                                            "translateY(0)";
                                        e.currentTarget.style.boxShadow =
                                            "0 4px 12px rgba(16, 185, 129, 0.25)";
                                    }
                                }}
                            >
                                <span>
                                    {processing
                                        ? "Memverifikasi..."
                                        : selectedRole === "admin"
                                          ? "Masuk Dashboard Admin"
                                          : "Masuk Portal HSE"}
                                </span>
                                <ArrowRight size={16} strokeWidth={2.4} />
                            </button>
                        </form>

                        {/* REGISTER NEW ACCOUNT LINK */}
                        <div
                            style={{
                                marginTop: "20px",
                                paddingTop: "16px",
                                borderTop: "1px solid #e2e8f0",
                                textAlign: "center",
                            }}
                        >
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "13px",
                                    color: "#64748b",
                                }}
                            >
                                Belum memiliki izin akses?{" "}
                                <Link
                                    href="/register"
                                    style={{
                                        color: "#10b981",
                                        fontWeight: "600",
                                        textDecoration: "none",
                                        marginLeft: "4px",
                                        transition: "color 0.15s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = "#059669";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = "#10b981";
                                    }}
                                >
                                    Ajukan Pendaftaran
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div
                        style={{
                            textAlign: "center",
                            marginTop: "16px",
                            color: "#94a3b8",
                            fontSize: "12px",
                            fontWeight: "500",
                            lineHeight: "1.4",
                        }}
                    >
                        © {new Date().getFullYear()} PT Besmindo Materi Sewatama.<br />
                        <span style={{ fontSize: "11px", color: "#cbd5e1" }}>
                            Health, Safety, and Environment Reporting System
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}
