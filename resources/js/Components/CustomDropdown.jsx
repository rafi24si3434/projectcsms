import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";

/**
 * CustomDropdown — Dropdown interaktif modern dan reusable sesuai tema HSE / Besmindo.
 *
 * Props:
 *  - value             {any}             Nilai yang sedang terpilih
 *  - onChange          {function}        Callback saat opsi dipilih: (val) => void
 *  - options           {Array}           Array opsi (string/number atau object { value, label, badge, sublabel, icon })
 *  - placeholder       {string}          Teks fallback saat tidak ada yang dipilih
 *  - headerLabel       {string}          Label header kecil di dalam popover (misal: "PILIH BULAN", "PILIH UNIT RIG")
 *  - icon              {ReactNode}       Ikon Lucide di sisi kiri trigger button (opsional)
 *  - variant           {"default"|"inline"|"form"}  Varian tampilan tombol
 *  - size              {"sm"|"md"}       Ukuran tombol
 *  - align             {"left"|"right"}  Posisi dropdown melayang (default: "left")
 *  - minWidth          {string}          Lebar minimal dropdown panel (misal: "min-w-[200px]" atau "w-56")
 *  - searchable        {boolean}         Tampilkan search bar jika opsi banyak (default: true jika opsi > 8)
 *  - searchPlaceholder {string}          Placeholder untuk kotak pencarian
 *  - showCheck         {boolean}         Tampilkan ikon centang pada opsi aktif (default: true)
 *  - disabled          {boolean}         Status disabled
 *  - className         {string}          Class container terluar
 *  - buttonClassName   {string}          Custom class tambahan untuk tombol trigger
 *  - menuClassName     {string}          Custom class tambahan untuk panel popover
 */
export default function CustomDropdown({
    value,
    onChange,
    options = [],
    placeholder = "Pilih opsi",
    headerLabel,
    icon: Icon,
    variant = "default",
    size = "md",
    align = "left",
    minWidth,
    searchable,
    searchPlaceholder = "Cari pilihan...",
    showCheck = true,
    disabled = false,
    className = "",
    buttonClassName = "",
    menuClassName = "",
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    // Normalisasi struktur opsi
    const normalizedOptions = useMemo(() => {
        return (options || []).map((opt) => {
            if (typeof opt === "object" && opt !== null) {
                return {
                    value: opt.value !== undefined ? opt.value : opt.id,
                    label: opt.label !== undefined ? opt.label : (opt.name || String(opt.value)),
                    badge: opt.badge,
                    sublabel: opt.sublabel,
                    icon: opt.icon,
                };
            }
            return {
                value: opt,
                label: String(opt),
            };
        });
    }, [options]);

    // Opsi terpilih saat ini
    const selectedOption = useMemo(() => {
        return normalizedOptions.find((opt) => String(opt.value) === String(value));
    }, [normalizedOptions, value]);

    // Auto-detect apakah pencarian perlu aktif
    const isSearchable = searchable !== undefined ? searchable : normalizedOptions.length > 8;

    // Filter opsi berdasarkan input pencarian
    const filteredOptions = useMemo(() => {
        if (!searchTerm.trim()) return normalizedOptions;
        const q = searchTerm.toLowerCase();
        return normalizedOptions.filter((opt) => {
            const labelStr = typeof opt.label === "string" ? opt.label : String(opt.label || "");
            const valStr = String(opt.value || "");
            const badgeStr = opt.badge ? String(opt.badge) : "";
            return (
                labelStr.toLowerCase().includes(q) ||
                valStr.toLowerCase().includes(q) ||
                badgeStr.toLowerCase().includes(q)
            );
        });
    }, [normalizedOptions, searchTerm]);

    // Klik di luar untuk menutup dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
                setSearchTerm("");
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    // Auto focus pada search input saat terbuka
    useEffect(() => {
        if (isOpen && isSearchable && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
        }
    }, [isOpen, isSearchable]);

    const handleSelect = (val) => {
        onChange?.(val);
        setIsOpen(false);
        setSearchTerm("");
    };

    // Styling tombol sesuai variant
    let baseButtonClasses = "";
    if (variant === "inline") {
        // Digunakan di dalam wadah periode yang sudah punya background & border (seperti di sebelah YearSelect)
        baseButtonClasses = `inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 py-1 px-1.5 rounded-lg hover:bg-slate-100/70 transition-all cursor-pointer select-none`;
    } else if (variant === "form") {
        // Digunakan di dalam formulir modal input
        baseButtonClasses = `w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer select-none ${
            isOpen ? "border-emerald-500 ring-2 ring-emerald-500/20" : ""
        }`;
    } else {
        // Variant default: tombol kapsul / rounded rapi pada bar filter
        const sizeClasses = size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-xs sm:text-sm";
        baseButtonClasses = `inline-flex items-center justify-between gap-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl ${sizeClasses} font-bold text-slate-700 shadow-2xs transition-all cursor-pointer select-none ${
            isOpen ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs" : ""
        }`;
    }

    if (disabled) {
        baseButtonClasses += " opacity-60 cursor-not-allowed pointer-events-none";
    }

    // Penentuan lebar container popover
    const defaultWidth = minWidth || (variant === "inline" ? "w-52 sm:w-56" : "min-w-full sm:min-w-[200px]");
    const alignClass = align === "right" ? "right-0 left-auto" : "left-0 right-auto";

    return (
        <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
            {/* Tombol Pemicu (Trigger Button) */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => {
                    if (!disabled) {
                        setIsOpen((prev) => !prev);
                        setSearchTerm("");
                    }
                }}
                className={`${baseButtonClasses} ${buttonClassName}`}
                title={selectedOption ? String(selectedOption.label) : placeholder}
            >
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                    {Icon && <Icon size={size === "sm" ? 13 : 14} className="text-emerald-600 shrink-0" />}
                    <span className="truncate">
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    {selectedOption?.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
                            {selectedOption.badge}
                        </span>
                    )}
                </div>
                <ChevronDown
                    size={size === "sm" ? 12 : 13}
                    className={`text-slate-400 shrink-0 transition-transform duration-200 ml-1 ${
                        isOpen ? "rotate-180 text-emerald-600" : ""
                    }`}
                />
            </button>

            {/* Menu Popover Melayang (Dropdown Panel) */}
            {isOpen && (
                <div
                    className={`absolute top-full mt-1.5 ${alignClass} ${defaultWidth} bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col divide-y divide-slate-100 ${menuClassName}`}
                    style={{ animation: "fadeIn 0.15s ease-out" }}
                >
                    {/* Header Label Opsional */}
                    {headerLabel && (
                        <div className="px-3 py-2 bg-slate-50/90 flex items-center justify-between shrink-0">
                            <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-500">
                                {headerLabel}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200/70 text-slate-600">
                                {normalizedOptions.length}
                            </span>
                        </div>
                    )}

                    {/* Quick Search Bar jika item banyak */}
                    {isSearchable && (
                        <div className="p-2 bg-white shrink-0 border-b border-slate-100">
                            <div className="relative">
                                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={searchPlaceholder}
                                    className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Daftar Opsi Pilihan (Scrollable) */}
                    <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 flex-1 custom-thin-scrollbar">
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-slate-400 italic">
                                Tidak ada opsi yang cocok
                            </div>
                        ) : (
                            filteredOptions.map((opt, idx) => {
                                const isSelected = String(opt.value) === String(value);

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => handleSelect(opt.value)}
                                        className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                                            isSelected
                                                ? "bg-emerald-50 text-emerald-800 font-extrabold shadow-2xs"
                                                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            {showCheck && (
                                                isSelected ? (
                                                    <Check size={14} className="text-emerald-600 shrink-0 stroke-[2.5]" />
                                                ) : (
                                                    <span className="w-3.5 shrink-0" />
                                                )
                                            )}
                                            {opt.icon && (
                                                <span className="shrink-0 text-slate-400 group-hover:text-slate-600">
                                                    {opt.icon}
                                                </span>
                                            )}
                                            <div className="truncate flex flex-col min-w-0">
                                                <span className="truncate">{opt.label}</span>
                                                {opt.sublabel && (
                                                    <span className="text-[10px] text-slate-400 font-normal">
                                                        {opt.sublabel}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {opt.badge && (
                                            <span
                                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-2 shrink-0 ${
                                                    isSelected
                                                        ? "bg-emerald-100 text-emerald-800"
                                                        : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                                                }`}
                                            >
                                                {opt.badge}
                                            </span>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
