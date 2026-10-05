import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
    theme: "dark",
    toggleTheme: () => {},
    setTheme: () => {},
});

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("theme");
            if (saved === "light" || saved === "dark") {
                return saved;
            }
        }
        return "dark"; // Default to dark mode
    });

    const applyTheme = (newTheme) => {
        const root = document.documentElement;
        if (newTheme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem("theme", newTheme);
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
