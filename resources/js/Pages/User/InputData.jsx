import UserSidebar from "../../Components/UserSidebar";
import { useMemo, useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import {
    ClipboardList,
    CheckCircle2,
    RotateCcw,
    ShieldAlert,
    TrendingUp,
    Info,
    Calendar,
    FileSpreadsheet,
    User,
} from "lucide-react";

const MONTHS = [
    { value: "01", label: "Januari" },
    { value: "02", label: "Februari" },
    { value: "03", label: "Maret" },
    { value: "04", label: "April" },
    { value: "05", label: "Mei" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "Agustus" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, i) => String(2024 + i));

const LAGGING_INDICATORS = [
    "FATALITY",
    "SERIOUS LOST TIME INJURY (>21 LOST DAY)",
    "RESTRICTED WORK CASE",
    "MEDICAL TREATMENT CASE (MTC)",
    "TOTAL RECORDABLE INJURY",
    "MOTOR VEHICLE CRASH (MVC)",
    "TUMPAHAN / OIL SPILL",
    "FIRE",
    "PROPERTY DAMAGE",
    "SECURITY CASE",
    "ILLNESS FATALITY",
    "REPORTABLE CASE",
];

const LEADING_INDICATORS = [
    "OBSERVASI PERILAKU (PEKA) *)",
    "IDENTIFIKASI BAHAYA (HAZID/ 5 MNT RISK ASSESSMENT)",
    "SWA REPORT",
    "INSPEKSI SAFETY EQUIPMENT & APD *) (Eye wash, Shower, Fire, P3K, Tandu, FBH, SCBA)",
    "EKSTERNAL INSPEKSI LR COLOR CODE",
    "INSPEKSI BENDA JATUH / DROPS **)",
    "INTERNAL INSPEKSI / V&V OLEH TEAM",
    "INSPEKSI / AUDIT SMK3L: PERALATAN, DATA PERSONAL MILIK SUBKONTRAKTOR",
    "SPOT CHECK KENDARAAN *) **)",
    "AUDIT INTERNAL & EKSTERNAL (Sistem manajemen *)",
    "MONITORING KEPATUHAN PENGEMUDI (Mencakup speed / IVMS report / fatigue *)",
    "Laporan Inspeksi Kendaraan (PTI)",
    "SPESIFIK MCU RANDOM : (NAPZA & MIRAS TEST *)",
    "PRA MCU (MCU TAHUNAN BAGI YANG KONSULTASI TAHUN SEBELUMNYA)",
    "TOP MANAGEMENT VISIT / MWT (Level General Manager / Dir. Operasi / Direktur Utama ***)",
    "MANAGEMENT VISIT / MWT (Level Coord level s/d Manager *)",
    "RAPAT RUTIN KESELAMATAN (TGM PER SHIFT/PJM)",
    "PRE HITCH MEETING",
    "RAPAT/FORUM BERSAMA LEADER BMS DAN PHR.",
    "SAFETY TALK MONTHLY MEETING : SUPPORT YARD & RIG",
    "LEADERSHIP FORUM ***)",
    "KAMPANYE KESELAMATAN (PIN/POSTER/STIKER/ SPANDUK) *)",
    "REVIEW, TINJAUAN MANAJEMEN *)",
    "HYGIENE MONITORING : NOISE & LUX MONITORING **)",
    "HYGIENE MONITORING : Mess, Catering, DAM*)",
    "INSPEKSI \"HOUSEKEEPING RIG\"",
    "PENGHARGAAN: KONTES \"HOUSEKEEPING RIG\" *)",
    "PELAPORAN LINGKUNGAN KE DINAS LH",
    "PENGHARGAAN: RIG OF THE MONTH INTERNAL / EXTERNAL **)",
    "PENGHARGAAN THE BEST BBS / PEKA",
    "PENGHARGAAN THE BEST DRIVER",
    "PENGHARGAAN: PENCAPAIAN KERJA SELAMAT TAHUNAN",
    "PENGHARGAAN HES REFRESHING",
    "\"ON SITE TRAINING\" DI LOKASI *)",
    "ERP DRILL RIG : H2S&SCBA / FIRE / MEDIVAC/ PENYELAMATAN KERJA DI KETINGGIAN / TUMPAHAN. **)",
    "ERP DRILL YARD : FIRE / MEDIVAC / TUMPAHAN *)",
];

const initialMo = String(new Date().getMonth() + 1).padStart(2, "0");
const initialYr = String(CURRENT_YEAR);

const INITIAL_FORM = {
    date: `${initialYr}-${initialMo}-01`,
    contractNo: "",
    rigNo: "",
    locationDistrict: "",
    period: initialMo,
    year: initialYr,
    submitterName: "",
    submitterEmail: "",

    // =========================
    // MAN HOURS
    // =========================
    manHoursPremisesPlan: 0,
    manHoursNonPremisesPlan: 0,
    manHoursPremisesActual: 0,
    manHoursNonPremisesActual: 0,

    // =========================
    // EXPOSURE
    // =========================
    employees: 0,
    totalVehicles: 0,

    // =========================
    // KILOMETER
    // =========================
    kilometerPremisesPlan: 0,
    kilometerNonPremisesPlan: 0,
    kilometerPremisesActual: 0,
    kilometerNonPremisesActual: 0,

    lagging: {},
    leading: {},
    remarks: "",
};

function createIndicatorValues(names) {
    return names.reduce((result, name) => {
        result[name] = {
            actual: 0,
            plan: 0,
        };
        return result;
    }, {});
}

const DEFAULT_LAGGING = createIndicatorValues(LAGGING_INDICATORS);
const DEFAULT_LEADING = createIndicatorValues(LEADING_INDICATORS);

export default function UserInputData() {
    const { auth } = usePage().props;
    const currentUser = auth?.user;

    const [form, setForm] = useState({
        ...INITIAL_FORM,
        submitterName: currentUser?.name || "",
        submitterEmail: currentUser?.email || "",
        lagging: DEFAULT_LAGGING,
        leading: DEFAULT_LEADING,
    });

    useEffect(() => {
        if (currentUser) {
            setForm((prev) => ({
                ...prev,
                submitterName: prev.submitterName || currentUser.name || "",
                submitterEmail: prev.submitterEmail || currentUser.email || "",
            }));
        }
    }, [currentUser]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const selectedMonthLabel = useMemo(() => {
        const month = MONTHS.find((item) => item.value === form.period);
        return month ? month.label : "Bulan belum dipilih";
    }, [form.period]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((previous) => {
            const updated = {
                ...previous,
                [name]: value,
            };

            if (name === "period") {
                const yr = previous.year || String(CURRENT_YEAR);
                updated.date = `${yr}-${value}-01`;
            } else if (name === "year") {
                const mo = previous.period || "01";
                updated.date = `${value}-${mo}-01`;
            } else if (name === "date" && value) {
                const parts = value.split("-");
                if (parts.length >= 2) {
                    updated.year = parts[0];
                    updated.period = parts[1];
                }
            }

            return updated;
        });
    };

    const handleIndicatorChange = (type, indicator, field, value) => {
        setForm((previous) => ({
            ...previous,
            [type]: {
                ...previous[type],
                [indicator]: {
                    ...previous[type][indicator],
                    [field]: value,
                },
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitSuccess(false);

        try {
            const payload = {
                date: form.date,
                contractNo: form.contractNo,
                rigNo: form.rigNo,
                locationDistrict: form.locationDistrict,
                period: form.period,
                submitterName: form.submitterName,
                submitterEmail: form.submitterEmail,

                manHoursPremisesPlan: Number(form.manHoursPremisesPlan) || 0,
                manHoursNonPremisesPlan: Number(form.manHoursNonPremisesPlan) || 0,
                manHoursPremisesActual: Number(form.manHoursPremisesActual) || 0,
                manHoursNonPremisesActual: Number(form.manHoursNonPremisesActual) || 0,

                totalEmployees: Number(form.employees) || 0,
                totalVehicles: Number(form.totalVehicles) || 0,

                kilometerPremisesPlan: Number(form.kilometerPremisesPlan) || 0,
                kilometerNonPremisesPlan: Number(form.kilometerNonPremisesPlan) || 0,
                kilometerPremisesActual: Number(form.kilometerPremisesActual) || 0,
                kilometerNonPremisesActual: Number(form.kilometerNonPremisesActual) || 0,

                lagging: Object.entries(form.lagging).map(
                    ([name, values], index) => ({
                        name: name,
                        indicator_name: name,
                        indicator_no: index + 1,
                        plan: Number(values.plan) || 0,
                        actual: Number(values.actual) || 0,
                    }),
                ),

                leading: Object.entries(form.leading).map(
                    ([name, values], index) => ({
                        name: name,
                        indicator_name: name,
                        indicator_no: index + 1,
                        plan: Number(values.plan) || 0,
                        actual: Number(values.actual) || 0,
                    }),
                ),

                remarks: form.remarks,
            };

            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");

            const response = await fetch("/hse-report", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": csrfToken || "",
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "same-origin",
                body: JSON.stringify(payload),
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                let errorMsg = (result && result.message) ? result.message : "Data HSE gagal disimpan. Periksa kembali form input Anda.";
                if (result && result.errors) {
                    const firstError = Object.values(result.errors)[0];
                    if (firstError && firstError.length > 0) {
                        errorMsg = firstError[0];
                    }
                }
                alert(errorMsg);
                setIsSubmitting(false);
                return;
            }

            setSubmitSuccess(true);
            alert(`Data HSE periode ${selectedMonthLabel} berhasil dikirim! Status saat ini: PENDING (Menunggu Persetujuan / Approval dari Admin via Email atau Menu Approval).`);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
            console.error("ERROR SUBMIT HSE:", error);
            alert("Terjadi kendala saat mengirim data HSE: " + (error?.message || "Silakan periksa koneksi."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        if (window.confirm("Apakah Anda yakin ingin mengosongkan seluruh isian formulir?")) {
            setForm({
                ...INITIAL_FORM,
                lagging: createIndicatorValues(LAGGING_INDICATORS),
                leading: createIndicatorValues(LEADING_INDICATORS),
            });
            setSubmitSuccess(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f8fafc",
                fontFamily:
                    "'Instrument Sans', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
                color: "#1e293b",
            }}
        >
            <UserSidebar />

            <main
                style={{
                    marginLeft: "var(--admin-sidebar-width, 215px)",
                    width: "calc(100% - var(--admin-sidebar-width, 215px))",
                    transition:
                        "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    minHeight: "100vh",
                }}
            >
                {/* =====================================================
                    TOPBAR
                ===================================================== */}
                <header
                    style={{
                        height: "64px",
                        backgroundColor: "#ffffff",
                        borderBottom: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 32px",
                        boxSizing: "border-box",
                        position: "sticky",
                        top: 0,
                        zIndex: 90,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                            style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                backgroundColor: "#004d32",
                                border: "1px solid #efff00",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#efff00",
                                boxShadow: "0 0 8px rgba(239, 255, 0, 0.25)",
                            }}
                        >
                            <ClipboardList size={18} strokeWidth={2.5} />
                        </div>
                        <span
                            style={{
                                fontSize: "16px",
                                fontWeight: "800",
                                color: "#004d32",
                                letterSpacing: "-0.01em",
                            }}
                        >
                            HSE Field Data Input
                        </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "5px 12px",
                                borderRadius: "20px",
                                backgroundColor: "#ecfdf5",
                                border: "1px solid #a7f3d0",
                                color: "#004d32",
                                fontSize: "11.5px",
                                fontWeight: "700",
                            }}
                        >
                            <span
                                style={{
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    backgroundColor: "#10b981",
                                    boxShadow: "0 0 6px #10b981",
                                }}
                            />
                            Field User Mode
                        </div>
                    </div>
                </header>

                {/* =====================================================
                    PAGE BODY
                ===================================================== */}
                <div style={{ padding: "28px 32px 60px", maxWidth: "1400px", margin: "0 auto" }}>
                    {/* HERO BANNER */}
                    <div
                        style={{
                            backgroundColor: "#004d32",
                            borderRadius: "16px",
                            padding: "24px 28px",
                            color: "#ffffff",
                            marginBottom: "24px",
                            position: "relative",
                            overflow: "hidden",
                            boxShadow: "0 10px 25px rgba(0, 77, 50, 0.15)",
                            border: "1px solid rgba(239, 255, 0, 0.3)",
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                top: "-40px",
                                right: "-40px",
                                width: "160px",
                                height: "160px",
                                borderRadius: "50%",
                                backgroundColor: "rgba(239, 255, 0, 0.08)",
                                pointerEvents: "none",
                            }}
                        />

                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                            <span
                                style={{
                                    padding: "3px 8px",
                                    borderRadius: "4px",
                                    backgroundColor: "rgba(239, 255, 0, 0.2)",
                                    border: "1px solid #efff00",
                                    color: "#efff00",
                                    fontSize: "11px",
                                    fontWeight: "800",
                                    letterSpacing: "0.05em",
                                    textTransform: "uppercase",
                                }}
                            >
                                Field Portal
                            </span>
                            <span style={{ color: "#a7f3d0", fontSize: "12px", fontWeight: "600" }}>
                                PT Besmindo HSE Operations
                            </span>
                        </div>

                        <h1 style={{ margin: "0 0 6px", fontSize: "24px", fontWeight: "900", letterSpacing: "-0.02em" }}>
                            Formulir Penginputan Data HSE
                        </h1>
                        <p style={{ margin: "0 0 16px", color: "#d1fae5", fontSize: "13.5px", maxWidth: "720px", lineHeight: "1.5" }}>
                            Silakan input realisasi kinerja keselamatan kerja (HSE) untuk rig dan periode yang bersangkutan. Data yang Anda simpan akan secara otomatis terintegrasi ke seluruh laporan dan matriks KPI per Rig.
                        </p>

                        {/* SUBMITTER IDENTITY CARD */}
                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "12px",
                                backgroundColor: "rgba(0, 0, 0, 0.3)",
                                border: "1.5px solid #efff00",
                                borderRadius: "10px",
                                padding: "8px 16px",
                                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                            }}
                        >
                            <div
                                style={{
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "50%",
                                    backgroundColor: "#efff00",
                                    color: "#004d32",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "900",
                                    fontSize: "13px",
                                    boxShadow: "0 0 10px rgba(239, 255, 0, 0.6)",
                                    flexShrink: 0,
                                }}
                            >
                                {(form.submitterName || currentUser?.name || "P").charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontSize: "11px", color: "#a7f3d0", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                    Petugas Penginput (PIC Terautentikasi):
                                </div>
                                <div style={{ fontSize: "13.5px", fontWeight: "800", color: "#ffffff", marginTop: "1px" }}>
                                    {form.submitterName || currentUser?.name || "User Lapangan"}{" "}
                                    <span style={{ color: "#efff00", fontWeight: "600", fontSize: "12px" }}>
                                        ({form.submitterEmail || currentUser?.email || "user@besmindo.com"})
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SUCCESS NOTIFICATION */}
                    {submitSuccess && (
                        <div
                            style={{
                                backgroundColor: "#ecfdf5",
                                border: "1px solid #34d399",
                                borderRadius: "12px",
                                padding: "14px 18px",
                                marginBottom: "20px",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                color: "#065f46",
                                fontSize: "13.5px",
                                fontWeight: "700",
                            }}
                        >
                            <CheckCircle2 size={20} color="#059669" />
                            <span>Data HSE berhasil disimpan dan disinkronkan ke database sistem!</span>
                        </div>
                    )}



                    {/* FORM CONTAINER */}
                    <form onSubmit={handleSubmit}>
                        {/* 1. IDENTIFICATION */}
                        <Section title="1. Data Identifikasi Rig & Periode">
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                    gap: "16px",
                                }}
                            >
                                <InputField
                                    label="Tanggal Laporan"
                                    name="date"
                                    type="date"
                                    required
                                    value={form.date}
                                    onChange={handleChange}
                                />

                                <InputField
                                    label="Nomor Kontrak"
                                    name="contractNo"
                                    placeholder="Contoh: SPHR01097C"
                                    value={form.contractNo}
                                    onChange={handleChange}
                                    required
                                />

                                <InputField
                                    label="Lokasi / Distrik Wilayah"
                                    name="locationDistrict"
                                    placeholder="Contoh: AREA WK ROKAN - RIAU"
                                    value={form.locationDistrict}
                                    onChange={handleChange}
                                    required
                                />

                                <SelectField
                                    label="Nomor Rig"
                                    name="rigNo"
                                    value={form.rigNo}
                                    onChange={handleChange}
                                    options={[
                                        "BMS#01",
                                        "BMS#02",
                                        "BMS#03",
                                        "BMS#03A",
                                        "BMS#05",
                                        "BMS#06",
                                        "BMS#07",
                                        "BMS#08",
                                        "BMS#09",
                                        "BMS#10",
                                        "BMS#11",
                                        "BMS#15",
                                        "BMS#16",
                                        "BMS#17",
                                        "BMS#18",
                                        "BMS#19",
                                        "BMS#20",
                                        "BMS#21",
                                        "BMS#22",
                                        "BMS#23",
                                    ]}
                                    required
                                />

                                <SelectField
                                    label="Periode Bulan"
                                    name="period"
                                    value={form.period}
                                    onChange={handleChange}
                                    options={MONTHS.map((month) => month.value)}
                                    optionLabels={MONTHS.reduce((result, month) => {
                                        result[month.value] = month.label;
                                        return result;
                                    }, {})}
                                    required
                                />

                                <SelectField
                                    label="Tahun Kinerja"
                                    name="year"
                                    value={form.year}
                                    onChange={handleChange}
                                    options={YEARS}
                                    optionLabels={YEARS.reduce((result, yr) => {
                                        result[yr] = `Tahun ${yr}`;
                                        return result;
                                    }, {})}
                                    required
                                />

                                <InputField
                                    label="Nama Petugas Penginput (PIC)"
                                    name="submitterName"
                                    placeholder="Contoh: Budi Santoso"
                                    value={form.submitterName}
                                    onChange={handleChange}
                                    required
                                />

                                <InputField
                                    label="Email Petugas Penginput (PIC)"
                                    name="submitterEmail"
                                    type="email"
                                    placeholder="Contoh: budi@besmindo.com"
                                    value={form.submitterEmail}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </Section>

                        {/* 2. EXPOSURE METRICS */}
                        <Section title="2. Metrik Exposure & Jam Kerja (Man Hours)">
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                    gap: "16px",
                                }}
                            >
                                <NumberField
                                    label="Man Hours Premises - Plan"
                                    name="manHoursPremisesPlan"
                                    value={form.manHoursPremisesPlan}
                                    onChange={handleChange}
                                    required
                                />

                                <NumberField
                                    label="Man Hours Non-Premises - Plan"
                                    name="manHoursNonPremisesPlan"
                                    value={form.manHoursNonPremisesPlan}
                                    onChange={handleChange}
                                    required
                                />

                                <NumberField
                                    label="Man Hours Premises - Actual"
                                    name="manHoursPremisesActual"
                                    value={form.manHoursPremisesActual}
                                    onChange={handleChange}
                                    required
                                />

                                <NumberField
                                    label="Man Hours Non-Premises - Actual"
                                    name="manHoursNonPremisesActual"
                                    value={form.manHoursNonPremisesActual}
                                    onChange={handleChange}
                                    required
                                />

                                <NumberField
                                    label="Total Karyawan (Employees)"
                                    name="employees"
                                    value={form.employees}
                                    onChange={handleChange}
                                    required
                                />

                                <NumberField
                                    label="Total Kendaraan (Vehicles)"
                                    name="totalVehicles"
                                    value={form.totalVehicles}
                                    onChange={handleChange}
                                    required
                                />

                                <NumberField
                                    label="KM Driven Premises - Plan"
                                    name="kilometerPremisesPlan"
                                    value={form.kilometerPremisesPlan}
                                    onChange={handleChange}
                                    required
                                />

                                <NumberField
                                    label="KM Driven Non-Premises - Plan"
                                    name="kilometerNonPremisesPlan"
                                    value={form.kilometerNonPremisesPlan}
                                    onChange={handleChange}
                                    required
                                />

                                <NumberField
                                    label="KM Driven Premises - Actual"
                                    name="kilometerPremisesActual"
                                    value={form.kilometerPremisesActual}
                                    onChange={handleChange}
                                    required
                                />

                                <NumberField
                                    label="KM Driven Non-Premises - Actual"
                                    name="kilometerNonPremisesActual"
                                    value={form.kilometerNonPremisesActual}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </Section>

                        {/* 3. LAGGING INDICATORS */}
                        <IndicatorSection
                            title="3. ⚠ Lagging Indicators (Insiden Keselamatan)"
                            type="lagging"
                            indicators={LAGGING_INDICATORS}
                            values={form.lagging}
                            onChange={handleIndicatorChange}
                        />

                        {/* 4. LEADING INDICATORS */}
                        <IndicatorSection
                            title="4. ↗ Leading Indicators (Aktivitas Pencegahan)"
                            type="leading"
                            indicators={LEADING_INDICATORS}
                            values={form.leading}
                            onChange={handleIndicatorChange}
                        />

                        {/* 5. DOCUMENTATION / REMARKS */}
                        <Section title="5. Catatan / Executive Remarks">
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "12.5px",
                                    fontWeight: "700",
                                    marginBottom: "8px",
                                    color: "#334155",
                                }}
                            >
                                Catatan Tambahan / Ringkasan Realisasi Lapangan <span style={{ color: "#64748b", fontWeight: "normal" }}>(Opsional)</span>
                            </label>

                            <textarea
                                name="remarks"
                                value={form.remarks}
                                onChange={handleChange}
                                placeholder="Tuliskan catatan penting operasional atau penjelasan kendala lapangan pada periode ini (jika ada)..."
                                rows={4}
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "8px",
                                    padding: "12px",
                                    resize: "vertical",
                                    outline: "none",
                                    fontSize: "13.5px",
                                    color: "#1e293b",
                                }}
                            />
                        </Section>

                        {/* ACTIONS BAR */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center",
                                gap: "12px",
                                marginTop: "24px",
                                paddingBottom: "30px",
                            }}
                        >
                            <button
                                type="button"
                                onClick={handleReset}
                                style={{
                                    height: "42px",
                                    padding: "0 22px",
                                    backgroundColor: "#ffffff",
                                    border: "1px solid #004d32",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    color: "#004d32",
                                    fontWeight: "700",
                                    fontSize: "13px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    transition: "all 0.2s",
                                }}
                            >
                                <RotateCcw size={15} />
                                Reset Form
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    height: "42px",
                                    padding: "0 26px",
                                    backgroundColor: "#004d32",
                                    color: "#efff00",
                                    border: "1px solid #efff00",
                                    borderRadius: "8px",
                                    cursor: isSubmitting ? "not-allowed" : "pointer",
                                    fontWeight: "800",
                                    fontSize: "13.5px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    boxShadow: "0 0 12px rgba(239, 255, 0, 0.25)",
                                    opacity: isSubmitting ? 0.7 : 1,
                                    transition: "all 0.2s",
                                }}
                            >
                                <CheckCircle2 size={16} strokeWidth={2.6} />
                                {isSubmitting ? "Menyimpan Data..." : "Simpan Data HSE Lapangan"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

/* ============================================================
   SUB-COMPONENTS
============================================================ */

function IndicatorSection({ title, type, indicators, values, onChange }) {
    return (
        <Section title={title}>
            <div
                style={{
                    overflowX: "auto",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        minWidth: "850px",
                    }}
                >
                    <thead>
                        <tr
                            style={{
                                backgroundColor: "#004d32",
                                color: "#ffffff",
                                borderBottom: "2px solid #efff00",
                            }}
                        >
                            <th style={tableHeaderStyle}>No</th>
                            <th
                                style={{
                                    ...tableHeaderStyle,
                                    textAlign: "left",
                                    minWidth: "380px",
                                }}
                            >
                                Point yang Diukur / Indikator
                            </th>
                            <th style={tableHeaderStyle}>Target / Plan</th>
                            <th style={tableHeaderStyle}>Realisasi / Actual</th>
                        </tr>
                    </thead>

                    <tbody>
                        {indicators.map((indicator, index) => {
                            const value = values[indicator] || {
                                plan: 0,
                                actual: 0,
                            };

                            return (
                                <tr
                                    key={indicator}
                                    style={{
                                        backgroundColor:
                                            index % 2 === 0
                                                ? "#ffffff"
                                                : "#fcfdfd",
                                        borderBottom: "1px solid #f1f5f9",
                                    }}
                                >
                                    <td
                                        style={{
                                            ...tableCellStyle,
                                            fontWeight: "700",
                                            color: "#004d32",
                                            width: "50px",
                                        }}
                                    >
                                        {index + 1}
                                    </td>

                                    <td
                                        style={{
                                            ...tableCellStyle,
                                            textAlign: "left",
                                            color: "#1e293b",
                                            fontWeight: "500",
                                        }}
                                    >
                                        {indicator}
                                    </td>

                                    <td style={{ ...tableCellStyle, width: "140px" }}>
                                        <NumberTableField
                                            value={value.plan}
                                            onChange={(event) =>
                                                onChange(
                                                    type,
                                                    indicator,
                                                    "plan",
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </td>

                                    <td style={{ ...tableCellStyle, width: "140px" }}>
                                        <NumberTableField
                                            value={value.actual}
                                            onChange={(event) =>
                                                onChange(
                                                    type,
                                                    indicator,
                                                    "actual",
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <p
                style={{
                    margin: "12px 0 0",
                    fontSize: "12px",
                    color: "#64748b",
                }}
            >
                Isi nilai <strong>Plan</strong> sesuai target yang ditentukan, lalu isi <strong>Actual</strong> sesuai realisasi pada bulan berjalan.
            </p>
        </Section>
    );
}



function Section({ title, children }) {
    return (
        <section
            style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                boxShadow: "0 4px 18px rgba(0, 77, 50, 0.04)",
                padding: "24px",
                marginBottom: "20px",
                boxSizing: "border-box",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: "linear-gradient(90deg, #004d32 0%, #efff00 100%)",
                }}
            />

            <h2
                style={{
                    margin: "0 0 18px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid #f1f5f9",
                    fontSize: "15.5px",
                    fontWeight: "800",
                    color: "#004d32",
                }}
            >
                {title}
            </h2>

            {children}
        </section>
    );
}

function InputField({
    label,
    name,
    type = "text",
    placeholder,
    value,
    onChange,
    required,
}) {
    return (
        <div>
            <label
                style={{
                    display: "block",
                    fontSize: "12.5px",
                    fontWeight: "700",
                    marginBottom: "6px",
                    color: "#334155",
                }}
            >
                {label}
                {required && <span style={{ color: "#dc2626", marginLeft: "4px" }}>*</span>}
            </label>

            <input
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                style={{
                    width: "100%",
                    height: "38px",
                    boxSizing: "border-box",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    padding: "0 12px",
                    outline: "none",
                    backgroundColor: "#ffffff",
                    fontSize: "13px",
                    color: "#1e293b",
                }}
            />
        </div>
    );
}

function NumberField({ label, name, value, onChange, required }) {
    return (
        <div>
            <label
                style={{
                    display: "block",
                    fontSize: "12.5px",
                    fontWeight: "700",
                    marginBottom: "6px",
                    color: "#334155",
                }}
            >
                {label}
                {required && <span style={{ color: "#dc2626", marginLeft: "4px" }}>*</span>}
            </label>

            <input
                type="number"
                min="0"
                step="any"
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                style={{
                    width: "100%",
                    height: "38px",
                    boxSizing: "border-box",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    padding: "0 12px",
                    outline: "none",
                    backgroundColor: "#ffffff",
                    textAlign: "right",
                    fontSize: "13px",
                    color: "#1e293b",
                }}
            />
        </div>
    );
}

function NumberTableField({ value, onChange }) {
    return (
        <input
            type="number"
            min="0"
            step="any"
            required
            value={value}
            onChange={onChange}
            style={{
                width: "100%",
                minWidth: "90px",
                height: "32px",
                boxSizing: "border-box",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                padding: "0 8px",
                outline: "none",
                backgroundColor: "#f8fafc",
                textAlign: "right",
                fontSize: "13px",
                color: "#1e293b",
            }}
        />
    );
}

function SelectField({
    label,
    name,
    value,
    onChange,
    options = [],
    optionLabels = {},
    required = false,
    placeholder,
}) {
    return (
        <div>
            <label
                style={{
                    display: "block",
                    fontSize: "12.5px",
                    fontWeight: "700",
                    marginBottom: "6px",
                    color: "#334155",
                }}
            >
                {label}
                {required && <span style={{ color: "#dc2626", marginLeft: "4px" }}>*</span>}
            </label>

            <select
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                style={{
                    width: "100%",
                    height: "38px",
                    boxSizing: "border-box",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    padding: "0 10px",
                    outline: "none",
                    backgroundColor: "#ffffff",
                    fontSize: "13px",
                    color: "#1e293b",
                }}
            >
                <option value="">
                    {placeholder || (name === "period" ? "Pilih Periode (Bulan)" : name === "year" ? "Pilih Tahun" : name === "rigNo" ? "Pilih Rig" : `-- Pilih ${label || "Pilihan"} --`)}
                </option>

                {options.map((option) => (
                    <option key={option} value={option}>
                        {optionLabels[option] || option}
                    </option>
                ))}
            </select>
        </div>
    );
}

const tableHeaderStyle = {
    padding: "10px 12px",
    fontSize: "12px",
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
};

const tableCellStyle = {
    padding: "8px 12px",
    border: "1px solid #f1f5f9",
    fontSize: "12.5px",
    textAlign: "center",
    color: "#334155",
};
