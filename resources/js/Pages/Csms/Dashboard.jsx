import React, { useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    HardDrive,
    Search,
    Filter,
    Upload,
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronRight,
    Plus,
    X,
    Eye,
    Trash2,
    Shield,
    Calendar,
    Download,
} from "lucide-react";

export default function CsmsDashboard({ rigs, categories, records, rigStats, filter, summary }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(filter?.bulan || "Januari");
    const [selectedYear, setSelectedYear] = useState(filter?.tahun || 2025);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const years = [2024, 2025, 2026];

    const { data, setData, post, processing, reset, errors } = useForm({
        csms_rig_id: rigs?.[0]?.id || "",
        csms_document_category_id: categories?.[0]?.id || "",
        periode_bulan: selectedMonth,
        periode_tahun: selectedYear,
        crew: "Crew A",
        status: "Lengkap",
        keterangan: "",
        file: null,
    });

    const handleFilterChange = (month, year) => {
        setSelectedMonth(month);
        setSelectedYear(year);
        router.get(
            '/csms',
            { bulan: month, tahun: year },
            { preserveState: true, replace: true }
        );
    };

    const handleUploadSubmit = (e) => {
        e.preventDefault();
        post('/csms/upload', {
            onSuccess: () => {
                setIsUploadModalOpen(false);
                reset();
            },
        });
    };

    const handleDeleteRecord = (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus dokumen rekaman ini?")) {
            router.delete(`/csms/record/${id}`);
        }
    };

    const filteredRigStats = (rigStats || []).filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <Head title="CSMS Data Storage - 20 RIG BMS" />

            <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-10 translate-x-8 -translate-y-8">
                        <HardDrive size={240} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-emerald-300 font-medium text-sm mb-1">
                                <Shield size={16} />
                                <span>SYSTEM SAFETY MANAGEMENT CONTRACTOR (CSMS)</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                                Penyimpanan Data Rekaman CSMS - RIG OPS BMS
                            </h1>
                            <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
                                Monitoring dan manajemen 21 Dokumen & Rekaman HSE untuk 20 RIG BMS (01, 02, 03, 03A, 05, 06, 07, 08, 09, 10, 11, 15, 16, 17 - 23).
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-bold px-4 py-2.5 rounded-xl shadow-lg hover:shadow-yellow-400/20 transition flex items-center gap-2 text-sm"
                            >
                                <Plus size={18} />
                                <span>Upload Dokumen CSMS</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                            <Calendar size={18} className="text-emerald-700" />
                            <span>Periode:</span>
                        </div>
                        <select
                            value={selectedMonth}
                            onChange={(e) => handleFilterChange(e.target.value, selectedYear)}
                            className="border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                            {months.map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => handleFilterChange(selectedMonth, e.target.value)}
                            className="border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                            {years.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative flex-1 max-w-md">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari Rig (misal: RIG BMS 01, 03A, 17)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Stat Cards Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl">
                            20
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Kategori RIG</p>
                            <h3 className="text-xl font-extrabold text-slate-800">20 RIG BMS</h3>
                            <p className="text-xs text-slate-500 mt-0.5">BMS 01 - BMS 23</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xl">
                            21
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dokumen HSE / Rig</p>
                            <h3 className="text-xl font-extrabold text-slate-800">21 Kategori</h3>
                            <p className="text-xs text-slate-500 mt-0.5">APAR, Tandu, SCBA, JSA, dll</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dokumen Lengkap</p>
                            <h3 className="text-xl font-extrabold text-slate-800">{summary?.lengkap_count || 0} File</h3>
                            <p className="text-xs text-emerald-600 font-medium mt-0.5">Terverifikasi</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dokumen Pending</p>
                            <h3 className="text-xl font-extrabold text-slate-800">{summary?.pending_count || 0} File</h3>
                            <p className="text-xs text-amber-600 font-medium mt-0.5">Membutuhkan Upload</p>
                        </div>
                    </div>
                </div>

                {/* 20 RIG Grid Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <HardDrive size={20} className="text-emerald-700" />
                            <span>Daftar 20 Kategori RIG BMS</span>
                        </h2>
                        <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                            Periode: {selectedMonth} {selectedYear}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredRigStats.map((rig) => (
                            <Link
                                key={rig.id}
                                href={`/csms/rig/${rig.id}?bulan=${selectedMonth}&tahun=${selectedYear}`}
                                className="bg-white rounded-xl border border-slate-200 hover:border-emerald-500 p-4 shadow-sm hover:shadow-md transition group relative flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-emerald-900 text-yellow-300">
                                            {rig.code}
                                        </span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                            rig.percentage >= 100
                                                ? "bg-green-100 text-green-800 border border-green-200"
                                                : rig.percentage > 50
                                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                                : "bg-amber-100 text-amber-800 border border-amber-200"
                                        }`}>
                                            {rig.percentage}%
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-base group-hover:text-emerald-700 transition">
                                        {rig.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {rig.completed_count} dari {rig.total_required} dokumen ter-upload
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <div className="w-full bg-slate-100 rounded-full h-2 mr-3 overflow-hidden">
                                        <div
                                            className={`h-2 rounded-full transition-all ${
                                                rig.percentage >= 100 ? "bg-green-500" : "bg-emerald-600"
                                            }`}
                                            style={{ width: `${Math.min(rig.percentage, 100)}%` }}
                                        ></div>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition flex-shrink-0" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Document Record List Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                            <FileText size={18} className="text-emerald-700" />
                            <span>Berkas File Rekaman Dokumen CSMS ({records?.length || 0} File)</span>
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-700">
                                <tr>
                                    <th className="p-3 border-b">RIG</th>
                                    <th className="p-3 border-b">No</th>
                                    <th className="p-3 border-b">Dokumen Rekaman</th>
                                    <th className="p-3 border-b">Crew / Scope</th>
                                    <th className="p-3 border-b">Nama File</th>
                                    <th className="p-3 border-b">Status</th>
                                    <th className="p-3 border-b">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(!records || records.length === 0) ? (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-slate-400">
                                            Belum ada dokumen rekaman CSMS yang di-upload untuk periode {selectedMonth} {selectedYear}.
                                        </td>
                                    </tr>
                                ) : (
                                    records.map((rec) => (
                                        <tr key={rec.id} className="hover:bg-slate-50 transition">
                                            <td className="p-3 font-bold text-slate-800">{rec.rig?.name || '-'}</td>
                                            <td className="p-3 font-semibold text-slate-500">{rec.category?.no}</td>
                                            <td className="p-3 font-medium text-slate-800">{rec.category?.nama_dokumen}</td>
                                            <td className="p-3">
                                                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-xs rounded font-semibold">
                                                    {rec.crew || 'Rig'}
                                                </span>
                                            </td>
                                            <td className="p-3 font-mono text-xs text-blue-600 truncate max-w-xs">
                                                {rec.file_name ? (
                                                    <a href={`/storage/${rec.file_path}`} target="_blank" rel="noreferrer" className="underline hover:text-blue-800">
                                                        {rec.file_name}
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400 italic">Tanpa File</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                                                    rec.status === 'Lengkap'
                                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                                                }`}>
                                                    {rec.status}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    {rec.file_path && (
                                                        <a
                                                            href={`/storage/${rec.file_path}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                                                            title="Lihat Dokumen"
                                                        >
                                                            <Eye size={16} />
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteRecord(rec.id)}
                                                        className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                                                        title="Hapus Dokumen"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Upload size={20} className="text-emerald-700" />
                                <span>Upload Dokumen Rekaman CSMS</span>
                            </h3>
                            <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pilih RIG</label>
                                <select
                                    value={data.csms_rig_id}
                                    onChange={(e) => setData("csms_rig_id", e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                >
                                    {(rigs || []).map((rig) => (
                                        <option key={rig.id} value={rig.id}>{rig.name} ({rig.code})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dokumen Rekaman HSE (21 Kategori)</label>
                                <select
                                    value={data.csms_document_category_id}
                                    onChange={(e) => setData("csms_document_category_id", e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                >
                                    {(categories || []).map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.no}. {cat.nama_dokumen} ({cat.durasi})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Crew / Scope</label>
                                    <select
                                        value={data.crew}
                                        onChange={(e) => setData("crew", e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    >
                                        <option value="Crew A">Crew A</option>
                                        <option value="Crew B">Crew B</option>
                                        <option value="Crew C">Crew C</option>
                                        <option value="Rig">All / Rig</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status Dokumen</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData("status", e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-slate-50 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    >
                                        <option value="Lengkap">Lengkap</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Tidak Ada">Tidak Ada</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Upload File (PDF / Image / Excel / Doc)</label>
                                <input
                                    type="file"
                                    onChange={(e) => setData("file", e.target.files[0])}
                                    className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-slate-50 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Keterangan / Notes</label>
                                <textarea
                                    value={data.keterangan}
                                    onChange={(e) => setData("keterangan", e.target.value)}
                                    rows="2"
                                    placeholder="Catatan tambahan (opsional)..."
                                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 text-sm font-bold text-emerald-950 bg-yellow-400 hover:bg-yellow-300 rounded-lg shadow-md transition"
                                >
                                    {processing ? "Menyimpan..." : "Simpan Dokumen"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
