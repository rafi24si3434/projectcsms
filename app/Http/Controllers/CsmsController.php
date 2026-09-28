<?php

namespace App\Http\Controllers;

use App\Models\CsmsRig;
use App\Models\CsmsDocumentCategory;
use App\Models\CsmsRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CsmsController extends Controller
{
    /**
     * Dashboard CSMS - List of 20 RIGs and document overview.
     */
    public function index(Request $request): Response
    {
        $bulan = $request->query('bulan', 'Januari');
        $tahun = (int) $request->query('tahun', 2025);
        $selectedRigId = $request->query('rig_id');

        $rigs = CsmsRig::where('status', 'active')->orderBy('id')->get();
        $categories = CsmsDocumentCategory::orderBy('no')->get();

        // Get records for selected month & year
        $query = CsmsRecord::with(['rig', 'category'])
            ->where('periode_bulan', $bulan)
            ->where('periode_tahun', $tahun);

        if ($selectedRigId) {
            $query->where('csms_rig_id', $selectedRigId);
        }

        $records = $query->get();

        // Calculate stats per RIG
        $rigStats = $rigs->map(function ($rig) use ($records, $categories) {
            $rigRecords = $records->where('csms_rig_id', $rig->id);
            $totalRequired = $categories->reduce(function ($carry, $cat) {
                return $carry + ($cat->scope === 'crew' ? 3 : 1);
            }, 0);
            $completed = $rigRecords->where('status', 'Lengkap')->count();

            return [
                'id' => $rig->id,
                'name' => $rig->name,
                'code' => $rig->code,
                'completed_count' => $completed,
                'total_required' => $totalRequired,
                'percentage' => $totalRequired > 0 ? round(($completed / $totalRequired) * 100, 1) : 0,
            ];
        });

        // Overall statistics
        $totalRigCount = $rigs->count();
        $totalRecordsCount = $records->count();
        $lengkapCount = $records->where('status', 'Lengkap')->count();
        $pendingCount = $records->where('status', 'Pending')->count();

        return Inertia::render('Csms/Dashboard', [
            'rigs' => $rigs,
            'categories' => $categories,
            'records' => $records,
            'rigStats' => $rigStats,
            'filter' => [
                'bulan' => $bulan,
                'tahun' => $tahun,
                'rig_id' => $selectedRigId ? (int)$selectedRigId : null,
            ],
            'summary' => [
                'total_rigs' => $totalRigCount,
                'total_uploaded' => $totalRecordsCount,
                'lengkap_count' => $lengkapCount,
                'pending_count' => $pendingCount,
            ],
        ]);
    }

    /**
     * View detail RIG CSMS document matrix.
     */
    public function showRig(Request $request, $id): Response
    {
        $rig = CsmsRig::findOrFail($id);
        $bulan = $request->query('bulan', 'Januari');
        $tahun = (int) $request->query('tahun', 2025);

        $categories = CsmsDocumentCategory::orderBy('no')->get();
        $records = CsmsRecord::where('csms_rig_id', $rig->id)
            ->where('periode_bulan', $bulan)
            ->where('periode_tahun', $tahun)
            ->get();

        // Organize records into matrix indexed by [category_id][crew]
        $matrix = [];
        foreach ($records as $rec) {
            $crewKey = $rec->crew ?: 'Rig';
            $matrix[$rec->csms_document_category_id][$crewKey] = $rec;
        }

        return Inertia::render('Csms/RigDetail', [
            'rig' => $rig,
            'categories' => $categories,
            'records' => $records,
            'matrix' => $matrix,
            'filter' => [
                'bulan' => $bulan,
                'tahun' => $tahun,
            ],
            'allRigs' => CsmsRig::where('status', 'active')->orderBy('id')->get(),
        ]);
    }

    /**
     * Store or update document upload.
     */
    public function uploadRecord(Request $request)
    {
        $request->validate([
            'csms_rig_id' => 'required|exists:csms_rigs,id',
            'csms_document_category_id' => 'required|exists:csms_document_categories,id',
            'periode_bulan' => 'required|string',
            'periode_tahun' => 'required|integer',
            'crew' => 'nullable|string',
            'status' => 'required|in:Lengkap,Tidak Ada,Pending,In Progress',
            'keterangan' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx|max:10240',
        ]);

        $record = CsmsRecord::firstOrNew([
            'csms_rig_id' => $request->csms_rig_id,
            'csms_document_category_id' => $request->csms_document_category_id,
            'periode_bulan' => $request->periode_bulan,
            'periode_tahun' => $request->periode_tahun,
            'crew' => $request->crew,
        ]);

        if ($request->hasFile('file')) {
            // Delete old file if existing
            if ($record->file_path && Storage::disk('public')->exists($record->file_path)) {
                Storage::disk('public')->delete($record->file_path);
            }

            $file = $request->file('file');
            $path = $file->store('csms_documents', 'public');

            $record->file_path = $path;
            $record->file_name = $file->getClientOriginalName();
            $record->file_size = $file->getSize();
            $record->file_type = $file->getClientOriginalExtension();
        }

        $record->status = $request->status;
        $record->keterangan = $request->keterangan;
        $record->uploaded_by = auth()->user()->name ?? 'Operator';
        $record->save();

        return redirect()->back()->with('success', 'Dokumen CSMS berhasil disimpan!');
    }

    /**
     * Delete record file.
     */
    public function deleteRecord($id)
    {
        $record = CsmsRecord::findOrFail($id);

        if ($record->file_path && Storage::disk('public')->exists($record->file_path)) {
            Storage::disk('public')->delete($record->file_path);
        }

        $record->delete();

        return redirect()->back()->with('success', 'Dokumen CSMS berhasil dihapus!');
    }
}
