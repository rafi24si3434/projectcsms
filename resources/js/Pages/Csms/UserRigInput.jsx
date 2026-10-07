import React, { useState, useEffect, useRef } from "react";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import FileDropzone from "@/Components/FileDropzone";
import AttachmentsModal from "@/Components/AttachmentsModal";
import DocumentViewerModal from "@/Components/DocumentViewerModal";
import YearSelect from "@/Components/YearSelect";
import {
    HardDrive,
    Upload,
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    Eye,
    Trash2,
    X,
    HardHat,
    Calendar,
    ChevronDown,
    RotateCcw,
    ShieldCheck,
    AlertTriangle,
    Download,
    Check,
    Search,
    Layers,
    FileCheck,
    Loader2,
    FileUp,
    Sparkles,
    MessageSquare,
    Pencil,
    Plus,
} from "lucide-react";

export default function UserRigInput({ rig, allRigs = [], categories = [], records = [], matrix = {}, rigSummary = {}, filter = {}, isRestricted = false, availableYears = [] }) {
    const { auth, flash } = usePage().props;
    const isAdmin = !isRestricted && (auth?.user?.role === 'admin' || !auth?.user?.csms_rig_id);

    const [selectedMonth, setSelectedMonth] = useState(filter.bulan || "Januari");
    const [selectedYear, setSelectedYear] = useState(filter.tahun || availableYears?.[0] || new Date().getFullYear());

    useEffect(() => {
        if (filter.tahun) {
            setSelectedYear(filter.tahun);
        }
    }, [filter.tahun]);
    const [searchCategory, setSearchCategory] = useState("");
    const [uploadTarget, setUploadTarget] = useState(null); // { catId, catNo, catName, crew, currentRecord }
    const [uploadingKey, setUploadingKey] = useState(null); // `${category.id}-${crew}`
    const [isGlobalDragging, setIsGlobalDragging] = useState(false);
    const [viewAttachmentsRecord, setViewAttachmentsRecord] = useState(null); // Record to preview attachments
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStepMessage, setUploadStepMessage] = useState("");
    const globalDragCounter = useRef(0);

    // ── [ADMIN ONLY] State untuk inline rename nama dokumen ───────────────────
    const [renamingCatId, setRenamingCatId] = useState(null);
    const [renameValue, setRenameValue] = useState("");
    const renameInputRef = useRef(null);

    // ── [ADMIN ONLY] State untuk modal tambah dokumen baru ────────────────────
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({ nama_dokumen: "", durasi: "", scope: "crew", keterangan_default: "" });
    const [addSubmitting, setAddSubmitting] = useState(false);

    // ── [ADMIN ONLY] State untuk modal hapus kategori dokumen ─────────────────
    const [deleteCatModal, setDeleteCatModal] = useState(null);
    const [isDeletingCat, setIsDeletingCat] = useState(false);

    // Modal Verifikasi & ACC State untuk Admin HSE
    const [verificationModal, setVerificationModal] = useState({
        isOpen: false,
        record: null,
        category: null,
        crew: null,
    });
    const [verifyStatus, setVerifyStatus] = useState("approved"); // "approved" | "revision" | "rejected"
    const [verifyNotes, setVerifyNotes] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    // Modal Inspeksi & Pratinjau Berkas In-App (DocumentViewerModal) dengan Tombol ACC
    const [viewerState, setViewerState] = useState({
        isOpen: false,
        record: null,
        category: null,
        crew: null,
        initialIndex: 0,
    });

    // Sinkronisasi record yang sedang dibuka di DocumentViewerModal saat Inertia me-reload data
    useEffect(() => {
        if (viewerState.isOpen && viewerState.record) {
            const updated = records.find((r) => r.id === viewerState.record.id);
            if (updated) {
                setViewerState((prev) => ({ ...prev, record: updated }));
            }
        }
    }, [records]);

    // Mencegah browser membuka file di tab baru secara global pada seluruh halaman
    useEffect(() => {
        const handleGlobalDragOver = (e) => {
            e.preventDefault();
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = "copy";
            }
        };

        const handleGlobalDragEnter = (e) => {
            e.preventDefault();
            globalDragCounter.current += 1;
            if (e.dataTransfer && e.dataTransfer.types && Array.from(e.dataTransfer.types).includes("Files")) {
                setIsGlobalDragging(true);
            }
        };

        const handleGlobalDragLeave = (e) => {
            e.preventDefault();
            globalDragCounter.current -= 1;
            if (globalDragCounter.current <= 0) {
                globalDragCounter.current = 0;
                setIsGlobalDragging(false);
            }
        };

        const handleGlobalDrop = (e) => {
            e.preventDefault();
            globalDragCounter.current = 0;
            setIsGlobalDragging(false);
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

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];


    const { data, setData, post, processing, reset, errors } = useForm({
        csms_rig_id: rig?.id || "",
        csms_document_category_id: "",
        periode_bulan: selectedMonth,
        periode_tahun: selectedYear,
        crew: "Crew A",
        status: "Lengkap",
        keterangan: "",
        files: [],
    });

    const handleFilterChange = (month, year) => {
        setSelectedMonth(month);
        setSelectedYear(year);
        router.get(
            `/csms/input-rig/${rig.id}`,
            { bulan: month, tahun: year },
            { preserveState: true, replace: true }
        );
    };

    // ── [ADMIN ONLY] Handler rename inline ───────────────────────────────────
    const startRename = (cat) => {
        setRenamingCatId(cat.id);
        setRenameValue(cat.nama_dokumen);
        setTimeout(() => renameInputRef.current?.focus(), 50);
    };

    const cancelRename = () => {
        setRenamingCatId(null);
        setRenameValue("");
    };

    const submitRename = (catId) => {
        if (!renameValue.trim()) return;
        router.patch(
            `/admin/csms/categories/${catId}`,
            { nama_dokumen: renameValue.trim() },
            {
                preserveState: true,
                onSuccess: () => { setRenamingCatId(null); setRenameValue(""); },
            }
        );
    };

    // ── [ADMIN ONLY] Handler tambah kategori baru ────────────────────────────
    const handleAddCategory = (e) => {
        e.preventDefault();
        if (!addForm.nama_dokumen.trim() || !addForm.durasi.trim()) return;
        setAddSubmitting(true);
        router.post(
            "/admin/csms/categories",
            addForm,
            {
                preserveState: false,
                onSuccess: () => {
                    setShowAddModal(false);
                    setAddForm({ nama_dokumen: "", durasi: "", scope: "crew", keterangan_default: "" });
                },
                onFinish: () => setAddSubmitting(false),
            }
        );
    };

    // ── [ADMIN ONLY] Handler hapus kategori dokumen ──────────────────────────
    const confirmDeleteCategory = () => {
        if (!deleteCatModal) return;
        setIsDeletingCat(true);
        router.delete(`/admin/csms/categories/${deleteCatModal.id}`, {
            preserveState: false,
            onSuccess: () => {
                setDeleteCatModal(null);
            },
            onFinish: () => setIsDeletingCat(false),
        });
    };

    const handleRigSwitch = (newRigId) => {
        router.get(
            `/csms/input-rig/${newRigId}`,
            { bulan: selectedMonth, tahun: selectedYear }
        );
    };

    const openUploadModal = (category, crew, existingRecord = null) => {
        setUploadTarget({
            catId: category.id,
            catNo: category.no,
            catName: category.nama_dokumen,
            crew: crew,
            currentRecord: existingRecord,
        });

        setData({
            csms_rig_id: rig.id,
            csms_document_category_id: category.id,
            periode_bulan: selectedMonth,
            periode_tahun: selectedYear,
            crew: crew,
            status: "Lengkap",
            keterangan: existingRecord?.keterangan || "",
            files: [],
        });
    };

    const handleUploadSubmit = (e) => {
        e.preventDefault();
        const hasExisting = Boolean(
            uploadTarget?.currentRecord?.file_path || 
            (uploadTarget?.currentRecord?.attachments && uploadTarget.currentRecord.attachments.length > 0)
        );
        const hasNewFiles = data.files && data.files.length > 0;

        if (!hasExisting && !hasNewFiles) {
            alert("Harap pilih atau tarik berkas dokumen yang akan diunggah terlebih dahulu (Maks. 5 MB per berkas: PDF, JPG, JPEG, Word).");
            return;
        }

        const formData = new FormData();
        formData.append("csms_rig_id", rig.id);
        formData.append("csms_document_category_id", uploadTarget.catId);
        formData.append("periode_bulan", selectedMonth);
        formData.append("periode_tahun", selectedYear);
        formData.append("crew", uploadTarget.crew);
        formData.append("status", "Lengkap");
        formData.append("keterangan", data.keterangan || "");

        if (hasNewFiles) {
            data.files.forEach((file) => {
                formData.append("files[]", file);
            });
        }

        setIsUploading(true);
        setUploadProgress(15);
        setUploadStepMessage("Mengompresi & mempersiapkan paket berkas...");

        let currentProg = 15;
        const progressTimer = setInterval(() => {
            currentProg += Math.floor(Math.random() * 12) + 6;
            if (currentProg >= 94) {
                currentProg = 94;
                setUploadStepMessage("Menyimpan rekaman & memverifikasi integritas CSMS...");
            } else if (currentProg > 65) {
                setUploadStepMessage("Mentransfer paket berkas ke peladen K3...");
            } else if (currentProg > 35) {
                setUploadStepMessage("Memeriksa format & ukuran dokumen...");
            }
            setUploadProgress(currentProg);
        }, 120);

        router.post("/csms/upload", formData, {
            preserveScroll: true,
            onProgress: (progress) => {
                if (progress && progress.percentage) {
                    setUploadProgress((prev) => Math.max(prev, Math.min(progress.percentage, 95)));
                }
            },
            onSuccess: () => {
                clearInterval(progressTimer);
                setUploadProgress(100);
                setUploadStepMessage("Berkas berhasil diunggah secara sempurna!");
                setTimeout(() => {
                    setIsUploading(false);
                    setUploadProgress(0);
                    setUploadStepMessage("");
                    setUploadTarget(null);
                    reset();
                }, 400);
            },
            onError: (errs) => {
                clearInterval(progressTimer);
                setIsUploading(false);
                setUploadProgress(0);
                setUploadStepMessage("");
                console.error("Upload error:", errs);
                alert("Pengunggahan dokumen gagal. Pastikan berkas berformat PDF, JPG, PNG, atau Word dan ukuran maks 5 MB per berkas.");
            },
            onFinish: () => {
                clearInterval(progressTimer);
            }
        });
    };

    // Handler setelah Drag & Drop pada Baris Tabel:
    // Menampilkan detail berkas yang di-drop ke dalam modal, sehingga user dapat memeriksa detailnya sebelum menekan tombol "Upload"
    const handleDropToReview = (category, crew, droppedFilesList, existingRecord = null) => {
        if (!droppedFilesList) return;
        const droppedFiles = droppedFilesList instanceof FileList || Array.isArray(droppedFilesList)
            ? Array.from(droppedFilesList)
            : [droppedFilesList];

        if (droppedFiles.length === 0) return;

        // Validasi ukuran berkas (Maks 5 MB per berkas) & format ekstensi
        const maxSizeBytes = 5 * 1024 * 1024; // 5 MB (5242880 bytes)
        const allowed = ["pdf", "jpg", "jpeg", "png", "doc", "docx"];

        const validFiles = [];
        for (const f of droppedFiles) {
            const ext = f.name.split(".").pop().toLowerCase();
            if (!allowed.includes(ext)) {
                alert(`Format berkas "${f.name}" (.${ext}) tidak didukung. Harap gunakan berkas PDF, JPG, JPEG, atau Word (DOC/DOCX).`);
                return;
            }
            if (f.size > maxSizeBytes) {
                const sizeMB = (f.size / (1024 * 1024)).toFixed(2);
                alert(`Berkas "${f.name}" (${sizeMB} MB) melebihi batas maksimal 5 MB.`);
                return;
            }
            validFiles.push(f);
        }

        // Buka modal upload dengan berkas yang baru saja di-drop agar pengguna dapat memeriksa detailnya sebelum menekan Upload
        setUploadTarget({
            catId: category.id,
            catNo: category.no,
            catName: category.nama_dokumen,
            crew: crew,
            currentRecord: existingRecord,
            fromDrop: true,
        });

        setData({
            csms_rig_id: rig.id,
            csms_document_category_id: category.id,
            periode_bulan: selectedMonth,
            periode_tahun: selectedYear,
            crew: crew,
            status: "Lengkap",
            keterangan: existingRecord?.keterangan || "",
            files: validFiles,
        });
    };

    // ═══════════════════════════════════════════════════════════════
    // HANDLER INSPEKSI & VERIFIKASI DOKUMEN (IN-APP VIEWER & ACC)
    // ═══════════════════════════════════════════════════════════════
    const openDocumentViewer = (record, category, crew, initialIndex = 0) => {
        if (!record || !record.file_path) return;
        setViewerState({
            isOpen: true,
            record,
            category,
            crew,
            initialIndex,
        });
    };

    // Handler ACC langsung dari dalam DocumentViewerModal
    const handleApproveFromViewer = (recordId) => {
        return new Promise((resolve, reject) => {
            router.post(`/admin/csms/verify/${recordId}`, {
                approval_status: "approved",
                approval_notes: "Disetujui langsung (ACC Sah) dari pratinjau dokumen oleh Admin HSE.",
            }, {
                preserveScroll: true,
                onSuccess: (page) => {
                    const updatedRec = page.props.records?.find((r) => r.id === recordId);
                    if (updatedRec) {
                        setViewerState((prev) => ({ ...prev, record: updatedRec }));
                    }
                    resolve();
                },
                onError: reject,
            });
        });
    };

    // Handler Revisi / Catatan dari dalam DocumentViewerModal
    const handleReviseFromViewer = (recordId, status, notes) => {
        return new Promise((resolve, reject) => {
            router.post(`/admin/csms/verify/${recordId}`, {
                approval_status: status,
                approval_notes: notes,
            }, {
                preserveScroll: true,
                onSuccess: (page) => {
                    const updatedRec = page.props.records?.find((r) => r.id === recordId);
                    if (updatedRec) {
                        setViewerState((prev) => ({ ...prev, record: updatedRec }));
                    }
                    resolve();
                },
                onError: reject,
            });
        });
    };

    const handleQuickApprove = (recordId) => {
        if (!recordId) return;
        router.post(`/admin/csms/verify/${recordId}`, {
            approval_status: 'approved',
            approval_notes: 'Disetujui langsung (ACC Sah) oleh Admin HSE.',
        }, {
            preserveScroll: true,
        });
    };

    const openVerificationModal = (record, category, crew, defaultStatus = "approved") => {
        if (!record) return;
        setVerificationModal({
            isOpen: true,
            record,
            category,
            crew,
        });
        setVerifyStatus(
            record.approval_status === "revision" || record.approval_status === "rejected"
                ? record.approval_status
                : defaultStatus
        );
        setVerifyNotes(record.approval_notes || "");
    };

    const handleVerificationSubmit = (e) => {
        e.preventDefault();
        if (!verificationModal.record) return;
        setIsVerifying(true);
        router.post(`/admin/csms/verify/${verificationModal.record.id}`, {
            approval_status: verifyStatus,
            approval_notes: verifyNotes,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsVerifying(false);
                setVerificationModal({ isOpen: false, record: null, category: null, crew: null });
                setVerifyNotes("");
            },
            onError: () => {
                setIsVerifying(false);
            },
        });
    };

    const handleBulkApproveRig = () => {
        const pendingRecords = records.filter(r => r.file_path && r.approval_status !== 'approved');
        if (pendingRecords.length === 0) {
            alert(`Seluruh berkas yang terunggah pada ${rig.name} (${selectedMonth} ${selectedYear}) sudah berstatus Disetujui (ACC Sah).`);
            return;
        }
        if (confirm(`Apakah Anda yakin ingin menyetujui (ACC Sah) ${pendingRecords.length} berkas dokumen CSMS pada ${rig.name} (${selectedMonth} ${selectedYear}) sekaligus?`)) {
            router.post('/admin/csms/verify-bulk', {
                record_ids: pendingRecords.map(r => r.id),
                approval_status: 'approved',
            }, {
                preserveScroll: true,
            });
        }
    };

    const handleDeleteRecord = (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus berkas dokumen ini?")) {
            router.delete(`/csms/record/${id}`);
        }
    };

    // Filter categories by search
    const filteredCategories = categories.filter(c =>
        c.nama_dokumen.toLowerCase().includes(searchCategory.toLowerCase()) ||
        String(c.no).includes(searchCategory)
    );

    return (
        <AdminLayout>
            <Head title={`Form Input CSMS - ${rig?.name || 'RIG'}`} />

            {/* SAFETY HAZARD ACCENT STRIPE */}
            <div
                className="w-full h-1.5 shrink-0"
                style={{
                    background:
                        "repeating-linear-gradient(45deg, #f59e0b, #f59e0b 16px, #1e293b 16px, #1e293b 32px)",
                }}
            />

            <div className="p-4 sm:p-6 lg:p-8 max-w-[1560px] mx-auto space-y-7 font-sans bg-[#f8fafc] text-slate-800">
                
                {/* ═══════════════════════════════════════════════════════════════
                    1. HEADER CARD (PORTAL INPUT DOKUMEN PER-RIG)
                ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs relative">
                    {/* Garis Aksen K3 Emerald Pekat di bagian atas card */}
                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900" />

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                                {isAdmin ? (
                                    <>
                                        <ShieldCheck size={14} className="text-emerald-600" />
                                        <span>Panel Verifikasi & ACC CSMS • Admin HSE</span>
                                    </>
                                ) : (
                                    <>
                                        <HardHat size={14} className="text-emerald-600" />
                                        <span>Portal Pelaporan CSMS Lapangan</span>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                                    {isAdmin ? `Verifikasi & ACC Dokumen: ${rig?.name}` : `Input Dokumen: ${rig?.name}`}
                                </h1>
                                <span className="text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-lg">
                                    {rig?.code}
                                </span>
                            </div>

                            <p className="text-slate-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
                                {isAdmin
                                    ? "Periksa kelengkapan 21 kategori dokumen CSMS K3 per-crew & unit rig. Anda dapat melakukan verifikasi, memberikan catatan instruksi revisi, atau melakukan ACC Sah massal secara langsung di portal ini."
                                    : "Silakan lengkapi berkas untuk 21 kategori dokumen K3. Berkas yang dikirim akan diverifikasi oleh Admin HSE sebelum di-ACC."}
                            </p>
                        </div>

                        {/* Rig Switcher & Periode */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Tombol Bulk ACC Dokumen untuk Admin HSE */}
                            {isAdmin && (
                                <button
                                    type="button"
                                    onClick={handleBulkApproveRig}
                                    disabled={(rigSummary.pending_count || 0) === 0}
                                    className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                                    title="Setujui (ACC Sah) seluruh dokumen yang belum di-ACC pada rig ini untuk periode aktif"
                                >
                                    <ShieldCheck size={16} />
                                    <span>
                                        ACC Semua Dokumen Rig {(rigSummary.pending_count || 0) > 0 ? `(${rigSummary.pending_count})` : ''}
                                    </span>
                                </button>
                            )}

                            {/* Pemilih Rig atau Badge Rig Terkunci */}
                            {isRestricted ? (
                                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs font-black text-emerald-800 shadow-2xs">
                                    <HardHat size={15} className="text-emerald-600" />
                                    <span>Unit Ditugaskan: {rig?.name} ({rig?.code})</span>
                                </div>
                            ) : (
                                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
                                    <HardDrive size={16} className="text-emerald-600 mr-2" />
                                    <span className="text-xs font-bold text-slate-500 mr-2">Pilih Unit RIG:</span>
                                    <select
                                        value={rig?.id || ''}
                                        onChange={(e) => handleRigSwitch(e.target.value)}
                                        className="bg-transparent text-slate-800 text-xs sm:text-sm font-bold cursor-pointer border-none focus:ring-0 py-1 pl-1 pr-6 focus:outline-none"
                                    >
                                        {allRigs.map((r) => (
                                            <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Pemilih Periode */}
                            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1.5 shadow-2xs">
                                <Calendar size={15} className="text-emerald-600 ml-1.5 mr-1" />
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => handleFilterChange(e.target.value, selectedYear)}
                                    className="bg-transparent text-slate-700 text-xs sm:text-sm font-bold cursor-pointer border-none focus:ring-0 py-1 pl-1 pr-6 focus:outline-none"
                                >
                                    {months.map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                                <span className="text-slate-300">/</span>
                                <YearSelect
                                    value={selectedYear}
                                    onChange={(year) => handleFilterChange(selectedMonth, year)}
                                    availableYears={availableYears}
                                    className="bg-transparent text-slate-700 text-xs sm:text-sm font-bold cursor-pointer border-none focus:ring-0 py-1 pl-1 pr-6 focus:outline-none"
                                    optionClass="bg-white text-slate-800"
                                />
                            </div>

                            {/* Tombol Navigasi */}
                            {!isRestricted ? (
                                <Link
                                    href="/csms"
                                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-all border border-slate-200"
                                >
                                    Kembali ke Overview
                                </Link>
                            ) : (
                                <Link
                                    href={`/csms/rig/${rig?.id}`}
                                    className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs sm:text-sm transition-all border border-emerald-200"
                                >
                                    Lihat Matriks Rig
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notifikasi Flash Feedback */}
                {flash?.success && (
                    <div className="p-3.5 rounded-2xl bg-emerald-900 text-white border border-emerald-700 shadow-md flex items-center justify-between animate-in fade-in duration-200">
                        <div className="flex items-center gap-2.5 text-xs font-bold">
                            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                            <span>{flash.success}</span>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════
                    2. PROGRESS KEPATUHAN CSMS RIG TERPILIH
                ═══════════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    {/* Dokumen Terunggah */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                            <Upload size={22} />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Terunggah</span>
                            <h3 className="text-2xl font-black text-slate-800">
                                {rigSummary.total_uploaded || 0} <span className="text-xs font-semibold text-slate-500">/ {rigSummary.total_required || 33}</span>
                            </h3>
                        </div>
                    </div>

                    {/* Disetujui (ACC Sah) */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                            <CheckCircle2 size={22} />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Disetujui (ACC Sah)</span>
                            <h3 className="text-2xl font-black text-emerald-700">
                                {rigSummary.approved_count || 0} <span className="text-xs font-semibold text-slate-500">Dokumen</span>
                            </h3>
                        </div>
                    </div>

                    {/* Menunggu Verifikasi */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                            <Clock size={22} />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Menunggu ACC Admin</span>
                            <h3 className="text-2xl font-black text-amber-700">
                                {rigSummary.pending_count || 0} <span className="text-xs font-semibold text-slate-500">Pending</span>
                            </h3>
                        </div>
                    </div>

                    {/* Perlu Revisi */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                            <RotateCcw size={22} />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">Perlu Perbaikan / Revisi</span>
                            <h3 className="text-2xl font-black text-red-700">
                                {rigSummary.revision_count || 0} <span className="text-xs font-semibold text-slate-500">Perlu Dicek</span>
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Banner Peringatan Jika Ada Dokumen Perlu Revisi */}
                {(rigSummary.revision_count || 0) > 0 && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-800">
                        <AlertTriangle size={24} className="shrink-0 text-red-600" />
                        <div className="text-xs sm:text-sm">
                            <strong className="font-bold">Perhatian:</strong> Terdapat <strong>{rigSummary.revision_count} dokumen</strong> yang memerlukan revisi dari tim lapangan. Silakan periksa catatan dari Admin HSE pada tabel di bawah dan unggah dokumen perbaikan.
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════
                    3. MATRIKS FORMULIR INPUT 21 DOKUMEN CSMS
                ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    
                    {/* Header Filter Pencarian */}
                    <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Layers size={18} className="text-emerald-600" />
                            <h3 className="font-black text-slate-800 text-sm sm:text-base">
                                Matriks 21 Kategori Dokumen CSMS - {rig?.name}
                            </h3>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            {/* [ADMIN ONLY] Tombol tambah dokumen baru */}
                            {isAdmin && (
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all shadow-sm"
                                >
                                    <Plus size={13} />
                                    Tambah Dokumen
                                </button>
                            )}

                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama atau nomor kategori..."
                                    value={searchCategory}
                                    onChange={(e) => setSearchCategory(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 shadow-2xs w-64 placeholder-slate-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table View Matriks */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                                    <th className="p-3.5 border-r border-slate-200 w-12 text-center">No</th>
                                    <th className="p-3.5 border-r border-slate-200 min-w-[220px]">Nama Dokumen Rekaman</th>
                                    <th className="p-3.5 border-r border-slate-200 w-28">Durasi / Periode</th>
                                    <th className="p-3.5 border-r border-slate-200 text-center w-40 bg-slate-100/50">Crew A</th>
                                    <th className="p-3.5 border-r border-slate-200 text-center w-40 bg-slate-100/50">Crew B</th>
                                    <th className="p-3.5 border-r border-slate-200 text-center w-40 bg-slate-100/50">Crew C</th>
                                    <th className="p-3.5 min-w-[200px]">Catatan / Instruksi Admin</th>
                                    {isAdmin && (
                                        <th className="p-3.5 border-l border-slate-200 text-center w-16">Aksi</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filteredCategories.map((cat) => {
                                    const recordCrewA = matrix?.[cat.id]?.['Crew A'];
                                    const recordCrewB = matrix?.[cat.id]?.['Crew B'];
                                    const recordCrewC = matrix?.[cat.id]?.['Crew C'];
                                    const recordRig   = matrix?.[cat.id]?.['Rig'];

                                    const isCrewScope = cat.scope === 'crew';
                                    const activeFeedback = recordRig?.approval_notes || recordCrewA?.approval_notes || recordCrewB?.approval_notes || recordCrewC?.approval_notes;
                                    const isRenaming  = isAdmin && renamingCatId === cat.id;

                                    return (
                                        <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                                            {/* Nomor */}
                                            <td className="p-3.5 text-center font-bold border-r border-slate-100 text-slate-500">
                                                {cat.no}
                                            </td>

                                            {/* Nama Dokumen — inline rename untuk Admin, read-only untuk User */}
                                            <td className="p-3.5 font-bold text-slate-800 border-r border-slate-100">
                                                {isRenaming ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <input
                                                            ref={renameInputRef}
                                                            type="text"
                                                            value={renameValue}
                                                            onChange={(e) => setRenameValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") submitRename(cat.id);
                                                                if (e.key === "Escape") cancelRename();
                                                            }}
                                                            className="flex-1 text-xs border border-emerald-400 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-300 font-bold text-slate-800"
                                                        />
                                                        <button onClick={() => submitRename(cat.id)} title="Simpan" className="text-emerald-600 hover:text-emerald-700 transition-colors">
                                                            <Check size={14} />
                                                        </button>
                                                        <button onClick={cancelRename} title="Batal" className="text-slate-400 hover:text-slate-600 transition-colors">
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 group">
                                                        <div>{cat.nama_dokumen}</div>
                                                        {/* Ikon pensil hanya muncul saat hover, khusus Admin */}
                                                        {isAdmin && (
                                                            <button
                                                                onClick={() => startRename(cat)}
                                                                title="Ubah nama dokumen"
                                                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-emerald-600 transition-all"
                                                            >
                                                                <Pencil size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                                <span className="text-[10px] font-semibold text-slate-400">
                                                    Scope: {isCrewScope ? '3 Crew (A, B, C)' : '1 Unit Per Rig'}
                                                </span>
                                            </td>

                                            {/* Durasi */}
                                            <td className="p-3.5 border-r border-slate-100 font-medium text-slate-500 whitespace-pre-line text-[11px]">
                                                {cat.durasi}
                                            </td>

                                            {/* LOGIKA UPLOAD: JIKA CREW SCOPE, TAMPILKAN 3 KOLOM TERPISAH (CREW A, B, C).
                                                JIKA RIG SCOPE, GABUNGKAN (COLSPAN=3) MENJADI 1 TEMPAT UPLOAD TERPADU */}
                                            {isCrewScope ? (
                                                <>
                                                    {/* Slot Crew A */}
                                                    <td className="p-2 border-r border-slate-100 text-center align-middle">
                                                        <UserUploadCell
                                                            category={cat}
                                                            crew="Crew A"
                                                            record={recordCrewA}
                                                            onUpload={() => openUploadModal(cat, "Crew A", recordCrewA)}
                                                            onDelete={handleDeleteRecord}
                                                            onDropFile={(files) => handleDropToReview(cat, "Crew A", files, recordCrewA)}
                                                            onViewAttachments={() => setViewAttachmentsRecord(recordCrewA)}
                                                            isUploading={uploadingKey === `${cat.id}-Crew A`}
                                                            isGlobalDragging={isGlobalDragging}
                                                            isAdmin={isAdmin}
                                                            onQuickApprove={() => handleQuickApprove(recordCrewA?.id)}
                                                            onReview={(defaultStatus) => openVerificationModal(recordCrewA, cat, "Crew A", defaultStatus)}
                                                            onPreview={(idx) => openDocumentViewer(recordCrewA, cat, "Crew A", idx)}
                                                        />
                                                    </td>

                                                    {/* Slot Crew B */}
                                                    <td className="p-2 border-r border-slate-100 text-center align-middle">
                                                        <UserUploadCell
                                                            category={cat}
                                                            crew="Crew B"
                                                            record={recordCrewB}
                                                            onUpload={() => openUploadModal(cat, "Crew B", recordCrewB)}
                                                            onDelete={handleDeleteRecord}
                                                            onDropFile={(files) => handleDropToReview(cat, "Crew B", files, recordCrewB)}
                                                            onViewAttachments={() => setViewAttachmentsRecord(recordCrewB)}
                                                            isUploading={uploadingKey === `${cat.id}-Crew B`}
                                                            isGlobalDragging={isGlobalDragging}
                                                            isAdmin={isAdmin}
                                                            onQuickApprove={() => handleQuickApprove(recordCrewB?.id)}
                                                            onReview={(defaultStatus) => openVerificationModal(recordCrewB, cat, "Crew B", defaultStatus)}
                                                            onPreview={(idx) => openDocumentViewer(recordCrewB, cat, "Crew B", idx)}
                                                        />
                                                    </td>

                                                    {/* Slot Crew C */}
                                                    <td className="p-2 border-r border-slate-100 text-center align-middle">
                                                        <UserUploadCell
                                                            category={cat}
                                                            crew="Crew C"
                                                            record={recordCrewC}
                                                            onUpload={() => openUploadModal(cat, "Crew C", recordCrewC)}
                                                            onDelete={handleDeleteRecord}
                                                            onDropFile={(files) => handleDropToReview(cat, "Crew C", files, recordCrewC)}
                                                            onViewAttachments={() => setViewAttachmentsRecord(recordCrewC)}
                                                            isUploading={uploadingKey === `${cat.id}-Crew C`}
                                                            isGlobalDragging={isGlobalDragging}
                                                            isAdmin={isAdmin}
                                                            onQuickApprove={() => handleQuickApprove(recordCrewC?.id)}
                                                            onReview={(defaultStatus) => openVerificationModal(recordCrewC, cat, "Crew C", defaultStatus)}
                                                            onPreview={(idx) => openDocumentViewer(recordCrewC, cat, "Crew C", idx)}
                                                        />
                                                    </td>
                                                </>
                                            ) : (
                                                /* ═══════════════════════════════════════════════════════════════
                                                   GABUNGAN (COLSPAN=3): TEMPAT UPLOAD SATUAN UNTUK CREW A, B, C
                                                ═══════════════════════════════════════════════════════════════ */
                                                <td colSpan={3} className="p-2 border-r border-slate-100 text-center align-middle">
                                                    <UnifiedRigUploadCell
                                                        category={cat}
                                                        record={recordRig}
                                                        onUpload={() => openUploadModal(cat, "Rig", recordRig)}
                                                        onDelete={handleDeleteRecord}
                                                        onDropFile={(files) => handleDropToReview(cat, "Rig", files, recordRig)}
                                                        onViewAttachments={() => setViewAttachmentsRecord(recordRig)}
                                                        isUploading={uploadingKey === `${cat.id}-Rig`}
                                                        isGlobalDragging={isGlobalDragging}
                                                        isAdmin={isAdmin}
                                                        onQuickApprove={() => handleQuickApprove(recordRig?.id)}
                                                        onReview={(defaultStatus) => openVerificationModal(recordRig, cat, "Rig", defaultStatus)}
                                                        onPreview={(idx) => openDocumentViewer(recordRig, cat, "Rig", idx)}
                                                    />
                                                </td>
                                            )}

                                            {/* Feedback / Catatan Admin HSE */}
                                            <td className="p-3 text-[11px] leading-relaxed">
                                                {activeFeedback ? (
                                                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-medium space-y-1">
                                                        <div className="flex items-center justify-between gap-1">
                                                            <strong className="text-[10px] uppercase tracking-wide text-amber-800">Catatan Admin:</strong>
                                                            {isAdmin && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const rec = recordRig || recordCrewA || recordCrewB || recordCrewC;
                                                                        const crw = recordRig ? "Rig" : recordCrewA ? "Crew A" : recordCrewB ? "Crew B" : "Crew C";
                                                                        openVerificationModal(rec, cat, crw, "revision");
                                                                    }}
                                                                    className="text-[10px] text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer shrink-0"
                                                                >
                                                                    Ubah Catatan
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div>{activeFeedback}</div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between gap-1">
                                                        <span className="text-slate-400 italic">
                                                            {cat.keterangan_default || '-'}
                                                        </span>
                                                        {isAdmin && (recordRig || recordCrewA || recordCrewB || recordCrewC) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const rec = recordRig || recordCrewA || recordCrewB || recordCrewC;
                                                                    const crw = recordRig ? "Rig" : recordCrewA ? "Crew A" : recordCrewB ? "Crew B" : "Crew C";
                                                                    openVerificationModal(rec, cat, crw, "revision");
                                                                }}
                                                                className="text-[10px] text-slate-600 hover:text-amber-800 font-bold px-1.5 py-0.5 rounded border border-slate-200 hover:border-amber-300 bg-white hover:bg-amber-50 shrink-0 cursor-pointer shadow-2xs"
                                                                title="Beri catatan evaluasi / revisi untuk kategori ini"
                                                            >
                                                                + Catatan
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            {/* [ADMIN ONLY] Kolom Aksi (Hapus Kategori) */}
                                            {isAdmin && (
                                                <td className="p-3 text-center border-l border-slate-100 align-middle">
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteCatModal(cat)}
                                                        title={`Hapus kategori "${cat.nama_dokumen}"`}
                                                        className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 inline-flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                MODAL FORM UPLOAD BERKAS PER-RIG
            ═══════════════════════════════════════════════════════════════ */}
            {uploadTarget && (
                <div
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer) e.dataTransfer.dropEffect = "copy"; }}
                    onDrop={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
                >
                    <div
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer) e.dataTransfer.dropEffect = "copy"; }}
                        onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                                const newFiles = Array.from(e.dataTransfer.files);
                                setData("files", [...(data.files || []), ...newFiles]);
                            }
                        }}
                        className="bg-white border border-slate-200/90 rounded-3xl max-w-4xl xl:max-w-5xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-slate-800 my-auto"
                    >
                        {/* Machined Header */}
                        <div className="flex items-start justify-between border-b border-slate-100 pb-3.5 mb-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-slate-900 text-white uppercase tracking-wider">
                                        {uploadTarget.catNo ? `NO. ${uploadTarget.catNo}` : 'CSMS'}
                                    </span>
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                                        {rig?.name} • {uploadTarget.crew === 'Rig' ? 'Seluruh Rig' : uploadTarget.crew}
                                    </span>
                                </div>
                                <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                                    {uploadTarget.catName}
                                </h3>
                            </div>
                            <button
                                onClick={() => !isUploading && setUploadTarget(null)}
                                disabled={isUploading}
                                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-30"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Tampilkan Catatan Revisi jika dokumen sebelumnya ditolak / perlu revisi */}
                        {uploadTarget.currentRecord?.approval_notes && (
                            <div className="p-3 mb-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                                <strong className="font-bold flex items-center gap-1 text-amber-800 mb-0.5">
                                    <AlertCircle size={14} />
                                    <span>Instruksi Revisi dari Admin HSE:</span>
                                </strong>
                                <span>{uploadTarget.currentRecord.approval_notes}</span>
                            </div>
                        )}

                        <form onSubmit={handleUploadSubmit} className="space-y-4">
                            {/* GRID 2-KOLOM: MELEBAR KE KANAN, BUKAN KE BAWAH */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                                {/* KOLOM KIRI: Lingkup, Drop Area, & Catatan */}
                                <div className="space-y-3">
                                    {/* Metadata Strip */}
                                    <div className="grid grid-cols-2 gap-2.5 p-2.5 bg-slate-50/90 rounded-xl border border-slate-200/80 text-xs">
                                        <div>
                                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Lingkup Pelaporan</span>
                                            <span className="font-bold text-slate-800 text-xs truncate block">
                                                {uploadTarget.crew === 'Rig' ? 'Seluruh Rig (Crew A, B, C)' : uploadTarget.crew}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Periode CSMS</span>
                                            <span className="font-bold text-slate-800 text-xs block">
                                                {selectedMonth} {selectedYear}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Area Drop Berkas (Kiri) */}
                                    <div>
                                        <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                                            Tarik & Lepas Berkas ke Sini
                                        </label>
                                        <FileDropzone
                                            viewMode="dropOnly"
                                            files={data.files}
                                            onFilesChange={(newFiles) => setData("files", newFiles)}
                                            existingAttachments={uploadTarget.currentRecord?.attachments || []}
                                            existingFileName={uploadTarget.currentRecord?.file_name}
                                            existingFilePath={uploadTarget.currentRecord?.file_path}
                                            error={errors.files || errors.file}
                                            maxSizeKB={5120}
                                            multiple={true}
                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        />
                                    </div>

                                    {/* Catatan Lapangan Opsional (Kiri) */}
                                    <div>
                                        <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                                            Catatan Lapangan (Opsional)
                                        </label>
                                        <textarea
                                            value={data.keterangan}
                                            onChange={(e) => setData("keterangan", e.target.value)}
                                            disabled={isUploading}
                                            rows="2"
                                            placeholder="Contoh: Dokumen telah diverifikasi Rig Superintendent & HSE Officer..."
                                            className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none text-slate-800 placeholder-slate-400 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* KOLOM KANAN: Daftar Berkas Terpilih & Animasi Panjang Bar */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                                            Pratinjau Berkas Siap Diunggah
                                        </label>
                                        <FileDropzone
                                            viewMode="filesOnly"
                                            files={data.files}
                                            onFilesChange={(newFiles) => setData("files", newFiles)}
                                            maxSizeKB={5120}
                                            multiple={true}
                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        />
                                    </div>

                                    {/* ANIMASI PANJANG BAR PROSES UPLOAD (KANAN) */}
                                    {isUploading && (
                                        <div className="p-4 rounded-2xl bg-slate-950 text-white shadow-xl border border-slate-800 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                                    </span>
                                                    <span className="font-semibold text-slate-200 tracking-wide text-[11px] truncate">
                                                        {uploadStepMessage || "Mentransfer Berkas ke Peladen CSMS..."}
                                                    </span>
                                                </div>
                                                <span className="font-mono text-xs font-black text-emerald-400 tracking-wider shrink-0 ml-2">
                                                    {Math.round(uploadProgress)}%
                                                </span>
                                            </div>

                                            {/* PANJANG BAR (TRACK & FILL WITH SHIMMER & STRIPES) */}
                                            <div className="h-3.5 w-full bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner relative">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 progress-striped transition-all duration-300 ease-out relative overflow-hidden shadow-xs"
                                                    style={{ width: `${uploadProgress}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-shimmer" />
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5 font-mono">
                                                <span>Total Muatan: {data.files?.length || 1} Berkas</span>
                                                <span className={uploadProgress === 100 ? "text-emerald-400 font-bold" : "text-slate-400"}>
                                                    {uploadProgress === 100 ? "UNGGAH BERHASIL ✓" : "TRANSFER AKTIF..."}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer: Direct Drop Pill & Action Buttons */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 border-t border-slate-100">
                                <div>
                                    {uploadTarget.fromDrop ? (
                                        <div className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs inline-flex items-center gap-2 shadow-xs">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                            <span className="text-[11px] font-medium text-slate-200">
                                                Berkas terdeteksi via Drag & Drop
                                            </span>
                                            <span className="font-mono text-[9px] font-bold text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-800 uppercase">
                                                DIRECT DROP
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-[11px] text-slate-400 font-mono">
                                            Maksimal ukuran 5 MB per berkas dokumen
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-end gap-2.5">
                                    <button
                                        type="button"
                                        disabled={isUploading}
                                        onClick={() => setUploadTarget(null)}
                                        className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-40 cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUploading || (!data.files || data.files.length === 0)}
                                        className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-black disabled:opacity-50 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer group"
                                    >
                                        <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            {isUploading ? (
                                                <Loader2 size={13} className="animate-spin text-emerald-400" />
                                            ) : (
                                                <Upload size={13} className="text-white" />
                                            )}
                                        </div>
                                        <span>
                                            {isUploading
                                                ? `Mengunggah (${Math.round(uploadProgress)}%)...`
                                                : `Upload ${data.files && data.files.length > 0 ? `(${data.files.length} Berkas)` : ""} Sekarang`}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Pratinjau / Daftar Lampiran Berkas CSMS */}
            <AttachmentsModal
                isOpen={Boolean(viewAttachmentsRecord)}
                onClose={() => setViewAttachmentsRecord(null)}
                record={viewAttachmentsRecord}
                onPreviewAttachment={(rec, att, idx) => {
                    setViewAttachmentsRecord(null);
                    openDocumentViewer(rec, rec.category, rec.crew || "Rig", idx);
                }}
            />

            {/* ═══════════════════════════════════════════════════════════════
                MODAL INSPEKSI & PRATINJAU DOKUMEN IN-APP DENGAN TOMBOL ACC
            ═══════════════════════════════════════════════════════════════ */}
            <DocumentViewerModal
                isOpen={viewerState.isOpen}
                onClose={() => setViewerState((prev) => ({ ...prev, isOpen: false }))}
                record={viewerState.record}
                category={viewerState.category}
                crew={viewerState.crew}
                isAdmin={isAdmin}
                onApprove={handleApproveFromViewer}
                onRevise={handleReviseFromViewer}
                initialIndex={viewerState.initialIndex}
            />

            {/* ═══════════════════════════════════════════════════════════════
                MODAL VERIFIKASI & ACC CSMS (KHUSUS HSE ADMIN)
            ═══════════════════════════════════════════════════════════════ */}
            {verificationModal.isOpen && verificationModal.record && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                    <div className="bg-white border border-slate-200/90 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-slate-800 my-auto">
                        {/* Header */}
                        <div className="flex items-start justify-between border-b border-slate-100 pb-3.5 mb-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-emerald-600 text-white uppercase tracking-wider">
                                        VERIFIKASI & ACC CSMS
                                    </span>
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                                        {rig?.name} • {verificationModal.crew === 'Rig' ? 'Seluruh Rig' : verificationModal.crew}
                                    </span>
                                </div>
                                <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                                    {verificationModal.category?.nama_dokumen || "Verifikasi Dokumen CSMS"}
                                </h3>
                            </div>
                            <button
                                onClick={() => setVerificationModal({ isOpen: false, record: null, category: null, crew: null })}
                                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleVerificationSubmit} className="space-y-4">
                            {/* Ringkasan Berkas Terunggah */}
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                                <div className="min-w-0 pr-2">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Berkas Terunggah</span>
                                    <span className="font-bold text-slate-800 text-xs truncate block" title={verificationModal.record.file_name}>
                                        {verificationModal.record.file_name || "Berkas Dokumen"}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                        Periode: {selectedMonth} {selectedYear}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {verificationModal.record.attachments && verificationModal.record.attachments.length > 1 ? (
                                        <button
                                            type="button"
                                            onClick={() => openDocumentViewer(verificationModal.record, verificationModal.category, verificationModal.crew, 0)}
                                            className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-bold text-xs shadow-2xs flex items-center gap-1 cursor-pointer"
                                        >
                                            <Eye size={12} />
                                            <span>Lihat {verificationModal.record.attachments.length} Berkas</span>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => openDocumentViewer(verificationModal.record, verificationModal.category, verificationModal.crew, 0)}
                                            className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-bold text-xs shadow-2xs flex items-center gap-1 cursor-pointer"
                                        >
                                            <Eye size={12} />
                                            <span>Lihat Berkas</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Pilihan Keputusan Status Verifikasi */}
                            <div>
                                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    Keputusan Verifikasi HSE
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setVerifyStatus("approved")}
                                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                                            verifyStatus === "approved"
                                                ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-200 shadow-xs"
                                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        <ShieldCheck size={18} className={verifyStatus === "approved" ? "text-emerald-600" : "text-slate-400"} />
                                        <span className="text-[11px] font-extrabold uppercase">ACC (Sah)</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setVerifyStatus("revision")}
                                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                                            verifyStatus === "revision"
                                                ? "bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-200 shadow-xs"
                                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        <RotateCcw size={18} className={verifyStatus === "revision" ? "text-amber-600" : "text-slate-400"} />
                                        <span className="text-[11px] font-extrabold uppercase">Perlu Revisi</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setVerifyStatus("rejected")}
                                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                                            verifyStatus === "rejected"
                                                ? "bg-red-50 border-red-500 text-red-800 ring-2 ring-red-200 shadow-xs"
                                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        <AlertCircle size={18} className={verifyStatus === "rejected" ? "text-red-600" : "text-slate-400"} />
                                        <span className="text-[11px] font-extrabold uppercase">Tolak</span>
                                    </button>
                                </div>
                            </div>

                            {/* Catatan Evaluasi / Instruksi Revisi */}
                            <div>
                                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                                    Catatan Evaluasi / Instruksi Revisi untuk Kru Rig
                                </label>
                                <textarea
                                    value={verifyNotes}
                                    onChange={(e) => setVerifyNotes(e.target.value)}
                                    rows="3"
                                    placeholder={
                                        verifyStatus === "approved"
                                            ? "Catatan persetujuan (opsional): e.g. Berkas valid dan telah memenuhi standar CSMS K3..."
                                            : "Tuliskan instruksi perbaikan yang jelas: e.g. Tanda tangan Rig Superintendent belum ada, mohon scan ulang lampiran..."
                                    }
                                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none text-slate-800 placeholder-slate-400 transition-all"
                                />
                            </div>

                            {/* Tombol Aksi */}
                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setVerificationModal({ isOpen: false, record: null, category: null, crew: null })}
                                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isVerifying}
                                    className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center gap-1.5 cursor-pointer ${
                                        verifyStatus === "approved"
                                            ? "bg-emerald-600 hover:bg-emerald-700"
                                            : verifyStatus === "revision"
                                            ? "bg-amber-600 hover:bg-amber-700"
                                            : "bg-red-600 hover:bg-red-700"
                                    }`}
                                >
                                    {isVerifying ? (
                                        <Loader2 size={13} className="animate-spin" />
                                    ) : (
                                        <Check size={13} />
                                    )}
                                    <span>
                                        {verifyStatus === "approved"
                                            ? "ACC & Sahkan Dokumen"
                                            : verifyStatus === "revision"
                                            ? "Simpan Catatan Revisi"
                                            : "Tolak Dokumen"}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                [ADMIN ONLY] MODAL TAMBAH KATEGORI DOKUMEN BARU
            ═══════════════════════════════════════════════════════════════ */}
            {isAdmin && showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
                        {/* Header modal */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <Plus size={14} className="text-emerald-700" />
                                </div>
                                <h3 className="text-sm font-black text-slate-800">Tambah Kategori Dokumen Baru</h3>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleAddCategory} className="p-5 space-y-4">
                            {/* Nama Dokumen */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Nama Dokumen <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={addForm.nama_dokumen}
                                    onChange={(e) => setAddForm({ ...addForm, nama_dokumen: e.target.value })}
                                    placeholder="cth: Laporan Inspeksi Bulanan"
                                    required
                                    className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                                />
                            </div>

                            {/* Durasi */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Durasi / Frekuensi <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={addForm.durasi}
                                    onChange={(e) => setAddForm({ ...addForm, durasi: e.target.value })}
                                    placeholder="cth: 1x/Bulan atau Harian"
                                    required
                                    className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                                />
                            </div>

                            {/* Scope */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Scope <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={addForm.scope}
                                    onChange={(e) => setAddForm({ ...addForm, scope: e.target.value })}
                                    className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white"
                                >
                                    <option value="crew">Per Crew (Crew A, B, C terpisah)</option>
                                    <option value="rig">Per Rig (1 upload untuk seluruh crew)</option>
                                </select>
                            </div>

                            {/* Keterangan Default (opsional) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Keterangan Default <span className="text-slate-400 font-normal">(opsional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={addForm.keterangan_default}
                                    onChange={(e) => setAddForm({ ...addForm, keterangan_default: e.target.value })}
                                    placeholder="cth: Wajib diisi setiap bulan"
                                    className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                                />
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={addSubmitting || !addForm.nama_dokumen.trim() || !addForm.durasi.trim()}
                                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                                >
                                    {addSubmitting ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                                    {addSubmitting ? "Menyimpan..." : "Tambah Dokumen"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                [ADMIN ONLY] MODAL KONFIRMASI HAPUS KATEGORI DOKUMEN
            ═══════════════════════════════════════════════════════════════ */}
            {isAdmin && deleteCatModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 p-5 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3.5">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-base font-black text-slate-900 mb-1.5">
                            Hapus Kategori Dokumen?
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4">
                            Anda akan menghapus kategori <strong className="text-slate-800 font-bold">"{deleteCatModal.nama_dokumen}"</strong> (No. {deleteCatModal.no}). Semua berkas dan rekaman terkait kategori ini pada seluruh unit Rig akan ikut terhapus secara permanen.
                        </p>
                        <div className="flex items-center justify-center gap-2">
                            <button
                                type="button"
                                disabled={isDeletingCat}
                                onClick={() => setDeleteCatModal(null)}
                                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isDeletingCat}
                                onClick={confirmDeleteCategory}
                                className="px-4 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                                {isDeletingCat ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                <span>{isDeletingCat ? "Menghapus..." : "Ya, Hapus Kategori"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

function UserUploadCell({
    category,
    crew,
    record,
    onUpload,
    onDelete,
    onDropFile,
    onViewAttachments,
    isUploading = false,
    isGlobalDragging = false,
    isAdmin = false,
    onQuickApprove,
    onReview,
    onPreview,
}) {
    const [isHoveringDrag, setIsHoveringDrag] = useState(false);
    const dragCounter = useRef(0);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current += 1;
        if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
        setIsHoveringDrag(true);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
        if (!isHoveringDrag) setIsHoveringDrag(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current -= 1;
        if (dragCounter.current <= 0) {
            dragCounter.current = 0;
            setIsHoveringDrag(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current = 0;
        setIsHoveringDrag(false);

        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onDropFile(e.dataTransfer.files);
        }
    };

    // State saat proses upload berlangsung
    if (isUploading) {
        return (
            <div className="w-full py-2 px-1 bg-emerald-100 border border-emerald-400 text-emerald-900 rounded-lg font-bold text-[9px] flex items-center justify-center gap-1 shadow-xs animate-pulse">
                <Loader2 size={12} className="animate-spin text-emerald-700 shrink-0" />
                <span className="truncate">Mengunggah...</span>
            </div>
        );
    }

    if (!record || !record.file_path) {
        return (
            <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={onUpload}
                className={`w-full py-2 px-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer group select-none ${
                    isHoveringDrag
                        ? "bg-emerald-200 border-2 border-emerald-600 ring-2 ring-emerald-400 scale-105 text-emerald-950 font-black shadow-md"
                        : isGlobalDragging
                        ? "bg-emerald-100/80 border border-dashed border-emerald-500 text-emerald-800 animate-pulse"
                        : "bg-slate-50 hover:bg-emerald-50 border border-dashed border-slate-300 hover:border-emerald-400 text-slate-500 hover:text-emerald-700"
                }`}
                title={`Tarik & lepas satu atau beberapa file (maks 5MB) ke sini atau klik (${crew})`}
            >
                {isHoveringDrag ? (
                    <span className="text-emerald-950 font-black">Lepas di sini!</span>
                ) : (
                    <>
                        <Upload size={12} className="group-hover:-translate-y-0.5 transition-transform text-emerald-600" />
                        <span>Upload</span>
                    </>
                )}
            </div>
        );
    }

    const isApproved = record.approval_status === "approved";
    const isRevision = record.approval_status === "revision" || record.approval_status === "rejected";
    const hasMultiple = record.attachments && Array.isArray(record.attachments) && record.attachments.length > 1;

    return (
        <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                isHoveringDrag
                    ? "bg-blue-100 border-2 border-blue-500 ring-2 ring-blue-300 scale-105 shadow-md"
                    : isApproved
                    ? "bg-emerald-50/80 border-emerald-300"
                    : isRevision
                    ? "bg-red-50/80 border-red-300"
                    : "bg-amber-50/80 border-amber-300"
            }`}
        >
            {isHoveringDrag ? (
                <span className="text-[10px] font-black text-blue-900 py-1">Ganti Berkas</span>
            ) : (
                <>
                    {/* Status Header Badge */}
                    <div className="flex items-center gap-1">
                        {isApproved && <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />}
                        {isRevision && <RotateCcw size={12} className="text-red-600 shrink-0" />}
                        {!isApproved && !isRevision && <Clock size={12} className="text-amber-600 shrink-0" />}

                        <span className={`font-black text-[10px] tracking-wide uppercase ${
                            isApproved ? "text-emerald-700" : isRevision ? "text-red-700" : "text-amber-700"
                        }`}>
                            {isApproved ? "DI-ACC" : isRevision ? "REVISI" : "PENDING"}
                        </span>
                    </div>

                    {/* Jika lebih dari 1 file lampiran */}
                    {hasMultiple && (
                        <button
                            type="button"
                            onClick={() => (onPreview ? onPreview(0) : onViewAttachments())}
                            className="px-1.5 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[9px] font-black cursor-pointer transition-all shadow-2xs"
                            title="Klik untuk melihat semua lampiran berkas di pratinjau"
                        >
                            {record.attachments.length} Berkas
                        </button>
                    )}

                    {/* File Actions */}
                    <div className="flex items-center gap-1 mt-0.5 flex-wrap justify-center">
                        {/* Tombol ACC Cepat Khusus Admin HSE jika belum ACC */}
                        {isAdmin && !isApproved && (
                            <button
                                type="button"
                                onClick={onQuickApprove}
                                className="px-1.5 py-0.5 bg-emerald-600 text-white rounded font-black text-[9px] hover:bg-emerald-700 transition shadow-2xs flex items-center gap-0.5 cursor-pointer"
                                title="Setujui (ACC Sah) Dokumen Ini Langsung"
                            >
                                <Check size={10} strokeWidth={3} />
                                <span>ACC</span>
                            </button>
                        )}

                        {/* Tombol Buka Modal Evaluasi / Verifikasi Admin HSE */}
                        {isAdmin && (
                            <button
                                type="button"
                                onClick={() => onReview(isApproved ? "approved" : "revision")}
                                className="p-1 bg-amber-50 text-amber-800 border border-amber-300 rounded hover:bg-amber-100 transition-colors shadow-2xs cursor-pointer"
                                title="Evaluasi Dokumen / Berikan Catatan Revisi"
                            >
                                <MessageSquare size={11} />
                            </button>
                        )}

                        {/* Tombol Pratinjau Berkas & Foto (In-App Modal Tanpa Buka Tab Baru) */}
                        {hasMultiple ? (
                            <button
                                type="button"
                                onClick={() => (onPreview ? onPreview(0) : onViewAttachments())}
                                className="p-1 bg-white text-emerald-700 border border-slate-200 rounded hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer"
                                title="Lihat Pratinjau Berkas (In-App)"
                            >
                                <Eye size={12} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => (onPreview ? onPreview(0) : null)}
                                className="p-1 bg-white text-emerald-700 border border-slate-200 rounded hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer"
                                title="Lihat Pratinjau Berkas & Foto (In-App)"
                            >
                                <Eye size={12} />
                            </button>
                        )}

                        {/* Tombol Re-upload / Update File */}
                        <button
                            onClick={onUpload}
                            className="p-1 bg-white text-blue-700 border border-slate-200 rounded hover:bg-blue-50 transition-colors shadow-2xs cursor-pointer"
                            title={isRevision ? "Unggah Dokumen Revisi" : "Ganti Berkas"}
                        >
                            <Upload size={12} />
                        </button>

                        {/* Tombol Hapus */}
                        <button
                            onClick={() => onDelete(record.id)}
                            className="p-1 bg-white text-red-600 border border-slate-200 rounded hover:bg-red-50 transition-colors shadow-2xs cursor-pointer"
                            title="Hapus Dokumen"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

/**
 * Slot Upload Terpadu untuk Dokumen Per-Rig (Menggabungkan Kolom Crew A, B, C)
 * Mendukung Drag & Drop Banyak Berkas Langsung pada Baris Tabel!
 */
function UnifiedRigUploadCell({
    category,
    record,
    onUpload,
    onDelete,
    onDropFile,
    onViewAttachments,
    isUploading = false,
    isGlobalDragging = false,
    isAdmin = false,
    onQuickApprove,
    onReview,
    onPreview,
}) {
    const [isHoveringDrag, setIsHoveringDrag] = useState(false);
    const dragCounter = useRef(0);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current += 1;
        if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
        setIsHoveringDrag(true);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
        if (!isHoveringDrag) setIsHoveringDrag(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current -= 1;
        if (dragCounter.current <= 0) {
            dragCounter.current = 0;
            setIsHoveringDrag(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current = 0;
        setIsHoveringDrag(false);

        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onDropFile(e.dataTransfer.files);
        }
    };

    // State saat proses upload berlangsung
    if (isUploading) {
        return (
            <div className="w-full py-2.5 px-4 bg-emerald-100/90 border border-emerald-400 text-emerald-900 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs animate-pulse">
                <Loader2 size={16} className="animate-spin text-emerald-700 shrink-0" />
                <span>Sedang Mengunggah & Menyimpan Berkas Dokumen...</span>
            </div>
        );
    }

    if (!record || !record.file_path) {
        return (
            <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={onUpload}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer group shadow-2xs select-none relative ${
                    isHoveringDrag
                        ? "bg-emerald-200 border-2 border-emerald-600 ring-4 ring-emerald-400/50 scale-[1.02] text-emerald-950 shadow-md font-black"
                        : isGlobalDragging
                        ? "bg-emerald-100/80 border-2 border-dashed border-emerald-500 text-emerald-800 animate-pulse ring-2 ring-emerald-200"
                        : "bg-emerald-50/70 hover:bg-emerald-100/80 border border-dashed border-emerald-300 hover:border-emerald-500 text-emerald-800"
                }`}
                title="Tarik & lepas satu atau banyak file (maks 5MB) ke kotak ini, atau klik untuk buka form"
            >
                {isHoveringDrag ? (
                    <>
                        <FileUp size={16} className="animate-bounce text-emerald-800 shrink-0" />
                        <span className="font-black text-emerald-950 text-sm">
                            Lepaskan Berkas untuk Langsung Unggah (Seluruh Unit Rig)!
                        </span>
                    </>
                ) : (
                    <>
                        <Upload size={14} className="group-hover:-translate-y-0.5 transition-transform text-emerald-600 shrink-0" />
                        <span>Upload Dokumen (Tarik & Lepas File ke Sini / Klik)</span>
                    </>
                )}
            </div>
        );
    }

    const isApproved = record.approval_status === "approved";
    const isRevision = record.approval_status === "revision" || record.approval_status === "rejected";
    const hasMultiple = record.attachments && Array.isArray(record.attachments) && record.attachments.length > 1;

    return (
        <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex items-center justify-between p-2 px-3 rounded-xl border transition-all duration-150 relative ${
                isHoveringDrag
                    ? "bg-blue-100 border-2 border-blue-500 ring-4 ring-blue-300 scale-[1.01] shadow-md"
                    : isApproved
                    ? "bg-emerald-50/80 border-emerald-300"
                    : isRevision
                    ? "bg-red-50/80 border-red-300"
                    : "bg-amber-50/80 border-amber-300"
            }`}
        >
            {isHoveringDrag ? (
                <div className="w-full py-1 text-center flex items-center justify-center gap-2 text-blue-900 font-black text-xs">
                    <FileUp size={15} className="animate-bounce text-blue-600 shrink-0" />
                    <span>Lepaskan berkas baru di sini untuk mengganti dokumen ini!</span>
                </div>
            ) : (
                <>
                    {/* Status & Nama File */}
                    <div className="flex items-center gap-2.5 truncate text-left">
                        <span className={`inline-flex items-center gap-1 font-black text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-md ${
                            isApproved ? "bg-emerald-100 text-emerald-800" : isRevision ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                        }`}>
                            {isApproved && <CheckCircle2 size={11} />}
                            {isRevision && <RotateCcw size={11} />}
                            {!isApproved && !isRevision && <Clock size={11} />}
                            <span>{isApproved ? "DI-ACC SAH" : isRevision ? "REVISI" : "MENUNGGU ACC"}</span>
                        </span>

                        <div className="truncate max-w-[260px]">
                            {hasMultiple ? (
                                <button
                                    type="button"
                                    onClick={() => (onPreview ? onPreview(0) : onViewAttachments())}
                                    className="text-xs font-bold text-slate-800 hover:text-emerald-700 hover:underline truncate block text-left cursor-pointer"
                                    title="Klik untuk melihat semua lampiran berkas di pratinjau"
                                >
                                    {record.file_name}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => (onPreview ? onPreview(0) : null)}
                                    className="text-xs font-bold text-slate-800 hover:text-emerald-700 hover:underline truncate block text-left cursor-pointer"
                                    title="Klik untuk melihat pratinjau berkas"
                                >
                                    {record.file_name}
                                </button>
                            )}
                            <span className="text-[10px] text-slate-500">Berlaku untuk Crew A, B, C (Seluruh Rig)</span>
                        </div>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-3">
                        {/* Tombol ACC Cepat Khusus Admin HSE jika belum ACC */}
                        {isAdmin && !isApproved && (
                            <button
                                type="button"
                                onClick={onQuickApprove}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black text-xs transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                title="Setujui (ACC Sah) Dokumen Ini Langsung"
                            >
                                <Check size={13} strokeWidth={3} />
                                <span>ACC Sah</span>
                            </button>
                        )}

                        {/* Tombol Buka Modal Evaluasi / Verifikasi Admin HSE */}
                        {isAdmin && (
                            <button
                                type="button"
                                onClick={() => onReview(isApproved ? "approved" : "revision")}
                                className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                title="Evaluasi Dokumen / Berikan Catatan Revisi"
                            >
                                <MessageSquare size={13} />
                                <span className="hidden sm:inline">Evaluasi</span>
                            </button>
                        )}

                        {/* Tombol Pratinjau Berkas & Foto (In-App Modal Tanpa Buka Tab Baru) */}
                        {hasMultiple ? (
                            <button
                                type="button"
                                onClick={() => (onPreview ? onPreview(0) : onViewAttachments())}
                                className="p-1.5 bg-white text-emerald-700 border border-slate-200 rounded-lg hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer"
                                title="Lihat Semua Lampiran Berkas (In-App)"
                            >
                                <Eye size={13} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => (onPreview ? onPreview(0) : null)}
                                className="p-1.5 bg-white text-emerald-700 border border-slate-200 rounded-lg hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer"
                                title="Lihat Pratinjau Berkas & Foto (In-App)"
                            >
                                <Eye size={13} />
                            </button>
                        )}

                        <button
                            onClick={onUpload}
                            className="p-1.5 bg-white text-blue-700 border border-slate-200 rounded-lg hover:bg-blue-50 transition-colors shadow-2xs cursor-pointer"
                            title={isRevision ? "Unggah Dokumen Revisi" : "Ganti Dokumen"}
                        >
                            <Upload size={13} />
                        </button>

                        <button
                            onClick={() => onDelete(record.id)}
                            className="p-1.5 bg-white text-red-600 border border-slate-200 rounded-lg hover:bg-red-50 transition-colors shadow-2xs cursor-pointer"
                            title="Hapus Dokumen"
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
