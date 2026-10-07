import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    Users,
    Settings,
    LogOut,
    HardDrive,
    ShieldCheck,
    ChevronRight,
    HardHat,
    FileSpreadsheet,
    PhoneCall,
    Activity,
    Layers,
    UserCheck,
    Clock,
} from "lucide-react";
import { router } from "@inertiajs/react";

function AdminSidebar() {
    const { url, props } = usePage();
    const currentUser      = props.auth?.user;
    const isRigUser        = currentUser?.role === "user";
    const userRig          = currentUser?.rig;
    const pendingCount     = props.pendingUsersCount ?? 0;

    // Menu untuk Admin HSE
    const adminMainMenu = [
        { name: "CSMS Storage (20 RIG)", href: "/csms",            icon: HardDrive },
        { name: "Verifikasi & ACC CSMS", href: "/csms/input-rig",  icon: ShieldCheck },
    ];

    const adminManagementMenu = [
        { name: "User Management",   href: "/admin/users",    icon: Users,    badge: pendingCount },
        { name: "Pengaturan Sistem", href: "/admin/settings", icon: Settings, badge: 0 },
    ];

    // Menu khusus untuk User Rig Lapangan
    const rigUserMenu = [
        {
            name: `Input Dokumen (${userRig?.code || "Rig Saya"})`,
            href: "/csms/input-rig",
            icon: FileSpreadsheet,
        },
        {
            name: "Matriks Dokumen K3",
            href: `/csms/rig/${currentUser?.csms_rig_id || 1}`,
            icon: Layers,
        },
    ];

    const isActive = (href) =>
        url === href || (href !== "/csms" && url.startsWith(href));

    const handleLogout = () => {
        router.post("/logout");
    };

    return (
        <aside
            className="fixed left-0 top-0 h-screen flex flex-col bg-white border-r border-slate-200 z-50 shadow-xs font-sans transition-colors duration-200"
            style={{ width: "240px" }}
        >
            {/* ── SAFETY HAZARD ACCENT STRIPE AT TOP ── */}
            <div
                className="w-full h-1.5 shrink-0"
                style={{
                    background:
                        "repeating-linear-gradient(45deg, #f59e0b, #f59e0b 10px, #1e293b 10px, #1e293b 20px)",
                }}
            />

            {/* ── BRANDING & LOGO SECTION ── */}
            <div className="p-5 border-b border-slate-100 shrink-0 flex flex-col items-center justify-center">
                <Link href={isRigUser ? "/csms/input-rig" : "/csms"} className="block focus:outline-none">
                    <img
                        src="/images/logo-besmindo.png"
                        alt="PT BESMINDO MATERI SEWATAMA"
                        className="w-auto h-auto max-h-[46px] max-w-[185px] object-contain"
                    />
                </Link>
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">
                    <HardHat size={12} className="text-emerald-600" />
                    <span>{isRigUser ? `RIG OPS • ${userRig?.code || "LAPANGAN"}` : "HSE & CSMS Portal"}</span>
                </div>
            </div>

            {/* ── USER PROFILE CARD ── */}
            <div className="p-4 pb-2 shrink-0">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        {isRigUser ? (
                            <HardHat size={18} strokeWidth={2.4} />
                        ) : (
                            <ShieldCheck size={18} strokeWidth={2.4} />
                        )}
                    </div>
                    <div className="overflow-hidden flex-1">
                        <div className="text-[12px] font-black text-slate-800 truncate leading-tight">
                            {currentUser?.name || (isRigUser ? "Operator Rig" : "HSE Officer")}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5 truncate">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                            <span className="truncate">
                                {isRigUser ? (userRig ? userRig.name : "Rig Ditugaskan") : "Admin Pusat"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── SCROLLABLE NAVIGATION ── */}
            <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4">
                {isRigUser ? (
                    /* ═══════════ NAVIGASI USER LAPANGAN ═══════════ */
                    <div>
                        <div className="px-3 pb-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                            <span>Pelaporan Rig Saya</span>
                            <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">
                                {userRig?.code || "RIG"}
                            </span>
                        </div>
                        <div className="space-y-1">
                            {rigUserMenu.map((item) => {
                                const active = isActive(item.href);
                                const Icon   = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all focus:outline-none ${
                                            active
                                                ? "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 shadow-2xs"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon
                                                size={17}
                                                strokeWidth={active ? 2.5 : 2}
                                                className={active ? "text-emerald-600" : "text-slate-400"}
                                            />
                                            <span className="truncate">{item.name}</span>
                                        </div>
                                        {active && <ChevronRight size={14} className="text-emerald-600 opacity-80" />}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    /* ═══════════ NAVIGASI ADMIN HSE ═══════════ */
                    <>
                        {/* Section 1: Modul CSMS */}
                        <div>
                            <div className="px-3 pb-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Modul CSMS & K3
                            </div>
                            <div className="space-y-1">
                                {adminMainMenu.map((item) => {
                                    const active = isActive(item.href);
                                    const Icon   = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all focus:outline-none ${
                                                active
                                                    ? "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 shadow-2xs"
                                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon
                                                    size={17}
                                                    strokeWidth={active ? 2.5 : 2}
                                                    className={active ? "text-emerald-600" : "text-slate-400"}
                                                />
                                                <span className="truncate">{item.name}</span>
                                            </div>
                                            {active && <ChevronRight size={14} className="text-emerald-600 opacity-80" />}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Section 2: Administrasi Pusat */}
                        <div>
                            <div className="px-3 pb-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Administrasi Pusat
                            </div>
                            <div className="space-y-1">
                                {adminManagementMenu.map((item) => {
                                    const active = isActive(item.href);
                                    const Icon   = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all focus:outline-none ${
                                                active
                                                    ? "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 shadow-2xs"
                                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon
                                                    size={17}
                                                    strokeWidth={active ? 2.5 : 2}
                                                    className={active ? "text-emerald-600" : "text-slate-400"}
                                                />
                                                <span className="truncate">{item.name}</span>
                                            </div>
                                            {/* Badge notifikasi pending */}
                                            {item.badge > 0 ? (
                                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black animate-pulse">
                                                    <Clock size={9} />
                                                    {item.badge}
                                                </span>
                                            ) : active ? (
                                                <ChevronRight size={14} className="text-emerald-600 opacity-80" />
                                            ) : null}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}

                {/* ── K3 SAFETY MOTTO ── */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/70 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold text-[11px]">
                        <Activity size={14} className="text-emerald-600" />
                        <span>K3 & Safety Culture</span>
                    </div>
                    <p className="text-[10.5px] text-slate-600 leading-relaxed font-medium">
                        {isRigUser
                            ? `"Utamakan Keselamatan Kerja dan patuhi SOP di Rig ${userRig?.code || ""}."`
                            : `"Utamakan Keselamatan dan Kesehatan Kerja di Seluruh 20 Rig BMS."`}
                    </p>
                    <div className="pt-1 border-t border-emerald-200/50 flex items-center justify-between text-[9.5px] text-emerald-700 font-bold">
                        <span>ISO / HSE Center</span>
                        <span>0852-6393-9902</span>
                    </div>
                </div>
            </div>

            {/* ── FOOTER ACTIONS ── */}
            <div className="p-3 border-t border-slate-100 shrink-0 space-y-1">
                <a
                    href="tel:085263939902"
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                    <PhoneCall size={15} className="text-slate-400" />
                    <span>Kontak HSE Coord</span>
                </a>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                    <LogOut size={15} />
                    <span>Keluar / Logout</span>
                </button>
            </div>
        </aside>
    );
}

export default AdminSidebar;
