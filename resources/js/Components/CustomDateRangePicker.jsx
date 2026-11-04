import React, { useState, useRef, useEffect, useMemo } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

const MONTH_NAMES_ID = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const MONTH_SHORT_ID = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

/**
 * Format string "YYYY-MM-DD" menjadi "DD Mmm YYYY" (contoh: "05 Okt 2026")
 */
export const formatDateDisplay = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string" || !dateStr.includes("-")) return "";
    const parts = dateStr.split("-");
    if (parts.length < 3) return dateStr;
    const y = parts[0];
    const m = parseInt(parts[1], 10) - 1;
    const d = parts[2];
    return `${d} ${MONTH_SHORT_ID[m] || parts[1]} ${y}`;
};

/**
 * Format Date object ke "YYYY-MM-DD"
 */
const toDateString = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

/**
 * CustomDateRangePicker — Komponen pemilih rentang tanggal kustom dengan popover kalender
 * modern bernuansa HSE / Besmindo (Emerald Theme).
 *
 * Props:
 * - startDate      {string}   Tanggal mulai ("YYYY-MM-DD")
 * - endDate        {string}   Tanggal akhir ("YYYY-MM-DD")
 * - onChange       {function} Callback saat rentang diterapkan: (startDate, endDate) => void
 * - onReset        {function} Callback saat tombol reset diklik (opsional)
 * - align          {"left"|"right"} Posisi popover kalender melayang (default: "right")
 * - placeholder    {string}   Teks saat belum ada tanggal terpilih
 * - className      {string}   Class container terluar
 */
export default function CustomDateRangePicker({
    startDate,
    endDate,
    onChange,
    onReset,
    align = "right",
    placeholder = "Pilih Rentang Tanggal",
    className = "",
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // State draft rentang yang sedang dipilih di dalam kalender sebelum tombol Terapkan diklik
    const [draftStart, setDraftStart] = useState(startDate || "");
    const [draftEnd, setDraftEnd] = useState(endDate || "");
    const [hoverDate, setHoverDate] = useState(null);

    // Bulan & Tahun yang sedang dilihat pada kalender
    const initialDate = useMemo(() => {
        if (startDate && startDate.includes("-")) {
            const [y, m] = startDate.split("-").map(Number);
            return { year: y, month: m - 1 };
        }
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() };
    }, [startDate]);

    const [viewYear, setViewYear] = useState(initialDate.year);
    const [viewMonth, setViewMonth] = useState(initialDate.month);

    // Sinkronisasi state draft saat prop startDate/endDate berubah
    useEffect(() => {
        setDraftStart(startDate || "");
        setDraftEnd(endDate || "");
    }, [startDate, endDate]);

    // Sinkronisasi view kalender saat popover dibuka
    useEffect(() => {
        if (isOpen) {
            setDraftStart(startDate || "");
            setDraftEnd(endDate || "");
            setHoverDate(null);
            if (startDate && startDate.includes("-")) {
                const [y, m] = startDate.split("-").map(Number);
                setViewYear(y);
                setViewMonth(m - 1);
            }
        }
    }, [isOpen, startDate, endDate]);

    // Klik di luar untuk menutup popover
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setHoverDate(null);
                setDraftStart(startDate || "");
                setDraftEnd(endDate || "");
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, startDate, endDate]);

    // Navigasi Bulan Kalender
    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((y) => y - 1);
        } else {
            setViewMonth((m) => m - 1);
        }
    };

    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((y) => y + 1);
        } else {
            setViewMonth((m) => m + 1);
        }
    };

    // Quick Presets
    const presets = useMemo(() => {
        const today = new Date();

        // 7 Hari Terakhir
        const d7 = new Date(today);
        d7.setDate(today.getDate() - 6);

        // 30 Hari Terakhir
        const d30 = new Date(today);
        d30.setDate(today.getDate() - 29);

        // Bulan Ini
        const startThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Bulan Lalu
        const startLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

        return [
            {
                label: "7 Hari Terakhir",
                start: toDateString(d7),
                end: toDateString(today),
            },
            {
                label: "30 Hari Terakhir",
                start: toDateString(d30),
                end: toDateString(today),
            },
            {
                label: "Bulan Ini",
                start: toDateString(startThisMonth),
                end: toDateString(today),
            },
            {
                label: "Bulan Lalu",
                start: toDateString(startLastMonth),
                end: toDateString(endLastMonth),
            },
        ];
    }, []);

    // Terapkan Preset Cepat
    const handleSelectPreset = (preset) => {
        setDraftStart(preset.start);
        setDraftEnd(preset.end);
        setHoverDate(null);

        // Pindahkan tampilan kalender ke bulan start
        const [y, m] = preset.start.split("-").map(Number);
        setViewYear(y);
        setViewMonth(m - 1);

        // Terapkan langsung dan tutup
        if (onChange) {
            onChange(preset.start, preset.end);
        }
        setIsOpen(false);
    };

    // Hitung Kisi Angka Kalender (Grid 7 Kolom Senin - Minggu)
    const calendarDays = useMemo(() => {
        const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
        const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

        // Di JS getDay(): 0 = Minggu, 1 = Senin, dst.
        // Kita gunakan Senin sebagai hari pertama (0 = Senin ... 6 = Minggu)
        const jsDay = firstDayOfMonth.getDay();
        const startDayIndex = jsDay === 0 ? 6 : jsDay - 1;

        const cells = [];
        const todayStr = toDateString(new Date());

        // 1. Hari dari bulan sebelumnya (padding kiri)
        for (let i = startDayIndex - 1; i >= 0; i--) {
            const dayNum = daysInPrevMonth - i;
            const prevMonthDate = new Date(viewYear, viewMonth - 1, dayNum);
            const dateStr = toDateString(prevMonthDate);
            cells.push({
                dateStr,
                dayNum,
                isCurrentMonth: false,
                isToday: dateStr === todayStr,
            });
        }

        // 2. Hari bulan ini
        for (let d = 1; d <= daysInCurrentMonth; d++) {
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            cells.push({
                dateStr,
                dayNum: d,
                isCurrentMonth: true,
                isToday: dateStr === todayStr,
            });
        }

        // 3. Hari bulan berikutnya (padding kanan agar pas kelipatan 7 baris)
        const totalRows = Math.ceil(cells.length / 7);
        const totalCells = totalRows * 7;
        const remaining = totalCells - cells.length;
        for (let d = 1; d <= remaining; d++) {
            const nextMonthDate = new Date(viewYear, viewMonth + 1, d);
            const dateStr = toDateString(nextMonthDate);
            cells.push({
                dateStr,
                dayNum: d,
                isCurrentMonth: false,
                isToday: dateStr === todayStr,
            });
        }

        return cells;
    }, [viewYear, viewMonth]);

    // Handle klik tanggal pada kisi kalender
    const handleDateClick = (dateStr) => {
        // Jika belum ada start atau sudah ada start dan end, mulai pemilihan baru
        if (!draftStart || (draftStart && draftEnd)) {
            setDraftStart(dateStr);
            setDraftEnd("");
            setHoverDate(null);
            return;
        }

        // Jika start sudah ada dan end masih kosong
        if (draftStart && !draftEnd) {
            if (dateStr < draftStart) {
                // Jika tanggal yang diklik lebih awal dari start, tukar urutan
                setDraftStart(dateStr);
                setDraftEnd(draftStart);
            } else {
                setDraftEnd(dateStr);
            }
            setHoverDate(null);
        }
    };

    // Hitung range aktif sementara (memperhitungkan hover jika end belum dipilih)
    const activeRange = useMemo(() => {
        if (draftStart && draftEnd) {
            return {
                start: draftStart < draftEnd ? draftStart : draftEnd,
                end: draftStart < draftEnd ? draftEnd : draftStart,
            };
        }
        if (draftStart && hoverDate) {
            return {
                start: draftStart < hoverDate ? draftStart : hoverDate,
                end: draftStart < hoverDate ? hoverDate : draftStart,
            };
        }
        if (draftStart) {
            return { start: draftStart, end: draftStart };
        }
        return { start: null, end: null };
    }, [draftStart, draftEnd, hoverDate]);

    // Terapkan rentang terpilih
    const handleApply = () => {
        if (!draftStart) return;
        const finalStart = draftEnd ? (draftStart < draftEnd ? draftStart : draftEnd) : draftStart;
        const finalEnd = draftEnd ? (draftStart < draftEnd ? draftEnd : draftStart) : draftStart;

        if (onChange) {
            onChange(finalStart, finalEnd);
        }
        setIsOpen(false);
    };

    // Tombol Reset ke Default
    const handleReset = () => {
        if (onReset) {
            onReset();
            setIsOpen(false);
            return;
        }

        // Fallback default 30 hari terakhir
        const today = new Date();
        const d30 = new Date(today);
        d30.setDate(today.getDate() - 29);
        const defStart = toDateString(d30);
        const defEnd = toDateString(today);

        setDraftStart(defStart);
        setDraftEnd(defEnd);
        if (onChange) {
            onChange(defStart, defEnd);
        }
        setIsOpen(false);
    };

    // Label trigger button yang ringkas dan rapi
    const formattedLabel = useMemo(() => {
        if (startDate && endDate) {
            if (startDate === endDate) {
                return formatDateDisplay(startDate);
            }
            return `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`;
        }
        if (startDate) {
            return `${formatDateDisplay(startDate)} - ...`;
        }
        return placeholder;
    }, [startDate, endDate, placeholder]);

    const alignClass = align === "left" ? "left-0 right-auto" : "right-0 left-auto";

    return (
        <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
            {/* ── 1. TOMBOL PEMICU KAPSUL RAPI (TRIGGER BUTTON) ── */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`inline-flex items-center gap-2 bg-white border rounded-xl px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs select-none group ${
                    isOpen
                        ? "border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-800"
                        : "border-slate-200 hover:border-emerald-500 text-slate-700"
                }`}
                title={`Rentang Periode: ${formattedLabel}`}
            >
                <div className="flex items-center gap-1.5 text-emerald-700 shrink-0">
                    <Calendar size={14} className="text-emerald-600 group-hover:scale-105 transition-transform" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 hidden sm:inline">
                        Rentang:
                    </span>
                </div>
                <span className="font-semibold text-slate-800 group-hover:text-emerald-800 transition-colors">
                    {formattedLabel}
                </span>
                <ChevronDown
                    size={13}
                    className={`text-slate-400 shrink-0 transition-transform duration-200 ml-0.5 ${
                        isOpen ? "rotate-180 text-emerald-600" : "group-hover:text-slate-600"
                    }`}
                />
            </button>

            {/* ── 2. PANEL POPOVER KALENDER MELAYANG ── */}
            {isOpen && (
                <div
                    className={`absolute top-full mt-2 ${alignClass} bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 z-50 w-[310px] sm:w-[330px] flex flex-col space-y-3`}
                    style={{ animation: "fadeIn 0.15s ease-out" }}
                >
                    {/* Header Kalender & Navigasi Bulan */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                            title="Bulan sebelumnya"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <div className="text-xs font-extrabold text-slate-800 tracking-wide uppercase">
                            {MONTH_NAMES_ID[viewMonth]} {viewYear}
                        </div>

                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                            title="Bulan berikutnya"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                        {presets.map((preset) => {
                            const isMatch = draftStart === preset.start && draftEnd === preset.end;
                            return (
                                <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => handleSelectPreset(preset)}
                                    className={`text-[10.5px] font-bold px-2 py-1 rounded-lg transition-all shrink-0 cursor-pointer ${
                                        isMatch
                                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                            : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/80"
                                    }`}
                                >
                                    {preset.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Label Hari (Sen, Sel, Rab, Kam, Jum, Sab, Min) */}
                    <div className="grid grid-cols-7 text-center">
                        {DAY_LABELS.map((day) => (
                            <span key={day} className="text-[10.5px] font-bold text-slate-400 py-0.5">
                                {day}
                            </span>
                        ))}
                    </div>

                    {/* Kisi Angka Tanggal (Grid Days) */}
                    <div className="grid grid-cols-7 gap-y-1">
                        {calendarDays.map((cell, idx) => {
                            const isStart = cell.dateStr === activeRange.start;
                            const isEnd = cell.dateStr === activeRange.end;
                            const isBetween =
                                activeRange.start &&
                                activeRange.end &&
                                cell.dateStr > activeRange.start &&
                                cell.dateStr < activeRange.end;

                            // Penentuan styling background range
                            let containerStyle = "";
                            if (isStart && isEnd) {
                                containerStyle = "rounded-full";
                            } else if (isStart) {
                                containerStyle = "bg-emerald-50 rounded-l-full";
                            } else if (isEnd) {
                                containerStyle = "bg-emerald-50 rounded-r-full";
                            } else if (isBetween) {
                                containerStyle = "bg-emerald-50";
                            }

                            return (
                                <div
                                    key={idx}
                                    className={`relative flex items-center justify-center h-8 ${containerStyle}`}
                                    onMouseEnter={() => {
                                        if (draftStart && !draftEnd) {
                                            setHoverDate(cell.dateStr);
                                        }
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleDateClick(cell.dateStr)}
                                        className={`w-7 h-7 flex items-center justify-center text-xs font-semibold transition-all cursor-pointer ${
                                            isStart || isEnd
                                                ? "bg-emerald-600 text-white font-bold rounded-full shadow-xs scale-105 z-10"
                                                : isBetween
                                                ? "text-emerald-900 font-bold hover:bg-emerald-100 rounded-full"
                                                : cell.isCurrentMonth
                                                ? cell.isToday
                                                    ? "text-emerald-700 font-bold border border-emerald-400 rounded-full hover:bg-emerald-50"
                                                    : "text-slate-700 hover:bg-emerald-100 hover:text-emerald-900 rounded-full"
                                                : "text-slate-300 hover:bg-slate-100 rounded-full"
                                        }`}
                                        title={cell.dateStr}
                                    >
                                        {cell.dayNum}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer Popover (Rincian Draft & Tombol Aksi) */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="text-[11px] text-slate-500 font-medium truncate max-w-[155px]">
                            {draftStart ? (
                                <span className="font-semibold text-slate-700">
                                    {formatDateDisplay(draftStart)}
                                    {draftEnd ? ` - ${formatDateDisplay(draftEnd)}` : " - ..."}
                                </span>
                            ) : (
                                <span className="italic text-slate-400">Pilih rentang tanggal</span>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-2 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Reset ke 30 hari terakhir"
                            >
                                Reset
                            </button>
                            <button
                                type="button"
                                disabled={!draftStart || (!draftEnd && draftStart !== hoverDate)}
                                onClick={handleApply}
                                className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-all cursor-pointer"
                            >
                                Terapkan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
