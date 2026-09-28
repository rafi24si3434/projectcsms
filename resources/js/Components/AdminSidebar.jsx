import React, { useEffect, useState } from "react";
import { Link, usePage, router } from "@inertiajs/react";

import {
    LayoutDashboard,
    ClipboardList,
    ShieldCheck,
    BarChart3,
    Target,
    FileText,
    Settings2,
    CheckCircle2,
    FileBarChart,
    CalendarDays,
    TrendingUp,
    Users,
    Settings,
    CircleHelp,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight,
    HardDrive,
} from "lucide-react";

function AdminSidebar({
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
            const saved = localStorage.getItem("besmindo_admin_sidebar_collapsed");
            if (saved !== null) {
                return saved === "true";
            }
        }
        return false;
    });

    // Kalau dipakai bersama AdminLayout, state berasal dari parent.
    // Kalau belum ada AdminLayout, sidebar tetap bisa berjalan sendiri.
    const isControlled = typeof collapsedProp === "boolean";
    const collapsed = isControlled
        ? collapsedProp
        : internalCollapsed;

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
                const saved = localStorage.getItem("besmindo_admin_sidebar_collapsed");
                if (saved !== null) {
                    setInternalCollapsed(saved === "true");
                } else {
                    setInternalCollapsed(false);
                }
            }
        };

        handleResize();

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [isControlled]);

    /*
    |--------------------------------------------------------------------------
    | MENU
    |--------------------------------------------------------------------------
    */
    const menuItems = [
        {
            name: "CSMS Storage (20 RIG)",
            href: "/csms",
            icon: HardDrive,
        },

        {
            name: "User Management",
            href: "/admin/users",
            icon: Users,
        },

        {
            name: "Settings",
            href: "/admin/settings",
            icon: Settings,
        },
    ];

    /*
    |--------------------------------------------------------------------------
    | ACTIVE MENU
    |--------------------------------------------------------------------------
    */
    const isActive = (href) => {
        return (
            url === href ||
            url.startsWith(href + "/")
        );
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

    /*
    |--------------------------------------------------------------------------
    | TOGGLE
    |--------------------------------------------------------------------------
    */
    const toggleSidebar = () => {
        if (typeof onToggle === "function") {
            onToggle();
            return;
        }

        setInternalCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== "undefined") {
                localStorage.setItem("besmindo_admin_sidebar_collapsed", String(next));
            }
            return next;
        });
    };

    // Beri tahu layout/global page lebar sidebar saat berubah.
    useEffect(() => {
        document.documentElement.style.setProperty(
            "--admin-sidebar-width",
            collapsed ? "68px" : "215px"
        );
        window.dispatchEvent(new CustomEvent("admin-sidebar-resize", { detail: { collapsed } }));
    }, [collapsed]);

    return (
        <>
            {/* =========================================================
                SIDEBAR
            ========================================================= */}
            <aside
                style={{
                    position: "fixed",
                    left: 0,
                    top: 0,

                    width: collapsed
                        ? "68px"
                        : "215px",

                    height: "100vh",

                    backgroundColor: "#ffffff",

                    borderRight:
                        "1px solid #e2e8f0",

                    display: "flex",

                    flexDirection: "column",

                    zIndex: 1000,

                    boxSizing: "border-box",

                    overflow: "visible",

                    transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                {/* =====================================================
                    SIDEBAR INNER
                ===================================================== */}
                <div
                    style={{
                        width: "100%",

                        height: "100%",

                        backgroundColor:
                            "#ffffff",

                        display: "flex",

                        flexDirection:
                            "column",

                        boxSizing:
                            "border-box",

                        transition:
                            "width 0.25s ease",

                        overflow: "hidden",

                        borderRight:
                            "1px solid #e2e8f0",
                    }}
                >
                    {/* =================================================
                        LOGO
                    ================================================= */}
                    <div
                        style={{
                            height: "90px",

                            display: "flex",

                            alignItems:
                                "center",

                            justifyContent:
                                "center",

                            padding:
                                collapsed
                                    ? "10px 8px"
                                    : "10px 18px",

                            borderBottom:
                                "1px solid #e2e8f0",

                            boxSizing:
                                "border-box",

                            flexShrink: 0,
                        }}
                    >
                        <img
                            src="/images/logo-besmindo.png"
                            alt="BESMINDO"
                            style={{
                                width:
                                    collapsed
                                        ? "42px"
                                        : "100%",

                                maxWidth:
                                    collapsed
                                        ? "42px"
                                        : "175px",

                                height: "auto",

                                maxHeight:
                                    collapsed
                                        ? "42px"
                                        : "70px",

                                objectFit:
                                    "contain",

                                display: "block",

                                transition:
                                    "all 0.25s ease",
                            }}
                        />
                    </div>

                    {/* =================================================
                        ADMIN PROFILE
                    ================================================= */}
                    <div
                        style={{
                            padding:
                                collapsed
                                    ? "16px 8px"
                                    : "16px",

                            borderBottom:
                                "1px solid #e2e8f0",

                            boxSizing:
                                "border-box",

                            flexShrink: 0,
                        }}
                    >
                        <div
                            style={{
                                display:
                                    "flex",

                                alignItems:
                                    "center",

                                justifyContent:
                                    collapsed
                                        ? "center"
                                        : "flex-start",

                                gap: "12px",
                            }}
                        >
                            {/* CHECK ICON */}
                            <div
                                style={{
                                    width: "38px",
                                    height: "38px",

                                    borderRadius:
                                        "50%",

                                    backgroundColor:
                                        "#004d32",

                                    display:
                                        "flex",

                                    alignItems:
                                        "center",

                                    justifyContent:
                                        "center",

                                    color:
                                        "#efff00",

                                    fontSize:
                                        "18px",

                                    fontWeight:
                                        "bold",

                                    flexShrink: 0,
                                }}
                            >
                                ✓
                            </div>

                            {/* PROFILE TEXT */}
                            {!collapsed && (
                                <div>
                                    <div
                                        style={{
                                            fontSize:
                                                "13.5px",

                                            fontWeight:
                                                "700",

                                            color:
                                                "#004d32",

                                            whiteSpace:
                                                "nowrap",
                                        }}
                                    >
                                        Rig HSE Admin
                                    </div>

                                    <div
                                        style={{
                                            fontSize:
                                                "11px",

                                            color:
                                                "#64748b",

                                            marginTop:
                                                "2px",

                                            whiteSpace:
                                                "nowrap",

                                            fontWeight:
                                                "500",
                                        }}
                                    >
                                        Administrator
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* =================================================
                        MENU
                    ================================================= */}
                    <nav
                        style={{
                            flex: 1,

                            overflowY: "auto",

                            overflowX: "hidden",

                            padding:
                                collapsed
                                    ? "18px 8px"
                                    : "18px 12px",

                            boxSizing:
                                "border-box",
                        }}
                    >
                        {menuItems.map((item) => {
                            const active =
                                isActive(
                                    item.href
                                );

                            const Icon =
                                item.icon;

                            return (
                                <Link
                                    key={
                                        item.href
                                    }
                                    href={
                                        item.href
                                    }
                                    title={
                                        collapsed
                                            ? item.name
                                            : ""
                                    }
                                    style={{
                                        display:
                                            "flex",

                                        alignItems:
                                            "center",

                                        justifyContent:
                                            collapsed
                                                ? "center"
                                                : "flex-start",

                                        width:
                                            "100%",

                                        boxSizing:
                                            "border-box",

                                        padding:
                                            collapsed
                                                ? "10px 8px"
                                                : "10px 14px",

                                        marginBottom:
                                            "4px",

                                        borderRadius:
                                            "10px",

                                        textDecoration:
                                            "none",

                                        background:
                                            active
                                                ? "#004d32"
                                                : "transparent",

                                        color:
                                            active
                                                ? "#efff00"
                                                : "#334155",

                                        border:
                                            active
                                                ? "1px solid #efff00"
                                                : "1px solid transparent",

                                        fontSize:
                                            "12.5px",

                                        fontWeight:
                                            active ? "800" : "600",

                                        letterSpacing:
                                            "-0.01em",

                                        minHeight:
                                            "40px",

                                        overflow:
                                            "hidden",

                                        boxShadow:
                                            active
                                                ? "0 0 14px rgba(239, 255, 0, 0.35), inset 0 0 8px rgba(239, 255, 0, 0.15)"
                                                : "none",

                                        transition:
                                            "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                    }}
                                >
                                    {/* MENU ICON */}
                                    <span
                                        style={{
                                            width:
                                                "24px",

                                            minWidth:
                                                "24px",

                                            height:
                                                "24px",

                                            display:
                                                "flex",

                                            alignItems:
                                                "center",

                                            justifyContent:
                                                "center",

                                            marginRight:
                                                collapsed
                                                    ? "0"
                                                    : "10px",

                                            color:
                                                active
                                                    ? "#efff00"
                                                    : "#004d32",

                                            flexShrink:
                                                0,
                                        }}
                                    >
                                        <Icon
                                            size={17}
                                            strokeWidth={
                                                active ? 2.6 : 2
                                            }
                                        />
                                    </span>

                                    {/* MENU NAME */}
                                    {!collapsed && (
                                        <span
                                            style={{
                                                whiteSpace:
                                                    "nowrap",
                                                textShadow:
                                                    active
                                                        ? "0 0 10px rgba(239, 255, 0, 0.5)"
                                                        : "none",
                                            }}
                                        >
                                            {
                                                item.name
                                            }
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* =================================================
                        BOTTOM MENU
                    ================================================= */}
                    <div
                        style={{
                            borderTop:
                                "1px solid #e2e8f0",

                            padding:
                                collapsed
                                    ? "12px 8px"
                                    : "12px",

                            boxSizing:
                                "border-box",

                            flexShrink: 0,
                        }}
                    >
                        {/* =================================================
                            SUPPORT
                        ================================================= */}
                        <button
                            type="button"
                            title={
                                collapsed
                                    ? "Support"
                                    : ""
                            }
                            style={{
                                display:
                                    "flex",

                                alignItems:
                                    "center",

                                justifyContent:
                                    collapsed
                                        ? "center"
                                        : "flex-start",

                                width:
                                    "100%",

                                padding:
                                    collapsed
                                        ? "12px 8px"
                                        : "12px",

                                border: "none",

                                background:
                                    "transparent",

                                color:
                                    "#475569",

                                fontSize:
                                    "10px",

                                fontWeight:
                                    "700",

                                textTransform:
                                    "uppercase",

                                letterSpacing:
                                    "0.08em",

                                cursor:
                                    "pointer",

                                textAlign:
                                    "left",

                                boxSizing:
                                    "border-box",
                            }}
                        >
                            <span
                                style={{
                                    width:
                                        "24px",

                                    minWidth:
                                        "24px",

                                    height:
                                        "24px",

                                    display:
                                        "flex",

                                    alignItems:
                                        "center",

                                    justifyContent:
                                        "center",

                                    marginRight:
                                        collapsed
                                            ? "0"
                                            : "8px",

                                    color:
                                        "#006b45",
                                }}
                            >
                                <CircleHelp
                                    size={17}
                                    strokeWidth={
                                        2.2
                                    }
                                />
                            </span>

                            {!collapsed && (
                                <span>
                                    Support
                                </span>
                            )}
                        </button>

                        {/* =================================================
                            LOGOUT
                        ================================================= */}
                        <button
                            type="button"
                            onClick={
                                handleLogout
                            }
                            title={
                                collapsed
                                    ? "Logout"
                                    : ""
                            }
                            style={{
                                display:
                                    "flex",

                                alignItems:
                                    "center",

                                justifyContent:
                                    collapsed
                                        ? "center"
                                        : "flex-start",

                                width:
                                    "100%",

                                padding:
                                    collapsed
                                        ? "12px 8px"
                                        : "12px",

                                border: "none",

                                background:
                                    "transparent",

                                color:
                                    "#475569",

                                fontSize:
                                    "10px",

                                fontWeight:
                                    "700",

                                textTransform:
                                    "uppercase",

                                letterSpacing:
                                    "0.08em",

                                cursor:
                                    "pointer",

                                textAlign:
                                    "left",

                                boxSizing:
                                    "border-box",
                            }}
                        >
                            <span
                                style={{
                                    width:
                                        "24px",

                                    minWidth:
                                        "24px",

                                    height:
                                        "24px",

                                    display:
                                        "flex",

                                    alignItems:
                                        "center",

                                    justifyContent:
                                        "center",

                                    marginRight:
                                        collapsed
                                            ? "0"
                                            : "8px",

                                    color:
                                        "#006b45",
                                }}
                            >
                                <LogOut
                                    size={17}
                                    strokeWidth={
                                        2.2
                                    }
                                />
                            </span>

                            {!collapsed && (
                                <span>
                                    Logout
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* =====================================================
                    TOMBOL COLLAPSE
                ===================================================== */}
                <button
                    type="button"
                    onClick={
                        toggleSidebar
                    }
                    title={
                        collapsed
                            ? "Buka Sidebar"
                            : "Sembunyikan Sidebar"
                    }
                    aria-label={
                        collapsed
                            ? "Buka Sidebar"
                            : "Sembunyikan Sidebar"
                    }
                    style={{
                        position:
                            "absolute",

                        left:
                            collapsed
                                ? "56px"
                                : "203px",

                        top: "174px",

                        width: "24px",

                        height: "24px",

                        borderRadius:
                            "50%",

                        border:
                            "1px solid #d1d5db",

                        backgroundColor:
                            "#ffffff",

                        color:
                            "#004d32",

                        display:
                            "flex",

                        alignItems:
                            "center",

                        justifyContent:
                            "center",

                        cursor:
                            "pointer",

                        zIndex: 2000,

                        boxShadow:
                            "0 1px 4px rgba(0,0,0,0.15)",

                        padding: 0,

                        lineHeight: 1,
                    }}
                >
                    {collapsed ? (
                        <ChevronRight
                            size={15}
                            strokeWidth={2.5}
                        />
                    ) : (
                        <ChevronLeft
                            size={15}
                            strokeWidth={2.5}
                        />
                    )}
                </button>
            </aside>
        </>
    );
}

export default AdminSidebar;