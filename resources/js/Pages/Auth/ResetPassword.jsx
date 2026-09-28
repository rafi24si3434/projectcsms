import React, { useState } from "react";
import { useForm, Head, Link } from "@inertiajs/react";
import {
    ShieldCheck,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    ArrowRight,
    KeyRound,
    Mail,
} from "lucide-react";

export default function ResetPassword({ token, email: initialEmail = "" }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: initialEmail,
        password: "",
        password_confirmation: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/reset-password", {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <>
            <Head title="Atur Ulang Kata Sandi - PT Besmindo Materi Sewatama" />

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

                        <h1
                            style={{
                                margin: "0 0 4px",
                                fontSize: "22px",
                                fontWeight: "900",
                                color: "#ffffff",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            Buat Kata Sandi Baru
                        </h1>
                        <p style={{ margin: 0, color: "#d1fae5", fontSize: "13px" }}>
                            PT Besmindo Materi Sewatama - HSE Portal
                        </p>
                    </div>

                    {/* CARD */}
                    <div
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "20px",
                            padding: "32px 28px",
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

                        {/* ERROR ALERT */}
                        {(errors.email || errors.password || errors.token) && (
                            <div
                                style={{
                                    backgroundColor: "#fee2e2",
                                    border: "1px solid #f87171",
                                    borderRadius: "10px",
                                    padding: "10px 14px",
                                    marginBottom: "18px",
                                    color: "#991b1b",
                                    fontSize: "12.5px",
                                    fontWeight: "700",
                                }}
                            >
                                {errors.email || errors.password || errors.token}
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
                                    Alamat Email Akun
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
                                        type="email"
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
                                        }}
                                    />
                                </div>
                            </div>

                            {/* NEW PASSWORD */}
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
                                    Kata Sandi Baru
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
                                        placeholder="Minimal 6 karakter..."
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

                            {/* CONFIRM NEW PASSWORD */}
                            <div style={{ marginBottom: "24px" }}>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "12.5px",
                                        fontWeight: "700",
                                        color: "#334155",
                                        marginBottom: "6px",
                                    }}
                                >
                                    Ulangi Kata Sandi Baru
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
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type={
                                            showConfirm ? "text" : "password"
                                        }
                                        required
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                "password_confirmation",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Ketik ulang kata sandi baru..."
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
                                            setShowConfirm(!showConfirm)
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
                                        {showConfirm ? (
                                            <EyeOff size={16} />
                                        ) : (
                                            <Eye size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* SUBMIT BUTTON */}
                            <button
                                type="submit"
                                disabled={processing}
                                style={{
                                    width: "100%",
                                    height: "44px",
                                    borderRadius: "10px",
                                    backgroundColor: "#004d32",
                                    color: "#efff00",
                                    border: "1px solid #efff00",
                                    fontWeight: "900",
                                    fontSize: "14px",
                                    cursor: processing
                                        ? "not-allowed"
                                        : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                    boxShadow:
                                        "0 0 14px rgba(239, 255, 0, 0.3)",
                                    opacity: processing ? 0.7 : 1,
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <span>
                                    {processing
                                        ? "Memperbarui Kata Sandi..."
                                        : "Simpan Kata Sandi Baru"}
                                </span>
                                <ArrowRight size={16} strokeWidth={2.8} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
