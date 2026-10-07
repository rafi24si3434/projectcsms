import React, { useState, useRef, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import { ChevronDown, Plus, Trash2, Check, X, Loader2, Calendar } from "lucide-react";

const STORAGE_CUSTOM_KEY = "csms_custom_years";
const STORAGE_DELETED_KEY = "csms_deleted_years";

/**
 * YearSelect — Dropdown tahun dinamis dan interaktif dengan RBAC:
 * - Admin dapat menambah (+ Tambah Tahun Baru) dan MENGHAPUS opsi tahun (dengan pop-up konfirmasi).
 * - Non-admin hanya dapat memilih tahun tanpa opsi hapus/tambah.
 *
 * Props:
 *  - value        {number|string}  Tahun yang sedang dipilih
 *  - onChange     {function}       Callback (year: number) => void
 *  - className    {string}         Custom class untuk trigger dropdown
 *  - isAdmin      {boolean}        Override role admin (opsional)
 */
export default function YearSelect({ value, onChange, className = "", isAdmin: isAdminProp, availableYears }) {
    const { auth } = usePage().props;
    const isAdmin = isAdminProp !== undefined ? Boolean(isAdminProp) : (auth?.user?.role === "admin");

    const currentYear = new Date().getFullYear();

    // ── Custom years dari localStorage ────────────────────────────────────────
    const [customYears, setCustomYears] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_CUSTOM_KEY);
            return stored ? JSON.parse(stored).map(Number) : [];
        } catch {
            return [];
        }
    });

    // ── Deleted years (tahun yang dihapus admin) dari localStorage ────────────
    const [deletedYears, setDeletedYears] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_DELETED_KEY);
            return stored ? JSON.parse(stored).map(Number) : [];
        } catch {
            return [];
        }
    });

    // ── Base years dari props server atau fallback dinamis ───────────────────
    const baseYears = Array.isArray(availableYears) && availableYears.length > 0
        ? availableYears.map(Number)
        : Array.from({ length: currentYear + 5 - 2024 + 1 }, (_, i) => 2024 + i);

    // Gabung + deduplikasi + filter deleted + urutkan
    const allYears = [...new Set([...baseYears, ...customYears])]
        .filter((y) => !deletedYears.includes(Number(y)))
        .sort((a, b) => a - b);

    // ── Tentukan Tahun Efektif (Fallback Otomatis jika tahun tidak ada di list) ──
    const isValidYear = allYears.includes(Number(value));
    const effectiveYear = isValidYear
        ? Number(value)
        : (allYears.includes(currentYear) ? currentYear : (allYears[allYears.length - 1] || allYears[0] || currentYear));

    // Sinkronisasi otomatis ke parent jika value saat ini tidak valid di daftar tahun
    useEffect(() => {
        if (allYears.length > 0 && !allYears.includes(Number(value))) {
            const fallback = allYears.includes(currentYear)
                ? currentYear
                : (allYears[allYears.length - 1] || allYears[0]);
            if (fallback && fallback !== Number(value)) {
                onChange?.(fallback);
            }
        }
    }, [value, allYears, onChange, currentYear]);

    // ── State Popover & Modal ─────────────────────────────────────────────────
    const [isOpen, setIsOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newYearInput, setNewYearInput] = useState("");
    const [addError, setAddError] = useState("");
    const [yearToDelete, setYearToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const dropdownRef = useRef(null);
    const addInputRef = useRef(null);

    // Auto-close dropdown saat klik di luar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setIsAdding(false);
                setAddError("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus input saat mode tambah aktif
    useEffect(() => {
        if (isAdding && addInputRef.current) {
            addInputRef.current.focus();
        }
    }, [isAdding]);

    // ── Handler Tambah Tahun (Admin Only) ──────────────────────────────────────
    const handleAddConfirm = () => {
        const year = parseInt(newYearInput, 10);
        if (!newYearInput || isNaN(year)) {
            setAddError("Masukkan angka tahun.");
            return;
        }
        if (year < 1900 || year > 2200) {
            setAddError("Tahun harus 1900 - 2200.");
            return;
        }

        // Hapus dari deletedYears jika sebelumnya pernah dihapus
        if (deletedYears.includes(year)) {
            const newDeleted = deletedYears.filter((y) => y !== year);
            setDeletedYears(newDeleted);
            try {
                localStorage.setItem(STORAGE_DELETED_KEY, JSON.stringify(newDeleted));
            } catch {}
        }

        // Tambah ke customYears
        if (!baseYears.includes(year)) {
            const updated = [...new Set([...customYears, year])];
            setCustomYears(updated);
            try {
                localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(updated));
            } catch {}
        }

        // Jalankan update pilihan
        onChange?.(year);
        setIsAdding(false);
        setNewYearInput("");
        setAddError("");
        setIsOpen(false);

        // Notifikasi ke backend endpoint
        router.post('/admin/csms/years', { year }, {
            preserveState: true,
            preserveScroll: true,
            onError: () => {},
        });
    };

    // ── Handler Hapus Tahun (Admin Only) ──────────────────────────────────────
    const promptDeleteYear = (e, year) => {
        e.stopPropagation();
        setYearToDelete(year);
        setIsOpen(false);
    };

    const confirmDeleteYear = () => {
        if (!yearToDelete) return;
        setIsDeleting(true);

        const targetNum = Number(yearToDelete);

        // Update local state & localStorage
        const newCustom = customYears.filter((y) => Number(y) !== targetNum);
        setCustomYears(newCustom);
        try {
            localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(newCustom));
        } catch {}

        const newDeleted = [...new Set([...deletedYears, targetNum])];
        setDeletedYears(newDeleted);
        try {
            localStorage.setItem(STORAGE_DELETED_KEY, JSON.stringify(newDeleted));
        } catch {}

        // Hitung tahun aktif berikutnya
        const remainingYears = allYears.filter((y) => Number(y) !== targetNum);
        const nextActiveYear = remainingYears.includes(currentYear)
            ? currentYear
            : (remainingYears[remainingYears.length - 1] || remainingYears[0] || currentYear);

        // Jika tahun yang sedang aktif dihapus, arahkan langsung ke nextActiveYear
        if (Number(value) === targetNum) {
            onChange?.(nextActiveYear);
        }

        // Kirim request ke backend API
        router.delete(`/admin/csms/years/${targetNum}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleting(false);
                setYearToDelete(null);
                if (Number(value) === targetNum) {
                    onChange?.(nextActiveYear);
                }
            },
            onError: () => {
                setIsDeleting(false);
                setYearToDelete(null);
            },
            onFinish: () => {
                setIsDeleting(false);
                setYearToDelete(null);
            },
        });
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 py-1 pl-1 pr-1 rounded-lg hover:bg-slate-100/70 transition-all cursor-pointer select-none ${className}`}
                title="Pilih Tahun"
            >
                <span>{effectiveYear}</span>
                <ChevronDown
                    size={13}
                    className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {/* Dropdown Menu Popover */}
            {isOpen && (
                <div className="absolute top-full right-0 left-auto mt-2 w-56 sm:w-60 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fade-in flex flex-col divide-y divide-slate-100">
                    
                    {/* Header Popover */}
                    <div className="px-3 py-2.5 bg-slate-50/90 flex items-center justify-between shrink-0">
                        <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-500">Pilih Tahun</span>
                        {isAdmin && (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/80">
                                Admin Mode
                            </span>
                        )}
                    </div>

                    {/* List Opsi Tahun (Scrollable max-h-48) */}
                    <div className="max-h-48 overflow-y-auto p-1.5 space-y-0.5 flex-1">
                        {allYears.map((year) => {
                            const isSelected = Number(year) === effectiveYear;
                            return (
                                <div
                                    key={year}
                                    onClick={() => {
                                        onChange?.(Number(year));
                                        setIsOpen(false);
                                    }}
                                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        isSelected
                                            ? "bg-emerald-50 text-emerald-800 font-extrabold"
                                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {isSelected ? (
                                            <Check size={14} className="text-emerald-600 shrink-0" />
                                        ) : (
                                            <span className="w-3.5" />
                                        )}
                                        <span>{year}</span>
                                    </div>

                                    {/* [ADMIN ONLY] Tombol Ikon Hapus Tahun */}
                                    {isAdmin && (
                                        <button
                                            type="button"
                                            onClick={(e) => promptDeleteYear(e, year)}
                                            title={`Hapus tahun ${year}`}
                                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* [ADMIN ONLY] Sticky Bottom Tambah Tahun */}
                    {isAdmin && (
                        <div className="sticky bottom-0 bg-white border-t border-slate-100 p-2 shrink-0 z-10">
                            {isAdding ? (
                                <div className="space-y-1.5 p-1">
                                    <div className="flex items-center gap-1.5">
                                        <input
                                            ref={addInputRef}
                                            type="number"
                                            min="1900"
                                            max="2200"
                                            placeholder="cth: 2045"
                                            value={newYearInput}
                                            onChange={(e) => {
                                                setNewYearInput(e.target.value);
                                                setAddError("");
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleAddConfirm();
                                                if (e.key === "Escape") setIsAdding(false);
                                            }}
                                            className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 placeholder-slate-400"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddConfirm}
                                            className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center justify-center shrink-0"
                                            title="Simpan Tahun"
                                        >
                                            <Check size={13} strokeWidth={2.5} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsAdding(false);
                                                setAddError("");
                                            }}
                                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors flex items-center justify-center shrink-0"
                                            title="Batal"
                                        >
                                            <X size={13} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                    {addError && <p className="text-[10.5px] text-red-500 font-bold px-1">{addError}</p>}
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(true)}
                                    className="w-full text-left flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-200/60 rounded-xl transition-all cursor-pointer shadow-2xs"
                                >
                                    <Plus size={13} strokeWidth={2.5} />
                                    <span>Tambah Tahun Baru</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                [ADMIN ONLY] POP-UP MODAL KONFIRMASI HAPUS TAHUN
            ═══════════════════════════════════════════════════════════════ */}
            {isAdmin && yearToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 p-5 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3.5">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-base font-black text-slate-900 mb-1.5">
                            Hapus Pilihan Tahun?
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4">
                            Apakah Anda yakin ingin menghapus tahun <strong className="text-slate-800 font-bold">[{yearToDelete}]</strong> dari daftar pilihan?
                        </p>
                        <div className="flex items-center justify-center gap-2">
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setYearToDelete(null)}
                                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={confirmDeleteYear}
                                className="px-4 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                                {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                <span>{isDeleting ? "Menghapus..." : "Ya, Hapus Tahun"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
