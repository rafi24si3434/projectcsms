import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../Contexts/ThemeContext";

export default function ThemeToggle({ className = "", compact = false }) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? "Beralih ke Light Mode" : "Beralih ke Dark Mode"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: compact ? "center" : "space-between",
                width: compact ? "auto" : "100%",
                padding: compact ? "8px" : "8px 12px",
                borderRadius: "9px",
                border: isDark ? "1px solid rgba(51, 65, 85, 0.7)" : "1px solid #e2e8f0",
                backgroundColor: isDark ? "rgba(15, 23, 42, 0.85)" : "#f8fafc",
                color: isDark ? "#e2e8f0" : "#475569",
                fontSize: "12.5px",
                fontWeight: "500",
                cursor: "pointer",
                boxSizing: "border-box",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: isDark
                    ? "0 2px 6px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
                    : "0 1px 3px rgba(0, 0, 0, 0.04)",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? "#1e293b" : "#f1f5f9";
                e.currentTarget.style.color = isDark ? "#38bdf8" : "#0f172a";
                if (isDark) {
                    e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.4)";
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? "rgba(15, 23, 42, 0.85)" : "#f8fafc";
                e.currentTarget.style.color = isDark ? "#e2e8f0" : "#475569";
                e.currentTarget.style.borderColor = isDark ? "rgba(51, 65, 85, 0.7)" : "#e2e8f0";
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <span
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "22px",
                        height: "22px",
                        borderRadius: "6px",
                        backgroundColor: isDark ? "rgba(56, 189, 248, 0.15)" : "rgba(245, 158, 11, 0.15)",
                        color: isDark ? "#38bdf8" : "#d97706",
                        flexShrink: 0,
                        transition: "all 0.2s ease",
                    }}
                >
                    {isDark ? (
                        <Moon size={14} strokeWidth={2.4} />
                    ) : (
                        <Sun size={14} strokeWidth={2.4} />
                    )}
                </span>
                {!compact && (
                    <span>{isDark ? "Dark Theme" : "Light Theme"}</span>
                )}
            </div>

            {!compact && (
                <span
                    style={{
                        fontSize: "10px",
                        padding: "2px 7px",
                        borderRadius: "6px",
                        backgroundColor: isDark ? "rgba(56, 189, 248, 0.12)" : "rgba(100, 116, 139, 0.1)",
                        color: isDark ? "#38bdf8" : "#64748b",
                        fontWeight: "600",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                    }}
                >
                    {isDark ? "Dark" : "Light"}
                </span>
            )}
        </button>
    );
}
