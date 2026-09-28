import React, { useState } from "react";
import AdminSidebar from "../Components/AdminSidebar";

export default function AdminLayout({ children }) {
    const [collapsed, setCollapsed] = useState(false);

    const sidebarWidth = collapsed ? 68 : 215;

    return (
        <div
            style={{
                minHeight: "100vh",
                width: "100%",
                backgroundColor: "#f8fafc",
                overflowX: "hidden",
            }}
        >
            {/* =====================================================
                SIDEBAR
            ===================================================== */}
            <AdminSidebar
                collapsed={collapsed}
                onToggle={() =>
                    setCollapsed((prev) => !prev)
                }
            />

            {/* =====================================================
                MAIN CONTENT
            ===================================================== */}
            <div                                
                style={{
                    marginLeft: `${sidebarWidth}px`,

                    width: `calc(100% - ${sidebarWidth}px)`,

                    minHeight: "100vh",

                    boxSizing: "border-box",

                    transition:
                        "margin-left 0.25s ease, width 0.25s ease",

                    overflowX: "hidden",
                }}
            >
                {children}
            </div>
        </div>
    );
}