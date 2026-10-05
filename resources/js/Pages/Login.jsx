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
    Sparkles,
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
                email: "user@besmindo.com",
                password: "password",
                role: "user",
                remember: true,
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/login", {
            onFinish: () => reset("password"),
        });
    };

    return (
        <>
            <Head title="Login Portal HSE - PT Besmindo Materi Sewatama" />

            <div
                style={{
                    minHeight: "100vh",
                    backgroundColor: "#030712",
                    backgroundImage: `
                        radial-gradient(ellipse 80% 50% at 50% -20%, rgba(14, 165, 233, 0.22), transparent 70%),
                        radial-gradient(circle at 15% 25%, rgba(30, 58, 138, 0.32) 0%, transparent 45%),
                        radial-gradient(circle at 85% 75%, rgba(15, 23, 42, 0.85) 0%, transparent 50%),
                        linear-gradient(135deg, #020617 0%, #0a192f 45%, #020617 100%)
                    `,
                    fontFamily:
                        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "28px 16px",
                    boxSizing: "border-box",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* AMBIENT RADIAL GLOW ORBS */}
                <div
                    style={{
                        position: "absolute",
                        top: "-120px",
                        right: "-100px",
                        width: "500px",
                        height: "500px",
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle, rgba(56, 189, 248, 0.14) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }}
                />

                <div
                    style={{
                        position: "absolute",
                        bottom: "-140px",
                        left: "-120px",
                        width: "520px",
                        height: "520px",
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }}
                />

                {/* MAIN CONTAINER */}
                <div
                    style={{
                        width: "100%",
                        maxWidth: "480px",
                        zIndex: 10,
                        position: "relative",
                    }}
                >
                    {/* BRANDING HEADER */}
                    <div style={{ textAlign: "center", marginBottom: "22px" }}>
                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                maxWidth: "420px",
                                padding: "16px 24px",
                                borderRadius: "20px",
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                border: "1px solid rgba(56, 189, 248, 0.25)",
                                boxShadow:
                                    "0 12px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(56, 189, 248, 0.15)",
                                marginBottom: "16px",
                                boxSizing: "border-box",
                                backdropFilter: "blur(8px)",
                            }}
                        >
                            <img
                                src="/images/logo-besmindo.png"
                                alt="PT BESMINDO MATERI SEWATAMA"
                                style={{
                                    height: "auto",
                                    maxHeight: "82px",
                                    width: "100%",
                                    maxWidth: "340px",
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
                                    borderRadius: "20px",
                                    backgroundColor: "rgba(14, 165, 233, 0.12)",
                                    border: "1px solid rgba(56, 189, 248, 0.25)",
                                    color: "#38bdf8",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    letterSpacing: "0.06em",
                                    textTransform: "uppercase",
                                    boxShadow: "0 2px 10px rgba(56, 189, 248, 0.12)",
                                }}
                            >
                                <Sparkles size={13} />
                                HSE Integrated Management Portal
                            </div>
                        </div>
                    </div>

                    {/* LOGIN CARD - DARK NAVY GLASSMORPHISM */}
                    <div
                        style={{
                            backgroundColor: "rgba(15, 23, 42, 0.92)",
                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)",
                            borderRadius: "24px",
                            padding: "32px 30px",
                            boxShadow:
                                "0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 25px rgba(14, 165, 233, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                            border: "1px solid rgba(51, 65, 85, 0.8)",
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        {/* TOP ACCENT LINE */}
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                height: "3px",
                                background:
                                    "linear-gradient(90deg, #0284c7 0%, #38bdf8 50%, #6366f1 100%)",
                            }}
                        />

                        {/* ROLE SELECTOR TITLE */}
                        <div style={{ marginBottom: "18px" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "11.5px",
                                    fontWeight: "700",
                                    color: "#94a3b8",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    marginBottom: "10px",
                                }}
                            >
                                Pilih Peran Masuk (Role Access)
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
                                        padding: "12px 10px",
                                        borderRadius: "12px",
                                        border:
                                            selectedRole === "admin"
                                                ? "1.5px solid #60a5fa"
                                                : "1px solid #334155",
                                        backgroundColor:
                                            selectedRole === "admin"
                                                ? "#2563eb"
                                                : "rgba(30, 41, 59, 0.8)",
                                        color:
                                            selectedRole === "admin"
                                                ? "#ffffff"
                                                : "#94a3b8",
                                        cursor: "pointer",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "4px",
                                        boxShadow:
                                            selectedRole === "admin"
                                                ? "0 4px 16px rgba(37, 99, 235, 0.45)"
                                                : "none",
                                        transition: "all 0.2s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (selectedRole !== "admin") {
                                            e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 1)";
                                            e.currentTarget.style.color = "#e2e8f0";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedRole !== "admin") {
                                            e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.8)";
                                            e.currentTarget.style.color = "#94a3b8";
                                        }
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            fontWeight: "700",
                                            fontSize: "13px",
                                        }}
                                    >
                                        <ShieldCheck size={16} />
                                        HSE Admin
                                    </div>
                                    <span
                                        style={{
                                            fontSize: "10.5px",
                                            color:
                                                selectedRole === "admin"
                                                    ? "rgba(255, 255, 255, 0.85)"
                                                    : "#64748b",
                                            fontWeight: "500",
                                        }}
                                    >
                                        Dashboard & Approval
                                    </span>
                                </button>

                                {/* TAB 2: FIELD USER */}
                                <button
                                    type="button"
                                    onClick={() => handleRoleSelect("user")}
                                    style={{
                                        padding: "12px 10px",
                                        borderRadius: "12px",
                                        border:
                                            selectedRole === "user"
                                                ? "1.5px solid #60a5fa"
                                                : "1px solid #334155",
                                        backgroundColor:
                                            selectedRole === "user"
                                                ? "#2563eb"
                                                : "rgba(30, 41, 59, 0.8)",
                                        color:
                                            selectedRole === "user"
                                                ? "#ffffff"
                                                : "#94a3b8",
                                        cursor: "pointer",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "4px",
                                        boxShadow:
                                            selectedRole === "user"
                                                ? "0 4px 16px rgba(37, 99, 235, 0.45)"
                                                : "none",
                                        transition: "all 0.2s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (selectedRole !== "user") {
                                            e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 1)";
                                            e.currentTarget.style.color = "#e2e8f0";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedRole !== "user") {
                                            e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.8)";
                                            e.currentTarget.style.color = "#94a3b8";
                                        }
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            fontWeight: "700",
                                            fontSize: "13px",
                                        }}
                                    >
                                        <ClipboardList size={16} />
                                        Field User
                                    </div>
                                    <span
                                        style={{
                                            fontSize: "10.5px",
                                            color:
                                                selectedRole === "user"
                                                    ? "rgba(255, 255, 255, 0.85)"
                                                    : "#64748b",
                                            fontWeight: "500",
                                        }}
                                    >
                                        Penginputan Data HSE
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* SUCCESS STATUS ALERT */}
                        {status && (
                            <div
                                style={{
                                    backgroundColor: "rgba(14, 165, 233, 0.15)",
                                    border: "1px solid rgba(56, 189, 248, 0.4)",
                                    borderRadius: "10px",
                                    padding: "10px 14px",
                                    marginBottom: "16px",
                                    color: "#38bdf8",
                                    fontSize: "12.5px",
                                    fontWeight: "600",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <CheckCircle2 size={16} color="#38bdf8" />
                                <span>{status}</span>
                            </div>
                        )}

                        {/* ERROR ALERT */}
                        {errors.email && (
                            <div
                                style={{
                                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                                    border: "1px solid rgba(248, 113, 113, 0.4)",
                                    borderRadius: "10px",
                                    padding: "10px 14px",
                                    marginBottom: "16px",
                                    color: "#f87171",
                                    fontSize: "12.5px",
                                    fontWeight: "600",
                                }}
                            >
                                {errors.email}
                            </div>
                        )}

                        {/* FORM */}
                        <form onSubmit={handleSubmit}>
                            {/* EMAIL FIELD */}
                            <div style={{ marginBottom: "16px" }}>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "12.5px",
                                        fontWeight: "600",
                                        color: "#cbd5e1",
                                        marginBottom: "6px",
                                    }}
                                >
                                    Alamat Email / Username
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
                                            left: "13px",
                                            color: focusedInput === "email" ? "#38bdf8" : "#64748b",
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
                                            borderRadius: "11px",
                                            border: focusedInput === "email" ? "1.5px solid #38bdf8" : "1px solid #1e293b",
                                            boxShadow: focusedInput === "email" ? "0 0 0 3px rgba(56, 189, 248, 0.25)" : "none",
                                            outline: "none",
                                            fontSize: "13.5px",
                                            color: "#ffffff",
                                            backgroundColor: "rgba(2, 6, 23, 0.7)",
                                            boxSizing: "border-box",
                                            transition: "all 0.2s ease",
                                        }}
                                    />
                                </div>
                            </div>

                            {/* PASSWORD FIELD */}
                            <div style={{ marginBottom: "18px" }}>
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
                                            color: "#cbd5e1",
                                        }}
                                    >
                                        Kata Sandi (Password)
                                    </label>
                                    <Link
                                        href="/forgot-password"
                                        style={{
                                            fontSize: "12px",
                                            color: "#38bdf8",
                                            fontWeight: "600",
                                            textDecoration: "none",
                                            transition: "color 0.15s ease",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = "#7dd3fc";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color = "#38bdf8";
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
                                            left: "13px",
                                            color: focusedInput === "password" ? "#38bdf8" : "#64748b",
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
                                        onFocus={() => setFocusedInput("password")}
                                        onBlur={() => setFocusedInput(null)}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        placeholder="Masukkan kata sandi..."
                                        style={{
                                            width: "100%",
                                            height: "44px",
                                            padding: "0 40px 0 40px",
                                            borderRadius: "11px",
                                            border: focusedInput === "password" ? "1.5px solid #38bdf8" : "1px solid #1e293b",
                                            boxShadow: focusedInput === "password" ? "0 0 0 3px rgba(56, 189, 248, 0.25)" : "none",
                                            outline: "none",
                                            fontSize: "13.5px",
                                            color: "#ffffff",
                                            backgroundColor: "rgba(2, 6, 23, 0.7)",
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
                                            right: "12px",
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
                                    marginBottom: "22px",
                                    fontSize: "12.5px",
                                }}
                            >
                                <label
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        color: "#cbd5e1",
                                        cursor: "pointer",
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) =>
                                            setData(
                                                "remember",
                                                e.target.checked
                                            )
                                        }
                                        style={{ accentColor: "#0284c7" }}
                                    />
                                    Ingat sesi masuk
                                </label>

                                <span
                                    style={{
                                        fontSize: "11.5px",
                                        color: "#38bdf8",
                                        fontWeight: "600",
                                    }}
                                >
                                    Tujuan:{" "}
                                    {selectedRole === "admin"
                                        ? "Admin Dashboard"
                                        : "Form User Input"}
                                </span>
                            </div>

                            {/* SUBMIT BUTTON */}
                            <button
                                type="submit"
                                disabled={processing}
                                style={{
                                    width: "100%",
                                    height: "46px",
                                    borderRadius: "12px",
                                    background:
                                        "linear-gradient(135deg, #0284c7 0%, #1e3a8a 60%, #0f172a 100%)",
                                    color: "#ffffff",
                                    border: "1px solid rgba(56, 189, 248, 0.4)",
                                    fontWeight: "700",
                                    fontSize: "14px",
                                    letterSpacing: "0.01em",
                                    cursor: processing
                                        ? "not-allowed"
                                        : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                    boxShadow:
                                        "0 4px 20px rgba(14, 165, 233, 0.35)",
                                    opacity: processing ? 0.7 : 1,
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <span>
                                    {processing
                                        ? "Memverifikasi..."
                                        : selectedRole === "admin"
                                        ? "Masuk ke Dashboard Admin"
                                        : "Masuk ke Form Input User"}
                                </span>
                                <ArrowRight size={16} strokeWidth={2.4} />
                            </button>
                        </form>

                        {/* REGISTER NEW ACCOUNT LINK */}
                        <div
                            style={{
                                marginTop: "22px",
                                paddingTop: "18px",
                                borderTop: "1px solid rgba(51, 65, 85, 0.7)",
                                textAlign: "center",
                            }}
                        >
                            <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
                                Belum memiliki akun terdaftar?{" "}
                                <Link
                                    href="/register"
                                    style={{
                                        color: "#38bdf8",
                                        fontWeight: "600",
                                        textDecoration: "none",
                                        marginLeft: "4px",
                                        transition: "color 0.15s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = "#7dd3fc";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = "#38bdf8";
                                    }}
                                >
                                    Daftar Akun Baru
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div
                        style={{
                            textAlign: "center",
                            marginTop: "20px",
                            color: "rgba(255, 255, 255, 0.45)",
                            fontSize: "12px",
                        }}
                    >
                        © {new Date().getFullYear()} PT Besmindo Materi Sewatama.
                        All Rights Reserved.
                    </div>
                </div>
            </div>
        </>
    );
}
