import React from "react";
import {
    X,
    FileText,
    Download,
    Eye,
    ExternalLink,
    Image as ImageIcon,
    FileCheck,
    Layers,
    Calendar,
    Clock,
    CheckCircle2
} from "lucide-react";

export default function AttachmentsModal({ isOpen, onClose, record, onPreviewAttachment }) {
    if (!isOpen || !record) return null;

    // Normalisasi attachments list: jika ada array attachments gunakan itu, jika tidak ada gunakan file_path tunggal
    const attachments = (record.attachments && Array.isArray(record.attachments) && record.attachments.length > 0)
        ? record.attachments
        : record.file_path
        ? [{
            name: record.file_name || "Berkas CSMS",
            path: record.file_path,
            size: record.file_size || 0,
            type: record.file_type || (record.file_name?.split('.').pop() || 'pdf'),
            uploaded_at: record.updated_at || null,
        }]
        : [];

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return "-";
        const kb = bytes / 1024;
        if (kb < 1024) {
            return `${Math.round(kb)} KB`;
        }
        return `${(kb / 1024).toFixed(2)} MB`;
    };

    const getFileBadge = (fileName = "", fileType = "") => {
        const ext = (fileType || fileName.split(".").pop() || "").toLowerCase();
        if (ext === "pdf") {
            return {
                label: "PDF",
                badgeClass: "bg-red-100 text-red-700 border-red-200",
                icon: <FileText className="text-red-600" size={18} />
            };
        }
        if (["doc", "docx"].includes(ext)) {
            return {
                label: "WORD",
                badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
                icon: <FileText className="text-blue-600" size={18} />
            };
        }
        if (["jpg", "jpeg", "png", "webp"].includes(ext)) {
            return {
                label: ext.toUpperCase(),
                badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
                icon: <ImageIcon className="text-purple-600" size={18} />
            };
        }
        return {
            label: ext ? ext.toUpperCase() : "BERKAS",
            badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
            icon: <FileCheck className="text-emerald-600" size={18} />
        };
    };

    const isImageFile = (fileName = "", fileType = "") => {
        const ext = (fileType || fileName.split(".").pop() || "").toLowerCase();
        return ["jpg", "jpeg", "png", "webp"].includes(ext);
    };

    const isPdfFile = (fileName = "", fileType = "") => {
        const ext = (fileType || fileName.split(".").pop() || "").toLowerCase();
        return ext === "pdf";
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={onClose}
        >
            <div
                className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 text-slate-800 overflow-hidden flex flex-col max-h-[88vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Top Accent */}
                <div
                    className="w-full h-1 shrink-0"
                    style={{
                        background: "linear-gradient(90deg, #10b981 0%, #34d399 50%, #f59e0b 100%)",
                    }}
                />

                {/* Modal Header */}
                <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {record.crew === "Rig" ? "Seluruh Unit Rig" : record.crew || "Seluruh Rig"}
                            </span>
                            <span className="text-xs font-bold text-slate-500">
                                • Periode {record.periode_bulan} {record.periode_tahun}
                            </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-slate-800">
                            {record.category?.nama_dokumen || record.file_name || "Lampiran Berkas Dokumen CSMS"}
                        </h3>
                        <p className="text-xs text-slate-500">
                            Total {attachments.length} berkas terlampir (Maks. 500 KB per berkas)
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                        title="Tutup"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body / Attachments List */}
                <div className="p-5 overflow-y-auto space-y-3 divide-y divide-slate-100">
                    {attachments.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs">
                            Tidak ada berkas yang ditemukan pada rekaman ini.
                        </div>
                    ) : (
                        attachments.map((att, idx) => {
                            const badge = getFileBadge(att.name, att.type);
                            const isImg = isImageFile(att.name, att.type);
                            const fileUrl = `/storage/${att.path}`;

                            return (
                                <div
                                    key={idx}
                                    className={`pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all ${
                                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                                            {badge.icon}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border tracking-wider ${badge.badgeClass}`}
                                                >
                                                    {badge.label}
                                                </span>
                                                <span className="text-xs font-bold text-slate-700 truncate block">
                                                    {att.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-medium">
                                                <span>{formatBytes(att.size)}</span>
                                                {att.uploaded_at && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{att.uploaded_at}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                        {onPreviewAttachment ? (
                                            <button
                                                type="button"
                                                onClick={() => onPreviewAttachment(record, att, idx)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
                                            >
                                                <Eye size={13} />
                                                <span>Lihat Berkas</span>
                                            </button>
                                        ) : (
                                            <a
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all"
                                            >
                                                <Eye size={13} />
                                                <span>Buka Berkas</span>
                                            </a>
                                        )}

                                        <a
                                            href={fileUrl}
                                            download={att.name}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs shadow-2xs transition-all"
                                            title="Unduh Berkas ke Komputer"
                                        >
                                            <Download size={13} />
                                        </a>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        Format didukung: PDF, JPG, JPEG, Word (DOC/DOCX) maks 500 KB/berkas
                    </span>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
