import React, { useState } from "react";
import { useForm, Head, Link } from "@inertiajs/react";
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ShieldCheck,
    ClipboardList,
    ArrowRight,
    Sparkles,
} from "lucide-react";

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        role: "user",
        password: "",
        password_confirmation: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/register", {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <>
            <Head title="Registrasi Akun Baru - PT Besmindo Materi Sewatama" />

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
                {/* AMBIENT BACKGROUND GLOW */}
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
                        width: "100%",
                        maxWidth: "480px",
                        zIndex: 10,
                        position: "relative",
                    }}
                >
                    {/* BRANDING HEADER */}
                    <div style={{ textAlign: "center", marginBottom: "24px" }}>
                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                maxWidth: "390px",
                                padding: "16px 24px",
                                borderRadius: "20px",
                                backgroundColor: "#ffffff",
                                border: "2.5px solid #efff00",
                                boxShadow:
                                    "0 10px 30px rgba(0, 0, 0, 0.3), 0 0 24px rgba(239, 255, 0, 0.25)",
                                marginBottom: "16px",
                                boxSizing: "border-box",
                            }}
                        >
                            <img
                                src="/images/besmindo-logo.png"
                                alt="PT BESMINDO MATERI SEWATAMA"
                                style={{
                                    height: "auto",
                                    maxHeight: "85px",
                                    width: "100%",
                                    maxWidth: "330px",
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
                                Registrasi Akun Portal HSE
                            </div>
                        </div>
                    </div>

                    {/* REGISTER CARD */}
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

                        <div style={{ marginBottom: "22px" }}>
                            <h2
                                style={{
                                    margin: "0 0 4px",
                                    fontSize: "20px",
                                    fontWeight: "900",
                                    color: "#004d32",
                                    letterSpacing: "-0.02em",
                                }}
                            >
                                Buat Akun Baru
                            </h2>
                            <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                                Data akun akan tersimpan langsung di database MySQL.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* ROLE SELECTION TABS */}
                            <div style={{ marginBottom: "20px" }}>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: "800",
                                        color: "#004d32",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.04em",
                                        marginBottom: "8px",
                                    }}
                                >
                                    Pilih Peran Akun (Role Access) <span style={{ color: "#ef4444" }}>*</span>
                                </label>

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        gap: "10px",
                                    }}
                                >
                                    {/* USER / PIC */}
                                    <button
                                        type="button"
                                        onClick={() => setData("role", "user")}
                                        style={{
                                            padding: "12px 10px",
                                            borderRadius: "12px",
                                            border:
                                                data.role === "user"
                                                    ? "2px solid #004d32"
                                                    : "1px solid #e2e8f0",
                                            backgroundColor:
                                                data.role === "user"
                                                    ? "#004d32"
                                                    : "#f8fafc",
                                            color:
                                                data.role === "user"
                                                    ? "#efff00"
                                                    : "#475569",
                                            cursor: "pointer",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "4px",
                                            boxShadow:
                                                data.role === "user"
                                                    ? "0 4px 14px rgba(0, 77, 50, 0.25)"
                                                    : "none",
                                            transition: "all 0.2s ease",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <ClipboardList size={16} />
                                            <span style={{ fontWeight: "800", fontSize: "13px" }}>
                                                Field User / PIC
                                            </span>
                                        </div>
                                        <span
                                            style={{
                                                fontSize: "10.5px",
                                                opacity: 0.85,
                                                fontWeight: "600",
                                            }}
                                        >
                                            Penginputan Data HSE
                                        </span>
                                    </button>

                                    {/* ADMIN */}
                                    <button
                                        type="button"
                                        onClick={() => setData("role", "admin")}
                                        style={{
                                            padding: "12px 10px",
                                            borderRadius: "12px",
                                            border:
                                                data.role === "admin"
                                                    ? "2px solid #004d32"
                                                    : "1px solid #e2e8f0",
                                            backgroundColor:
                                                data.role === "admin"
                                                    ? "#004d32"
                                                    : "#f8fafc",
                                            color:
                                                data.role === "admin"
                                                    ? "#efff00"
                                                    : "#475569",
                                            cursor: "pointer",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "4px",
                                            boxShadow:
                                                data.role === "admin"
                                                    ? "0 4px 14px rgba(0, 77, 50, 0.25)"
                                                    : "none",
                                            transition: "all 0.2s ease",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <ShieldCheck size={16} />
                                            <span style={{ fontWeight: "800", fontSize: "13px" }}>
                                                HSE Admin
                                            </span>
                                        </div>
                                        <span
                                            style={{
                                                fontSize: "10.5px",
                                                opacity: 0.85,
                                                fontWeight: "600",
                                            }}
                                        >
                                            Dashboard & Approval
                                        </span>
                                    </button>
                                </div>
                                {errors.role && (
                                    <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                                        {errors.role}
                                    </div>
                                )}
                            </div>

                            {/* FULL NAME */}
                            <div style={{ marginBottom: "16px" }}>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "12.5px",
                                        fontWeight: "700",
                                        color: "#1e293b",
                                        marginBottom: "6px",
                                    }}
                                >
                                    Nama Lengkap <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <div style={{ position: "relative" }}>
                                    <User
                                        size={18}
                                        style={{
                                            position: "absolute",
                                            left: "14px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            color: "#64748b",
                                        }}
                                    />
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        placeholder="Contoh: Ahmad Fadilah"
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "11px 14px 11px 42px",
                                            borderRadius: "10px",
                                            border: errors.name
                                                ? "1.5px solid #ef4444"
                                                : "1.5px solid #cbd5e1",
                                            fontSize: "13.5px",
                                            boxSizing: "border-box",
                                            outline: "none",
                                        }}
                                    />
                                </div>
                                {errors.name && (
                                    <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                                        {errors.name}
                                    </div>
                                )}
                            </div>

                            {/* EMAIL */}
                            <div style={{ marginBottom: "16px" }}>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "12.5px",
                                        fontWeight: "700",
                                        color: "#1e293b",
                                        marginBottom: "6px",
                                    }}
                                >
                                    Alamat Email Resmi <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <div style={{ position: "relative" }}>
                                    <Mail
                                        size={18}
                                        style={{
                                            position: "absolute",
                                            left: "14px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            color: "#64748b",
                                        }}
                                    />
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                        placeholder="nama@besmindo.com"
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "11px 14px 11px 42px",
                                            borderRadius: "10px",
                                            border: errors.email
                                                ? "1.5px solid #ef4444"
                                                : "1.5px solid #cbd5e1",
                                            fontSize: "13.5px",
                                            boxSizing: "border-box",
                                            outline: "none",
                                        }}
                                    />
                                </div>
                                {errors.email && (
                                    <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                                        {errors.email}
                                    </div>
                                )}
                            </div>

                            {/* PASSWORD */}
                            <div style={{ marginBottom: "16px" }}>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "12.5px",
                                        fontWeight: "700",
                                        color: "#1e293b",
                                        marginBottom: "6px",
                                    }}
                                >
                                    Kata Sandi (Minimal 6 Karakter) <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <div style={{ position: "relative" }}>
                                    <Lock
                                        size={18}
                                        style={{
                                            position: "absolute",
                                            left: "14px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            color: "#64748b",
                                        }}
                                    />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={data.password}
                                        onChange={(e) => setData("password", e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "11px 42px 11px 42px",
                                            borderRadius: "10px",
                                            border: errors.password
                                                ? "1.5px solid #ef4444"
                                                : "1.5px solid #cbd5e1",
                                            fontSize: "13.5px",
                                            boxSizing: "border-box",
                                            outline: "none",
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: "absolute",
                                            right: "12px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            background: "none",
                                            border: "none",
                                            color: "#64748b",
                                            cursor: "pointer",
                                            padding: "4px",
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                                        {errors.password}
                                    </div>
                                )}
                            </div>

                            {/* PASSWORD CONFIRMATION */}
                            <div style={{ marginBottom: "24px" }}>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "12.5px",
                                        fontWeight: "700",
                                        color: "#1e293b",
                                        marginBottom: "6px",
                                    }}
                                >
                                    Konfirmasi Kata Sandi <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <div style={{ position: "relative" }}>
                                    <Lock
                                        size={18}
                                        style={{
                                            position: "absolute",
                                            left: "14px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            color: "#64748b",
                                        }}
                                    />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData("password_confirmation", e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "11px 42px 11px 42px",
                                            borderRadius: "10px",
                                            border: errors.password_confirmation
                                                ? "1.5px solid #ef4444"
                                                : "1.5px solid #cbd5e1",
                                            fontSize: "13.5px",
                                            boxSizing: "border-box",
                                            outline: "none",
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{
                                            position: "absolute",
                                            right: "12px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            background: "none",
                                            border: "none",
                                            color: "#64748b",
                                            cursor: "pointer",
                                            padding: "4px",
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                                        {errors.password_confirmation}
                                    </div>
                                )}
                            </div>

                            {/* SUBMIT BUTTON */}
                            <button
                                type="submit"
                                disabled={processing}
                                style={{
                                    width: "100%",
                                    padding: "14px 20px",
                                    borderRadius: "12px",
                                    border: "1px solid #efff00",
                                    backgroundColor: "#004d32",
                                    color: "#efff00",
                                    fontSize: "14.5px",
                                    fontWeight: "800",
                                    letterSpacing: "0.02em",
                                    cursor: processing ? "not-allowed" : "pointer",
                                    opacity: processing ? 0.75 : 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                    boxShadow:
                                        "0 6px 20px rgba(0, 77, 50, 0.4), 0 0 16px rgba(239, 255, 0, 0.2)",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                {processing ? (
                                    <span>Mendaftarkan ke MySQL...</span>
                                ) : (
                                    <>
                                        <span>Daftarkan Akun Baru</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* LINK TO LOGIN */}
                        <div
                            style={{
                                marginTop: "24px",
                                paddingTop: "20px",
                                borderTop: "1px solid #f1f5f9",
                                textAlign: "center",
                            }}
                        >
                            <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                                Sudah memiliki akun terdaftar?{" "}
                                <Link
                                    href="/login"
                                    style={{
                                        color: "#004d32",
                                        fontWeight: "800",
                                        textDecoration: "none",
                                        marginLeft: "4px",
                                    }}
                                >
                                    Masuk Sekarang
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div
                        style={{
                            textAlign: "center",
                            marginTop: "20px",
                            color: "#d1fae5",
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
