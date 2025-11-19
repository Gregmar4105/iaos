<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OperationsPageController extends Controller
{
    public function baggage(): Response
    {
        $payload = $this->fetchCollection(config('services.n8n.get_baggages'));

        return Inertia::render('Baggage', [
            'baggages' => $payload['data'],
            'error' => $payload['error'],
        ]);
    }

    public function checkedIn(): Response
    {
        $payload = $this->fetchCollection(config('services.n8n.get_checked_in'));

        return Inertia::render('Checked-in/Index', [
            'passengers' => $payload['data'],
            'error' => $payload['error'],
        ]);
    }

    public function notams(): Response
    {
        $payload = $this->fetchCollection(config('services.n8n.get_notams'));

        return Inertia::render('Notams', [
            'notams' => $payload['data'],
            'error' => $payload['error'],
        ]);
    }

    public function safetyMeasures(): Response
    {
        $payload = $this->fetchCollection(config('services.n8n.get_notams'));

        return Inertia::render('SafetyMeasures', [
            'guidelines' => $this->buildSafetyGuidelines($payload['data']),
            'error' => $payload['error'],
        ]);
    }

    public function weatherUpdates(Request $request): Response
    {
        $city = trim((string) $request->query('city', ''));
        $weatherPayload = [
            'data' => null,
            'error' => null,
        ];

        if ($city !== '') {
            $weatherPayload = $this->fetchWeather($city);
        }

        return Inertia::render('WeatherUpdates', [
            'query' => $city,
            'weather' => $weatherPayload['data'],
            'error' => $weatherPayload['error'],
        ]);
    }

    public function weatherLookup(Request $request)
    {
        $city = trim((string) $request->query('city', ''));

        if ($city === '') {
            return response()->json([
                'error' => 'City is required.',
            ], 422);
        }

        $payload = $this->fetchWeather($city);

        if ($payload['error']) {
            return response()->json([
                'error' => $payload['error'],
            ], 502);
        }

        return response()->json([
            'data' => $payload['data'],
        ]);
    }

    /**
     * @return array{data: array<int, mixed>, error: string|null}
     */
    protected function fetchCollection(?string $url): array
    {
        if (blank($url)) {
            return [
                'data' => [],
                'error' => 'The data source is not configured.',
            ];
        }

        try {
            $response = Http::timeout(10)->get($url);

            if ($response->successful()) {
                $data = $response->json();

                return [
                    'data' => is_array($data) ? $data : [],
                    'error' => null,
                ];
            }

            return [
                'data' => [],
                'error' => 'Failed to load data (HTTP '.$response->status().').',
            ];
        } catch (\Throwable $exception) {
            return [
                'data' => [],
                'error' => 'Unable to reach the data source.',
            ];
        }
    }

    /**
     * @return array{data: mixed, error: string|null}
     */
    protected function fetchWeather(string $city): array
    {
        $url = config('services.n8n.weather_lookup');

        if (blank($url)) {
            return [
                'data' => null,
                'error' => 'Weather endpoint is not configured.',
            ];
        }

        try {
            $response = Http::timeout(10)->get($url, [
                'city' => $city,
            ]);

            if ($response->successful()) {
                return [
                    'data' => $response->json(),
                    'error' => null,
                ];
            }

            return [
                'data' => null,
                'error' => 'Unable to fetch weather data (HTTP '.$response->status().').',
            ];
        } catch (\Throwable $exception) {
            return [
                'data' => null,
                'error' => 'Unable to reach the weather service.',
            ];
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $notams
     * @return array<int, array<string, mixed>>
     */
    protected function buildSafetyGuidelines(array $notams): array
    {
        return collect($notams)
            ->map(function (array $notam) {
                $message = (string) ($notam['message'] ?? '');
                $severity = $this->determineSeverity($message);

                return [
                    'airport_id' => $notam['airport_id'] ?? 'N/A',
                    'city' => $notam['city'] ?? 'Unknown',
                    'severity' => $severity,
                    'summary' => Str::of($message)->limit(220),
                    'recommendations' => $this->recommendationsFromMessage($message, $severity),
                ];
            })
            ->values()
            ->all();
    }

    protected function determineSeverity(string $message): string
    {
        $normalized = Str::lower($message);

        if (Str::contains($normalized, ['severe', 'thunderstorm', 'not advised'])) {
            return 'critical';
        }

        if (Str::contains($normalized, ['delay', 'light rain', 'scattered clouds'])) {
            return 'caution';
        }

        return 'normal';
    }

    /**
     * @return string[]
     */
    protected function recommendationsFromMessage(string $message, string $severity): array
    {
        $normalized = Str::lower($message);
        $tips = [];

        if (Str::contains($normalized, 'thunderstorm')) {
            $tips[] = 'Suspend ramp operations and secure ground equipment until lightning clears.';
            $tips[] = 'Coordinate with ATC for reroutes or slot swaps due to convective weather.';
        }

        if (Str::contains($normalized, 'delay')) {
            $tips[] = 'Provide updated ETAs to gate agents and passengers every 15 minutes.';
            $tips[] = 'Re-sequence departures/arrivals to minimize taxi congestion.';
        }

        if (Str::contains($normalized, 'light rain')) {
            $tips[] = 'Increase braking action advisories and ensure runway friction data is current.';
        }

        if (Str::contains($normalized, ['clear sky', 'few clouds'])) {
            $tips[] = 'Maintain standard visual separation and continue routine safety sweeps.';
        }

        if ($severity === 'critical') {
            $tips[] = 'Activate the airport emergency response checklist and keep ops supervisors on standby.';
        } elseif ($severity === 'caution') {
            $tips[] = 'Heighten monitoring cadence and keep maintenance crews on alert.';
        } else {
            $tips[] = 'Continue normal operations while monitoring NOTAM updates hourly.';
        }

        return array_values(array_unique($tips));
    }
}

