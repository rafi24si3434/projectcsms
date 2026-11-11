<?php

namespace App\Http\Controllers;

use App\Exceptions\RemoteStorageException;
use App\Services\RemoteStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class RemoteStorageController extends Controller
{
    protected RemoteStorageService $storage;

    public function __construct(RemoteStorageService $storage)
    {
        $this->storage = $storage;
    }

    /**
     * Helper untuk mengarahkan driver dari request query / body ('ftp' atau 'sftp').
     */
    protected function resolveService(Request $request): RemoteStorageService
    {
        $driver = $request->input('driver', $request->query('driver', 'sftp'));
        return $this->storage->setDriver($driver);
    }

    /**
     * Uji koneksi ke server remote storage (FTP atau SFTP).
     *
     * GET /admin/remote-storage/test?driver=sftp
     */
    public function test(Request $request): JsonResponse
    {
        $request->validate([
            'driver' => 'nullable|string|in:ftp,sftp',
        ]);

        $service = $this->resolveService($request);
        $result  = $service->testConnection();

        return response()->json([
            'status'  => $result['success'] ? 'connected' : 'error',
            'data'    => $result,
        ], $result['success'] ? 200 : 503);
    }

    /**
     * Tampilkan daftar file & direktori pada remote storage.
     *
     * GET /admin/remote-storage/files?driver=sftp&path=/
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'driver'    => 'nullable|string|in:ftp,sftp',
            'path'      => 'nullable|string',
            'recursive' => 'nullable|boolean',
        ]);

        $service   = $this->resolveService($request);
        $path      = $request->query('path', '/');
        $recursive = filter_var($request->query('recursive', false), FILTER_VALIDATE_BOOLEAN);

        try {
            $dirs  = $service->listDirectories($path, $recursive);
            $files = $service->listFiles($path, $recursive);

            return response()->json([
                'success'     => true,
                'driver'      => $service->getDriver(),
                'path'        => $path,
                'directories' => $dirs,
                'files'       => $files,
                'total_files' => count($files),
                'total_dirs'  => count($dirs),
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'driver'  => $service->getDriver(),
                'path'    => $path,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Upload file atau konten teks ke remote storage.
     *
     * POST /admin/remote-storage/upload
     * Body (multipart/form-data):
     * - driver: 'ftp' | 'sftp'
     * - file: (file binary) ATAU content: (string text)
     * - directory: (opsional folder target, default: 'uploads')
     * - filename: (opsional custom filename)
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'driver'    => 'nullable|string|in:ftp,sftp',
            'file'      => 'nullable|file|max:51200', // max 50MB
            'content'   => 'nullable|string',
            'directory' => 'nullable|string',
            'filename'  => 'nullable|string|max:255',
        ]);

        if (!$request->hasFile('file') && !$request->filled('content')) {
            return response()->json([
                'success' => false,
                'message' => 'Wajib menyertakan file binary (file) atau isi teks (content).',
            ], 422);
        }

        $service   = $this->resolveService($request);
        $directory = $request->input('directory', 'uploads');

        try {
            if ($request->hasFile('file')) {
                $file   = $request->file('file');
                $result = $service->uploadFile($directory, $file, $request->input('filename'));
            } else {
                $filename = $request->input('filename', 'file_' . time() . '.txt');
                $fullPath = rtrim($directory, '/') . '/' . ltrim($filename, '/');
                $result   = $service->uploadContent($fullPath, $request->input('content'));
            }

            return response()->json([
                'success' => true,
                'message' => "File berhasil diunggah ke server " . strtoupper($service->getDriver()) . ".",
                'data'    => $result,
            ], 201);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'driver'  => $service->getDriver(),
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Unduh file langsung dari remote storage (Streamed HTTP Response).
     *
     * GET /admin/remote-storage/download?driver=sftp&path=uploads/dokumen.pdf
     */
    public function download(Request $request): StreamedResponse|JsonResponse
    {
        $request->validate([
            'driver' => 'nullable|string|in:ftp,sftp',
            'path'   => 'required|string',
            'name'   => 'nullable|string',
        ]);

        $service = $this->resolveService($request);
        $path    = $request->query('path');
        $name    = $request->query('name');

        try {
            return $service->download($path, $name);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'driver'  => $service->getDriver(),
                'path'    => $path,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Baca isi file (preview konten) dari remote storage.
     *
     * GET /admin/remote-storage/preview?driver=sftp&path=uploads/catatan.txt
     */
    public function preview(Request $request): JsonResponse
    {
        $request->validate([
            'driver' => 'nullable|string|in:ftp,sftp',
            'path'   => 'required|string',
        ]);

        $service = $this->resolveService($request);
        $path    = $request->query('path');

        try {
            $content = $service->get($path);
            $size    = $service->size($path);

            return response()->json([
                'success'    => true,
                'driver'     => $service->getDriver(),
                'path'       => $path,
                'size'       => $size,
                'size_human' => $service->formatBytes($size),
                'content'    => $content,
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'driver'  => $service->getDriver(),
                'path'    => $path,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Hapus file atau direktori dari remote storage.
     *
     * DELETE /admin/remote-storage/delete
     * Body:
     * - driver: 'ftp' | 'sftp'
     * - path: path target
     * - is_directory: boolean (opsional)
     */
    public function destroy(Request $request): JsonResponse
    {
        $request->validate([
            'driver'       => 'nullable|string|in:ftp,sftp',
            'path'         => 'required|string',
            'is_directory' => 'nullable|boolean',
        ]);

        $service     = $this->resolveService($request);
        $path        = $request->input('path');
        $isDirectory = filter_var($request->input('is_directory', false), FILTER_VALIDATE_BOOLEAN);

        try {
            if (!$service->exists($path)) {
                return response()->json([
                    'success' => false,
                    'message' => "Item '{$path}' tidak ditemukan di remote storage.",
                ], 404);
            }

            if ($isDirectory) {
                $service->deleteDirectory($path);
                $message = "Direktori '{$path}' beserta seluruh isinya berhasil dihapus.";
            } else {
                $service->delete($path);
                $message = "File '{$path}' berhasil dihapus.";
            }

            return response()->json([
                'success' => true,
                'driver'  => $service->getDriver(),
                'path'    => $path,
                'message' => $message,
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'driver'  => $service->getDriver(),
                'path'    => $path,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
