import React, { useState } from "react";
import { useForm, Head, Link, usePage } from "@inertiajs/react";
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Clock,
    ShieldCheck,
    CheckCircle,
    ArrowRight,
    HardHat,
    Info,
} from "lucide-react";

export default function Register() {
    const { props } = usePage();
    const flashStatus = props.flash?.status || null;

    const [showPassword, setShowPassword]               = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitted, setSubmitted]                     = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name:                  "",
        email:                 "",
        password:              "",
        password_confirmation: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/register", {
            onSuccess: () => {
                setSubmitted(true);
                reset("password", "password_confirmation");
            },
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    // ────────────────────────────────────────────────────────────────────────
    // HALAMAN SUKSES — Tampil setelah registrasi berhasil
    // ────────────────────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <>
                <Head title="Pendaftaran Dikirim — Portal HSE" />
                <div style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #001f15 0%, #003824 50%, #002417 100%)",
                    fontFamily: "'Instrument Sans', 'Plus Jakarta Sans', -apple-system, sans-serif",
                    padding: "24px 16px",
                }}>
                    <div style={{ width: "100%", maxWidth: "420px", textAlign: "center" }}>
                        {/* Icon */}
                        <div style={{
                            width: "80px", height: "80px", borderRadius: "50%",
                            background: "linear-gradient(135deg, #10b981, #059669)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            margin: "0 auto 24px",
                            boxShadow: "0 0 40px rgba(16,185,129,0.4)",
                        }}>
                            <Clock size={36} color="#fff" strokeWidth={2.5} />
                        </div>

                        <h1 style={{ color: "#fff", fontSize: "22px", fontWeight: "900", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                            Pendaftaran Terkirim!
                        </h1>
                        <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6", margin: "0 0 28px" }}>
                            Akun Anda telah terdaftar dan sedang menunggu persetujuan{" "}
                            <span style={{ color: "#10b981", fontWeight: "700" }}>HSE Admin</span>.
                            Anda akan bisa login setelah admin menyetujui permintaan ini.
                        </p>

                        {/* Steps */}
                        <div style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "16px",
                            padding: "20px",
                            marginBottom: "24px",
                            textAlign: "left",
                        }}>
                            {[
                                { icon: CheckCircle, color: "#10b981", label: "Akun berhasil terdaftar di sistem" },
                                { icon: Clock,       color: "#f59e0b", label: "Menunggu review oleh HSE Admin" },
                                { icon: ShieldCheck, color: "#94a3b8", label: "Setelah di-ACC, Anda bisa login" },
                            ].map((step, i) => (
                                <div key={i} style={{
                                    display: "flex", alignItems: "center", gap: "12px",
                                    padding: "8px 0",
                                    borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                                }}>
                                    <step.icon size={18} color={step.color} strokeWidth={2.5} />
                                    <span style={{ color: "#cbd5e1", fontSize: "13px", fontWeight: "600" }}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Info kontak */}
                        <div style={{
                            background: "rgba(245,158,11,0.12)",
                            border: "1px solid rgba(245,158,11,0.3)",
                            borderRadius: "12px",
                            padding: "14px 16px",
                            marginBottom: "24px",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "10px",
                            textAlign: "left",
                        }}>
                            <Info size={16} color="#f59e0b" style={{ marginTop: "2px", flexShrink: 0 }} />
                            <p style={{ color: "#fcd34d", fontSize: "12.5px", margin: 0, lineHeight: "1.5", fontWeight: "600" }}>
                                Hubungi HSE Coordinator di <strong>0852-6393-9902</strong> untuk mempercepat proses verifikasi akun Anda.
                            </p>
                        </div>

                        <Link
                            href="/login"
                            style={{
                                display: "inline-flex", alignItems: "center", gap: "8px",
                                padding: "12px 28px", borderRadius: "12px",
                                background: "linear-gradient(135deg, #10b981, #059669)",
                                color: "#fff", fontSize: "14px", fontWeight: "800",
                                textDecoration: "none",
                                boxShadow: "0 4px 16px rgba(16,185,129,0.4)",
                            }}
                        >
                            Kembali ke Halaman Login
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    // ────────────────────────────────────────────────────────────────────────
    // FORM REGISTRASI
    // ────────────────────────────────────────────────────────────────────────
    return (
        <>
            <Head title="Daftar Akun Baru — Portal HSE CSMS" />

            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #001f15 0%, #003824 50%, #002417 100%)",
                fontFamily: "'Instrument Sans', 'Plus Jakarta Sans', -apple-system, sans-serif",
                padding: "24px 16px",
                position: "relative",
                overflow: "hidden",
            }}>
                {/* Ambient glow */}
                <div style={{
                    position: "absolute", top: "-200px", right: "-200px",
                    width: "500px", height: "500px", borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />
                <div style={{
                    position: "absolute", bottom: "-150px", left: "-150px",
                    width: "400px", height: "400px", borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />

                <div style={{ width: "100%", maxWidth: "460px", zIndex: 10, position: "relative" }}>

                    {/* LOGO */}
                    <div style={{ textAlign: "center", marginBottom: "20px" }}>
                        <div style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: "100%", maxWidth: "360px", padding: "14px 24px",
                            borderRadius: "18px", backgroundColor: "#ffffff",
                            border: "2px solid rgba(16,185,129,0.4)",
                            boxShadow: "0 8px 28px rgba(0,0,0,0.3), 0 0 20px rgba(16,185,129,0.15)",
                            marginBottom: "12px", boxSizing: "border-box",
                        }}>
                            <img
                                src="/images/besmindo-logo.png"
                                alt="PT BESMINDO MATERI SEWATAMA"
                                style={{ height: "auto", maxHeight: "72px", width: "100%", maxWidth: "300px", objectFit: "contain" }}
                            />
                        </div>

                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: "6px",
                            padding: "5px 16px", borderRadius: "20px",
                            background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)",
                            color: "#10b981", fontSize: "11px", fontWeight: "800",
                            letterSpacing: "0.06em", textTransform: "uppercase",
                        }}>
                            <HardHat size={13} />
                            Pendaftaran Akun Portal HSE
                        </div>
                    </div>

                    {/* CARD */}
                    <div style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "20px",
                        boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
                        border: "1px solid rgba(16,185,129,0.25)",
                        overflow: "hidden",
                        position: "relative",
                    }}>
                        {/* Top accent */}
                        <div style={{
                            height: "4px",
                            background: "linear-gradient(90deg, #064e3b 0%, #10b981 50%, #064e3b 100%)",
                        }} />

                        {/* K3 notice banner */}
                        <div style={{
                            background: "linear-gradient(90deg, #fef3c7, #fffbeb)",
                            borderBottom: "1px solid #fde68a",
                            padding: "10px 20px",
                            display: "flex", alignItems: "flex-start", gap: "10px",
                        }}>
                            <Clock size={15} color="#d97706" style={{ marginTop: "2px", flexShrink: 0 }} />
                            <p style={{ margin: 0, fontSize: "11.5px", color: "#92400e", fontWeight: "700", lineHeight: "1.5" }}>
                                Akun baru memerlukan persetujuan <strong>HSE Admin</strong> sebelum dapat digunakan untuk login ke sistem.
                            </p>
                        </div>

                        <div style={{ padding: "24px 28px 28px" }}>
                            <div style={{ marginBottom: "20px" }}>
                                <h2 style={{ margin: "0 0 4px", fontSize: "19px", fontWeight: "900", color: "#0f172a", letterSpacing: "-0.02em" }}>
                                    Buat Akun Baru
                                </h2>
                                <p style={{ margin: 0, color: "#64748b", fontSize: "12.5px" }}>
                                    Isi data diri Anda untuk mendaftar ke Portal HSE CSMS PT Besmindo.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {/* NAMA */}
                                <div style={{ marginBottom: "15px" }}>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                                        Nama Lengkap <span style={{ color: "#ef4444" }}>*</span>
                                    </label>
                                    <div style={{ position: "relative" }}>
                                        <User size={17} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData("name", e.target.value)}
                                            placeholder="Contoh: Ahmad Fadilah"
                                            required
                                            style={{
                                                width: "100%", padding: "11px 13px 11px 40px",
                                                borderRadius: "10px",
                                                border: errors.name ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
                                                fontSize: "13.5px", boxSizing: "border-box", outline: "none",
                                                background: "#f8fafc",
                                                transition: "border-color 0.2s",
                                            }}
                                            onFocus={e => e.target.style.borderColor = "#10b981"}
                                            onBlur={e => e.target.style.borderColor = errors.name ? "#ef4444" : "#e2e8f0"}
                                        />
                                    </div>
                                    {errors.name && <p style={{ color: "#dc2626", fontSize: "11.5px", marginTop: "4px", fontWeight: "600" }}>{errors.name}</p>}
                                </div>

                                {/* EMAIL */}
                                <div style={{ marginBottom: "15px" }}>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                                        Email Resmi <span style={{ color: "#ef4444" }}>*</span>
                                    </label>
                                    <div style={{ position: "relative" }}>
                                        <Mail size={17} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData("email", e.target.value)}
                                            placeholder="nama@besmindo.com"
                                            required
                                            style={{
                                                width: "100%", padding: "11px 13px 11px 40px",
                                                borderRadius: "10px",
                                                border: errors.email ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
                                                fontSize: "13.5px", boxSizing: "border-box", outline: "none",
                                                background: "#f8fafc",
                                            }}
                                            onFocus={e => e.target.style.borderColor = "#10b981"}
                                            onBlur={e => e.target.style.borderColor = errors.email ? "#ef4444" : "#e2e8f0"}
                                        />
                                    </div>
                                    {errors.email && <p style={{ color: "#dc2626", fontSize: "11.5px", marginTop: "4px", fontWeight: "600" }}>{errors.email}</p>}
                                </div>

                                {/* PASSWORD */}
                                <div style={{ marginBottom: "15px" }}>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                                        Kata Sandi <span style={{ color: "#ef4444" }}>*</span>
                                        <span style={{ color: "#94a3b8", fontWeight: "600", textTransform: "none", letterSpacing: "normal", marginLeft: "4px" }}>(min. 6 karakter)</span>
                                    </label>
                                    <div style={{ position: "relative" }}>
                                        <Lock size={17} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={data.password}
                                            onChange={(e) => setData("password", e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            style={{
                                                width: "100%", padding: "11px 42px 11px 40px",
                                                borderRadius: "10px",
                                                border: errors.password ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
                                                fontSize: "13.5px", boxSizing: "border-box", outline: "none",
                                                background: "#f8fafc",
                                            }}
                                            onFocus={e => e.target.style.borderColor = "#10b981"}
                                            onBlur={e => e.target.style.borderColor = errors.password ? "#ef4444" : "#e2e8f0"}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}>
                                            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                        </button>
                                    </div>
                                    {errors.password && <p style={{ color: "#dc2626", fontSize: "11.5px", marginTop: "4px", fontWeight: "600" }}>{errors.password}</p>}
                                </div>

                                {/* KONFIRMASI PASSWORD */}
                                <div style={{ marginBottom: "22px" }}>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                                        Konfirmasi Kata Sandi <span style={{ color: "#ef4444" }}>*</span>
                                    </label>
                                    <div style={{ position: "relative" }}>
                                        <Lock size={17} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={data.password_confirmation}
                                            onChange={(e) => setData("password_confirmation", e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            style={{
                                                width: "100%", padding: "11px 42px 11px 40px",
                                                borderRadius: "10px",
                                                border: errors.password_confirmation ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
                                                fontSize: "13.5px", boxSizing: "border-box", outline: "none",
                                                background: "#f8fafc",
                                            }}
                                            onFocus={e => e.target.style.borderColor = "#10b981"}
                                            onBlur={e => e.target.style.borderColor = errors.password_confirmation ? "#ef4444" : "#e2e8f0"}
                                        />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}>
                                            {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                        </button>
                                    </div>
                                    {errors.password_confirmation && <p style={{ color: "#dc2626", fontSize: "11.5px", marginTop: "4px", fontWeight: "600" }}>{errors.password_confirmation}</p>}
                                </div>

                                {/* SUBMIT */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    style={{
                                        width: "100%", padding: "13px 20px",
                                        borderRadius: "12px", border: "none",
                                        background: processing
                                            ? "#94a3b8"
                                            : "linear-gradient(135deg, #065f46, #10b981)",
                                        color: "#fff", fontSize: "14px", fontWeight: "800",
                                        letterSpacing: "0.02em", cursor: processing ? "not-allowed" : "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                        boxShadow: processing ? "none" : "0 6px 20px rgba(16,185,129,0.4)",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    {processing ? (
                                        <span>Mendaftar...</span>
                                    ) : (
                                        <>
                                            <span>Kirim Permohonan Akun</span>
                                            <ArrowRight size={17} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div style={{
                                marginTop: "20px", paddingTop: "18px",
                                borderTop: "1px solid #f1f5f9", textAlign: "center",
                            }}>
                                <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b" }}>
                                    Sudah memiliki akun?{" "}
                                    <Link href="/login" style={{ color: "#065f46", fontWeight: "800", textDecoration: "none" }}>
                                        Masuk Sekarang
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: "center", marginTop: "16px", color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>
                        © {new Date().getFullYear()} PT Besmindo Materi Sewatama. All Rights Reserved.
                    </div>
                </div>
            </div>
        </>
    );
}
