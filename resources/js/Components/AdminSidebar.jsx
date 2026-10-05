import React, { useEffect } from "react";
import { Link, usePage, router } from "@inertiajs/react";

import {
    Users,
    Settings,
    CircleHelp,
    LogOut,
    HardDrive,
    ShieldCheck,
    ChevronRight,
} from "lucide-react";

// Navy Radiant Blue — permanent single theme
const COLORS = {
    bg:          "#0b1329",
    border:      "#1e293b",
    profileBg:   "#131f37",
    labelColor:  "#64748b",
    textMain:    "#f1f5f9",
    textMuted:   "#94a3b8",
    activeBg:    "#1e293b",
    hoverBg:     "#131f37",
    hoverText:   "#38bdf8",
    activeText:  "#ffffff",
    iconActive:  "#38bdf8",
    iconMuted:   "#64748b",
};

function AdminSidebar() {
    const { url } = usePage();

    const menuItems = [
        { name: "CSMS Storage (20 RIG)", href: "/csms",           icon: HardDrive },
        { name: "User Management",       href: "/admin/users",    icon: Users     },
        { name: "Settings",              href: "/admin/settings", icon: Settings  },
    ];

    const isActive = (href) => url === href || url.startsWith(href + "/");

    const handleLogout = () => {
        router.post("/logout");
    };

    useEffect(() => {
        document.documentElement.style.setProperty("--admin-sidebar-width", "220px");
        window.dispatchEvent(new CustomEvent("admin-sidebar-resize", { detail: { collapsed: false } }));
    }, []);

    return (
        <aside
            style={{
                position: "fixed",
                left: 0,
                top: 0,
                width: "220px",
                height: "100vh",
                backgroundColor: COLORS.bg,
                borderRight: `1px solid ${COLORS.border}`,
                display: "flex",
                flexDirection: "column",
                zIndex: 1000,
                boxSizing: "border-box",
                overflow: "hidden",
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
        >
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>

                {/* ── HEADER / BRANDING ── */}
                <div style={{
                    height: "88px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 16px",
                    borderBottom: `1px solid ${COLORS.border}`,
                    boxSizing: "border-box",
                    flexShrink: 0,
                }}>
                    <Link href="/csms" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", textDecoration: "none" }}>
                        <img
                            src="/images/logo-besmindo.png"
                            alt="BESMINDO"
                            style={{
                                width: "100%",
                                maxWidth: "185px",
                                height: "auto",
                                maxHeight: "58px",
                                objectFit: "contain",
                                display: "block",
                                imageRendering: "auto",
                                transform: "translateZ(0)",
                                backfaceVisibility: "hidden",
                            }}
                        />
                    </Link>
                </div>

                {/* ── USER PROFILE ── */}
                <div style={{
                    padding: "14px 14px",
                    boxSizing: "border-box",
                    flexShrink: 0,
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 10px",
                        borderRadius: "10px",
                        backgroundColor: COLORS.profileBg,
                        border: `1px solid ${COLORS.border}`,
                    }}>
                        <div style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            backgroundColor: "#0ea5e9",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: "0 2px 4px rgba(14, 165, 233, 0.25)",
                        }}>
                            <ShieldCheck size={17} strokeWidth={2.4} />
                        </div>
                        <div style={{ overflow: "hidden", flex: 1 }}>
                            <div style={{
                                fontSize: "12.5px",
                                fontWeight: "600",
                                color: COLORS.textMain,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                lineHeight: "1.2",
                            }}>
                                Rig HSE Admin
                            </div>
                            <div style={{
                                fontSize: "11px",
                                color: COLORS.textMuted,
                                marginTop: "2px",
                                whiteSpace: "nowrap",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                            }}>
                                <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#10b981", display: "inline-block" }}></span>
                                <span>Online</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── MENU CATEGORY ── */}
                <div style={{
                    padding: "6px 18px 6px",
                    fontSize: "11px",
                    fontWeight: "600",
                    color: COLORS.labelColor,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    flexShrink: 0,
                }}>
                    Menu
                </div>

                {/* ── NAVIGATION ── */}
                <nav style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "2px 10px",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                }}>
                    {menuItems.map((item) => {
                        const active = isActive(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "9px 12px",
                                    borderRadius: "9px",
                                    textDecoration: "none",
                                    backgroundColor: active ? COLORS.activeBg : "transparent",
                                    color: active ? COLORS.activeText : COLORS.textMuted,
                                    fontSize: "13px",
                                    fontWeight: active ? "600" : "500",
                                    transition: "all 0.15s ease",
                                }}
                                onMouseEnter={(e) => {
                                    if (!active) {
                                        e.currentTarget.style.backgroundColor = COLORS.hoverBg;
                                        e.currentTarget.style.color = COLORS.hoverText;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!active) {
                                        e.currentTarget.style.backgroundColor = "transparent";
                                        e.currentTarget.style.color = COLORS.textMuted;
                                    }
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <Icon
                                        size={17}
                                        strokeWidth={active ? 2.3 : 1.9}
                                        style={{
                                            color: active ? COLORS.iconActive : COLORS.iconMuted,
                                            flexShrink: 0,
                                        }}
                                    />
                                    <span style={{ whiteSpace: "nowrap" }}>{item.name}</span>
                                </div>
                                {active && (
                                    <ChevronRight size={13} style={{ color: COLORS.iconActive, opacity: 0.8 }} />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* ── FOOTER / ACTIONS ── */}
                <div style={{
                    padding: "12px 10px",
                    borderTop: `1px solid ${COLORS.border}`,
                    boxSizing: "border-box",
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                }}>
                    <button
                        type="button"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: "transparent",
                            color: COLORS.textMuted,
                            fontSize: "13px",
                            fontWeight: "500",
                            cursor: "pointer",
                            textAlign: "left",
                            boxSizing: "border-box",
                            transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = COLORS.hoverBg;
                            e.currentTarget.style.color = COLORS.textMain;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = COLORS.textMuted;
                        }}
                    >
                        <CircleHelp size={16} strokeWidth={1.9} />
                        <span>Bantuan / Support</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: "transparent",
                            color: "#ef4444",
                            fontSize: "13px",
                            fontWeight: "500",
                            cursor: "pointer",
                            textAlign: "left",
                            boxSizing: "border-box",
                            transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.12)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                        }}
                    >
                        <LogOut size={16} strokeWidth={1.9} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default AdminSidebar;
