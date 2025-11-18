import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { dashboard, home, login, searchFlights, sendFlight } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import {
    ArrowLeftIcon,
    CalendarIcon,
    ChevronRightIcon,
    MapPinIcon,
    NavigationIcon,
    PlaneIcon,
    SearchIcon,
    ShieldIcon,
    UserRoundIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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
    fk_id_status_code: string;
};

interface SearchFlightsProps extends SharedData {
    searchParams?: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Search flights',
        href: searchFlights().url,
    },
];

const flightsEndpoint = 'https://n8n.larable.dev/webhook/flights';

const normalizeCode = (value?: string) => value?.trim().toUpperCase() ?? '';

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

export default function SearchFlights({ searchParams = {} }: SearchFlightsProps) {
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = !!auth?.user;
    const [flights, setFlights] = useState<FlightRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bookingFlightId, setBookingFlightId] = useState<number | null>(null);
    const [bookingFeedback, setBookingFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        const loadFlights = async () => {
            try {
                setError(null);
                const response = await fetch(flightsEndpoint, { signal: controller.signal });
                if (!response.ok) {
                    throw new Error('Unable to retrieve flights');
                }
                const data = (await response.json()) as FlightRecord[];
                setFlights(Array.isArray(data) ? data : []);
            } catch (err) {
                if ((err as Error).name === 'AbortError') return;
                setError('We could not load flight availability right now. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        loadFlights();
        return () => controller.abort();
    }, []);

    const desiredOrigin = normalizeCode(searchParams.departureCode ?? searchParams.origin_code);
    const desiredDestination = normalizeCode(searchParams.destinationCode ?? searchParams.destination_code);

    const filteredFlights = useMemo(() => {
        return flights.filter((flight) => {
            if (desiredOrigin && normalizeCode(flight.origin_code) !== desiredOrigin) {
                return false;
            }
            if (desiredDestination && normalizeCode(flight.destination_code) !== desiredDestination) {
                return false;
            }
            return true;
        });
    }, [flights, desiredOrigin, desiredDestination]);

    const handleBookFlight = async (flight: FlightRecord) => {
        if (!isAuthenticated) {
            router.visit(
                login.url({
                    query: {
                        redirect: searchFlights.url({ query: searchParams }),
                    },
                })
            );
            return;
        }

        setBookingFlightId(flight.id);
        setBookingFeedback(null);

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content;

            const response = await fetch(sendFlight.url(), {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken ?? '',
                },
                body: JSON.stringify({
                    flight,
                    search_context: searchParams,
                }),
            });

            if (!response.ok) {
                const problem = await response.json().catch(() => null);
                throw new Error(problem?.message ?? 'Unable to send flight to PMS');
            }

            setBookingFeedback({
                type: 'success',
                message: 'Flight manifest sent to PMS successfully.',
            });
        } catch (bookingError) {
            setBookingFeedback({
                type: 'error',
                message: 'We could not confirm this booking handoff. Please try again.',
            });
        } finally {
            setBookingFlightId(null);
        }
    };

    const tripDescriptor =
        searchParams.tripType === 'multi-city'
            ? 'Multi-city itinerary'
            : searchParams.tripType === 'one-way'
            ? 'One-way flight'
            : 'Round trip';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Search Flights" />
            <div className="flex flex-1 flex-col gap-8 rounded-xl p-4">
                <section className="rounded-3xl border border-slate-200 bg-white shadow-lg">
                    <div className="flex flex-wrap gap-4 border-b border-slate-100 px-6 py-4">
                        <button
                            type="button"
                            onClick={() => router.visit(home().url)}
                            className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                            <ArrowLeftIcon className="mr-1 h-4 w-4" />
                            Modify search
                        </button>
                        <div className="inline-flex items-center text-sm font-semibold text-slate-500">
                            <PlaneIcon className="mr-2 h-4 w-4 text-orange-500" />
                            {tripDescriptor}
                        </div>
                        <div className="inline-flex items-center text-sm font-semibold text-slate-500">
                            <UserRoundIcon className="mr-2 h-4 w-4 text-orange-500" />
                            {searchParams.pax ?? 'Travelers TBD'} · {searchParams.cabin ?? 'Cabin TBD'}
                        </div>
                    </div>
                    <div className="grid gap-6 px-6 py-6 md:grid-cols-3">
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase text-slate-500">Departure</p>
                            <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
                                <MapPinIcon className="h-5 w-5 text-orange-500" />
                                {searchParams.departure ?? 'Any origin'}
                            </div>
                            <p className="text-sm text-slate-500">{searchParams.departureDate ?? 'Flexible date'}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase text-slate-500">Destination</p>
                            <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
                                <NavigationIcon className="h-5 w-5 text-orange-500" />
                                {searchParams.destination || 'Any destination'}
                            </div>
                            <p className="text-sm text-slate-500">
                                {searchParams.tripType === 'one-way'
                                    ? 'Direct arrival'
                                    : searchParams.returnDate ?? 'Return date TBD'}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                            <p className="text-xs font-semibold uppercase text-emerald-700">Status</p>
                            <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-emerald-900">
                                <SearchIcon className="h-5 w-5" />
                                {loading ? 'Scanning schedules' : `${filteredFlights.length} flights available`}
                            </div>
                            <p className="text-sm text-emerald-700">
                                Real-time schedule feed from network control center.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white shadow-lg">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <div>
                            <p className="text-xs font-semibold uppercase text-slate-500">Available flights</p>
                            <h2 className="text-2xl font-semibold text-slate-900">
                                {loading ? 'Loading schedules' : `${filteredFlights.length} matching departures`}
                            </h2>
                        </div>
                        <div className="text-xs font-semibold uppercase text-emerald-600">
                            Live feed via operations webhook
                        </div>
                    </div>

                    {error && (
                        <div className="mx-6 mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}
                    {bookingFeedback && (
                        <div
                            className={`mx-6 mt-4 rounded-2xl border p-4 text-sm ${
                                bookingFeedback.type === 'success'
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                    : 'border-red-200 bg-red-50 text-red-700'
                            }`}
                        >
                            {bookingFeedback.message}
                        </div>
                    )}

                    {loading ? (
                        <div className="grid gap-4 p-6 md:grid-cols-2">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="animate-pulse rounded-2xl border border-slate-100 p-4">
                                    <div className="h-4 w-24 rounded bg-slate-200" />
                                    <div className="mt-4 h-6 w-3/4 rounded bg-slate-200" />
                                    <div className="mt-2 h-4 w-1/2 rounded bg-slate-100" />
                                </div>
                            ))}
                        </div>
                    ) : filteredFlights.length === 0 ? (
                        <div className="px-6 py-10 text-center">
                            <ShieldIcon className="mx-auto mb-4 h-10 w-10 text-slate-300" />
                            <p className="text-lg font-semibold text-slate-900">No flights match this search</p>
                            <p className="mt-2 text-sm text-slate-500">
                                Adjust your dates or select a nearby airport to reveal additional departures.
                            </p>
                            <Link
                                href={home().url}
                                className="mt-6 inline-flex items-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
                            >
                                Start a new search
                                <ChevronRightIcon className="ml-2 h-4 w-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredFlights.map((flight) => (
                                <div key={flight.id} className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
                                    <div className="flex flex-1 flex-col gap-3">
                                        <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
                                            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                                {flight.airline_code} {flight.flight_number}
                                            </span>
                                            <span className="text-slate-400">•</span>
                                            <span>{flight.aircraft_icao_code}</span>
                                            <span className="text-slate-400">•</span>
                                            <span>{flight.fk_id_status_code}</span>
                                        </div>
                                        <div className="text-2xl font-semibold text-slate-900">
                                            {flight.origin_code} → {flight.destination_code}
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                            <span className="inline-flex items-center gap-2">
                                                <CalendarIcon className="h-4 w-4 text-orange-500" />
                                                {formatDate(flight.scheduled_departure_time)}
                                            </span>
                                            <span className="inline-flex items-center gap-2">
                                                <CalendarIcon className="h-4 w-4 text-emerald-500" />
                                                {formatDate(flight.scheduled_arrival_time)}
                                            </span>
                                            <span className="inline-flex items-center gap-2">
                                                <NavigationIcon className="h-4 w-4 text-slate-400" />
                                                Terminal {flight.fk_id_terminal_code} · Gate {flight.fk_id_gate_code}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-shrink-0 flex-col items-stretch gap-3 md:w-60">
                                        <button
                                            onClick={() => handleBookFlight(flight)}
                                            disabled={bookingFlightId === flight.id}
                                            className="rounded-2xl bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            {bookingFlightId === flight.id
                                                ? 'Dispatching...'
                                                : isAuthenticated
                                                ? 'Book this flight'
                                                : 'Sign in to book'}
                                        </button>
                                        <p className="text-xs text-slate-500">
                                            Booking requires an authenticated session to protect itinerary data.
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}

