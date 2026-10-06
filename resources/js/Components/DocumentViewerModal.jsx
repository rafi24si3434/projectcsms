import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    X,
    CheckCircle2,
    RotateCcw,
    Clock,
    Download,
    ZoomIn,
    ZoomOut,
    RotateCw,
    ChevronLeft,
    ChevronRight,
    FileText,
    Check,
    MessageSquare,
    Send,
    Loader2,
    AlertCircle,
    Info,
    ExternalLink,
} from "lucide-react";

function formatBytes(bytes) {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * DocumentViewerModal
 * Modal inspeksi berkas & foto dokumen CSMS in-app yang bersih, tenang,
 * dengan latar semi-transparan yang wajar dan komponen pendukung inspeksi.
 */
export default function DocumentViewerModal({
    isOpen,
    onClose,
    record,
    category,
    crew,
    isAdmin = false,
    onApprove,
    onRevise,
    initialIndex = 0,
}) {
    if (!isOpen || !record) return null;

    // 1. Normalisasi daftar lampiran berkas
    const attachments = (record.attachments && Array.isArray(record.attachments) && record.attachments.length > 0)
        ? record.attachments
        : record.file_path
        ? [{
            name: record.file_name || "Berkas Dokumen CSMS",
            path: record.file_path,
            size: record.file_size || 0,
            type: record.file_type || (record.file_name?.split('.').pop() || 'pdf'),
            uploaded_at: record.updated_at || null,
        }]
        : [];

    const [activeIndex, setActiveIndex] = useState(
        Math.min(Math.max(initialIndex, 0), Math.max(attachments.length - 1, 0))
    );

    // 2. State Transformasi Gambar (Zoom, Rotasi, Pan Drag)
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // 3. State Aksi Admin (ACC & Minta Revisi)
    const [showRevisionForm, setShowRevisionForm] = useState(false);
    const [revisionStatus, setRevisionStatus] = useState("revision"); // "revision" | "rejected"
    const [revisionNotes, setRevisionNotes] = useState(record.approval_notes || "");
    const [isSubmittingAction, setIsSubmittingAction] = useState(false);
    const [actionSuccessMsg, setActionSuccessMsg] = useState("");

    const textareaRef = useRef(null);

    const currentFile = attachments[activeIndex] || attachments[0] || {};
    const fileUrl = currentFile.path ? `/storage/${currentFile.path}` : "";
    const fileExt = (currentFile.type || currentFile.name?.split(".").pop() || "").toLowerCase();
    const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(fileExt);
    const isPdf = fileExt === "pdf";

    // Reset transformasi setiap kali file berganti
    useEffect(() => {
        setZoom(1);
        setRotation(0);
        setPan({ x: 0, y: 0 });
        setImageLoaded(false);
        setImageError(false);
    }, [activeIndex]);

    // Template saran perbaikan instan untuk Admin HSE
    const quickRevisionTemplates = [
        "Foto buram / tidak terbaca jelas",
        "Tanda tangan & stempel belum lengkap",
        "Masa berlaku dokumen telah kadaluarsa",
        "Dokumen tidak sesuai kategori CSMS",
        "Mohon lampirkan sertifikat yang valid",
    ];

    // Navigasi berkas
    const handlePrev = useCallback(() => {
        if (attachments.length <= 1) return;
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : attachments.length - 1));
    }, [attachments.length]);

    const handleNext = useCallback(() => {
        if (attachments.length <= 1) return;
        setActiveIndex((prev) => (prev < attachments.length - 1 ? prev + 1 : 0));
    }, [attachments.length]);

    // Kontrol Zoom & Rotasi
    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
    const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
    const handleResetTransform = () => {
        setZoom(1);
        setRotation(0);
        setPan({ x: 0, y: 0 });
    };

    // Pan Drag Handlers
    const handleMouseDown = (e) => {
        if (zoom <= 1) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || zoom <= 1) return;
        setPan({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Eksekusi ACC Langsung
    const handleApproveClick = async () => {
        if (!onApprove) return;
        setIsSubmittingAction(true);
        try {
            await onApprove(record.id);
            setActionSuccessMsg("Dokumen berhasil disetujui (DI-ACC SAH).");
            setTimeout(() => setActionSuccessMsg(""), 3000);
        } finally {
            setIsSubmittingAction(false);
        }
    };

    // Eksekusi Kirim Revisi / Tolak Dokumen
    const handleRevisionSubmit = async (e) => {
        e?.preventDefault();
        if (!onRevise) return;
        setIsSubmittingAction(true);
        try {
            await onRevise(record.id, revisionStatus, revisionNotes);
            setActionSuccessMsg(
                revisionStatus === "revision"
                    ? "Status dokumen diubah menjadi PERLU REVISI."
                    : "Status dokumen diubah menjadi DITOLAK."
            );
            setShowRevisionForm(false);
            setTimeout(() => setActionSuccessMsg(""), 3000);
        } finally {
            setIsSubmittingAction(false);
        }
    };

    // Tambah template cepat ke catatan
    const handleAddTemplate = (text) => {
        setRevisionNotes((prev) => {
            if (!prev || prev.trim() === "") return text;
            return `${prev.trim()}. ${text}`;
        });
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

            if (e.key === "Escape") {
                onClose();
            } else if (e.key === "ArrowLeft") {
                handlePrev();
            } else if (e.key === "ArrowRight") {
                handleNext();
            } else if (e.key === "+" || e.key === "=") {
                handleZoomIn();
            } else if (e.key === "-") {
                handleZoomOut();
            } else if (e.key === "r" || e.key === "R") {
                handleRotate();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose, handlePrev, handleNext]);

    const isApproved = record.approval_status === "approved";
    const isRevision = record.approval_status === "revision" || record.approval_status === "rejected";

    return (
        /* Latar Belakang Bersih & Transparan (Bukan Layar Hitam Pekat) */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-900/40 backdrop-blur-xs select-none animate-in fade-in duration-150"
            onClick={onClose}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            {/* Modal Card Berdesain Minimalis Bersih & Elegan */}
            <div
                className={`relative bg-white rounded-2xl shadow-xl border border-slate-200/80 max-w-5xl w-full ${isPdf ? 'h-[88vh] max-h-[92vh]' : 'max-h-[92vh]'} flex flex-col overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ═══════════════════════════════════════════════════════════════
                    1. HEADER BERSIH & JELAS
                ═══════════════════════════════════════════════════════════════ */}
                <div className="px-5 py-3.5 bg-white border-b border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                        {category?.no && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-mono font-bold shrink-0">
                                No. {category.no}
                            </span>
                        )}

                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900 truncate">
                                    {category?.nama_dokumen || record.file_name}
                                </h3>
                                <span className="hidden sm:inline-block text-xs text-slate-500 font-medium">
                                    • {crew === "Rig" ? "Seluruh Rig" : crew}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 truncate mt-0.5">
                                <span className="font-mono text-slate-700 font-semibold">{currentFile.name}</span>
                                <span>•</span>
                                <span>{formatBytes(currentFile.size)}</span>
                                <span className="hidden md:inline">• Format: {fileExt.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Badge & Tombol Utilitas */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Status Approval Badge */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${
                            isApproved
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : isRevision
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                            {isApproved && <CheckCircle2 size={12} className="text-emerald-600" />}
                            {isRevision && <RotateCcw size={12} className="text-red-600" />}
                            {!isApproved && !isRevision && <Clock size={12} className="text-amber-600" />}
                            <span>{isApproved ? "DI-ACC SAH" : isRevision ? "PERLU REVISI" : "PENDING ACC"}</span>
                        </span>

                        {/* Buka PDF di Tab Baru (Akses Cepat) */}
                        {isPdf && (
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 transition shadow-2xs"
                                title="Buka PDF di Tab Penuh Browser"
                            >
                                <ExternalLink size={15} />
                            </a>
                        )}

                        {/* Tombol Unduh Berkas */}
                        <a
                            href={fileUrl}
                            download={currentFile.name}
                            className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 transition shadow-2xs"
                            title="Unduh Berkas ke Komputer"
                        >
                            <Download size={15} />
                        </a>

                        {/* Tombol Tutup */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg border border-slate-200 transition shadow-2xs cursor-pointer"
                            title="Tutup (Esc)"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    2. TAB MULTI-LAMPIRAN (JIKA LEBIH DARI 1 BERKAS)
                ═══════════════════════════════════════════════════════════════ */}
                {attachments.length > 1 && (
                    <div className="px-5 py-2 bg-slate-50/80 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto shrink-0">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 shrink-0">
                            Lampiran ({attachments.length}):
                        </span>
                        {attachments.map((att, idx) => {
                            const isCurrent = idx === activeIndex;
                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setActiveIndex(idx)}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border cursor-pointer shrink-0 ${
                                        isCurrent
                                            ? "bg-white text-emerald-700 border-emerald-300 shadow-2xs ring-1 ring-emerald-200"
                                            : "bg-transparent text-slate-600 hover:bg-white/80 border-transparent hover:border-slate-200"
                                    }`}
                                >
                                    <FileText size={12} className={isCurrent ? "text-emerald-600" : "text-slate-400"} />
                                    <span className="max-w-[160px] truncate">{att.name}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════
                    3. KANVAS INSPEKSI BERKAS / FOTO
                ═══════════════════════════════════════════════════════════════ */}
                <div className={`relative flex-1 ${isPdf ? 'h-full min-h-[520px]' : 'min-h-[360px] max-h-[58vh]'} bg-slate-100/70 flex ${isPdf ? 'flex-col items-stretch' : 'items-center justify-center'} overflow-hidden ${isPdf ? 'p-2 sm:p-3' : 'p-3'}`}>
                    {/* Navigasi Panah Kiri-Kanan jika > 1 berkas */}
                    {attachments.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={handlePrev}
                                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 border border-slate-200 shadow-sm transition active:scale-95 cursor-pointer"
                                title="Berkas Sebelumnya (←)"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 border border-slate-200 shadow-sm transition active:scale-95 cursor-pointer"
                                title="Berkas Berikutnya (→)"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </>
                    )}

                    {/* Notifikasi Sukses Aksi */}
                    {actionSuccessMsg && (
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-full shadow-md flex items-center gap-1.5 border border-emerald-400 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 size={14} />
                            <span>{actionSuccessMsg}</span>
                        </div>
                    )}

                    {/* Floating Minimalist Inspection Tools (Zoom & Rotate) Khusus Gambar */}
                    {isImage && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-slate-200/90 shadow-md flex items-center gap-1 text-slate-700">
                            <button
                                type="button"
                                onClick={handleZoomOut}
                                disabled={zoom <= 0.5}
                                className="p-1 hover:bg-slate-100 rounded-md text-slate-600 transition disabled:opacity-30 cursor-pointer"
                                title="Zoom Out (-)"
                            >
                                <ZoomOut size={14} />
                            </button>
                            <span className="px-1 text-[11px] font-mono font-bold text-slate-700 min-w-[38px] text-center">
                                {Math.round(zoom * 100)}%
                            </span>
                            <button
                                type="button"
                                onClick={handleZoomIn}
                                disabled={zoom >= 3}
                                className="p-1 hover:bg-slate-100 rounded-md text-slate-600 transition disabled:opacity-30 cursor-pointer"
                                title="Zoom In (+)"
                            >
                                <ZoomIn size={14} />
                            </button>

                            <div className="w-px h-3.5 bg-slate-200 mx-1" />

                            <button
                                type="button"
                                onClick={handleRotate}
                                className="p-1 hover:bg-slate-100 rounded-md text-slate-600 hover:text-emerald-700 transition cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                                title="Putar 90° (R)"
                            >
                                <RotateCw size={14} />
                                {rotation > 0 && <span className="font-mono">{rotation}°</span>}
                            </button>

                            {(zoom !== 1 || rotation !== 0 || pan.x !== 0 || pan.y !== 0) && (
                                <button
                                    type="button"
                                    onClick={handleResetTransform}
                                    className="ml-1 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition cursor-pointer"
                                    title="Reset Tampilan"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    )}

                    {/* TAMPILAN KONTEN BERKAS */}
                    {isImage ? (
                        <div
                            className="w-full h-full flex items-center justify-center overflow-hidden"
                            onMouseDown={handleMouseDown}
                            style={{
                                cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
                            }}
                        >
                            {!imageLoaded && !imageError && (
                                <div className="flex flex-col items-center gap-2 text-slate-400">
                                    <Loader2 size={24} className="animate-spin text-emerald-600" />
                                    <span className="text-xs">Memuat foto...</span>
                                </div>
                            )}

                            {imageError ? (
                                <div className="p-5 rounded-xl bg-white border border-slate-200 text-center max-w-xs space-y-2 shadow-xs">
                                    <AlertCircle size={28} className="mx-auto text-amber-500" />
                                    <div className="font-bold text-xs text-slate-800">Foto Tidak Dapat Dimuat</div>
                                    <p className="text-[11px] text-slate-500">
                                        Berkas foto tidak dapat ditampilkan langsung di kanvas.
                                    </p>
                                    <a
                                        href={fileUrl}
                                        download={currentFile.name}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
                                    >
                                        <Download size={13} />
                                        <span>Unduh Berkas</span>
                                    </a>
                                </div>
                            ) : (
                                <img
                                    src={fileUrl}
                                    alt={currentFile.name}
                                    onLoad={() => setImageLoaded(true)}
                                    onError={() => {
                                        setImageLoaded(true);
                                        setImageError(true);
                                    }}
                                    draggable={false}
                                    className="max-w-full max-h-full object-contain transition-transform duration-100 ease-out select-none shadow-sm rounded-lg"
                                    style={{
                                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                                        display: imageLoaded && !imageError ? "block" : "none",
                                    }}
                                />
                            )}
                        </div>
                    ) : isPdf ? (
                        <div className="w-full h-full flex-1 min-h-[500px] bg-white rounded-xl overflow-hidden shadow-xs border border-slate-200 flex flex-col relative">
                            <iframe
                                src={`${fileUrl}#view=FitH&toolbar=1`}
                                title={currentFile.name}
                                className="w-full h-full flex-1 border-0 rounded-xl"
                                style={{ width: "100%", height: "100%", minHeight: "500px" }}
                            />
                        </div>
                    ) : (
                        /* Tipe Berkas Lain (Word, Docx, dll) */
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm text-center max-w-sm space-y-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                                <FileText size={24} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-sm text-slate-800 break-words">
                                    {currentFile.name}
                                </h4>
                                <p className="text-xs text-slate-500">
                                    Dokumen Microsoft Word ({fileExt.toUpperCase()}) dapat diunduh untuk diperiksa secara menyeluruh.
                                </p>
                            </div>
                            <a
                                href={fileUrl}
                                download={currentFile.name}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs transition"
                            >
                                <Download size={13} />
                                <span>Unduh Dokumen ({formatBytes(currentFile.size)})</span>
                            </a>
                        </div>
                    )}
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    4. STRIP CATATAN / FEEDBACK LAPANGAN (JIKA ADA)
                ═══════════════════════════════════════════════════════════════ */}
                {(record.keterangan || record.approval_notes) && (
                    <div className="px-5 py-2 bg-slate-50 border-t border-slate-200/80 text-xs flex items-center gap-2 text-slate-600">
                        <Info size={14} className="text-slate-400 shrink-0" />
                        <div className="truncate">
                            {record.approval_notes ? (
                                <span>
                                    <strong className="text-amber-800 font-semibold">Catatan Evaluasi Admin:</strong> {record.approval_notes}
                                </span>
                            ) : (
                                <span>
                                    <strong className="text-slate-700 font-semibold">Catatan Kru:</strong> {record.keterangan}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════
                    5. DRAWER / FORM REVISI ADMIN (JIKA DIBUKA)
                ═══════════════════════════════════════════════════════════════ */}
                {isAdmin && showRevisionForm && (
                    <div className="px-5 py-3.5 bg-amber-50/70 border-t border-amber-200">
                        <form onSubmit={handleRevisionSubmit} className="space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                                    <MessageSquare size={13} className="text-amber-700" />
                                    <span>Instruksi Catatan Evaluasi untuk Kru Rig</span>
                                </div>

                                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-amber-200">
                                    <button
                                        type="button"
                                        onClick={() => setRevisionStatus("revision")}
                                        className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition ${
                                            revisionStatus === "revision"
                                                ? "bg-amber-600 text-white shadow-2xs"
                                                : "text-slate-600 hover:text-slate-900"
                                        }`}
                                    >
                                        Perlu Revisi
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRevisionStatus("rejected")}
                                        className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition ${
                                            revisionStatus === "rejected"
                                                ? "bg-red-600 text-white shadow-2xs"
                                                : "text-slate-600 hover:text-slate-900"
                                        }`}
                                    >
                                        Tolak
                                    </button>
                                </div>
                            </div>

                            {/* Template Saran Singkat */}
                            <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] text-slate-500 font-medium">Saran:</span>
                                {quickRevisionTemplates.map((t, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleAddTemplate(t)}
                                        className="px-2 py-0.5 rounded-md bg-white hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 text-[10px] font-medium transition cursor-pointer"
                                    >
                                        + {t}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    ref={textareaRef}
                                    type="text"
                                    value={revisionNotes}
                                    onChange={(e) => setRevisionNotes(e.target.value)}
                                    placeholder="Tuliskan catatan perbaikan atau instruksi..."
                                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-400"
                                />

                                <button
                                    type="submit"
                                    disabled={isSubmittingAction || !revisionNotes.trim()}
                                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed shrink-0"
                                >
                                    {isSubmittingAction ? (
                                        <Loader2 size={13} className="animate-spin" />
                                    ) : (
                                        <Send size={13} />
                                    )}
                                    <span>Simpan & Tandai {revisionStatus === "revision" ? "Revisi" : "Tolak"}</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowRevisionForm(false)}
                                    className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg border border-slate-200 transition shrink-0"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════
                    6. FOOTER BAR AKSI ADMIN & USER
                ═══════════════════════════════════════════════════════════════ */}
                <div className="px-5 py-3 bg-white border-t border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
                    <div className="text-[11px] text-slate-400 hidden sm:block">
                        {isPdf ? (
                            <span>Dokumen PDF dapat di-scroll atau diperbesar langsung menggunakan kontrol dokumen.</span>
                        ) : (
                            <span>Gunakan tombol panah <kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px]">←</kbd> <kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px]">→</kbd> untuk navigasi, dan <kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px]">R</kbd> untuk memutar foto.</span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                        {isAdmin && (
                            <>
                                {/* Tombol Minta Revisi */}
                                <button
                                    type="button"
                                    onClick={() => setShowRevisionForm(!showRevisionForm)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border cursor-pointer flex items-center gap-1.5 ${
                                        showRevisionForm
                                            ? "bg-amber-100 text-amber-900 border-amber-300"
                                            : "bg-white hover:bg-amber-50 text-amber-800 border-amber-300"
                                    }`}
                                >
                                    <MessageSquare size={13} />
                                    <span>{showRevisionForm ? "Tutup Form Catatan" : isRevision ? "Ubah Catatan" : "Minta Revisi"}</span>
                                </button>

                                {/* Tombol ACC Sah */}
                                <button
                                    type="button"
                                    onClick={handleApproveClick}
                                    disabled={isSubmittingAction || isApproved}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                                        isApproved
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default"
                                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                    }`}
                                >
                                    {isSubmittingAction ? (
                                        <Loader2 size={13} className="animate-spin" />
                                    ) : (
                                        <Check size={13} strokeWidth={2.5} />
                                    )}
                                    <span>{isApproved ? "Sudah Di-ACC Sah ✓" : "Setujui (ACC)"}</span>
                                </button>
                            </>
                        )}

                        {/* Tombol Tutup Standar */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 transition cursor-pointer"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
