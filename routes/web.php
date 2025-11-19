<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\FlightBookingController;
use App\Http\Controllers\FlightScheduleController;
use App\Http\Controllers\BookingsController;
use App\Http\Controllers\OperationsPageController;

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

Route::get('/baggage', [OperationsPageController::class, 'baggage'])->name('baggage.index');
Route::get('/checked-in', [OperationsPageController::class, 'checkedIn'])->name('checked-in.index');
Route::get('/notams', [OperationsPageController::class, 'notams'])->name('notams.index');
Route::get('/safety-measures', [OperationsPageController::class, 'safetyMeasures'])->name('safety-measures.index');
Route::get('/weather-updates', [OperationsPageController::class, 'weatherUpdates'])->name('weather-updates.index');
Route::get('/api/weather', [OperationsPageController::class, 'weatherLookup'])->name('weather.lookup');

Route::get('/arrivals', [FlightScheduleController::class, 'arrivals'])->name('flights.arrivals');
Route::get('/departures', [FlightScheduleController::class, 'departures'])->name('flights.departures');
Route::get('/flight-schedule', [FlightScheduleController::class, 'schedule'])->name('flights.schedule');
Route::post('/send-flight', FlightBookingController::class)
    ->middleware(['auth', 'throttle:60,1'])
    ->name('sendFlight');
Route::get('/search-flights', function () {
    // We'll use the environment variable for the external webhook URL as it's best practice.
    // The component's hardcoded URL is 'https://n8n.larable.dev/webhook/flights'.
    $n8n_webhook_url = env('N8N_GET_NOTAMS', 'https://n8n.larable.dev/webhook/flights'); 
    
    $flights_data = [];
    $error_message = null;

    if ($n8n_webhook_url) {
        try {
            // Fetch data from the external source with a timeout
            $response = Http::timeout(5)->get($n8n_webhook_url);

            if ($response->successful()) {
                $raw_data = $response->json();
                
                // Ensure data is an array of flight records
                if (is_array($raw_data)) {
                    $flights_data = $raw_data;
                } else {
                    $error_message = 'External API call succeeded, but returned data in an unexpected format.';
                }

            } else {
                // Handle non-200 responses (4xx, 5xx)
                $error_message = 'Failed to load flight schedule (Status: ' . $response->status() . ').';
            }

        } catch (\Exception $e) {
            // Handle network/connection errors (e.g., DNS error, timeout)
            $error_message = 'Network error: Could not connect to the flight data source.';
        }
    } else {
        $error_message = 'Flight data endpoint is not configured in the environment file.';
    }
    
    // Render the 'SearchFlights' Inertia component. 
    // The component will now receive the data and status immediately as props.
    return Inertia::render('SearchFlights', [
        // 1. Pass the URL query parameters for filtering and display
        'searchParams'    => request()->query(),
        
        // 2. Pass the fetched data array (what the component was setting to its 'flights' state)
        'flightsData'     => $flights_data, 
        
        // 3. Pass any server-side fetch errors
        'serverError'     => $error_message, 
        
        // Note: The 'loading' state is false here because the server request is complete.
        // The component will need to remove its own client-side fetch logic.
    ]);
})->name('searchFlights');

Route::middleware(['auth', 'verified', 'prevent-back'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');   

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
