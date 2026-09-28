import React, { useMemo, useState, useEffect } from "react";
import AdminSidebar from "../../Components/AdminSidebar";
import { usePage } from "@inertiajs/react";

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
            customName: name,
            definition: "",
        };
        return result;
    }, {});
}

const DEFAULT_LAGGING = createIndicatorValues(LAGGING_INDICATORS);
const DEFAULT_LEADING = createIndicatorValues(LEADING_INDICATORS);

export default function InputData() {
    const { auth } = usePage().props;
    const currentUser = auth?.user;

    const [form, setForm] = useState({
        ...INITIAL_FORM,
        submitterName: currentUser?.name || "",
        submitterEmail: currentUser?.email || "",
        lagging: DEFAULT_LAGGING,
        leading: DEFAULT_LEADING,
    });

    React.useEffect(() => {
        if (currentUser) {
            setForm((prev) => ({
                ...prev,
                submitterName: prev.submitterName || currentUser.name || "",
                submitterEmail: prev.submitterEmail || currentUser.email || "",
            }));
        }
    }, [currentUser]);

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

        try {
            // ==========================================
            // UBAH DATA REACT MENJADI DATA YANG
            // SESUAI DENGAN CONTROLLER LARAVEL
            // ==========================================

            const payload = {
                // =========================
                // IDENTIFICATION
                // =========================

                date: form.date,

                // Contract No
                contractNo: form.contractNo,

                // Rig
                rigNo: form.rigNo,

                // Location / Daerah
                locationDistrict: form.locationDistrict,

                // Periode
                period: form.period,
                year: form.year,

                submitterName: form.submitterName,
                submitterEmail: form.submitterEmail,

                // =========================
                // MAN HOURS
                // =========================

                manHoursPremisesPlan: Number(form.manHoursPremisesPlan) || 0,

                manHoursNonPremisesPlan:
                    Number(form.manHoursNonPremisesPlan) || 0,

                manHoursPremisesActual:
                    Number(form.manHoursPremisesActual) || 0,

                manHoursNonPremisesActual:
                    Number(form.manHoursNonPremisesActual) || 0,

                // =========================
                // EXPOSURE
                // =========================

                totalEmployees: Number(form.employees) || 0,

                totalVehicles: Number(form.totalVehicles) || 0,

                // =========================
                // KM DRIVEN
                // =========================

                kilometerPremisesPlan: Number(form.kilometerPremisesPlan) || 0,

                kilometerNonPremisesPlan:
                    Number(form.kilometerNonPremisesPlan) || 0,

                kilometerPremisesActual:
                    Number(form.kilometerPremisesActual) || 0,

                kilometerNonPremisesActual:
                    Number(form.kilometerNonPremisesActual) || 0,

                // =========================
                // LAGGING
                // =========================

                lagging: Object.entries(form.lagging).map(
                    ([name, values], index) => ({
                        name: name,
                        indicator_name: values.customName || name,
                        indicator_no: index + 1,
                        plan: Number(values.plan) || 0,
                        actual: Number(values.actual) || 0,
                        definition: values.definition || "",
                        notes: values.definition || "",
                    }),
                ),

                // =========================
                // LEADING
                // =========================

                leading: Object.entries(form.leading).map(
                    ([name, values], index) => ({
                        name: name,
                        indicator_name: values.customName || name,
                        indicator_no: index + 1,
                        plan: Number(values.plan) || 0,
                        actual: Number(values.actual) || 0,
                        definition: values.definition || "",
                        notes: values.definition || "",
                    }),
                ),

                // =========================
                // REMARKS
                // =========================

                remarks: form.remarks,
            };

            console.log("DATA YANG DIKIRIM:", payload);

            // ==========================================
            // CSRF TOKEN
            // ==========================================

            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");

            if (!csrfToken) {
                alert("CSRF token tidak ditemukan. Silakan cek app.blade.php.");
                return;
            }

            // ==========================================
            // KIRIM KE LARAVEL
            // ==========================================

            const response = await fetch("/admin/hse-report", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                    "X-Requested-With": "XMLHttpRequest",
                },

                credentials: "same-origin",

                body: JSON.stringify(payload),
            });

            const result = await response.json();

            console.log("RESPONSE SERVER:", result);

            // ==========================================
            // JIKA GAGAL
            // ==========================================

            if (!response.ok) {
                console.error("ERROR SERVER:", result);

                if (result.errors) {
                    console.error("VALIDATION ERRORS:", result.errors);
                }

                alert(result.message || "Data HSE gagal disimpan.");

                return;
            }

            // ==========================================
            // JIKA BERHASIL
            // ==========================================

            alert(
                `Data HSE ${selectedMonthLabel} berhasil dikirim! Status saat ini: PENDING (Menunggu Persetujuan / Approval dari Admin via Email atau Menu Approval).`,
            );

            console.log("REPORT BERHASIL DISIMPAN:", result.data);
        } catch (error) {
            console.error("ERROR SUBMIT HSE:", error);

            alert(
                "Terjadi kesalahan saat menyimpan data HSE. Silakan cek Console.",
            );
        }
    };

    const handleReset = () => {
        setForm({
            ...INITIAL_FORM,
            lagging: createIndicatorValues(LAGGING_INDICATORS),
            leading: createIndicatorValues(LEADING_INDICATORS),
        });
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f4f7f9",
                fontFamily: "Arial, Helvetica, sans-serif",
                color: "#12342b",
            }}
        >
            <AdminSidebar />

            <main
                style={{
                    marginLeft: "var(--admin-sidebar-width, 215px)",
                    width: "calc(100% - var(--admin-sidebar-width, 215px))",
                    transition: "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    minHeight: "100vh",
                }}
            >
                <header
                    style={{
                        height: "64px",
                        backgroundColor: "#ffffff",
                        borderBottom: "1px solid #d9e2de",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 28px",
                    }}
                >
                    <strong
                        style={{
                            fontSize: "25px",
                            color: "#004f3d",
                        }}
                    >
                        RigOps HSE Manager
                    </strong>

                    <div
                        style={{
                            fontSize: "15px",
                            color: "#60716b",
                        }}
                    >
                        Input Data HSE
                    </div>
                </header>

                <div
                    style={{
                        padding: "25px 30px 50px",
                    }}
                >
                    <div
                        style={{
                            marginBottom: "22px",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "15px",
                                color: "#71807a",
                                marginBottom: "10px",
                            }}
                        >
                            ▣ &nbsp; Input Data HSE (Admin)
                        </div>

                        <h1
                            style={{
                                margin: 0,
                                fontSize: "32px",
                                color: "#111827",
                            }}
                        >
                            Input HSE Data
                        </h1>

                        <p
                            style={{
                                marginTop: "7px",
                                color: "#60716b",
                                fontSize: "15px",
                            }}
                        >
                            Masukkan data HSE berdasarkan periode dan KPI pada dokumen KPI.
                        </p>

                        <div
                            style={{
                                marginTop: "12px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "10px",
                                backgroundColor: "#ecfdf5",
                                border: "1px solid #a7f3d0",
                                borderRadius: "8px",
                                padding: "6px 14px",
                                fontSize: "12.5px",
                                color: "#065f46",
                            }}
                        >
                            <span style={{ fontWeight: "700" }}>Diinput oleh (Admin):</span>
                            <span style={{ fontWeight: "800", color: "#004d32" }}>{currentUser?.name || "HSE Administrator"}</span>
                            <span style={{ color: "#047857" }}>({currentUser?.email || "admin@besmindo.com"})</span>
                        </div>
                    </div>



                    <form onSubmit={handleSubmit}>
                        <Section title="Identification">
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(4, 1fr)",
                                    gap: "14px",
                                }}
                            >
                                <InputField
                                    label="Date"
                                    name="date"
                                    type="date"
                                    required
                                    value={form.date}
                                    onChange={handleChange}
                                />

                                <InputField
                                    label="Contract No"
                                    name="contractNo"
                                    placeholder="Contoh: SPHR01097C"
                                    value={form.contractNo}
                                    onChange={handleChange}
                                    required
                                />

                                <InputField
                                    label="Location / Daerah"
                                    name="locationDistrict"
                                    placeholder="Contoh: AREA WK ROKAN - RIAU"
                                    value={form.locationDistrict}
                                    onChange={handleChange}
                                    required
                                />

                                <SelectField
                                    label="Rig No"
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
                                    label="Periode Kinerja (Bulan)"
                                    name="period"
                                    value={form.period}
                                    onChange={handleChange}
                                    options={MONTHS.map((month) => month.value)}
                                    optionLabels={MONTHS.reduce(
                                        (result, month) => {
                                            result[month.value] = month.label;
                                            return result;
                                        },
                                        {},
                                    )}
                                    required
                                />

                                <SelectField
                                    label="Tahun Kinerja"
                                    name="year"
                                    value={form.year}
                                    onChange={handleChange}
                                    options={YEARS}
                                    optionLabels={YEARS.reduce(
                                        (result, yr) => {
                                            result[yr] = `Tahun ${yr}`;
                                            return result;
                                        },
                                        {},
                                    )}
                                    required
                                />

                                <InputField
                                    label="Nama Petugas Penginput (PIC / Admin)"
                                    name="submitterName"
                                    placeholder="Contoh: Budi Santoso"
                                    value={form.submitterName}
                                    onChange={handleChange}
                                    required
                                />

                                <InputField
                                    label="Email Petugas Penginput"
                                    name="submitterEmail"
                                    type="email"
                                    placeholder="Contoh: admin@besmindo.com"
                                    value={form.submitterEmail}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </Section>

                        <Section title="Exposure Metrics">
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(4, 1fr)",
                                    gap: "14px",
                                }}
                            >
                                {/* =========================
            MAN HOURS PLAN
        ========================= */}

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

                                {/* =========================
            MAN HOURS ACTUAL
        ========================= */}

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

                                {/* =========================
            EMPLOYEE & VEHICLE
        ========================= */}

                                <NumberField
                                    label="Total Employees"
                                    name="employees"
                                    value={form.employees}
                                    onChange={handleChange}
                                    required
                                />

                                <NumberField
                                    label="Total Vehicles"
                                    name="totalVehicles"
                                    value={form.totalVehicles}
                                    onChange={handleChange}
                                    required
                                />

                                {/* =========================
            KM DRIVEN PLAN
        ========================= */}

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

                                {/* =========================
            KM DRIVEN ACTUAL
        ========================= */}

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

                        <IndicatorSection
                            title="⚠ Lagging Indicators"
                            type="lagging"
                            indicators={LAGGING_INDICATORS}
                            values={form.lagging}
                            onChange={handleIndicatorChange}
                        />

                        <IndicatorSection
                            title="↗ Leading Indicators"
                            type="leading"
                            indicators={LEADING_INDICATORS}
                            values={form.leading}
                            onChange={handleIndicatorChange}
                        />

                        <Section title="Documentation">
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    marginBottom: "7px",
                                    color: "#3f514b",
                                }}
                            >
                                Remarks / Executive Summary <span style={{ color: "#64748b", fontWeight: "normal", fontSize: "12px" }}>(Opsional)</span>
                            </label>

                            <textarea
                                name="remarks"
                                value={form.remarks}
                                onChange={handleChange}
                                placeholder="Catatan tambahan atau konteks opsional untuk data periode ini..."
                                rows={5}
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    border: "1px solid #ccd8d3",
                                    borderRadius: "5px",
                                    padding: "12px",
                                    resize: "vertical",
                                    outline: "none",
                                    fontFamily: "Arial",
                                    fontSize: "15px",
                                }}
                            />
                        </Section>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "10px",
                                marginTop: "20px",
                            }}
                        >
                            <button
                                type="button"
                                onClick={handleReset}
                                style={{
                                    padding: "11px 22px",
                                    backgroundColor: "#ffffff",
                                    border: "1px solid #004d32",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    color: "#004d32",
                                    fontWeight: "700",
                                    fontSize: "13px",
                                }}
                            >
                                Reset
                            </button>

                            <button
                                type="submit"
                                style={{
                                    padding: "11px 25px",
                                    backgroundColor: "#004d32",
                                    color: "#efff00",
                                    border: "1px solid #efff00",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "800",
                                    fontSize: "13px",
                                    boxShadow: "0 0 10px rgba(239, 255, 0, 0.25)",
                                }}
                            >
                                Save HSE Data
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

/* =========================
   INDICATOR SECTION
========================= */

function IndicatorRow({ indicator, index, type, value, onChange }) {
    const [editing, setEditing] = useState(false);
    const customName = value.customName !== undefined ? value.customName : indicator;
    const isEdited = customName !== indicator && customName.trim() !== "";

    return (
        <tr
            style={{
                backgroundColor: index % 2 === 0 ? "#ffffff" : "#fcfdfd",
                borderBottom: "1px solid #f1f5f9",
            }}
        >
            <td
                style={{
                    ...tableCellStyle,
                    fontWeight: "700",
                    color: "#004d32",
                }}
            >
                {index + 1}
            </td>

            <td
                style={{
                    ...tableCellStyle,
                    textAlign: "left",
                    padding: "8px 12px",
                }}
            >
                {editing ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                            type="text"
                            autoFocus
                            value={customName}
                            onChange={(event) =>
                                onChange(type, indicator, "customName", event.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") setEditing(false);
                            }}
                            style={{
                                flex: 1,
                                height: "34px",
                                boxSizing: "border-box",
                                border: "1.5px solid #004d32",
                                borderRadius: "6px",
                                padding: "0 10px",
                                outline: "none",
                                fontSize: "13px",
                                color: "#1e293b",
                                fontWeight: "600",
                                backgroundColor: "#ffffff",
                            }}
                            placeholder="Ketik poin yang diukur..."
                        />
                        <button
                            type="button"
                            onClick={() => setEditing(false)}
                            style={{
                                padding: "4px 12px",
                                height: "34px",
                                backgroundColor: "#004d32",
                                color: "#efff00",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: "700",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                flexShrink: 0,
                            }}
                        >
                            ✓ Simpan
                        </button>
                        {isEdited && (
                            <button
                                type="button"
                                title="Kembalikan ke nama default"
                                onClick={() => {
                                    onChange(type, indicator, "customName", indicator);
                                    setEditing(false);
                                }}
                                style={{
                                    padding: "4px 8px",
                                    height: "34px",
                                    backgroundColor: "#f1f5f9",
                                    color: "#64748b",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    flexShrink: 0,
                                }}
                            >
                                Reset
                            </button>
                        )}
                    </div>
                ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13px", fontWeight: isEdited ? "700" : "500", color: isEdited ? "#004d32" : "#1e293b" }}>
                                {customName}
                            </span>
                            {isEdited && (
                                <span
                                    style={{
                                        fontSize: "10.5px",
                                        fontWeight: "800",
                                        padding: "2px 7px",
                                        borderRadius: "4px",
                                        backgroundColor: "#fef3c7",
                                        color: "#92400e",
                                        border: "1px solid #fde68a",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "3px",
                                    }}
                                >
                                    ✏️ Telah Diedit
                                </span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setEditing(true)}
                            title="Edit nama poin indikator ini"
                            style={{
                                padding: "4px 9px",
                                backgroundColor: isEdited ? "#e0f2fe" : "#f8fafc",
                                color: isEdited ? "#0369a1" : "#475569",
                                border: isEdited ? "1px solid #bae6fd" : "1px solid #cbd5e1",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "11.5px",
                                fontWeight: "700",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                flexShrink: 0,
                                transition: "all 0.15s ease",
                            }}
                        >
                            ✏️ Edit Poin
                        </button>
                    </div>
                )}
            </td>

            <td style={tableCellStyle}>
                <NumberTableField
                    value={value.plan}
                    onChange={(event) =>
                        onChange(type, indicator, "plan", event.target.value)
                    }
                />
            </td>

            <td style={tableCellStyle}>
                <NumberTableField
                    value={value.actual}
                    onChange={(event) =>
                        onChange(type, indicator, "actual", event.target.value)
                    }
                />
            </td>
        </tr>
    );
}

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
                            <th style={{ ...tableHeaderStyle, width: "50px" }}>No</th>

                            <th
                                style={{
                                    ...tableHeaderStyle,
                                    textAlign: "left",
                                    minWidth: "380px",
                                }}
                            >
                                Point yang Diukur / Indikator
                            </th>

                            <th style={{ ...tableHeaderStyle, width: "130px" }}>Target / Plan</th>

                            <th style={{ ...tableHeaderStyle, width: "130px" }}>Realisasi / Actual</th>
                        </tr>
                    </thead>

                    <tbody>
                        {indicators.map((indicator, index) => {
                            const value = values[indicator] || {
                                plan: 0,
                                actual: 0,
                                customName: indicator,
                            };

                            return (
                                <IndicatorRow
                                    key={indicator}
                                    indicator={indicator}
                                    index={index}
                                    type={type}
                                    value={value}
                                    onChange={onChange}
                                />
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <p
                style={{
                    margin: "10px 0 0",
                    fontSize: "12px",
                    color: "#64748b",
                }}
            >
                Isi nilai <strong>Plan</strong> sesuai target implementasi pada
                dokumen KPI, lalu isi <strong>Actual</strong> sesuai realisasi
                bulan yang dipilih.
            </p>
        </Section>
    );
}

/* =========================
   STEP
========================= */

function Step({ number, title, active }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
            }}
        >
            <div
                style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    backgroundColor: active ? "#004d32" : "#e2e8f0",
                    color: active ? "#efff00" : "#64748b",
                    border: active ? "1px solid #efff00" : "1px solid transparent",
                    boxShadow: active ? "0 0 8px rgba(239, 255, 0, 0.3)" : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "800",
                    fontSize: "13px",
                }}
            >
                {number}
            </div>

            <div>
                <div
                    style={{
                        fontSize: "12px",
                        fontWeight: "800",
                        color: active ? "#004d32" : "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                    }}
                >
                    {title}
                </div>
            </div>
        </div>
    );
}

/* =========================
   SECTION
========================= */

function Section({ title, children }) {
    return (
        <section
            style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                boxShadow: "0 4px 18px rgba(0, 77, 50, 0.06)",
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
                    fontSize: "16px",
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

/* =========================
   INPUT
========================= */

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
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "7px",
                    color: "#53645d",
                }}
            >
                {label}

                {required && (
                    <span
                        style={{
                            color: "#dc2626",
                            marginLeft: "3px",
                        }}
                    >
                        *
                    </span>
                )}
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
                    border: "1px solid #ccd8d3",
                    borderRadius: "5px",
                    padding: "0 10px",
                    outline: "none",
                    backgroundColor: "#f8fafb",
                    fontSize: "14px",
                    color: "#263b34",
                }}
            />
        </div>
    );
}

/* =========================
   NUMBER
========================= */

function NumberField({ label, name, value, onChange, required }) {
    return (
        <div>
            <label
                style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "7px",
                    color: "#3f514b",
                }}
            >
                {label}

                {required && (
                    <span
                        style={{
                            color: "#dc2626",
                            marginLeft: "3px",
                        }}
                    >
                        *
                    </span>
                )}
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
                    height: "36px",
                    boxSizing: "border-box",
                    border: "1px solid #ccd8d3",
                    borderRadius: "4px",
                    padding: "0 10px",
                    outline: "none",
                    backgroundColor: "#f8fafb",
                    textAlign: "right",
                    fontSize: "14px",
                    color: "#263b34",
                }}
            />
        </div>
    );
}

/* =========================
   NUMBER TABLE
========================= */

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
                border: "1px solid #ccd8d3",
                borderRadius: "4px",
                padding: "0 8px",
                outline: "none",
                backgroundColor: "#f8fafb",
                textAlign: "right",
                fontSize: "13px",
                color: "#263b34",
            }}
        />
    );
}

/* =========================
   SELECT
========================= */

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
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "7px",
                    color: "#53645d",
                }}
            >
                {label}

                {required && (
                    <span
                        style={{
                            color: "#dc2626",
                            marginLeft: "3px",
                        }}
                    >
                        *
                    </span>
                )}
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
                    border: "1px solid #ccd8d3",
                    borderRadius: "5px",
                    padding: "0 10px",
                    outline: "none",
                    backgroundColor: "#f8fafb",
                    fontSize: "14px",
                    color: "#263b34",
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

/* =========================
   TABLE STYLE
========================= */

const tableHeaderStyle = {
    padding: "10px 8px",
    border: "1px solid rgba(255,255,255,0.2)",
    fontSize: "13px",
    textAlign: "center",
};

const tableCellStyle = {
    padding: "7px 8px",
    border: "1px solid #dbe4e0",
    fontSize: "13px",
    textAlign: "center",
    color: "#263b34",
};
