import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
    theme: "light",
    toggleTheme: () => {},
    setTheme: () => {},
});

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        if (typeof window !== "undefined") {
            // Gunakan key theme_v2 agar me-reset settingan lama yang terkunci di dark mode
            const saved = localStorage.getItem("theme_v2");
            if (saved === "light" || saved === "dark") {
                return saved;
            }
        }
        return "light"; // Pastikan selalu default ke putih/terang
    });

    const applyTheme = (newTheme) => {
        const root = document.documentElement;
        if (newTheme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem("theme_v2", newTheme);
        setThemeState(newTheme);
        window.dispatchEvent(new CustomEvent("theme-change", { detail: { theme: newTheme } }));
    };

    useEffect(() => {
        applyTheme(theme);
    }, []);

    const toggleTheme = () => {
        applyTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: applyTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
