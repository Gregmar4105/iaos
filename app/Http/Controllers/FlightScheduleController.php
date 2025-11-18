<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class FlightScheduleController extends Controller
{
    private const ITEMS_PER_PAGE = 15;
    private const WEBHOOK_URL = 'https://n8n.larable.dev/webhook/flights';

    public function arrivals(Request $request): Response
    {
        $page = max(1, (int) $request->get('page', 1));
        $flights = $this->fetchFlights();
        $arrivals = $this->filterArrivals($flights);
        $paginated = $this->paginate($arrivals, $page);

        return Inertia::render('arrivals', [
            'flights' => $paginated['data'],
            'currentPage' => $paginated['current_page'],
            'lastPage' => $paginated['last_page'],
            'total' => $paginated['total'],
        ]);
    }

    public function departures(Request $request): Response
    {
        $page = max(1, (int) $request->get('page', 1));
        $flights = $this->fetchFlights();
        $departures = $this->filterDepartures($flights);
        $paginated = $this->paginate($departures, $page);

        return Inertia::render('departures', [
            'flights' => $paginated['data'],
            'currentPage' => $paginated['current_page'],
            'lastPage' => $paginated['last_page'],
            'total' => $paginated['total'],
        ]);
    }

    public function schedule(Request $request): Response
    {
        $page = max(1, (int) $request->get('page', 1));
        $flights = $this->fetchFlights();
        $paginated = $this->paginate($flights, $page);

        return Inertia::render('flight-schedule', [
            'flights' => $paginated['data'],
            'currentPage' => $paginated['current_page'],
            'lastPage' => $paginated['last_page'],
            'total' => $paginated['total'],
        ]);
    }

    private function fetchFlights(): array
    {
        try {
            $response = Http::get(self::WEBHOOK_URL);
            $data = $response->json();
            return is_array($data) ? $data : [];
        } catch (\Exception $e) {
            return [];
        }
    }

    private function filterArrivals(array $flights): array
    {
        return array_filter($flights, function ($flight) {
            $status = $flight['fk_id_status_code'] ?? '';
            return str_contains($status, 'ARR') || str_contains($status, '3-');
        });
    }

    private function filterDepartures(array $flights): array
    {
        return array_filter($flights, function ($flight) {
            $status = $flight['fk_id_status_code'] ?? '';
            return str_contains($status, 'DEP') || str_contains($status, '2-');
        });
    }

    private function paginate(array $items, int $page): array
    {
        $total = count($items);
        $lastPage = max(1, (int) ceil($total / self::ITEMS_PER_PAGE));
        $currentPage = min($page, $lastPage);
        $offset = ($currentPage - 1) * self::ITEMS_PER_PAGE;

        $paginatedItems = array_slice($items, $offset, self::ITEMS_PER_PAGE);

        return [
            'data' => array_values($paginatedItems),
            'current_page' => $currentPage,
            'last_page' => $lastPage,
            'total' => $total,
            'per_page' => self::ITEMS_PER_PAGE,
        ];
    }
}

