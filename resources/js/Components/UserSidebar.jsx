import React, { useEffect } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import {
    CircleHelp,
    LogOut,
    HardDrive,
    ShieldCheck,
    ChevronRight,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../Contexts/ThemeContext";

export default function UserSidebar() {
    const { url } = usePage();
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const isActive = (path) => {
        if (!url) return false;
        return url.startsWith(path);
    };

    const handleLogout = () => {
        localStorage.removeItem("isLoggedIn");
        router.post("/logout");
    };

    useEffect(() => {
        if (typeof document !== "undefined") {
            document.documentElement.style.setProperty("--admin-sidebar-width", "220px");
        }
    }, []);

    return (
        <aside
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0,
                width: "220px",
                backgroundColor: isDark ? "#0b1329" : "#ffffff",
                borderRight: isDark ? "1px solid #1e293b" : "1px solid #edf2f7",
                display: "flex",
                flexDirection: "column",
                zIndex: 999,
                overflow: "hidden",
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                transition: "background-color 0.25s ease, border-color 0.25s ease",
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
                    borderBottom: isDark ? "1px solid #1e293b" : "1px solid #f1f5f9",
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
                        backgroundColor: isDark ? "#131f37" : "#f8fafc",
                        border: isDark ? "1px solid #1e293b" : "1px solid #f1f5f9",
                        transition: "all 0.25s ease",
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
                                color: isDark ? "#f1f5f9" : "#0f172a",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                lineHeight: "1.2",
                            }}>
                                Field PIC / User
                            </div>
                            <div style={{
                                fontSize: "11px",
                                color: isDark ? "#94a3b8" : "#64748b",
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
                    color: isDark ? "#64748b" : "#94a3b8",
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
                    <Link
                        href="/csms"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "9px 12px",
                            borderRadius: "9px",
                            textDecoration: "none",
                            backgroundColor: isActive("/csms")
                                ? isDark ? "#1e293b" : "#0f172a"
                                : "transparent",
                            color: isActive("/csms")
                                ? "#ffffff"
                                : isDark ? "#94a3b8" : "#475569",
                            fontSize: "13px",
                            fontWeight: isActive("/csms") ? "600" : "500",
                            transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                            if (!isActive("/csms")) {
                                e.currentTarget.style.backgroundColor = isDark ? "#131f37" : "#f1f5f9";
                                e.currentTarget.style.color = isDark ? "#38bdf8" : "#0f172a";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive("/csms")) {
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.color = isDark ? "#94a3b8" : "#475569";
                            }
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <HardDrive
                                size={17}
                                strokeWidth={isActive("/csms") ? 2.3 : 1.9}
                                style={{
                                    color: isActive("/csms")
                                        ? "#38bdf8"
                                        : isDark ? "#64748b" : "#64748b",
                                    flexShrink: 0,
                                }}
                            />
                            <span style={{ whiteSpace: "nowrap" }}>CSMS Storage (20 RIG)</span>
                        </div>
                        {isActive("/csms") && (
                            <ChevronRight size={13} style={{ color: "#38bdf8", opacity: 0.8 }} />
                        )}
                    </Link>
                </nav>

                {/* ── FOOTER / ACTIONS ── */}
                <div style={{
                    padding: "12px 10px",
                    borderTop: isDark ? "1px solid #1e293b" : "1px solid #f1f5f9",
                    boxSizing: "border-box",
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                }}>
                    {/* Theme Mode Switcher */}
                    <div style={{ marginBottom: "2px" }}>
                        <ThemeToggle />
                    </div>

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
                            color: isDark ? "#94a3b8" : "#64748b",
                            fontSize: "13px",
                            fontWeight: "500",
                            cursor: "pointer",
                            textAlign: "left",
                            boxSizing: "border-box",
                            transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDark ? "#131f37" : "#f1f5f9";
                            e.currentTarget.style.color = isDark ? "#e2e8f0" : "#0f172a";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = isDark ? "#94a3b8" : "#64748b";
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
                            e.currentTarget.style.backgroundColor = isDark ? "rgba(239, 68, 68, 0.12)" : "#fef2f2";
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
