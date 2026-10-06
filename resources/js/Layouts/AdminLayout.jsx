import React from "react";
import AdminSidebar from "../Components/AdminSidebar";
import { ThemeProvider, useTheme } from "../Contexts/ThemeContext";

function AdminLayoutInner({ children }) {
    const sidebarWidth = 240;
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <div
            className={`min-h-screen w-full transition-colors duration-250 ${
                isDark ? "bg-[#020617] text-slate-100" : "bg-[#f8fafc] text-slate-800"
            }`}
            style={{
                minHeight: "100vh",
                width: "100%",
                overflowX: "hidden",
            }}
        >
            {/* =====================================================
                SIDEBAR
            ===================================================== */}
            <AdminSidebar />

            {/* =====================================================
                MAIN CONTENT
            ===================================================== */}
            <div                                
                style={{
                    marginLeft: `${sidebarWidth}px`,
                    width: `calc(100% - ${sidebarWidth}px)`,
                    minHeight: "100vh",
                    boxSizing: "border-box",
                    transition: "margin-left 0.25s ease, width 0.25s ease",
                    overflowX: "hidden",
                }}
            >
                {children}
            </div>
        </div>
    );
}

export default function AdminLayout({ children }) {
    return (
        <ThemeProvider>
            <AdminLayoutInner>{children}</AdminLayoutInner>
        </ThemeProvider>
    );
}