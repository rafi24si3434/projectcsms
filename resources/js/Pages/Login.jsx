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
    UserCheck,
    Shield,
} from "lucide-react";

export default function Login({ status }) {
    const [selectedRole, setSelectedRole] = useState("admin"); // "admin" | "user"
    const [showPassword, setShowPassword] = useState(false);

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
                    backgroundColor: "#00281b",
                    backgroundImage: `
                        radial-gradient(circle at 15% 20%, rgba(239, 255, 0, 0.08) 0%, transparent 40%),
                        radial-gradient(circle at 85% 80%, rgba(0, 77, 50, 0.6) 0%, transparent 50%),
                        linear-gradient(135deg, #001f15 0%, #003824 50%, #002417 100%)
                    `,
                    fontFamily:
                        "'Instrument Sans', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px 16px",
                    boxSizing: "border-box",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* AMBIENT BACKGROUND GLOW LINES */}
                <div
                    style={{
                        position: "absolute",
                        top: "-150px",
                        right: "-150px",
                        width: "450px",
                        height: "450px",
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle, rgba(239, 255, 0, 0.12) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }}
                />

                <div
                    style={{
                        position: "absolute",
                        bottom: "-150px",
                        left: "-150px",
                        width: "500px",
                        height: "500px",
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle, rgba(0, 77, 50, 0.8) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }}
                />

                {/* MAIN CONTAINER */}
                <div
                    style={{
                        width: "100%",
                        maxWidth: "490px",
                        zIndex: 10,
                        position: "relative",
                    }}
                >
                    {/* BRANDING HEADER */}
                    <div style={{ textAlign: "center", marginBottom: "26px" }}>
                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                maxWidth: "430px",
                                padding: "18px 28px",
                                borderRadius: "22px",
                                backgroundColor: "#ffffff",
                                border: "2.5px solid #efff00",
                                boxShadow:
                                    "0 12px 36px rgba(0, 0, 0, 0.35), 0 0 28px rgba(239, 255, 0, 0.3)",
                                marginBottom: "18px",
                                boxSizing: "border-box",
                            }}
                        >
                            <img
                                src="/images/besmindo-logo.png"
                                alt="PT BESMINDO MATERI SEWATAMA"
                                style={{
                                    height: "auto",
                                    maxHeight: "95px",
                                    width: "100%",
                                    maxWidth: "370px",
                                    objectFit: "contain",
                                    display: "block",
                                }}
                            />
                        </div>

                        <div>
                            <div
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "6px 18px",
                                    borderRadius: "20px",
                                    backgroundColor: "rgba(0, 77, 50, 0.85)",
                                    border: "1px solid rgba(239, 255, 0, 0.4)",
                                    color: "#efff00",
                                    fontSize: "12px",
                                    fontWeight: "800",
                                    letterSpacing: "0.06em",
                                    textTransform: "uppercase",
                                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.2)",
                                }}
                            >
                                <Sparkles size={14} />
                                HSE Integrated Management Portal
                            </div>
                        </div>
                    </div>

                    {/* LOGIN CARD */}
                    <div
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "20px",
                            padding: "32px 30px",
                            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
                            border: "1px solid rgba(239, 255, 0, 0.4)",
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
                                height: "4px",
                                background:
                                    "linear-gradient(90deg, #004d32 0%, #efff00 50%, #004d32 100%)",
                            }}
                        />

                        {/* ROLE SELECTOR TITLE */}
                        <div style={{ marginBottom: "16px" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "12.5px",
                                    fontWeight: "800",
                                    color: "#004d32",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em",
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
                                                ? "2px solid #004d32"
                                                : "1px solid #e2e8f0",
                                        backgroundColor:
                                            selectedRole === "admin"
                                                ? "#004d32"
                                                : "#f8fafc",
                                        color:
                                            selectedRole === "admin"
                                                ? "#efff00"
                                                : "#475569",
                                        cursor: "pointer",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "4px",
                                        boxShadow:
                                            selectedRole === "admin"
                                                ? "0 4px 14px rgba(0, 77, 50, 0.25)"
                                                : "none",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            fontWeight: "800",
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
                                                    ? "#a7f3d0"
                                                    : "#94a3b8",
                                            fontWeight: "600",
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
                                                ? "2px solid #004d32"
                                                : "1px solid #e2e8f0",
                                        backgroundColor:
                                            selectedRole === "user"
                                                ? "#004d32"
                                                : "#f8fafc",
                                        color:
                                            selectedRole === "user"
                                                ? "#efff00"
                                                : "#475569",
                                        cursor: "pointer",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "4px",
                                        boxShadow:
                                            selectedRole === "user"
                                                ? "0 4px 14px rgba(0, 77, 50, 0.25)"
                                                : "none",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            fontWeight: "800",
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
                                                    ? "#a7f3d0"
                                                    : "#94a3b8",
                                            fontWeight: "600",
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
                                    backgroundColor: "#ecfdf5",
                                    border: "1px solid #34d399",
                                    borderRadius: "10px",
                                    padding: "10px 14px",
                                    marginBottom: "16px",
                                    color: "#065f46",
                                    fontSize: "12.5px",
                                    fontWeight: "700",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <CheckCircle2 size={16} color="#059669" />
                                <span>{status}</span>
                            </div>
                        )}

                        {/* ERROR ALERT */}
                        {errors.email && (
                            <div
                                style={{
                                    backgroundColor: "#fee2e2",
                                    border: "1px solid #f87171",
                                    borderRadius: "10px",
                                    padding: "10px 14px",
                                    marginBottom: "16px",
                                    color: "#991b1b",
                                    fontSize: "12.5px",
                                    fontWeight: "700",
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
                                        fontWeight: "700",
                                        color: "#334155",
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
                                            left: "12px",
                                            color: "#64748b",
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={data.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        placeholder="nama@besmindo.com"
                                        style={{
                                            width: "100%",
                                            height: "42px",
                                            padding: "0 14px 0 38px",
                                            borderRadius: "10px",
                                            border: "1px solid #cbd5e1",
                                            outline: "none",
                                            fontSize: "13.5px",
                                            color: "#1e293b",
                                            backgroundColor: "#f8fafc",
                                            boxSizing: "border-box",
                                            transition: "border-color 0.2s",
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
                                            fontWeight: "700",
                                            color: "#334155",
                                        }}
                                    >
                                        Kata Sandi (Password)
                                    </label>
                                    <Link
                                        href="/forgot-password"
                                        style={{
                                            fontSize: "12px",
                                            color: "#004d32",
                                            fontWeight: "700",
                                            textDecoration: "none",
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
                                            left: "12px",
                                            color: "#64748b",
                                            display: "flex",
                                            alignItems: "center",
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
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        placeholder="Masukkan kata sandi..."
                                        style={{
                                            width: "100%",
                                            height: "42px",
                                            padding: "0 40px 0 38px",
                                            borderRadius: "10px",
                                            border: "1px solid #cbd5e1",
                                            outline: "none",
                                            fontSize: "13.5px",
                                            color: "#1e293b",
                                            backgroundColor: "#f8fafc",
                                            boxSizing: "border-box",
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
                                            color: "#64748b",
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
                                        color: "#475569",
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
                                        style={{ accentColor: "#004d32" }}
                                    />
                                    Ingat sesi masuk
                                </label>

                                <span
                                    style={{
                                        fontSize: "11.5px",
                                        color: "#047857",
                                        fontWeight: "700",
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
                                    borderRadius: "10px",
                                    backgroundColor: "#004d32",
                                    color: "#efff00",
                                    border: "1px solid #efff00",
                                    fontWeight: "900",
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
                                        "0 0 16px rgba(239, 255, 0, 0.3)",
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
                                <ArrowRight size={16} strokeWidth={2.8} />
                            </button>
                        </form>

                        {/* REGISTER NEW ACCOUNT LINK */}
                        <div
                            style={{
                                marginTop: "22px",
                                paddingTop: "18px",
                                borderTop: "1px solid #f1f5f9",
                                textAlign: "center",
                            }}
                        >
                            <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                                Belum memiliki akun terdaftar?{" "}
                                <Link
                                    href="/register"
                                    style={{
                                        color: "#004d32",
                                        fontWeight: "800",
                                        textDecoration: "none",
                                        marginLeft: "4px",
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
                            color: "rgba(255, 255, 255, 0.5)",
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
