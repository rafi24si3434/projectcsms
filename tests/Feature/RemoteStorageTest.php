<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\RemoteStorageService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RemoteStorageTest extends TestCase
{
    /**
     * Uji instansiasi dan method switching pada RemoteStorageService.
     */
    public function test_service_can_switch_drivers(): void
    {
        $service = new RemoteStorageService();
        $this->assertEquals(RemoteStorageService::DRIVER_SFTP, $service->getDriver());

        $service->ftp();
        $this->assertEquals(RemoteStorageService::DRIVER_FTP, $service->getDriver());

        $service->sftp();
        $this->assertEquals(RemoteStorageService::DRIVER_SFTP, $service->getDriver());

        $service->setDriver('ftp');
        $this->assertEquals('ftp', $service->getDriver());
    }

    /**
     * Uji operasi upload, list, get, exists, download, dan delete menggunakan fake disk.
     */
    public function test_storage_operations_work_with_storage_disk(): void
    {
        // Fake disk SFTP untuk pengujian operasi internal tanpa membutuhkan remote server fisik
        Storage::fake('sftp');

        $service = new RemoteStorageService(RemoteStorageService::DRIVER_SFTP);

        // 1. Upload string content
        $uploadResult = $service->uploadContent('reports/sample.txt', 'Hello Remote SFTP Storage');
        $this->assertTrue($uploadResult['success']);
        $this->assertEquals('reports/sample.txt', $uploadResult['path']);

        // 2. Cek keberadaan file (exists)
        $this->assertTrue($service->exists('reports/sample.txt'));
        $this->assertFalse($service->exists('reports/nonexistent.txt'));

        // 3. Baca isi file (get)
        $content = $service->get('reports/sample.txt');
        $this->assertEquals('Hello Remote SFTP Storage', $content);

        // 4. Ambil daftar file (listFiles)
        $files = $service->listFiles('reports');
        $this->assertCount(1, $files);
        $this->assertEquals('sample.txt', $files[0]['name']);
        $this->assertEquals('txt', $files[0]['extension']);

        // 5. Upload file HTTP (UploadedFile)
        $fakeFile = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');
        $fileUploadResult = $service->uploadFile('documents', $fakeFile);
        $this->assertTrue($fileUploadResult['success']);
        $this->assertTrue($service->exists($fileUploadResult['path']));

        // 6. Download file (HTTP StreamedResponse)
        $response = $service->download('reports/sample.txt');
        $this->assertEquals(200, $response->getStatusCode());

        // 7. Hapus file (delete)
        $this->assertTrue($service->delete('reports/sample.txt'));
        $this->assertFalse($service->exists('reports/sample.txt'));
    }

    /**
     * Uji endpoint controller via HTTP request (dengan autentikasi admin).
     */
    public function test_controller_endpoints_work_correctly(): void
    {
        Storage::fake('sftp');

        $admin = new User([
            'id'     => 1,
            'name'   => 'Admin HSE',
            'role'   => 'admin',
            'status' => 'active',
        ]);
        $admin->id = 1;

        // 1. Test upload API
        $fakeFile = UploadedFile::fake()->create('test_upload.pdf', 50, 'application/pdf');
        $response = $this->actingAs($admin)
            ->postJson('/admin/remote-storage/upload', [
                'driver'    => 'sftp',
                'file'      => $fakeFile,
                'directory' => 'test-uploads',
            ]);

        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
        ]);

        $uploadedPath = $response->json('data.path');

        // 2. Test list files API
        $listResponse = $this->actingAs($admin)
            ->getJson('/admin/remote-storage/files?driver=sftp&path=test-uploads');

        $listResponse->assertStatus(200);
        $listResponse->assertJson([
            'success'     => true,
            'driver'      => 'sftp',
            'total_files' => 1,
        ]);

        // 3. Test preview API
        $previewResponse = $this->actingAs($admin)
            ->getJson('/admin/remote-storage/preview?driver=sftp&path=' . urlencode($uploadedPath));

        $previewResponse->assertStatus(200);

        // 4. Test delete API
        $deleteResponse = $this->actingAs($admin)
            ->deleteJson('/admin/remote-storage/delete', [
                'driver' => 'sftp',
                'path'   => $uploadedPath,
            ]);

        $deleteResponse->assertStatus(200);
        $deleteResponse->assertJson([
            'success' => true,
        ]);
    }

    /**
     * Uji try-catch error handling saat server remote tidak aktif / offline.
     */
    public function test_connection_test_returns_graceful_failure_when_offline(): void
    {
        $service = new RemoteStorageService(RemoteStorageService::DRIVER_SFTP);

        // Test connection ke host dummy 127.0.0.1:22222 yang pasti offline
        config(['filesystems.disks.sftp.host' => '127.0.0.1']);
        config(['filesystems.disks.sftp.port' => 22222]);
        config(['filesystems.disks.sftp.timeout' => 1]);

        $result = $service->testConnection('sftp');

        // Harus mengembalikan array status tanpa unhandled exception / crash
        $this->assertIsArray($result);
        $this->assertFalse($result['success']);
        $this->assertEquals('sftp', $result['driver']);
        $this->assertStringContainsString('Gagal', $result['message']);
    }
}
