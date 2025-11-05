<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
Use App\Http\Controllers\UserController;
use App\Models\User;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');


Route::middleware(['auth', 'verified', 'prevent-back'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');   

    // **This is the correct syntax for passing props to Inertia::render**
    Route::get('/checked-in', function () {
        return Inertia::render('Checked-in/Index', [
            'users' => User::all(), // PHP expects '=>' only within the array here
        ]);
    })->name('checked-in.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
