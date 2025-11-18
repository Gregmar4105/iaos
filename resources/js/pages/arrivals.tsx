import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { dashboard, home } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { ArrowLeftIcon, CalendarIcon, MapPinIcon, PlaneLanding } from 'lucide-react';

type FlightRecord = {
    id: number;
    flight_number: string;
    airline_code: string;
    origin_code: string;
    destination_code: string;
    aircraft_icao_code: string;
    scheduled_departure_time: string;
    scheduled_arrival_time: string;
    fk_id_terminal_code: string;
    fk_id_gate_code: string;
    fk_id_belt_code: string;
    fk_id_status_code: string;
};

interface ArrivalsProps extends SharedData {
    flights: FlightRecord[];
    currentPage: number;
    lastPage: number;
    total: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Arrivals',
        href: '/arrivals',
    },
];

const formatDate = (value?: string) => {
    if (!value) return '—';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
        ? value
        : parsed.toLocaleString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          });
};

export default function Arrivals({ flights, currentPage, lastPage, total }: ArrivalsProps) {
    const handlePageChange = (page: number) => {
        router.visit(`/arrivals?page=${page}`, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Arrivals" />
            <div className="flex flex-1 flex-col gap-8 rounded-xl p-4">
                <section className="rounded-3xl border border-slate-200 bg-white shadow-lg">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => router.visit(home().url)}
                                className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50"
                            >
                                <ArrowLeftIcon className="mr-1 h-4 w-4" />
                                Back
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Arrivals</h1>
                                <p className="text-sm text-slate-600">Showing {flights.length} of {total} arrival flights</p>
                            </div>
                        </div>
                        <PlaneLanding className="h-8 w-8 text-orange-500" />
                    </div>

                    <div className="divide-y divide-slate-100">
                        {flights.length === 0 ? (
                            <div className="px-6 py-12 text-center text-slate-500">
                                <p>No arrival flights found.</p>
                            </div>
                        ) : (
                            flights.map((flight) => (
                                <div key={flight.id} className="px-6 py-5 hover:bg-slate-50 transition-colors">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                                        {/* Flight Info Section */}
                                        <div className="lg:col-span-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-xl font-bold text-slate-900">{flight.flight_number}</span>
                                                <span className="text-sm font-medium text-slate-600">{flight.airline_code}</span>
                                                <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold">
                                                    {flight.fk_id_status_code}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <MapPinIcon className="h-4 w-4" />
                                                <span className="font-semibold">{flight.origin_code}</span>
                                                <span className="text-slate-400">→</span>
                                                <span className="font-semibold">{flight.destination_code}</span>
                                            </div>
                                        </div>

                                        {/* Arrival Time Section */}
                                        <div className="lg:col-span-3">
                                            <p className="text-xs text-slate-500 mb-1">Scheduled Arrival</p>
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="h-4 w-4 text-slate-400" />
                                                <span className="font-semibold text-slate-900 text-sm">{formatDate(flight.scheduled_arrival_time)}</span>
                                            </div>
                                        </div>

                                        {/* Details Section */}
                                        <div className="lg:col-span-5 grid grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Aircraft</p>
                                                <span className="font-medium text-slate-700 text-sm">{flight.aircraft_icao_code}</span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Terminal / Gate</p>
                                                <span className="font-medium text-slate-700 text-sm">
                                                    {flight.fk_id_terminal_code} / {flight.fk_id_gate_code}
                                                </span>
                                            </div>
                                            {flight.fk_id_belt_code && (
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">Belt</p>
                                                    <span className="font-medium text-slate-700 text-sm">{flight.fk_id_belt_code}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {lastPage > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                            <p className="text-sm text-slate-600">
                                Page {currentPage} of {lastPage}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === lastPage}
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}

