import React, { useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    ArrowLeft,
    Calendar,
    Upload,
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    Eye,
    Trash2,
    HardDrive,
    X,
    Shield,
    Download,
    ChevronDown,
} from "lucide-react";

export default function CsmsRigDetail({ rig, categories, records, matrix, filter, allRigs }) {
    const [selectedMonth, setSelectedMonth] = useState(filter?.bulan || "Januari");
    const [selectedYear, setSelectedYear] = useState(filter?.tahun || 2025);
    const [uploadTarget, setUploadTarget] = useState(null); // { catId, catNo, catName, crew }

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const years = [2024, 2025, 2026];

    const { data, setData, post, processing, reset, errors } = useForm({
        csms_rig_id: rig?.id || "",
        csms_document_category_id: "",
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
            `/csms/rig/${rig.id}`,
            { bulan: month, tahun: year },
            { preserveState: true, replace: true }
        );
    };

    const handleRigSwitch = (newRigId) => {
        router.get(
            `/csms/rig/${newRigId}`,
            { bulan: selectedMonth, tahun: selectedYear }
        );
    };

    const openUploadModal = (category, crew) => {
        const existingRecord = matrix?.[category.id]?.[crew];
        setUploadTarget({
            catId: category.id,
            catNo: category.no,
            catName: category.nama_dokumen,
            crew: crew,
        });

        setData({
            csms_rig_id: rig.id,
            csms_document_category_id: category.id,
            periode_bulan: selectedMonth,
            periode_tahun: selectedYear,
            crew: crew,
            status: existingRecord?.status || "Lengkap",
            keterangan: existingRecord?.keterangan || category.keterangan_default || "",
            file: null,
        });
    };

    const handleUploadSubmit = (e) => {
        e.preventDefault();
        post('/csms/upload', {
            onSuccess: () => {
                setUploadTarget(null);
                reset();
            },
        });
    };

    const handleDeleteRecord = (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) {
            router.delete(`/csms/record/${id}`);
        }
    };

    return (
        <AdminLayout>
            <Head title={`CSMS Record - ${rig?.name || 'RIG'}`} />

            <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
                {/* Header Back & Title */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/csms"
                            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition text-slate-600"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                                <Shield size={14} />
                                <span>Penyimpanan Data Rekaman CSMS</span>
                            </div>
                            <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                                <span>{rig?.name}</span>
                                <span className="text-xs font-black bg-emerald-900 text-yellow-300 px-2.5 py-1 rounded-md">
                                    {rig?.code}
                                </span>
                            </h1>
                        </div>
                    </div>

                    {/* Rig Switcher */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Pilih Rig:</span>
                        <select
                            value={rig?.id || ''}
                            onChange={(e) => handleRigSwitch(e.target.value)}
                            className="border border-emerald-600 bg-emerald-900 text-white font-bold rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                        >
                            {(allRigs || []).map((r) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Info Card & Period Filter */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-500">To: All Rig OPS BMS</p>
                            <p className="text-sm font-extrabold text-slate-800">
                                Matriks Dokumen Rekaman HSE - {rig?.name}
                            </p>
                            <p className="text-xs text-slate-500 italic">
                                Mohon bantuan untuk melengkapi 21 dokumen berikut sesuai durasi & crew.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            <Calendar size={18} className="text-emerald-700" />
                            <span className="text-xs font-bold text-slate-700">Periode:</span>
                            <select
                                value={selectedMonth}
                                onChange={(e) => handleFilterChange(e.target.value, selectedYear)}
                                className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-white focus:outline-none"
                            >
                                {months.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => handleFilterChange(selectedMonth, e.target.value)}
                                className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-white focus:outline-none"
                            >
                                {years.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Table Matrix */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-emerald-950 text-white font-extrabold uppercase text-[11px] tracking-wider border-b border-emerald-900">
                                    <th className="p-3 border-r border-emerald-900 w-12 text-center">No</th>
                                    <th className="p-3 border-r border-emerald-900 min-w-[220px]">Dokumen Rekaman</th>
                                    <th className="p-3 border-r border-emerald-900 w-32">Durasi</th>
                                    <th className="p-3 border-r border-emerald-900 text-center w-36 bg-emerald-900/80">Crew A</th>
                                    <th className="p-3 border-r border-emerald-900 text-center w-36 bg-emerald-900/80">Crew B</th>
                                    <th className="p-3 border-r border-emerald-900 text-center w-36 bg-emerald-900/80">Crew C</th>
                                    <th className="p-3 min-w-[180px]">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-slate-700 bg-white">
                                {(categories || []).map((cat, idx) => {
                                    const recordCrewA = matrix?.[cat.id]?.['Crew A'];
                                    const recordCrewB = matrix?.[cat.id]?.['Crew B'];
                                    const recordCrewC = matrix?.[cat.id]?.['Crew C'];
                                    const recordRig   = matrix?.[cat.id]?.['Rig'];

                                    const isCrewScope = cat.scope === 'crew';

                                    return (
                                        <tr key={cat.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"}>
                                            <td className="p-3 text-center font-bold border-r border-slate-200 text-slate-600">
                                                {cat.no}
                                            </td>
                                            <td className="p-3 font-semibold text-slate-800 border-r border-slate-200">
                                                {cat.nama_dokumen}
                                            </td>
                                            <td className="p-3 border-r border-slate-200 font-medium text-slate-600 whitespace-pre-line">
                                                {cat.durasi}
                                            </td>

                                            {/* Crew A or Rig Upload Cell */}
                                            <td className="p-2 border-r border-slate-200 text-center align-middle">
                                                <UploadCell
                                                    category={cat}
                                                    crew={isCrewScope ? "Crew A" : "Rig"}
                                                    record={isCrewScope ? recordCrewA : recordRig}
                                                    onUpload={() => openUploadModal(cat, isCrewScope ? "Crew A" : "Rig")}
                                                    onDelete={handleDeleteRecord}
                                                />
                                            </td>

                                            {/* Crew B Cell */}
                                            <td className="p-2 border-r border-slate-200 text-center align-middle">
                                                {isCrewScope ? (
                                                    <UploadCell
                                                        category={cat}
                                                        crew="Crew B"
                                                        record={recordCrewB}
                                                        onUpload={() => openUploadModal(cat, "Crew B")}
                                                        onDelete={handleDeleteRecord}
                                                    />
                                                ) : (
                                                    <span className="text-slate-300 italic text-[11px]">- (Per Rig) -</span>
                                                )}
                                            </td>

                                            {/* Crew C Cell */}
                                            <td className="p-2 border-r border-slate-200 text-center align-middle">
                                                {isCrewScope ? (
                                                    <UploadCell
                                                        category={cat}
                                                        crew="Crew C"
                                                        record={recordCrewC}
                                                        onUpload={() => openUploadModal(cat, "Crew C")}
                                                        onDelete={handleDeleteRecord}
                                                    />
                                                ) : (
                                                    <span className="text-slate-300 italic text-[11px]">- (Per Rig) -</span>
                                                )}
                                            </td>

                                            {/* Keterangan Cell */}
                                            <td className="p-3 font-medium text-slate-600 text-xs">
                                                {recordRig?.keterangan || recordCrewA?.keterangan || cat.keterangan_default || "-"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Note */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-xs space-y-1">
                        <p className="font-bold">Catatan Penting CSMS:</p>
                        <p>- Seluruh dokumen HSE agar dipersiapkan & diperbarui setiap bulan.</p>
                        <p>- Jika ada yang kurang jelas silahkan menghubungi HSE Coordinator Masing - Masing / ISO (0852 6393 9902).</p>
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            {uploadTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <div>
                                <span className="text-xs font-bold text-emerald-700 uppercase">RIG BMS - {rig?.name}</span>
                                <h3 className="text-base font-extrabold text-slate-800">
                                    Upload: {uploadTarget.catNo}. {uploadTarget.catName} ({uploadTarget.crew})
                                </h3>
                            </div>
                            <button onClick={() => setUploadTarget(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData("status", e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    >
                                        <option value="Lengkap">Lengkap</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Tidak Ada">Tidak Ada</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Crew / Scope</label>
                                    <input
                                        type="text"
                                        disabled
                                        value={uploadTarget.crew}
                                        className="w-full border border-slate-200 rounded-lg p-2 text-xs font-semibold bg-slate-100 text-slate-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pilih File (PDF, Image, Doc, Excel)</label>
                                <input
                                    type="file"
                                    onChange={(e) => setData("file", e.target.files[0])}
                                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-slate-50 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Keterangan / Notes</label>
                                <textarea
                                    value={data.keterangan}
                                    onChange={(e) => setData("keterangan", e.target.value)}
                                    rows="2"
                                    placeholder="Tuliskan keterangan bila ada..."
                                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setUploadTarget(null)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 text-xs font-bold text-emerald-950 bg-yellow-400 hover:bg-yellow-300 rounded-lg shadow-md transition"
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

function UploadCell({ category, crew, record, onUpload, onDelete }) {
    if (!record) {
        return (
            <button
                onClick={onUpload}
                className="w-full py-1.5 px-2 bg-slate-100 hover:bg-emerald-50 border border-dashed border-slate-300 hover:border-emerald-500 text-slate-500 hover:text-emerald-800 rounded-lg font-semibold text-[11px] transition flex items-center justify-center gap-1 group"
            >
                <Upload size={12} className="group-hover:scale-110 transition" />
                <span>Upload</span>
            </button>
        );
    }

    return (
        <div className="flex flex-col items-center gap-1 bg-emerald-50/70 p-1.5 rounded-lg border border-emerald-200">
            <div className="flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
                <span className="font-bold text-emerald-900 text-[11px]">{record.status}</span>
            </div>

            {record.file_path && (
                <div className="flex items-center gap-1 mt-0.5">
                    <a
                        href={`/storage/${record.file_path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 bg-white text-emerald-700 hover:text-emerald-900 border border-emerald-300 rounded shadow-xs hover:bg-emerald-100 transition"
                        title="Lihat File"
                    >
                        <Eye size={12} />
                    </a>
                    <button
                        onClick={onUpload}
                        className="p-1 bg-white text-blue-600 border border-blue-200 rounded shadow-xs hover:bg-blue-50 transition"
                        title="Ganti File"
                    >
                        <Upload size={12} />
                    </button>
                    <button
                        onClick={() => onDelete(record.id)}
                        className="p-1 bg-white text-red-600 border border-red-200 rounded shadow-xs hover:bg-red-50 transition"
                        title="Hapus"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            )}
        </div>
    );
}
