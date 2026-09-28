import React, { useEffect, useState } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import {
    ClipboardList,
    CircleHelp,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    UserCheck,
    HardDrive,
} from "lucide-react";

export default function UserSidebar({
    collapsed: collapsedProp,
    onToggle,
}) {
    const { url } = usePage();

    /*
    |--------------------------------------------------------------------------
    | SIDEBAR STATE
    |--------------------------------------------------------------------------
    */
    const [internalCollapsed, setInternalCollapsed] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("besmindo_user_sidebar_collapsed");
            if (saved !== null) {
                return saved === "true";
            }
        }
        return false;
    });

    const isControlled = typeof collapsedProp === "boolean";
    const collapsed = isControlled ? collapsedProp : internalCollapsed;

    /*
    |--------------------------------------------------------------------------
    | RESPONSIVE
    |--------------------------------------------------------------------------
    */
    useEffect(() => {
        if (isControlled) return;

        const handleResize = () => {
            if (window.innerWidth <= 900) {
                setInternalCollapsed(true);
            } else {
                const saved = localStorage.getItem("besmindo_user_sidebar_collapsed");
                if (saved !== null) {
                    setInternalCollapsed(saved === "true");
                } else {
                    setInternalCollapsed(false);
                }
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isControlled]);

    /*
    |--------------------------------------------------------------------------
    | TOGGLE
    |--------------------------------------------------------------------------
    */
    const handleToggle = () => {
        if (onToggle) {
            onToggle();
        } else {
            const next = !internalCollapsed;
            setInternalCollapsed(next);
            if (typeof window !== "undefined") {
                localStorage.setItem(
                    "besmindo_user_sidebar_collapsed",
                    String(next)
                );
            }
        }
    };

    /*
    |--------------------------------------------------------------------------
    | ACTIVE CHECK
    |--------------------------------------------------------------------------
    */
    const isActive = (path) => {
        if (!url) return false;
        return url.startsWith(path);
    };

    /*
    |--------------------------------------------------------------------------
    | LOGOUT
    |--------------------------------------------------------------------------
    */
    const handleLogout = () => {
        localStorage.removeItem("isLoggedIn");
        router.post("/logout");
    };

    const sidebarWidth = collapsed ? "78px" : "215px";

    useEffect(() => {
        if (typeof document !== "undefined") {
            document.documentElement.style.setProperty(
                "--admin-sidebar-width",
                sidebarWidth
            );
        }
    }, [sidebarWidth]);

    return (
        <>
            <aside
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: sidebarWidth,
                    backgroundColor: "#ffffff",
                    borderRight: "1px solid #e2e8f0",
                    display: "flex",
                    flexDirection: "column",
                    zIndex: 999,
                    transition:
                        "width 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s",
                    boxShadow: "2px 0 16px rgba(0, 77, 50, 0.04)",
                    fontFamily:
                        "'Instrument Sans', 'Plus Jakarta Sans', -apple-system, sans-serif",
                }}
            >
                {/* =====================================================
                    TOGGLE BUTTON
                ===================================================== */}
                <button
                    type="button"
                    onClick={handleToggle}
                    title={collapsed ? "Buka Sidebar" : "Tutup Sidebar"}
                    style={{
                        position: "absolute",
                        top: "18px",
                        right: "-13px",
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        backgroundColor: "#004d32",
                        border: "2px solid #efff00",
                        color: "#efff00",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                        boxShadow: "0 0 10px rgba(239, 255, 0, 0.35)",
                        transition: "transform 0.15s ease",
                    }}
                >
                    {collapsed ? (
                        <ChevronRight size={14} strokeWidth={3} />
                    ) : (
                        <ChevronLeft size={14} strokeWidth={3} />
                    )}
                </button>

                {/* =====================================================
                    LOGO / BRANDING
                ===================================================== */}
                <div
                    style={{
                        height: "90px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: collapsed ? "10px 8px" : "10px 18px",
                        borderBottom: "1px solid #e2e8f0",
                        boxSizing: "border-box",
                        overflow: "hidden",
                    }}
                >
                    <img
                        src="/images/besmindo-logo.png"
                        alt="BESMINDO"
                        style={{
                            width: collapsed ? "42px" : "100%",
                            maxWidth: collapsed ? "42px" : "175px",
                            height: "auto",
                            maxHeight: collapsed ? "42px" : "60px",
                            objectFit: "contain",
                            transition: "all 0.25s ease",
                        }}
                    />
                </div>

                {/* =====================================================
                    USER PROFILE CARD
                ===================================================== */}
                <div
                    style={{
                        padding: collapsed ? "14px 8px" : "14px 14px",
                        borderBottom: "1px solid #e2e8f0",
                        backgroundColor: "#fcfdfc",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: collapsed ? "0" : "10px",
                            justifyContent: collapsed ? "center" : "flex-start",
                        }}
                    >
                        <div
                            style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "8px",
                                backgroundColor: "#004d32",
                                border: "1px solid #efff00",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#efff00",
                                flexShrink: 0,
                                boxShadow: "0 0 8px rgba(239, 255, 0, 0.2)",
                            }}
                        >
                            <UserCheck size={18} strokeWidth={2.5} />
                        </div>

                        {!collapsed && (
                            <div style={{ overflow: "hidden" }}>
                                <div
                                    style={{
                                        fontSize: "13px",
                                        fontWeight: "800",
                                        color: "#004d32",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Field PIC / Operator
                                </div>
                                <div
                                    style={{
                                        fontSize: "10px",
                                        color: "#64748b",
                                        fontWeight: "600",
                                        marginTop: "1px",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Data Entry Access
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* =====================================================
                    NAVIGATION MENU (INPUT DATA ONLY)
                ===================================================== */}
                <nav
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: collapsed ? "16px 8px" : "16px 12px",
                        boxSizing: "border-box",
                    }}
                >
                    <div
                        style={{
                            fontSize: "10px",
                            fontWeight: "800",
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            padding: "0 8px",
                            marginBottom: "8px",
                            display: collapsed ? "none" : "block",
                        }}
                    >
                        Form Menu
                    </div>

                    <Link
                        href="/csms"
                        title={collapsed ? "CSMS Storage (20 RIG)" : ""}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: collapsed ? "center" : "flex-start",
                            width: "100%",
                            boxSizing: "border-box",
                            padding: collapsed ? "10px 8px" : "10px 14px",
                            marginBottom: "8px",
                            borderRadius: "10px",
                            textDecoration: "none",
                            background: isActive("/csms") ? "#004d32" : "transparent",
                            color: isActive("/csms") ? "#efff00" : "#334155",
                            border: isActive("/csms") ? "1px solid #efff00" : "1px solid transparent",
                            fontSize: "12.5px",
                            fontWeight: "800",
                            letterSpacing: "-0.01em",
                            minHeight: "40px",
                            overflow: "hidden",
                            boxShadow: isActive("/csms")
                                ? "0 0 14px rgba(239, 255, 0, 0.35), inset 0 0 8px rgba(239, 255, 0, 0.15)"
                                : "none",
                            transition: "all 0.2s ease",
                        }}
                    >
                        <span
                            style={{
                                width: "24px",
                                minWidth: "24px",
                                height: "24px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: collapsed ? "0" : "10px",
                                color: isActive("/csms") ? "#efff00" : "#004d32",
                                flexShrink: 0,
                            }}
                        >
                            <HardDrive size={18} strokeWidth={2.6} />
                        </span>

                        {!collapsed && (
                            <span
                                style={{
                                    whiteSpace: "nowrap",
                                }}
                            >
                                CSMS Storage (20 RIG)
                            </span>
                        )}
                    </Link>

                    {/* CSMS Menu Only */}
                </nav>

                {/* =====================================================
                    BOTTOM MENU (LOGOUT & HELP)
                ===================================================== */}
                <div
                    style={{
                        borderTop: "1px solid #e2e8f0",
                        padding: collapsed ? "12px 8px" : "12px",
                        boxSizing: "border-box",
                        flexShrink: 0,
                    }}
                >
                    <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: collapsed ? "center" : "flex-start",
                            width: "100%",
                            padding: collapsed ? "8px" : "8px 12px",
                            borderRadius: "8px",
                            backgroundColor: "transparent",
                            color: "#b91c1c",
                            fontSize: "12px",
                            fontWeight: "700",
                            border: "1px solid transparent",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#fef2f2";
                            e.currentTarget.style.borderColor = "#fecaca";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.borderColor = "transparent";
                        }}
                    >
                        <LogOut
                            size={16}
                            style={{
                                marginRight: collapsed ? "0" : "10px",
                                flexShrink: 0,
                            }}
                        />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
