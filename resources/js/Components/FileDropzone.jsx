import React, { useState, useRef, useEffect } from "react";
import {
    Upload,
    FileText,
    FileSpreadsheet,
    FileCheck,
    Image as ImageIcon,
    CheckCircle2,
    AlertCircle,
    X,
    Eye,
    RefreshCw,
    Sparkles,
    FileUp,
    Plus,
    Trash2
} from "lucide-react";

export default function FileDropzone({
    files = [], // Array of File objects or single File
    onFilesChange, // Callback: (files: File[]) => void
    existingAttachments = [], // Array of existing attachments from server [{name, path, size, type}]
    existingFileName = null,
    existingFilePath = null,
    error = null,
    accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx",
    maxSizeKB = 5120, // 5 MB (5120 KB)
    multiple = true, // Dukung upload banyak berkas
    required = false,
    viewMode = "all", // "all" | "dropOnly" | "filesOnly"
}) {
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [isWindowDragging, setIsWindowDragging] = useState(false);
    const [localError, setLocalError] = useState(null);
    const fileInputRef = useRef(null);
    const dragCounter = useRef(0);
    const windowDragCounter = useRef(0);

    // Normalisasi files menjadi array
    const fileList = Array.isArray(files) ? files : files ? [files] : [];

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return "0 KB";
        const kb = bytes / 1024;
        if (kb < 1024) {
            return `${Math.round(kb)} KB`;
        }
        return `${(kb / 1024).toFixed(2)} MB`;
    };

    const validateAndProcessFiles = (incomingFiles) => {
        setLocalError(null);
        if (!incomingFiles || incomingFiles.length === 0) return;

        const maxSizeBytes = maxSizeKB * 1024;
        const allowedExts = accept.split(",").map((ext) => ext.trim().toLowerCase().replace(".", ""));

        const validFiles = [];
        const errors = [];

        Array.from(incomingFiles).forEach((f) => {
            const ext = f.name.split(".").pop().toLowerCase();
            const formattedSize = formatBytes(f.size);
            const maxLabel = maxSizeKB >= 1024 ? `${Math.round(maxSizeKB / 1024)} MB` : `${maxSizeKB} KB`;

            // Validasi format ekstensi
            if (allowedExts.length > 0 && !allowedExts.includes(ext)) {
                errors.push(`Format berkas "${f.name}" (.${ext}) tidak didukung. Gunakan: PDF, JPG, JPEG, atau Word (DOC/DOCX).`);
                return;
            }

            // Validasi ukuran berkas (Maksimal 5 MB / 5120 KB)
            if (f.size > maxSizeBytes) {
                errors.push(`Berkas "${f.name}" (${formattedSize}) melebihi batas maksimal ${maxLabel}.`);
                return;
            }

            // Cek duplikasi nama di list baru
            const isDuplicate = fileList.some((existing) => existing.name === f.name && existing.size === f.size);
            if (!isDuplicate) {
                validFiles.push(f);
            }
        });

        if (errors.length > 0) {
            setLocalError(errors.join(" "));
        }

        if (validFiles.length > 0) {
            if (multiple) {
                const combined = [...fileList, ...validFiles];
                onFilesChange(combined);
            } else {
                onFilesChange([validFiles[0]]);
            }
        }
    };

    // CEGAH BROWSER MEMBUKA PDF / FILE DI TAB BARU SECARA GLOBAL
    useEffect(() => {
        const handleGlobalDragOver = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = "copy";
            }
        };

        const handleGlobalDragEnter = (e) => {
            e.preventDefault();
            e.stopPropagation();
            windowDragCounter.current += 1;
            if (e.dataTransfer && e.dataTransfer.types && Array.from(e.dataTransfer.types).includes("Files")) {
                setIsWindowDragging(true);
            }
        };

        const handleGlobalDragLeave = (e) => {
            e.preventDefault();
            e.stopPropagation();
            windowDragCounter.current -= 1;
            if (windowDragCounter.current <= 0) {
                windowDragCounter.current = 0;
                setIsWindowDragging(false);
            }
        };

        const handleGlobalDrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            windowDragCounter.current = 0;
            setIsWindowDragging(false);
            setIsDraggingOver(false);
        };

        window.addEventListener("dragover", handleGlobalDragOver, false);
        window.addEventListener("dragenter", handleGlobalDragEnter, false);
        window.addEventListener("dragleave", handleGlobalDragLeave, false);
        window.addEventListener("drop", handleGlobalDrop, false);

        return () => {
            window.removeEventListener("dragover", handleGlobalDragOver, false);
            window.removeEventListener("dragenter", handleGlobalDragEnter, false);
            window.removeEventListener("dragleave", handleGlobalDragLeave, false);
            window.removeEventListener("drop", handleGlobalDrop, false);
        };
    }, []);

    // Handler Khusus Elemen Dropzone
    const handleZoneDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current += 1;
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = "copy";
        }
        setIsDraggingOver(true);
    };

    const handleZoneDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = "copy";
        }
        if (!isDraggingOver) {
            setIsDraggingOver(true);
        }
    };

    const handleZoneDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current -= 1;
        if (dragCounter.current <= 0) {
            dragCounter.current = 0;
            setIsDraggingOver(false);
        }
    };

    const handleZoneDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current = 0;
        windowDragCounter.current = 0;
        setIsDraggingOver(false);
        setIsWindowDragging(false);

        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndProcessFiles(e.dataTransfer.files);
            try {
                e.dataTransfer.clearData();
            } catch (err) {}
        }
    };

    const handleInputChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndProcessFiles(e.target.files);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemoveFileIndex = (indexToRemove) => {
        const updated = fileList.filter((_, idx) => idx !== indexToRemove);
        onFilesChange(updated);
        setLocalError(null);
    };

    const handleClearAll = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        onFilesChange([]);
        setLocalError(null);
    };

    const getFileBadge = (fileName) => {
        if (!fileName) return { label: "FILE", color: "bg-slate-100 text-slate-700 border-slate-200", icon: <FileText size={16} strokeWidth={2} /> };
        const ext = fileName.split(".").pop().toLowerCase();
        if (ext === "pdf") {
            return {
                label: "PDF",
                color: "bg-rose-50 text-rose-700 border-rose-200",
                badgeBg: "bg-rose-600 text-white",
                icon: <FileText className="text-rose-600" size={17} strokeWidth={2} />
            };
        }
        if (["doc", "docx"].includes(ext)) {
            return {
                label: "DOCX",
                color: "bg-blue-50 text-blue-700 border-blue-200",
                badgeBg: "bg-blue-600 text-white",
                icon: <FileSpreadsheet className="text-blue-600" size={17} strokeWidth={2} />
            };
        }
        if (["jpg", "jpeg", "png", "webp"].includes(ext)) {
            return {
                label: ext.toUpperCase(),
                color: "bg-amber-50 text-amber-700 border-amber-200",
                badgeBg: "bg-amber-600 text-white",
                icon: <ImageIcon className="text-amber-600" size={17} strokeWidth={2} />
            };
        }
        return {
            label: ext.toUpperCase(),
            color: "bg-slate-100 text-slate-700 border-slate-200",
            badgeBg: "bg-slate-700 text-white",
            icon: <FileCheck className="text-emerald-600" size={17} strokeWidth={2} />
        };
    };

    const totalPayloadBytes = fileList.reduce((acc, f) => acc + f.size, 0);

    const renderFilesList = () => {
        if (fileList.length === 0) {
            return (
                <div className="h-44 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50/80 border-2 border-dashed border-slate-200 text-center">
                    <FileText size={24} className="text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-600">Belum Ada Berkas Terpilih</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Tarik berkas ke kotak di sebelah kiri atau klik telusuri</p>
                </div>
            );
        }

        return (
            <div className="space-y-2.5 p-3.5 bg-slate-50/90 border border-slate-200/90 rounded-2xl shadow-xs">
                {/* Header Rincian Lampiran */}
                <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-200/70">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-extrabold tracking-widest text-slate-500 uppercase">
                            Berkas Terpilih
                        </span>
                        <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-slate-900 text-white shadow-2xs">
                            {fileList.length} DOKUMEN
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-slate-500">
                            Muatan: <strong className="text-slate-800 font-bold">{formatBytes(totalPayloadBytes)}</strong>
                        </span>
                        {multiple && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-[11px] font-bold text-slate-700 hover:text-emerald-700 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                            >
                                <Plus size={11} />
                                <span>Tambah</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleClearAll}
                            className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                            Hapus Semua
                        </button>
                    </div>
                </div>

                {/* Daftar Kartu Berkas (Tanpa Persentase Bar yang Membingungkan) */}
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {fileList.map((f, idx) => {
                        const badge = getFileBadge(f.name);
                        const maxSizeBytes = maxSizeKB * 1024;
                        const isOver = f.size > maxSizeBytes;

                        return (
                            <div
                                key={idx}
                                className={`p-2.5 bg-white rounded-xl border transition-all duration-200 shadow-2xs ${
                                    isOver
                                        ? "border-rose-300 bg-rose-50/20"
                                        : "border-slate-200/90 hover:border-slate-300"
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2.5">
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                        {/* Machined Icon Tile */}
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${badge.color}`}>
                                            {badge.icon}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-xs font-bold text-slate-800 truncate" title={f.name}>
                                                    {f.name}
                                                </p>
                                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-2xs shrink-0 ${badge.badgeBg}`}>
                                                    {badge.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                                                <span>Ukuran: <strong className="text-slate-700 font-bold">{formatBytes(f.size)}</strong></span>
                                                {isOver ? (
                                                    <span className="text-rose-600 font-bold text-[9px] px-1 rounded bg-rose-50 border border-rose-200">
                                                        Melebihi Batas {maxSizeKB >= 1024 ? `${Math.round(maxSizeKB / 1024)} MB` : `${maxSizeKB} KB`}
                                                    </span>
                                                ) : (
                                                    <span className="text-emerald-700 font-bold text-[9px] px-1 rounded bg-emerald-50 border border-emerald-200">
                                                        ✓ Sesuai SOP (≤ {maxSizeKB >= 1024 ? `${Math.round(maxSizeKB / 1024)} MB` : `${maxSizeKB} KB`})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFileIndex(idx)}
                                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                            title="Hapus berkas ini"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderDropArea = () => (
        <div
            onDragEnter={handleZoneDragEnter}
            onDragOver={handleZoneDragOver}
            onDragLeave={handleZoneDragLeave}
            onDrop={handleZoneDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative w-full border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 select-none overflow-hidden ${
                isDraggingOver
                    ? "border-emerald-500 bg-emerald-50/90 scale-[1.01] shadow-lg ring-4 ring-emerald-500/10"
                    : isWindowDragging
                    ? "border-slate-400 bg-slate-100/70 ring-2 ring-slate-300 animate-pulse"
                    : fileList.length > 0
                    ? "border-slate-200/90 bg-white hover:border-slate-300 p-3"
                    : "border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-100/60 shadow-2xs"
            }`}
        >
            {/* Layer Penjaga Transparan untuk Menghilangkan Flickering Mouse Event */}
            {isDraggingOver && (
                <div className="absolute inset-0 z-20 pointer-events-none bg-emerald-500/5 backdrop-blur-[0.5px]" />
            )}

            <div className="flex flex-col items-center justify-center relative z-10 pointer-events-none">
                <div
                    className={`rounded-xl flex items-center justify-center transition-all duration-200 shadow-2xs ${
                        fileList.length > 0 ? "w-8 h-8 mb-1.5" : "w-10 h-10 mb-2"
                    } ${
                        isDraggingOver
                            ? "bg-emerald-600 text-white scale-110 shadow-md ring-4 ring-emerald-200"
                            : isWindowDragging
                            ? "bg-slate-200 text-slate-700"
                            : "bg-white border border-slate-200/80 text-slate-600"
                    }`}
                >
                    {isDraggingOver ? (
                        <FileUp size={fileList.length > 0 ? 16 : 20} className="animate-bounce text-white" />
                    ) : (
                        <Upload size={fileList.length > 0 ? 16 : 20} className="text-slate-600" />
                    )}
                </div>

                <p className="text-xs font-bold text-slate-800">
                    {isDraggingOver ? (
                        <span className="text-emerald-700 font-extrabold text-xs tracking-wide">
                            Lepaskan berkas di sini untuk menambahkan
                        </span>
                    ) : isWindowDragging ? (
                        <span className="text-slate-700 font-bold">
                            Arahkan berkas ke dalam zona ini
                        </span>
                    ) : fileList.length > 0 ? (
                        <span className="text-slate-600">Tarik berkas tambahan ke sini atau <strong className="text-slate-900 underline font-bold">telusuri berkas</strong></span>
                    ) : (
                        <>
                            <span className="text-slate-600">Tarik & letakkan berkas di sini, atau </span>
                            <span className="text-slate-900 font-bold underline cursor-pointer">
                                telusuri berkas
                            </span>
                        </>
                    )}
                </p>

                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    PDF • Word • JPG • PNG • Maksimal <strong className="text-slate-700 font-bold">{maxSizeKB >= 1024 ? `${Math.round(maxSizeKB / 1024)} MB` : `${maxSizeKB} KB`} / berkas</strong>
                </p>
            </div>

            {/* Tampilan Lampiran yang Sudah Ada di Server */}
            {(existingAttachments?.length > 0 || existingFileName) && fileList.length === 0 && !isDraggingOver && (
                <div className="mt-3 pt-2.5 border-t border-slate-200 text-xs text-slate-600 relative z-10">
                    <span className="font-semibold text-slate-500 mr-1.5">Berkas saat ini di sistem:</span>
                    {existingAttachments?.length > 0 ? (
                        <div className="inline-flex flex-wrap gap-1.5 mt-1 justify-center">
                            {existingAttachments.map((att, aIdx) => (
                                <a
                                    key={aIdx}
                                    href={`/storage/${att.path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 bg-white hover:bg-emerald-50 px-2 py-0.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-800 hover:text-emerald-800 shadow-2xs"
                                >
                                    <Eye size={11} className="text-emerald-600" />
                                    <span className="max-w-[150px] truncate">{att.name}</span>
                                    <span className="text-[9px] text-slate-400">({formatBytes(att.size)})</span>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <span className="font-bold text-slate-800 max-w-[220px] truncate inline-block align-middle">
                            {existingFileName}
                        </span>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div className="w-full space-y-3">
            {/* Input File Tersembunyi */}
            <input
                ref={fileInputRef}
                type="file"
                multiple={multiple}
                accept={accept}
                onChange={handleInputChange}
                className="hidden"
                id="file-dropzone-hidden-input"
            />

            {viewMode === "filesOnly" && renderFilesList()}
            {viewMode === "dropOnly" && renderDropArea()}
            {viewMode === "all" && (
                <>
                    {fileList.length > 0 && renderFilesList()}
                    {renderDropArea()}
                </>
            )}

            {/* Tampilan Pesan Error Jika Ada */}
            {(localError || error) && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 font-bold px-2.5 py-1.5 rounded-xl bg-red-50 border border-red-200 mt-1 animate-in fade-in duration-150">
                    <AlertCircle size={14} className="shrink-0 text-red-500" />
                    <span>{localError || error}</span>
                </div>
            )}
        </div>
    );
}
