import React, { useState, useEffect, useRef } from "react";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import FileDropzone from "@/Components/FileDropzone";
import AttachmentsModal from "@/Components/AttachmentsModal";
import DocumentViewerModal from "@/Components/DocumentViewerModal";
import RigDownloadModal from "@/Components/RigDownloadModal";
import YearSelect from "@/Components/YearSelect";
import {
    ArrowLeft,
    Upload,
    CheckCircle2,
    Eye,
    Trash2,
    X,
    FileText,
    HardDrive,
    Shield,
    RotateCcw,
    Clock,
    AlertCircle,
    Calendar,
    Download,
    Loader2,
    FileUp,
    Sparkles,
    Pencil,
    Plus,
    Check,
} from "lucide-react";

export default function RigDetail({ rig, categories = [], records = [], matrix = {}, filter = {}, allRigs = [], isRestricted = false, availableYears = [] }) {
    const { auth } = usePage().props;
    const isAdmin = !isRestricted && (auth?.user?.role === "admin" || !auth?.user?.csms_rig_id);

    const [selectedMonth, setSelectedMonth] = useState(filter.bulan || "Januari");
    const [selectedYear, setSelectedYear] = useState(filter.tahun || availableYears?.[0] || new Date().getFullYear());

    useEffect(() => {
        if (filter.tahun) {
            setSelectedYear(filter.tahun);
        }
    }, [filter.tahun]);
    const [uploadTarget, setUploadTarget] = useState(null); // { catId, catNo, catName, crew, currentRecord }
    const [uploadingKey, setUploadingKey] = useState(null); // `${category.id}-${crew}`
    const [isGlobalDragging, setIsGlobalDragging] = useState(false);
    const [viewAttachmentsRecord, setViewAttachmentsRecord] = useState(null);
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
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

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
            `/csms/rig/${rig.id}`,
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
        router.get(`/csms/rig/${newRigId}?bulan=${selectedMonth}&tahun=${selectedYear}`);
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
        setUploadStepMessage("Mengompresi & mempersiapkan paket dokumen...");

        let currentProg = 15;
        const progressTimer = setInterval(() => {
            currentProg += Math.floor(Math.random() * 12) + 6;
            if (currentProg >= 94) {
                currentProg = 94;
                setUploadStepMessage("Menyimpan rekaman & memverifikasi integritas CSMS...");
            } else if (currentProg > 65) {
                setUploadStepMessage("Mentransfer paket berkas ke peladen K3...");
            } else if (currentProg > 35) {
                setUploadStepMessage("Memeriksa format & integritas berkas...");
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
                setUploadStepMessage("Dokumen berhasil diunggah secara sempurna!");
                setTimeout(() => {
                    setIsUploading(false);
                    setUploadProgress(0);
                    setUploadStepMessage("");
                    setUploadTarget(null);
                    reset();
                }, 400);
            },
            onError: () => {
                clearInterval(progressTimer);
                setIsUploading(false);
                setUploadProgress(0);
                setUploadStepMessage("");
            },
            onFinish: () => {
                clearInterval(progressTimer);
            },
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

    const handleDeleteRecord = (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus dokumen rekaman ini?")) {
            router.delete(`/csms/record/${id}`);
        }
    };

    return (
        <AdminLayout>
            <Head title={`Matriks Dokumen CSMS - ${rig?.name || 'RIG'}`} />

            {/* PITA GARIS KESELAMATAN K3 (SAFETY HAZARD RIBBON) */}
            <div
                className="w-full h-1.5 shrink-0"
                style={{
                    background:
                        "repeating-linear-gradient(45deg, #f59e0b, #f59e0b 16px, #1e293b 16px, #1e293b 32px)",
                }}
            />

            <div className="p-4 sm:p-6 max-w-[1560px] mx-auto space-y-6 font-sans bg-[#f8fafc] text-slate-800">
                
                {/* ═══════════════════════════════════════════════════════════════
                    HEADER TOP BAR
                ═══════════════════════════════════════════════════════════════ */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={isRestricted ? "/csms/input-rig" : "/csms"}
                            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors text-slate-700 shadow-2xs cursor-pointer"
                            title="Kembali"
                        >
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                                <Shield size={14} />
                                <span>Penyimpanan Data Rekaman CSMS</span>
                            </div>
                            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3 mt-0.5">
                                <span>{rig?.name}</span>
                                <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-lg">
                                    {rig?.code}
                                </span>
                            </h1>
                        </div>
                    </div>

                    {/* Rig Switcher & Periode */}
                    <div className="flex flex-wrap items-center gap-3">
                        {!isRestricted ? (
                            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
                                <HardDrive size={15} className="text-emerald-600 mr-2" />
                                <span className="text-xs font-bold text-slate-500 mr-2">Pilih Rig:</span>
                                <select
                                    value={rig?.id || ''}
                                    onChange={(e) => handleRigSwitch(e.target.value)}
                                    className="border-none bg-transparent text-slate-800 font-bold text-xs sm:text-sm focus:ring-0 focus:outline-none cursor-pointer pr-6"
                                >
                                    {(allRigs || []).map((r) => (
                                        <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs font-bold text-emerald-800 shadow-2xs">
                                <HardDrive size={15} className="text-emerald-600" />
                                <span>Rig Ditugaskan: {rig?.name}</span>
                            </div>
                        )}

                        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1.5 shadow-2xs">
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
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    MATRIKS TABLE CSMS - GABUNGKAN SLOT UPLOAD PER-RIG
                ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                            <p className="text-xs font-bold text-slate-400">To: All Rig OPS BMS</p>
                            <h3 className="text-sm sm:text-base font-black text-slate-800">
                                Matriks Dokumen Rekaman HSE - {rig?.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Kategori bertanda <em>1x/Bln/Rig</em> telah digabung tempat upload-nya untuk seluruh crew, sedangkan berkas <em>per-crew</em> tetap tersedia terpisah per Crew A, B, dan C.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            {/* [ADMIN ONLY] Tombol tambah dokumen baru */}
                            {isAdmin && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setIsDownloadModalOpen(true)}
                                        className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-lg text-xs transition-all border border-emerald-300 shadow-2xs cursor-pointer"
                                        title={`Unduh Paket Seluruh Dokumen ${rig?.name} (ZIP)`}
                                    >
                                        <Download size={13} className="text-emerald-700" />
                                        <span>Unduh Semua Dokumen (ZIP)</span>
                                    </button>

                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all shadow-sm cursor-pointer"
                                    >
                                        <Plus size={13} />
                                        Tambah Dokumen
                                    </button>
                                </>
                            )}
                            <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Periode: {selectedMonth} {selectedYear}
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                                    <th className="p-3.5 border-r border-slate-200 w-12 text-center">No</th>
                                    <th className="p-3.5 border-r border-slate-200 min-w-[220px]">Dokumen Rekaman</th>
                                    <th className="p-3.5 border-r border-slate-200 w-28">Durasi</th>
                                    <th className="p-3.5 border-r border-slate-200 text-center w-36 bg-slate-100/60">Crew A</th>
                                    <th className="p-3.5 border-r border-slate-200 text-center w-36 bg-slate-100/60">Crew B</th>
                                    <th className="p-3.5 border-r border-slate-200 text-center w-36 bg-slate-100/60">Crew C</th>
                                    <th className="p-3.5 min-w-[180px]">Keterangan</th>
                                    {isAdmin && (
                                        <th className="p-3.5 border-l border-slate-200 text-center w-16">Aksi</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {(categories || []).map((cat) => {
                                    const recordCrewA = matrix?.[cat.id]?.['Crew A'];
                                    const recordCrewB = matrix?.[cat.id]?.['Crew B'];
                                    const recordCrewC = matrix?.[cat.id]?.['Crew C'];
                                    const recordRig   = matrix?.[cat.id]?.['Rig'];

                                    const isCrewScope = cat.scope === 'crew';
                                    const activeNotes = recordRig?.approval_notes || recordCrewA?.approval_notes || recordCrewB?.approval_notes || recordCrewC?.approval_notes;
                                    const isRenaming  = isAdmin && renamingCatId === cat.id;

                                    return (
                                        <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                                            {/* Nomor */}
                                            <td className="p-3 text-center font-bold border-r border-slate-100 text-slate-500">
                                                {cat.no}
                                            </td>

                                            {/* Nama Dokumen — inline rename untuk Admin, read-only untuk User */}
                                            <td className="p-3 font-bold text-slate-800 border-r border-slate-100">
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
                                                    {isCrewScope ? '3 Crew (A, B, C)' : '1 Unit Seluruh Rig'}
                                                </span>
                                            </td>


                                            {/* Durasi */}
                                            <td className="p-3 border-r border-slate-100 font-medium text-slate-500 whitespace-pre-line text-[11px]">
                                                {cat.durasi}
                                            </td>

                                            {/* LOGIKA UPLOAD: JIKA CREW SCOPE, TAMPILKAN 3 KOLOM TERPISAH.
                                                JIKA RIG SCOPE, GABUNGKAN (COLSPAN=3) MENJADI 1 TEMPAT UPLOAD TERPADU! */}
                                            {isCrewScope ? (
                                                <>
                                                    {/* Crew A */}
                                                    <td className="p-2 border-r border-slate-100 text-center align-middle">
                                                        <UploadCell
                                                            category={cat}
                                                            crew="Crew A"
                                                            record={recordCrewA}
                                                            onUpload={() => openUploadModal(cat, "Crew A", recordCrewA)}
                                                            onDelete={handleDeleteRecord}
                                                            onDropFile={(files) => handleDropToReview(cat, "Crew A", files, recordCrewA)}
                                                            onViewAttachments={() => setViewAttachmentsRecord(recordCrewA)}
                                                            isUploading={uploadingKey === `${cat.id}-Crew A`}
                                                            isGlobalDragging={isGlobalDragging}
                                                            onPreview={(idx) => openDocumentViewer(recordCrewA, cat, "Crew A", idx)}
                                                        />
                                                    </td>

                                                    {/* Crew B */}
                                                    <td className="p-2 border-r border-slate-100 text-center align-middle">
                                                        <UploadCell
                                                            category={cat}
                                                            crew="Crew B"
                                                            record={recordCrewB}
                                                            onUpload={() => openUploadModal(cat, "Crew B", recordCrewB)}
                                                            onDelete={handleDeleteRecord}
                                                            onDropFile={(files) => handleDropToReview(cat, "Crew B", files, recordCrewB)}
                                                            onViewAttachments={() => setViewAttachmentsRecord(recordCrewB)}
                                                            isUploading={uploadingKey === `${cat.id}-Crew B`}
                                                            isGlobalDragging={isGlobalDragging}
                                                            onPreview={(idx) => openDocumentViewer(recordCrewB, cat, "Crew B", idx)}
                                                        />
                                                    </td>

                                                    {/* Crew C */}
                                                    <td className="p-2 border-r border-slate-100 text-center align-middle">
                                                        <UploadCell
                                                            category={cat}
                                                            crew="Crew C"
                                                            record={recordCrewC}
                                                            onUpload={() => openUploadModal(cat, "Crew C", recordCrewC)}
                                                            onDelete={handleDeleteRecord}
                                                            onDropFile={(files) => handleDropToReview(cat, "Crew C", files, recordCrewC)}
                                                            onViewAttachments={() => setViewAttachmentsRecord(recordCrewC)}
                                                            isUploading={uploadingKey === `${cat.id}-Crew C`}
                                                            isGlobalDragging={isGlobalDragging}
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
                                                        onPreview={(idx) => openDocumentViewer(recordRig, cat, "Rig", idx)}
                                                    />
                                                </td>
                                            )}

                                            {/* Keterangan & Catatan Feedback */}
                                            <td className="p-3 font-medium text-slate-500 text-[11px] leading-relaxed">
                                                {activeNotes ? (
                                                    <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
                                                        Catatan: {activeNotes}
                                                    </div>
                                                ) : (
                                                    <span>{recordRig?.keterangan || recordCrewA?.keterangan || cat.keterangan_default || "-"}</span>
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
                MODAL UPLOAD DOKUMEN
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

                        {/* Catatan Evaluasi Admin HSE jika ada */}
                        {uploadTarget.currentRecord?.approval_notes && (
                            <div className="p-3 mb-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                                <strong className="font-bold flex items-center gap-1 text-amber-800 mb-0.5">
                                    <AlertCircle size={14} />
                                    <span>Catatan Evaluasi Admin HSE:</span>
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

                                    {/* Catatan / Keterangan Opsional (Kiri) */}
                                    <div>
                                        <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                                            Catatan / Keterangan Dokumen (Opsional)
                                        </label>
                                        <textarea
                                            value={data.keterangan}
                                            onChange={(e) => setData("keterangan", e.target.value)}
                                            disabled={isUploading}
                                            rows="2"
                                            placeholder="Tuliskan catatan singkat jika ada..."
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

            {/* [ADMIN ONLY] Modal Unduh Paket Dokumen Rig (ZIP) */}
            {isAdmin && (
                <RigDownloadModal
                    isOpen={isDownloadModalOpen}
                    onClose={() => setIsDownloadModalOpen(false)}
                    rigs={[rig]}
                    selectedRig={rig}
                    selectedYear={selectedYear}
                    selectedMonth={selectedMonth}
                />
            )}
        </AdminLayout>
    );
}

/**
 * Slot Upload Terpadu untuk Dokumen Per-Rig (Menggabungkan Kolom Crew A, B, C)
 * Mendukung Drag & Drop Langsung pada Tombol Tabel!
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
                    <div className="flex items-center gap-1 shrink-0 ml-3">
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
                                title="Lihat Pratinjau Berkas (In-App)"
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

/**
 * Slot Upload Satuan untuk Dokumen Spesifik Per-Crew (Crew A, Crew B, Crew C)
 * Mendukung Drag & Drop Banyak Berkas Langsung pada Baris Tabel!
 */
function UploadCell({
    category,
    crew,
    record,
    onUpload,
    onDelete,
    onDropFile,
    onViewAttachments,
    isUploading = false,
    isGlobalDragging = false,
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
                title={`Tarik & lepas satu atau beberapa berkas (maks 5MB) ke sini atau klik (${crew})`}
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

                    <div className="flex items-center gap-1 mt-0.5">
                        {hasMultiple ? (
                            <button
                                type="button"
                                onClick={() => (onPreview ? onPreview(0) : onViewAttachments())}
                                className="p-1 bg-white text-emerald-700 border border-slate-200 rounded hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer"
                                title="Lihat Semua Lampiran Berkas (In-App)"
                            >
                                <Eye size={12} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => (onPreview ? onPreview(0) : null)}
                                className="p-1 bg-white text-emerald-700 border border-slate-200 rounded hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer"
                                title="Lihat Pratinjau Berkas (In-App)"
                            >
                                <Eye size={12} />
                            </button>
                        )}

                        <button
                            onClick={onUpload}
                            className="p-1 bg-white text-blue-700 border border-slate-200 rounded hover:bg-blue-50 transition-colors shadow-2xs cursor-pointer"
                            title={isRevision ? "Unggah Dokumen Revisi" : "Ganti Berkas"}
                        >
                            <Upload size={12} />
                        </button>

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
