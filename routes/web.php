<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\CsmsController;

/*
|--------------------------------------------------------------------------
| AUTHENTICATION & LOGIN
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect()->route('csms.dashboard');
});

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.attempt');
Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
Route::post('/register', [AuthController::class, 'register'])->name('register.attempt');
Route::match(['get', 'post'], '/logout', [AuthController::class, 'logout'])->name('logout');

// FORGOT & RESET PASSWORD
Route::get('/forgot-password', [AuthController::class, 'showForgotPassword'])->name('password.request');
Route::post('/forgot-password', [AuthController::class, 'sendResetLinkEmail'])->name('password.email');
Route::get('/reset-password/{token}', [AuthController::class, 'showResetPassword'])->name('password.reset');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('password.update');

/*
|--------------------------------------------------------------------------
| CSMS STORAGE (PENYIMPANAN DATA REKAMAN CSMS 20 RIGS)
|--------------------------------------------------------------------------
*/
Route::middleware(['role:user,admin'])->group(function () {
    Route::get('/csms', [CsmsController::class, 'index'])->name('csms.dashboard');
    Route::get('/csms/input-rig/{rig_id?}', [CsmsController::class, 'userRigInput'])->name('csms.user-rig-input');
    Route::get('/user/input-data', [CsmsController::class, 'userRigInput'])->name('user.input-data');
    Route::get('/csms/rig/{id}', [CsmsController::class, 'showRig'])->name('csms.rig-detail');
    Route::post('/csms/upload', [CsmsController::class, 'uploadRecord'])->name('csms.upload');
    Route::delete('/csms/record/{id}', [CsmsController::class, 'deleteRecord'])->name('csms.delete');
});

/*
|--------------------------------------------------------------------------
| ADMIN CSMS MANAGEMENT & VERIFICATION
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->middleware(['role:admin'])->group(function () {

    Route::get('/dashboard', [CsmsController::class, 'index'])->name('admin.dashboard');
    Route::get('/csms', [CsmsController::class, 'index'])->name('admin.csms');

    // CSMS Verification & ACC Routes
    Route::get('/csms/verification', function () {
        return redirect('/csms/input-rig');
    })->name('admin.csms.verification');
    Route::post('/csms/verify/{id}', [CsmsController::class, 'verifyRecord'])->name('admin.csms.verify');
    Route::post('/csms/verify-bulk', [CsmsController::class, 'verifyBulk'])->name('admin.csms.verify-bulk');

    // User Management
    Route::get('/users', [UserController::class, 'index'])->name('admin.users');
    Route::post('/users', [UserController::class, 'store'])->name('admin.users.store');
    Route::put('/users/{id}', [UserController::class, 'update'])->name('admin.users.update');
    Route::patch('/users/{id}/toggle-status', [UserController::class, 'toggleStatus'])->name('admin.users.toggle-status');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('admin.users.destroy');

    // Settings
    Route::get('/settings', [SettingController::class, 'index'])->name('admin.settings');
    Route::post('/settings/profile', [SettingController::class, 'updateProfile'])->name('admin.settings.profile');
    Route::post('/settings/password', [SettingController::class, 'updatePassword'])->name('admin.settings.password');
});

// Fallback route untuk file storage publik (memastikan berkas selalu dapat diakses dan tidak pernah 403 Forbidden)
Route::get('/storage/{path}', function (string $path) {
    if (\Illuminate\Support\Facades\Storage::disk('public')->exists($path)) {
        return \Illuminate\Support\Facades\Storage::disk('public')->response($path);
    }
    abort(404, 'Berkas tidak ditemukan.');
})->where('path', '.*');