<?php

use App\Http\Controllers\GuestController;
use App\Http\Controllers\WishController;
use App\Http\Controllers\WeddingSettingController;
use App\Http\Controllers\DashboardController;

Route::get('/', [WeddingSettingController::class, 'welcome'])->name('home');
Route::post('/wishes', [WishController::class, 'store'])->name('wishes.store');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Guest CRUD
    Route::post('dashboard/guests', [GuestController::class, 'store'])->name('guests.store');
    Route::put('dashboard/guests/{guest}', [GuestController::class, 'update'])->name('guests.update');
    Route::delete('dashboard/guests/{guest}', [GuestController::class, 'destroy'])->name('guests.destroy');
    Route::post('dashboard/guests/batch', [GuestController::class, 'batchStore'])->name('guests.batchStore');

    // Wish moderation
    Route::delete('dashboard/wishes/{wish}', [WishController::class, 'destroy'])->name('wishes.destroy');

    // Wedding Settings & music upload
    Route::post('dashboard/settings', [WeddingSettingController::class, 'update'])->name('wedding-settings.update');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
