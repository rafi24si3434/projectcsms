import React, { useState, useRef, useEffect } from "react";
import { Head, useForm } from "@inertiajs/react";
import {
    ShieldCheck,
    Lock,
    Mail,
    UserCheck,
    AlertCircle,
    Eye,
    EyeOff,
    CheckCircle2,
    HardHat,
    ArrowRight,
    ChevronDown,
    User,
    Check,
} from "lucide-react";

/**
 * Standardize Rig Name format: "BMS 01" -> "BMS-01", "BMS 03A" -> "BMS-03A"
 */
const formatRigName = (code, name) => {
    const raw = (code || name || "").trim();
    let clean = raw.replace(/^RIG\s+/i, "").trim();
    clean = clean.replace(/^(BMS)\s*[-_]?\s*(\w+)/i, (_, p1, p2) => `${p1.toUpperCase()}-${p2.toUpperCase()}`);
    return clean;
};

/**
 * Custom Minimalist & Modern Dropdown Component
 */
function CustomSelect({
    value,
    onChange,
    options = [],
    placeholder = "Pilih opsi",
    disabled = false,
    icon: Icon,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    const selectedOption = options.find((opt) =>
        typeof opt === "object" ? String(opt.value) === String(value) : String(opt) === String(value)
    );

    const selectedLabel = selectedOption
        ? typeof selectedOption === "object"
            ? selectedOption.label
            : selectedOption
        : null;

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen((prev) => !prev)}
                className={`w-full pl-10 pr-9 py-2.5 rounded-xl text-xs sm:text-sm text-left transition-all flex items-center justify-between border select-none ${
                    disabled
                        ? "bg-slate-100/70 border-slate-200 text-slate-400 cursor-not-allowed opacity-80"
                        : isOpen
                        ? "bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs cursor-pointer"
                        : "bg-slate-50 border-slate-200 text-slate-900 hover:bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                }`}
            >
                {/* Left Icon */}
                <div
                    className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
                        disabled ? "text-slate-300" : "text-emerald-600"
                    }`}
                >
                    {Icon && <Icon className="h-4 w-4" />}
                </div>

                {/* Selected Text or Muted Placeholder */}
                <span
                    className={`truncate ${
                        selectedLabel
                            ? "font-semibold text-slate-800"
                            : "font-normal text-slate-400"
                    }`}
                >
                    {selectedLabel || placeholder}
                </span>

                {/* Chevron Down */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-emerald-600" : ""
                        }`}
                    />
                </div>
            </button>

            {/* Floating Dropdown Card */}
            {isOpen && !disabled && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1 transition-all">
                    <div className="max-h-56 overflow-y-auto divide-y divide-slate-50 focus:outline-none">
                        {options.length === 0 ? (
                            <div className="px-4 py-3 text-xs text-slate-400 text-center italic">
                                Tidak ada opsi tersedia
                            </div>
                        ) : (
                            options.map((option, idx) => {
                                const val = typeof option === "object" ? option.value : option;
                                const lbl = typeof option === "object" ? option.label : option;
                                const isSelected = String(val) === String(value);

                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSelect(val)}
                                        className={`w-full px-4 py-2.5 text-xs sm:text-sm text-left flex items-center justify-between transition-colors cursor-pointer ${
                                            isSelected
                                                ? "bg-emerald-50 text-emerald-800 font-bold"
                                                : "text-slate-700 font-medium hover:bg-emerald-50/70 hover:text-emerald-800"
                                        }`}
                                    >
                                        <span className="truncate">{lbl}</span>
                                        {isSelected && (
                                            <Check className="h-4 w-4 text-emerald-600 shrink-0 ml-2" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Login({ status, activeRigs = [] }) {
    const [activeRole, setActiveRole] = useState("admin"); // "admin" | "officer"
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRigId, setSelectedRigId] = useState("");
    const [hfoError, setHfoError] = useState("");

    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
        role: "admin",
        hfo_name: "",
    });

    const handleRoleChange = (role) => {
        setActiveRole(role);
        setSelectedRigId("");
        setHfoError("");
        setData((prev) => ({
            ...prev,
            email: "",
            password: "",
            role: role === "admin" ? "admin" : "user",
            hfo_name: "",
        }));
    };

    const handleRigSelect = (rigId) => {
        setSelectedRigId(rigId);
        setHfoError("");
        const rig = activeRigs.find((r) => String(r.id) === String(rigId));
        if (rig) {
            setData((prev) => ({
                ...prev,
                email: rig.email,
                hfo_name: "",
            }));
        } else {
            setData((prev) => ({
                ...prev,
                email: "",
                hfo_name: "",
            }));
        }
    };

    const selectedRig = activeRigs.find((r) => String(r.id) === String(selectedRigId));
    const hfoOptions = selectedRig?.hfos || [];

    const rigOptions = activeRigs.map((rig) => ({
        value: rig.id,
        label: formatRigName(rig.code, rig.name),
    }));

    const hfoDropdownOptions = hfoOptions.map((hfo) => ({
        value: hfo,
        label: hfo,
    }));

    const submit = (e) => {
        e.preventDefault();
        if (activeRole !== "admin") {
            if (selectedRigId && !data.hfo_name) {
                setHfoError("Silakan pilih petugas HFO yang sedang bertugas.");
                return;
            }
        }
        post("/login", {
            onFinish: () => reset("password"),
        });
    };

    return (
        <div className="min-h-screen relative flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased selection:bg-emerald-600 selection:text-white overflow-hidden">
            <Head title="Masuk - CSMS PT Besmindo Materi Sewatama" />

            {/* ── FULLSCREEN BACKGROUND IMAGE WITH MODERATE BLUR ── */}
            <div
                className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat bg-fixed scale-105 pointer-events-none z-0"
                style={{
                    backgroundImage: "url('/images/background-besmindo.jpg')",
                    filter: "blur(4px)",
                }}
            />

            {/* ── TRANSPARENT GREEN OVERLAY (HIJAU TRANSPARAN ELEGAN) ── */}
            <div className="fixed inset-0 w-full h-full bg-gradient-to-b from-[#046A38]/50 via-emerald-950/60 to-slate-950/70 backdrop-blur-xs pointer-events-none z-0" />

            {/* Background Decorative Subtle Ambient Glow */}
            <div className="fixed -top-32 -right-32 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none z-0" />
            <div className="fixed -bottom-32 -left-32 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none z-0" />

            <div className="w-full max-w-md space-y-5 relative z-10">
                {/* ── 1. HEADER SECTION (TUNGGAL, HD, & INTERAKTIF RESPONSIF) ── */}
                <div className="flex flex-col items-center text-center">
                    {/* Interactive Group Container (Logo & Teks) */}
                    <div className="group flex flex-col items-center cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-105 active:scale-95">
                        {/* ── LOGO BERLIAN DENGAN GARIS LED NEON MENGIKUTI SILUET LOGO (100% TRANSPARAN, FULL CONTINUOUS GEOMETRY GLOW) ── */}
                        <div className="relative z-10 w-28 h-28 mx-auto flex items-center justify-center animate-dynamic-logo">
                            {/* SVG Kontur Neon: Menyelimuti Seluruh Garis Luar Geometri Logo Besmindo Secara Penuh + Berkas Cahaya Mengalir */}
                            <svg
                                className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20"
                                viewBox="0 0 512 512"
                            >
                                <defs>
                                    {/* Gradien Neon Mengalir: White-Hot Head Node -> Electric Cyan -> Emerald Glow */}
                                    <linearGradient id="diamondNeonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                                        <stop offset="25%" stopColor="#00f2fe" stopOpacity="1" />
                                        <stop offset="65%" stopColor="#10b981" stopOpacity="0.95" />
                                        <stop offset="100%" stopColor="#043B72" stopOpacity="0.1" />
                                    </linearGradient>

                                    {/* Neon Glow Bloom Filter */}
                                    <filter id="diamondNeonBloom" x="-40%" y="-40%" width="180%" height="180%">
                                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
                                        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
                                        <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur3" />
                                        <feMerge>
                                            <feMergeNode in="blur3" />
                                            <feMergeNode in="blur2" />
                                            <feMergeNode in="blur1" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                {/* 1. Full Continuous Neon Glow Outline (Menyala Utuh Penuh Mengelilingi Seluruh Geometri) */}
                                <path
                                    d="M 36,24 L 382,24 L 476,118 L 476,480 L 146,480 L 36,370 Z"
                                    fill="none"
                                    stroke="#06b6d4"
                                    strokeOpacity="0.8"
                                    strokeWidth="3.5"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    filter="url(#diamondNeonBloom)"
                                />

                                {/* 2. Secondary Inner Neon Ring (Emerald/Cyan Aksen Lembut) */}
                                <path
                                    d="M 36,24 L 382,24 L 476,118 L 476,480 L 146,480 L 36,370 Z"
                                    fill="none"
                                    stroke="#10b981"
                                    strokeOpacity="0.9"
                                    strokeWidth="1.8"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                />

                                {/* 3. Berkas Sinar Pijar Neon Super Terang Mengalir Secara Kontinyu */}
                                <path
                                    d="M 36,24 L 382,24 L 476,118 L 476,480 L 146,480 L 36,370 Z"
                                    fill="none"
                                    stroke="url(#diamondNeonGrad)"
                                    strokeWidth="5.5"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    pathLength="1680"
                                    className="animate-diamond-neon"
                                    filter="url(#diamondNeonBloom)"
                                />
                            </svg>

                            {/* Logo Navy Utama & Kilatan Permukaan (100% Transparan, Tanpa Kotak Pembungkus) */}
                            <div className="relative w-full h-full flex items-center justify-center">
                                <img
                                    src="/images/logo-besmindo.png"
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = "/images/logo-besmindo.webp";
                                    }}
                                    alt="Logo PT Besmindo Materi Sewatama"
                                    className="w-full h-full object-contain select-none transition-all duration-300"
                                />
                                {/* Surface Dynamic Light Sweep Effect */}
                                <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden [clip-path:polygon(7%_5%,75%_5%,93%_23%,93%_94%,29%_94%,7%_72%)]">
                                    <div className="w-[50%] h-[220%] -top-12 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-light-sweep pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Teks Judul Utama */}
                        <h1 className="text-xl font-bold tracking-wider text-white drop-shadow-md mt-3 uppercase select-none transition-colors duration-200">
                            BESMINDO MATERI SEWATAMA
                        </h1>

                        {/* Teks Sub-Judul Miring */}
                        <p className="text-xs font-semibold italic text-slate-200 mt-1 select-none drop-shadow-xs">
                            Drilling &amp; Workover Rig Services
                        </p>
                    </div>

                    {/* Badge K3 Standar */}
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-900/60 border border-emerald-400/40 text-emerald-300 shadow-sm backdrop-blur-md">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-[10.5px] sm:text-xs font-bold tracking-widest uppercase">
                            SAFETY FIRST • ZERO ACCIDENT
                        </span>
                    </div>
                </div>

                {/* ── 2. FORM CARD LOGIN (PUTIH BERSIH) ── */}
                <div className="bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl border border-slate-200/80 p-6 sm:p-7 space-y-5 relative overflow-hidden">
                    {/* Top Accent Line Gradasi Navy - Hijau Pekat Emerald (#046A38) - Emerald */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#043B72] via-[#046A38] to-emerald-500 rounded-t-2xl" />

                    {/* Tab Pilihan Hak Akses */}
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                            Pilih Hak Akses
                        </label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/90 rounded-xl border border-slate-200">
                            <button
                                type="button"
                                onClick={() => handleRoleChange("admin")}
                                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                                    activeRole === "admin"
                                        ? "bg-gradient-to-r from-[#046A38] to-emerald-600 text-white shadow-md"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                <UserCheck className={`w-4 h-4 ${activeRole === "admin" ? "text-white" : "text-slate-400"}`} />
                                <span>HSE Admin</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleRoleChange("officer")}
                                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                                    activeRole === "officer"
                                        ? "bg-gradient-to-r from-[#046A38] to-emerald-600 text-white shadow-md"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                <HardHat className={`w-4 h-4 ${activeRole === "officer" ? "text-white" : "text-slate-400"}`} />
                                <span>HSE Crew</span>
                            </button>
                        </div>
                    </div>

                    {/* Status Alert */}
                    {status && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{status}</span>
                        </div>
                    )}

                    {/* Form Input */}
                    <form onSubmit={submit} className="space-y-4" autoComplete="off">
                        {activeRole === "admin" ? (
                            /* ── ADMIN LOGIN: USERNAME INPUT ── */
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    USERNAME
                                </label>
                                <div className="relative rounded-xl shadow-2xs">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <input
                                        id="username"
                                        type="text"
                                        name="email"
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                        placeholder="admin"
                                        className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        required
                                        autoComplete="off"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                        ) : (
                            /* ── HSE CREW LOGIN: CUSTOM FLOATING DROPDOWNS ── */
                            <>
                                {/* 1. Dropdown UNIT RIG */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        UNIT RIG
                                    </label>
                                    <CustomSelect
                                        value={selectedRigId}
                                        onChange={(val) => handleRigSelect(val)}
                                        options={rigOptions}
                                        placeholder="Pilih Unit RIG"
                                        icon={HardHat}
                                    />
                                    {errors.email && (
                                        <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* 2. Dropdown HFO (HES Field Officer) */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        HFO (HES Field Officer)
                                    </label>
                                    <CustomSelect
                                        value={data.hfo_name}
                                        onChange={(val) => {
                                            setData("hfo_name", val);
                                            if (hfoError) setHfoError("");
                                        }}
                                        options={hfoDropdownOptions}
                                        placeholder={
                                            !selectedRigId
                                                ? "Pilih Unit RIG terlebih dahulu"
                                                : hfoOptions.length === 0
                                                ? "(Belum ada personil HFO terdaftar)"
                                                : "Pilih Petugas HFO"
                                        }
                                        disabled={!selectedRigId || hfoOptions.length === 0}
                                        icon={User}
                                    />
                                    {hfoError && (
                                        <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            {hfoError}
                                        </p>
                                    )}
                                    {data.hfo_name && (
                                        <p className="mt-1.5 text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                            <span>
                                                Petugas bertugas:{" "}
                                                <strong className="text-emerald-900">{data.hfo_name}</strong>{" "}
                                                (otomatis dicatat sebagai uploader).
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Input Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    PASSWORD
                                </label>
                            </div>
                            <div className="relative rounded-xl shadow-2xs">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData("password", e.target.value)}
                                    placeholder="••••••••"
                                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between pt-0.5">
                            <label className="flex items-center cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData("remember", e.target.checked)}
                                    className="rounded border-slate-300 text-emerald-600 shadow-2xs focus:ring-emerald-500 cursor-pointer"
                                />
                                <span className="ml-2 text-xs font-medium text-slate-600">
                                    Ingat sesi masuk
                                </span>
                            </label>
                            <span className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider">
                                {activeRole === "admin" ? "Sesi Admin" : "Sesi Kru Rig"}
                            </span>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full mt-1.5 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>
                                        Masuk Dashboard {activeRole === "admin" ? "HSE Admin" : "HSE Crew"}
                                    </span>
                                    <ArrowRight className="w-4 h-4 ml-0.5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Disclaimer Keamanan Akses Internal */}
                    <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                        <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
                            Akses Terbatas • PT Besmindo Materi Sewatama<br />
                            Kendala akun atau akses sistem? Hubungi{" "}
                            <span className="text-emerald-700 font-semibold">Administrator HSE Pusat</span>
                        </p>
                    </div>
                </div>

                {/* ── 3. FOOTER SECTION (1X) ── */}
                <div className="text-center pt-1 pb-2">
                    <p className="text-xs text-slate-300 font-medium drop-shadow-xs">
                        &copy; 2026 PT Besmindo Materi Sewatama. All rights reserved.
                    </p>
                    <p className="text-xs text-slate-400 mt-1 font-medium drop-shadow-xs">
                        Created by Salsabila Adinda Putri
                    </p>
                </div>
            </div>
        </div>
    );
}
