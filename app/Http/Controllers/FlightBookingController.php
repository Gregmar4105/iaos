<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;

class FlightBookingController extends Controller
{
    /**
     * Send the selected flight together with the authenticated user to the PMS webhook.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'flight.id' => ['required'],
            'flight.flight_number' => ['required', 'string'],
            'flight.airline_code' => ['required', 'string'],
            'flight.origin_code' => ['required', 'string'],
            'flight.destination_code' => ['required', 'string'],
            'flight.aircraft_icao_code' => ['required', 'string'],
            'flight.scheduled_departure_time' => ['required', 'string'],
            'flight.scheduled_arrival_time' => ['required', 'string'],
            'flight.fk_id_terminal_code' => ['nullable', 'string'],
            'flight.fk_id_gate_code' => ['nullable', 'string'],
            'flight.fk_id_status_code' => ['nullable', 'string'],
            'search_context' => ['array', 'nullable'],
        ]);

        $user = $request->user();

        $payload = [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'flight' => $validated['flight'],
            'search_context' => $validated['search_context'] ?? [],
            'meta' => [
                'source' => 'iaos-ops-dashboard',
                'timestamp' => now()->toIso8601String(),
            ],
        ];

        $webhookUrl = config('services.n8n.send_flight_to_pms', 'https://n8n.larable.dev/webhook/send-flight-to-pms');

        try {
            $response = Http::post($webhookUrl, $payload);

            if (!$response->successful()) {
                return response()->json([
                    'message' => 'Failed to dispatch flight data to PMS.',
                    'details' => $response->json(),
                ], 502);
            }

            return response()->json([
                'message' => 'Flight dispatched to PMS successfully.',
            ]);
        } catch (\Throwable $throwable) {
            report($throwable);

            return response()->json([
                'message' => 'Unexpected error while sending flight to PMS.',
            ], 500);
        }
    }
}

