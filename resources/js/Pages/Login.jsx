import React, { useState } from "react";
import { useForm, Head, Link } from "@inertiajs/react";
import {
    ShieldCheck,
    HardHat,
    Lock,
    Mail,
    Eye,
    EyeOff,
    CheckCircle2,
    ArrowRight,
    AlertTriangle,
    Shield,
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
                email: "bms01@besmindo.com",
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
            <Head title="Login Portal K3 & CSMS - PT Besmindo Materi Sewatama" />

            {/* ═══════════════════════════════════════════════════════════════
                STRICT 100VH VIEWPORT CONTAINER (ZERO SCROLLING)
            ═══════════════════════════════════════════════════════════════ */}
            <div className="h-screen max-h-screen w-screen overflow-hidden bg-[#f4f7f6] relative flex flex-col justify-between font-sans select-none">
                
                {/* ── SAFETY ACCENT STRIPE (PITA K3 TOP) ── */}
                <div
                    className="w-full h-1.5 shrink-0 z-30"
                    style={{
                        background:
                            "repeating-linear-gradient(45deg, #f59e0b, #f59e0b 14px, #1e293b 14px, #1e293b 28px)",
                    }}
                />

                {/* ── AMBIENT SAFETY RADIAL GLOW BACKGROUND ── */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    <div
                        className="absolute -top-[120px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-20 blur-3xl"
                        style={{
                            background: "radial-gradient(circle, #10b981 0%, rgba(16,185,129,0) 70%)",
                        }}
                    />
                    <div
                        className="absolute bottom-[-100px] right-[-80px] w-[500px] h-[400px] rounded-full opacity-15 blur-3xl"
                        style={{
                            background: "radial-gradient(circle, #f59e0b 0%, rgba(245,158,11,0) 70%)",
                        }}
                    />
                    {/* Subtle grid pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.035]"
                        style={{
                            backgroundImage: `radial-gradient(#1e293b 1px, transparent 1px)`,
                            backgroundSize: "24px 24px",
                        }}
                    />
                </div>

                {/* ── MAIN CONTENT WRAPPER (CENTERED & COMPACT TO PREVENT SCROLL) ── */}
                <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-2 sm:py-3 w-full max-w-[480px] mx-auto">
                    
                    {/* 1. BRANDING & SAFETY BADGE */}
                    <div className="flex flex-col items-center text-center mb-2 sm:mb-3 shrink-0">
                        {/* Logo Animasi Bersinar Transparan True HD */}
                        <img
                            src="/images/logo-animation.webp"
                            alt="PT BESMINDO MATERI SEWATAMA"
                            className="w-72 sm:w-80 h-auto mx-auto mb-4 object-contain drop-shadow-md select-none transition-transform hover:scale-[1.02]"
                        />

                        {/* Safety Tagline Badge */}
                        <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/90 text-[10.5px] font-black text-emerald-800 uppercase tracking-widest shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                            <HardHat size={12} className="text-emerald-700" />
                            <span>Safety First &bull; Zero Accident</span>
                        </div>
                    </div>

                    {/* 2. DOUBLE-BEZEL LOGIN CARD */}
                    <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.08),0_0_20px_rgba(16,185,129,0.04)] relative overflow-hidden p-5 sm:p-6 shrink-0">
                        
                        {/* Top Gradient Highlight */}
                        <div
                            className="absolute top-0 left-0 right-0 h-1"
                            style={{
                                background: "linear-gradient(90deg, #10b981 0%, #34d399 50%, #f59e0b 100%)",
                            }}
                        />

                        {/* ── TABS PEMILIH PERAN: "MASUK SEBAGAI" ── */}
                        <div className="mb-3.5">
                            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                                <span>Masuk Sebagai</span>
                                <span className="text-[10px] text-emerald-700 font-bold lowercase tracking-normal">
                                    {selectedRole === "admin" ? "akses pusat" : "akses kru rig"}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/70">
                                {/* Tab 1: HSE Admin */}
                                <button
                                    type="button"
                                    onClick={() => handleRoleSelect("admin")}
                                    className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all duration-200 focus:outline-none ${
                                        selectedRole === "admin"
                                            ? "bg-white text-slate-900 shadow-sm border border-emerald-300/80"
                                            : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                                    }`}
                                >
                                    <div
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                            selectedRole === "admin"
                                                ? "bg-emerald-600 text-white shadow-2xs"
                                                : "bg-slate-200/80 text-slate-500"
                                        }`}
                                    >
                                        <ShieldCheck size={16} strokeWidth={2.4} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="text-xs font-black tracking-tight leading-tight truncate">
                                            HSE Admin
                                        </div>
                                        <div className="text-[9.5px] text-slate-500 truncate mt-0.5 leading-none">
                                            Validator Pusat
                                        </div>
                                    </div>
                                    {selectedRole === "admin" && (
                                        <div className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    )}
                                </button>

                                {/* Tab 2: HSE Officer / Rig Operator */}
                                <button
                                    type="button"
                                    onClick={() => handleRoleSelect("user")}
                                    className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all duration-200 focus:outline-none ${
                                        selectedRole === "user"
                                            ? "bg-white text-slate-900 shadow-sm border border-emerald-300/80"
                                            : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                                    }`}
                                >
                                    <div
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                            selectedRole === "user"
                                                ? "bg-emerald-600 text-white shadow-2xs"
                                                : "bg-slate-200/80 text-slate-500"
                                        }`}
                                    >
                                        <HardHat size={16} strokeWidth={2.4} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="text-xs font-black tracking-tight leading-tight truncate">
                                            HSE Officer
                                        </div>
                                        <div className="text-[9.5px] text-slate-500 truncate mt-0.5 leading-none">
                                            Pelapor Lapangan
                                        </div>
                                    </div>
                                    {selectedRole === "user" && (
                                        <div className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* STATUS NOTIFICATION (IF ANY) */}
                        {status && (
                            <div className="mb-3 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                                <span className="truncate">{status}</span>
                            </div>
                        )}

                        {/* ERROR ALERT */}
                        {errors.email && (
                            <div className="mb-3 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                                <AlertTriangle size={15} className="text-rose-600 shrink-0" />
                                <span className="truncate">{errors.email}</span>
                            </div>
                        )}

                        {/* ── FORM LOGIN ── */}
                        <form onSubmit={handleSubmit} className="space-y-3">
                            
                            {/* FIELD: EMAIL / USERNAME */}
                            <div>
                                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                                    Alamat Email / ID Pegawai
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                        onFocus={() => setFocusedInput("email")}
                                        onBlur={() => setFocusedInput(null)}
                                        placeholder={
                                            selectedRole === "admin"
                                                ? "admin@besmindo.com"
                                                : "bms01@besmindo.com atau kode rig"
                                        }
                                        required
                                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none transition-all ${
                                            focusedInput === "email"
                                                ? "border-emerald-500 ring-2 ring-emerald-200/80 bg-white"
                                                : "border-slate-200 hover:border-slate-300"
                                        }`}
                                    />
                                </div>
                            </div>

                            {/* FIELD: PASSWORD */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
                                        Kata Sandi
                                    </label>
                                    <Link
                                        href="/forgot-password"
                                        tabIndex={-1}
                                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                                    >
                                        Lupa Sandi?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={data.password}
                                        onChange={(e) => setData("password", e.target.value)}
                                        onFocus={() => setFocusedInput("password")}
                                        onBlur={() => setFocusedInput(null)}
                                        placeholder="••••••••"
                                        required
                                        className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none transition-all ${
                                            focusedInput === "password"
                                                ? "border-emerald-500 ring-2 ring-emerald-200/80 bg-white"
                                                : "border-slate-200 hover:border-slate-300"
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md"
                                    >
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            {/* REMEMBER ME & HINT */}
                            <div className="flex items-center justify-between text-xs pt-0.5">
                                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData("remember", e.target.checked)}
                                        className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                                    />
                                    <span>Ingat sesi masuk</span>
                                </label>
                                <span className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider">
                                    {selectedRole === "admin" ? "Sesi Admin" : "Sesi Kru Lapangan"}
                                </span>
                            </div>

                            {/* PRIMARY CTA BUTTON (BUTTON-IN-BUTTON HIGH-END ARCHITECTURE) */}
                            <div className="pt-1">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="group relative w-full h-11 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-700/20 hover:shadow-lg hover:shadow-emerald-700/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-between px-4 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:opacity-60"
                                >
                                    <span className="truncate">
                                        {processing
                                            ? "Memverifikasi Akun..."
                                            : selectedRole === "admin"
                                            ? "Masuk Dashboard Admin"
                                            : "Masuk Portal Kru Rig"}
                                    </span>
                                    <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
                                        <ArrowRight size={15} strokeWidth={2.5} />
                                    </div>
                                </button>
                            </div>
                        </form>

                        {/* REGISTER ACCOUNT LINK */}
                        <div className="mt-3.5 pt-3 border-t border-slate-100 text-center">
                            <p className="text-[11.5px] font-semibold text-slate-500">
                                Belum memiliki hak akses akun?{" "}
                                <Link
                                    href="/register"
                                    className="font-black text-emerald-700 hover:text-emerald-800 hover:underline transition-colors"
                                >
                                    Ajukan Pendaftaran
                                </Link>
                            </p>
                        </div>
                    </div>
                </main>

                {/* ── MINIMAL COMPACT FOOTER (NO SCROLLING) ── */}
                <footer className="relative z-10 py-2.5 text-center text-slate-400 text-[11px] font-medium shrink-0">
                    <div>
                        &copy; {new Date().getFullYear()} <strong>PT Besmindo Materi Sewatama</strong> &bull; Contractor Safety Management System (CSMS)
                    </div>
                </footer>
            </div>
        </>
    );
}
