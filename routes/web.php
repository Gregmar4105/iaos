<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
Use App\Http\Controllers\UserController;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use App\Http\Controllers\FlightBookingController;
use App\Http\Controllers\FlightScheduleController;
use App\Http\Controllers\BookingsController;

Route::get('/', function () {
    $n8n_webhook_url = env('N8N_GET_NOTAMS');
    $notams = []; // Initialize an empty array for safety

    try {
        // 1. Fetch the NOTAM data
        $res = Http::get($n8n_webhook_url);
        
        // 2. Decode the JSON response
        // Use ->json() to convert the response body into a PHP array
        $notams = $res->json();
        
    } catch (\Exception $e) {
        $notams = [];
    }
    return Inertia::render('welcome', [
        'flightNotams' => $notams,
        'isNotamsLoading' => false,
    ]);
})->name('home');

Route::get('/search-flights', function (Request $request) {
    return Inertia::render('search-flights', [
        'searchParams' => $request->all(),
    ]);
})->name('flights.search');

Route::get('/arrivals', [FlightScheduleController::class, 'arrivals'])->name('flights.arrivals');
Route::get('/departures', [FlightScheduleController::class, 'departures'])->name('flights.departures');
Route::get('/flight-schedule', [FlightScheduleController::class, 'schedule'])->name('flights.schedule');


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


    Route::get('/get-notams', function () {
        $n8n_webhook_url = env('N8N_GET_NOTAMS');

        try {
            $res = Http::get($n8n_webhook_url);
            return $res->json();
        } catch (\Exception $e) {
            return [];
        }
    });

    Route::post('/book-flight', FlightBookingController::class)->name('flights.send');
    Route::get('/bookings', [BookingsController::class, 'index'])->name('bookings.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
