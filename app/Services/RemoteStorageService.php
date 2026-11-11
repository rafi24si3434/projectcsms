<?php

namespace App\Services;

use App\Exceptions\RemoteStorageException;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class RemoteStorageService
{
    /**
     * Driver aktif default ('ftp' atau 'sftp').
     */
    protected string $driver;

    /**
     * Supported drivers.
     */
    public const DRIVER_FTP  = 'ftp';
    public const DRIVER_SFTP = 'sftp';

    public function __construct(string $driver = self::DRIVER_SFTP)
    {
        $this->driver = $this->normalizeDriver($driver);
    }

    /**
     * Set driver secara dinamis ('ftp' atau 'sftp').
     */
    public function setDriver(string $driver): self
    {
        $this->driver = $this->normalizeDriver($driver);
        return $this;
    }

    /**
     * Dapatkan nama driver aktif saat ini.
     */
    public function getDriver(): string
    {
        return $this->driver;
    }

    /**
     * Fluent shortcut untuk berganti ke driver FTP.
     */
    public function ftp(): self
    {
        return $this->setDriver(self::DRIVER_FTP);
    }

    /**
     * Fluent shortcut untuk berganti ke driver SFTP.
     */
    public function sftp(): self
    {
        return $this->setDriver(self::DRIVER_SFTP);
    }

    /**
     * Dapatkan instance Storage Disk Laravel untuk driver aktif.
     */
    public function disk(?string $driver = null): Filesystem
    {
        $targetDriver = $driver ? $this->normalizeDriver($driver) : $this->driver;

        try {
            return Storage::disk($targetDriver);
        } catch (Throwable $e) {
            $this->logError('disk-init', $e, null, $targetDriver);
            throw new RemoteStorageException(
                "Inisialisasi disk Storage gagal: " . $e->getMessage(),
                $targetDriver,
                null,
                0,
                $e
            );
        }
    }

    /**
     * Normalisasi nama driver yang diizinkan.
     */
    protected function normalizeDriver(string $driver): string
    {
        $clean = strtolower(trim($driver));
        if (!in_array($clean, [self::DRIVER_FTP, self::DRIVER_SFTP], true)) {
            throw new RemoteStorageException("Driver remote storage '{$driver}' tidak didukung. Gunakan 'ftp' atau 'sftp'.", $driver);
        }
        return $clean;
    }

    /**
     * Uji konektivitas ke server remote (FTP / SFTP).
     *
     * @return array{success: bool, driver: string, host: string, port: int, message: string, time_ms: float}
     */
    public function testConnection(?string $driver = null): array
    {
        $targetDriver = $driver ? $this->normalizeDriver($driver) : $this->driver;
        $config       = config("filesystems.disks.{$targetDriver}", []);
        $host         = $config['host'] ?? 'unknown';
        $port         = (int) ($config['port'] ?? ($targetDriver === self::DRIVER_SFTP ? 22 : 21));

        $start = microtime(true);

        try {
            // Coba akses root direktori atau list konten sederhana
            $disk = $this->disk($targetDriver);
            $disk->files('/');

            $elapsed = round((microtime(true) - $start) * 1000, 2);

            return [
                'success' => true,
                'driver'  => $targetDriver,
                'host'    => $host,
                'port'    => $port,
                'message' => "Koneksi ke server " . strtoupper($targetDriver) . " [{$host}:{$port}] berhasil terhubung.",
                'time_ms' => $elapsed,
            ];
        } catch (Throwable $e) {
            $elapsed = round((microtime(true) - $start) * 1000, 2);
            $this->logError('test-connection', $e, '/', $targetDriver);

            return [
                'success' => false,
                'driver'  => $targetDriver,
                'host'    => $host,
                'port'    => $port,
                'message' => "Gagal terhubung ke server " . strtoupper($targetDriver) . " [{$host}:{$port}]: " . $e->getMessage(),
                'time_ms' => $elapsed,
            ];
        }
    }

    /**
     * Upload file ke remote storage (menerima UploadedFile, string konten, atau stream resource).
     *
     * @param string $path Target path pada remote storage (misal: "uploads/dokumen.pdf")
     * @param UploadedFile|string|resource $content Konten file
     * @param array $options Opsi tambahan Flysystem (visibility, headers, dll)
     * @return array Metadata hasil upload
     */
    public function upload(string $path, mixed $content, array $options = []): array
    {
        $path = $this->cleanPath($path);

        try {
            $disk = $this->disk();

            $success = false;
            $originalName = null;
            $mimeType = null;
            $fileSize = 0;

            if ($content instanceof UploadedFile) {
                $originalName = $content->getClientOriginalName();
                $mimeType     = $content->getClientMimeType();
                $fileSize     = $content->getSize();

                // Buka file stream untuk efisiensi memori
                $stream = fopen($content->getRealPath(), 'r');
                $success = $disk->put($path, $stream, $options);
                if (is_resource($stream)) {
                    fclose($stream);
                }
            } elseif (is_resource($content)) {
                $success = $disk->put($path, $content, $options);
            } else {
                // String konten teks/binary
                $fileSize = strlen((string) $content);
                $success  = $disk->put($path, (string) $content, $options);
            }

            if (!$success) {
                throw new RemoteStorageException("Server menolak penyimpanan file ke '{$path}'.", $this->driver, $path);
            }

            // Dapatkan ukuran jika belum diketahui
            if ($fileSize === 0) {
                try {
                    $fileSize = $disk->size($path);
                } catch (Throwable) {
                    $fileSize = 0;
                }
            }

            return [
                'success'       => true,
                'driver'        => $this->driver,
                'path'          => $path,
                'filename'      => basename($path),
                'original_name' => $originalName ?: basename($path),
                'size'          => $fileSize,
                'size_human'    => $this->formatBytes($fileSize),
                'mime_type'     => $mimeType,
                'uploaded_at'   => now()->toIso8601String(),
            ];
        } catch (Throwable $e) {
            $this->logError('upload', $e, $path);
            if ($e instanceof RemoteStorageException) {
                throw $e;
            }
            throw new RemoteStorageException("Proses upload file gagal: " . $e->getMessage(), $this->driver, $path, 0, $e);
        }
    }

    /**
     * Helper khusus upload string / konten teks secara langsung.
     */
    public function uploadContent(string $path, string $content, array $options = []): array
    {
        return $this->upload($path, $content, $options);
    }

    /**
     * Helper khusus upload file HTTP (UploadedFile).
     */
    public function uploadFile(string $directory, UploadedFile $file, ?string $customFilename = null, array $options = []): array
    {
        $filename = $customFilename ?: (time() . '_' . preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $file->getClientOriginalName()));
        $fullPath = rtrim($directory, '/') . '/' . ltrim($filename, '/');

        return $this->upload($fullPath, $file, $options);
    }

    /**
     * Ambil isi konten mentah file sebagai string.
     */
    public function get(string $path): string
    {
        $path = $this->cleanPath($path);

        try {
            $disk = $this->disk();

            if (!$disk->exists($path)) {
                throw new RemoteStorageException("File '{$path}' tidak ditemukan di remote storage.", $this->driver, $path);
            }

            $content = $disk->get($path);

            if ($content === null) {
                throw new RemoteStorageException("Gagal membaca isi konten file '{$path}'.", $this->driver, $path);
            }

            return $content;
        } catch (Throwable $e) {
            $this->logError('get', $e, $path);
            if ($e instanceof RemoteStorageException) {
                throw $e;
            }
            throw new RemoteStorageException("Gagal mengambil file: " . $e->getMessage(), $this->driver, $path, 0, $e);
        }
    }

    /**
     * Download file langsung ke response browser klien (HTTP StreamedResponse).
     */
    public function download(string $path, ?string $name = null, array $headers = []): StreamedResponse
    {
        $path = $this->cleanPath($path);

        try {
            $disk = $this->disk();

            if (!$disk->exists($path)) {
                throw new RemoteStorageException("File '{$path}' tidak ditemukan untuk diunduh.", $this->driver, $path);
            }

            $downloadName = $name ?: basename($path);

            return $disk->download($path, $downloadName, $headers);
        } catch (Throwable $e) {
            $this->logError('download', $e, $path);
            if ($e instanceof RemoteStorageException) {
                throw $e;
            }
            throw new RemoteStorageException("Gagal mengunduh file: " . $e->getMessage(), $this->driver, $path, 0, $e);
        }
    }

    /**
     * Ambil resource stream dari remote file.
     *
     * @return resource
     */
    public function readStream(string $path)
    {
        $path = $this->cleanPath($path);

        try {
            $disk = $this->disk();

            if (!$disk->exists($path)) {
                throw new RemoteStorageException("File '{$path}' tidak ditemukan.", $this->driver, $path);
            }

            $stream = $disk->readStream($path);

            if (!is_resource($stream)) {
                throw new RemoteStorageException("Gagal membuka stream file '{$path}'.", $this->driver, $path);
            }

            return $stream;
        } catch (Throwable $e) {
            $this->logError('readStream', $e, $path);
            if ($e instanceof RemoteStorageException) {
                throw $e;
            }
            throw new RemoteStorageException("Gagal membuka stream: " . $e->getMessage(), $this->driver, $path, 0, $e);
        }
    }

    /**
     * Ambil daftar file dalam suatu direktori (dengan informasi metadata lengkap).
     *
     * @return array<int, array{name: string, path: string, type: string, size: int, size_human: string, last_modified: ?string, extension: string}>
     */
    public function listFiles(string $directory = '/', bool $recursive = false): array
    {
        $directory = $this->cleanPath($directory);

        try {
            $disk  = $this->disk();
            $files = $recursive ? $disk->allFiles($directory) : $disk->files($directory);

            $result = [];
            foreach ($files as $filePath) {
                $filename = basename($filePath);
                $ext      = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

                $size = 0;
                $lastModified = null;

                try {
                    $size = $disk->size($filePath);
                } catch (Throwable) {
                    $size = 0;
                }

                try {
                    $timestamp = $disk->lastModified($filePath);
                    if ($timestamp) {
                        $lastModified = date('Y-m-d H:i:s', $timestamp);
                    }
                } catch (Throwable) {
                    $lastModified = null;
                }

                $result[] = [
                    'name'          => $filename,
                    'path'          => $filePath,
                    'type'          => 'file',
                    'extension'     => $ext,
                    'size'          => $size,
                    'size_human'    => $this->formatBytes($size),
                    'last_modified' => $lastModified,
                ];
            }

            return $result;
        } catch (Throwable $e) {
            $this->logError('listFiles', $e, $directory);
            throw new RemoteStorageException("Gagal membaca daftar file dari '{$directory}': " . $e->getMessage(), $this->driver, $directory, 0, $e);
        }
    }

    /**
     * Ambil daftar subdirektori.
     *
     * @return array<int, array{name: string, path: string, type: string}>
     */
    public function listDirectories(string $directory = '/', bool $recursive = false): array
    {
        $directory = $this->cleanPath($directory);

        try {
            $disk        = $this->disk();
            $directories = $recursive ? $disk->allDirectories($directory) : $disk->directories($directory);

            $result = [];
            foreach ($directories as $dirPath) {
                $result[] = [
                    'name' => basename($dirPath),
                    'path' => $dirPath,
                    'type' => 'directory',
                ];
            }

            return $result;
        } catch (Throwable $e) {
            $this->logError('listDirectories', $e, $directory);
            throw new RemoteStorageException("Gagal membaca daftar direktori dari '{$directory}': " . $e->getMessage(), $this->driver, $directory, 0, $e);
        }
    }

    /**
     * Ambil seluruh isi folder (gabungan file dan folder).
     */
    public function listContents(string $directory = '/'): array
    {
        $dirs  = $this->listDirectories($directory);
        $files = $this->listFiles($directory);

        return array_merge($dirs, $files);
    }

    /**
     * Cek apakah file atau direktori ada di remote storage.
     */
    public function exists(string $path): bool
    {
        $path = $this->cleanPath($path);

        try {
            return $this->disk()->exists($path);
        } catch (Throwable $e) {
            $this->logError('exists', $e, $path);
            return false;
        }
    }

    /**
     * Dapatkan ukuran file dalam bytes.
     */
    public function size(string $path): int
    {
        $path = $this->cleanPath($path);

        try {
            return $this->disk()->size($path);
        } catch (Throwable $e) {
            $this->logError('size', $e, $path);
            throw new RemoteStorageException("Gagal mendapatkan ukuran file '{$path}': " . $e->getMessage(), $this->driver, $path, 0, $e);
        }
    }

    /**
     * Dapatkan timestamp terakhir file dimodifikasi.
     */
    public function lastModified(string $path): int
    {
        $path = $this->cleanPath($path);

        try {
            return $this->disk()->lastModified($path);
        } catch (Throwable $e) {
            $this->logError('lastModified', $e, $path);
            throw new RemoteStorageException("Gagal mendapatkan waktu modifikasi file '{$path}': " . $e->getMessage(), $this->driver, $path, 0, $e);
        }
    }

    /**
     * Hapus satu atau beberapa file dari remote storage.
     *
     * @param string|array<int, string> $paths
     */
    public function delete(string|array $paths): bool
    {
        $pathList = is_array($paths) ? $paths : [$paths];
        $cleaned  = array_map([$this, 'cleanPath'], $pathList);

        try {
            $disk    = $this->disk();
            $success = $disk->delete($cleaned);

            if (!$success) {
                throw new RemoteStorageException("Remote server gagal menghapus file yang ditentukan.", $this->driver, implode(', ', $cleaned));
            }

            return true;
        } catch (Throwable $e) {
            $this->logError('delete', $e, implode(', ', $cleaned));
            if ($e instanceof RemoteStorageException) {
                throw $e;
            }
            throw new RemoteStorageException("Gagal menghapus file: " . $e->getMessage(), $this->driver, implode(', ', $cleaned), 0, $e);
        }
    }

    /**
     * Hapus direktori beserta seluruh isinya dari remote storage.
     */
    public function deleteDirectory(string $directory): bool
    {
        $directory = $this->cleanPath($directory);

        try {
            $disk = $this->disk();

            $success = $disk->deleteDirectory($directory);

            if (!$success) {
                throw new RemoteStorageException("Gagal menghapus direktori '{$directory}'.", $this->driver, $directory);
            }

            return true;
        } catch (Throwable $e) {
            $this->logError('deleteDirectory', $e, $directory);
            if ($e instanceof RemoteStorageException) {
                throw $e;
            }
            throw new RemoteStorageException("Gagal menghapus direktori: " . $e->getMessage(), $this->driver, $directory, 0, $e);
        }
    }

    /**
     * Buat direktori baru pada remote storage.
     */
    public function makeDirectory(string $directory): bool
    {
        $directory = $this->cleanPath($directory);

        try {
            return $this->disk()->makeDirectory($directory);
        } catch (Throwable $e) {
            $this->logError('makeDirectory', $e, $directory);
            throw new RemoteStorageException("Gagal membuat direktori '{$directory}': " . $e->getMessage(), $this->driver, $directory, 0, $e);
        }
    }

    /**
     * Salin file di dalam remote storage.
     */
    public function copy(string $from, string $to): bool
    {
        $from = $this->cleanPath($from);
        $to   = $this->cleanPath($to);

        try {
            return $this->disk()->copy($from, $to);
        } catch (Throwable $e) {
            $this->logError('copy', $e, "{$from} -> {$to}");
            throw new RemoteStorageException("Gagal menyalin file dari '{$from}' ke '{$to}': " . $e->getMessage(), $this->driver, $from, 0, $e);
        }
    }

    /**
     * Pindahkan / rename file di dalam remote storage.
     */
    public function move(string $from, string $to): bool
    {
        $from = $this->cleanPath($from);
        $to   = $this->cleanPath($to);

        try {
            return $this->disk()->move($from, $to);
        } catch (Throwable $e) {
            $this->logError('move', $e, "{$from} -> {$to}");
            throw new RemoteStorageException("Gagal memindahkan file dari '{$from}' ke '{$to}': " . $e->getMessage(), $this->driver, $from, 0, $e);
        }
    }

    /**
     * Format byte ukuran file menjadi format yang mudah dibaca (KB, MB, GB).
     */
    public function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow   = $bytes > 0 ? floor(log($bytes) / log(1024)) : 0;
        $pow   = min($pow, count($units) - 1);

        $bytes /= (1 << (10 * $pow));

        return round($bytes, $precision) . ' ' . $units[$pow];
    }

    /**
     * Bersihkan path dari karakter berlebih.
     */
    protected function cleanPath(string $path): string
    {
        $trimmed = trim($path);
        if ($trimmed === '' || $trimmed === '/' || $trimmed === '.') {
            return '/';
        }
        // Ganti backslash Windows ke forward slash
        $normalized = str_replace('\\', '/', $trimmed);
        return ltrim($normalized, '/');
    }

    /**
     * Pencatatan log terpusat dengan level ERROR.
     */
    protected function logError(string $operation, Throwable $e, ?string $path = null, ?string $overrideDriver = null): void
    {
        $drv = strtoupper($overrideDriver ?: $this->driver);
        Log::error("[{$drv} Storage Error] Gagal menjalankan operasi '{$operation}'", [
            'driver'    => $overrideDriver ?: $this->driver,
            'operation' => $operation,
            'path'      => $path,
            'error'     => $e->getMessage(),
            'code'      => $e->getCode(),
            'file'      => $e->getFile(),
            'line'      => $e->getLine(),
        ]);
    }
}
