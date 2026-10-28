<?php
require 'c:/laragon/www/projectcsms/vendor/autoload.php';
$app = require_once 'c:/laragon/www/projectcsms/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// 1. Test unauthenticated request to '/'
$request = Illuminate\Http\Request::create('/', 'GET');
$response = $app->handle($request);
echo "1. Unauthenticated request to '/' => Status: " . $response->getStatusCode() . " | Location: " . $response->headers->get('Location') . "\n";

// 2. Test unauthenticated request to '/csms'
$request = Illuminate\Http\Request::create('/csms', 'GET');
$response = $app->handle($request);
echo "2. Unauthenticated request to '/csms' => Status: " . $response->getStatusCode() . " | Location: " . $response->headers->get('Location') . "\n";

// 3. Test unauthenticated request to '/admin/users'
$request = Illuminate\Http\Request::create('/admin/users', 'GET');
$response = $app->handle($request);
echo "3. Unauthenticated request to '/admin/users' => Status: " . $response->getStatusCode() . " | Location: " . $response->headers->get('Location') . "\n";

// 4. Test authenticated admin request to '/'
$admin = App\Models\User::where('role', 'admin')->first();
Illuminate\Support\Facades\Auth::login($admin);
$request = Illuminate\Http\Request::create('/', 'GET');
$request->setUserResolver(fn() => $admin);
$response = $app->handle($request);
echo "4. Authenticated admin request to '/' => Status: " . $response->getStatusCode() . " | Location: " . $response->headers->get('Location') . "\n";

// 5. Test authenticated crew request to '/'
$crew = App\Models\User::where('role', 'user')->first();
Illuminate\Support\Facades\Auth::login($crew);
$request = Illuminate\Http\Request::create('/', 'GET');
$request->setUserResolver(fn() => $crew);
$response = $app->handle($request);
echo "5. Authenticated crew request to '/' => Status: " . $response->getStatusCode() . " | Location: " . $response->headers->get('Location') . "\n";

// 6. Test unauthenticated request to '/login'
Illuminate\Support\Facades\Auth::logout();
$request = Illuminate\Http\Request::create('/login', 'GET');
$response = $app->handle($request);
echo "6. Unauthenticated request to '/login' => Status: " . $response->getStatusCode() . " (Renders Login page)\n";
