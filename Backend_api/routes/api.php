<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\ImageController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\CheckoutController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\V1\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\V1\Admin\UserController as AdminUserController;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:api');
    Route::post('refresh', [AuthController::class, 'refresh'])->middleware('auth:api');
    Route::get('user', [AuthController::class, 'user'])->middleware('auth:api');
    Route::put('profile', [AuthController::class, 'updateProfile'])->middleware('auth:api');
});

Route::prefix('v1')->group(function () {

    // ===== AUTENTICACIÓN =====
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:api');
        Route::post('refresh', [AuthController::class, 'refresh'])->middleware('auth:api');
        Route::get('user', [AuthController::class, 'user'])->middleware('auth:api');
        Route::put('profile', [AuthController::class, 'updateProfile'])->middleware('auth:api');
        Route::post('/upload-image', [ImageController::class, 'upload'])->middleware('auth:api');
    });

    // ===== CATÁLOGO =====
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/featured', [ProductController::class, 'featured']);
    Route::get('products/search', [ProductController::class, 'search']);
    Route::get('products/{id}', [ProductController::class, 'show']);
    Route::get('products/{id}/related', [ProductController::class, 'related']);
    Route::get('product/{slug}', [ProductController::class, 'showBySlug']);

    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('categories/{id}', [CategoryController::class, 'show']);
    Route::get('categories/slug/{slug}', [CategoryController::class, 'showBySlug']);
    Route::get('categories/{slug}/products', [CategoryController::class, 'products']);

    // ===== CARRITO (con middleware web para sesión) =====
    Route::middleware(['web'])->group(function () {
        Route::get('cart', [CartController::class, 'index']);
        Route::post('cart/add', [CartController::class, 'add']);
        Route::put('cart/update', [CartController::class, 'update']);
        Route::delete('cart/remove/{itemId}', [CartController::class, 'remove']);
        Route::delete('cart/clear', [CartController::class, 'clear']);
    });

    // ===== RUTAS PROTEGIDAS (Admin) =====
    Route::middleware(['auth:api'])->group(function () {
        Route::post('admin/products', [ProductController::class, 'store']);
        Route::put('admin/products/{id}', [ProductController::class, 'update']);
        Route::delete('admin/products/{id}', [ProductController::class, 'destroy']);

        Route::post('admin/categories', [CategoryController::class, 'store']);
        Route::put('admin/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('admin/categories/{id}', [CategoryController::class, 'destroy']);
    });


    // ===== CHECKOUT =====
    Route::middleware(['auth:api'])->group(function () {
        Route::post('checkout/process', [CheckoutController::class, 'process']);
        Route::get('orders', [CheckoutController::class, 'orders']);
        Route::get('orders/{id}', [CheckoutController::class, 'order']);
    });

    // Ruta de prueba para simular pago (sin autenticación)
    Route::post('checkout/simulate-payment/{orderId}', [CheckoutController::class, 'simulatePayment']);


    // ===== ADMINISTRACIÓN =====
    Route::middleware(['auth:api'])->prefix('admin')->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index']);

        Route::get('products', [AdminProductController::class, 'index']);
        Route::get('products/{id}', [AdminProductController::class, 'show']);   // ✅ AGREGAR ESTA LÍNEA
        Route::post('products', [AdminProductController::class, 'store']);
        Route::put('products/{id}', [AdminProductController::class, 'update']);
        Route::delete('products/{id}', [AdminProductController::class, 'destroy']);

        Route::get('orders', [AdminOrderController::class, 'index']);
        Route::get('orders/{id}', [AdminOrderController::class, 'show']);
        Route::put('orders/{id}/status', [AdminOrderController::class, 'updateStatus']);

        Route::get('users', [AdminUserController::class, 'index']);
        Route::put('users/{id}/role', [AdminUserController::class, 'updateRole']);
    });
});
