import { dashboard, login, register, searchFlights } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { can } from '@/lib/can'; // For the register link check
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    Activity,
    ArrowRightIcon,
    CalendarIcon,
    Clock,
    Gauge,
    Info,
    PlaneLanding,
    PlaneTakeoff,
    Radar,
    Route,
    Shield,
    UserIcon,
    Users,
} from 'lucide-react';
import { ChevronRightIcon, InfoIcon, GiftIcon, ZapIcon } from 'lucide-react';
import { useState, type CSSProperties, type ReactNode } from 'react'; // Import hooks for loading simulation/control

// --- Utility Components (for better readability) ---

// Tailwind CSS Spinner/Skeleton Utility
const NotamLoadingSkeleton = () => (
    <li className="p-4 sm:p-6 animate-pulse">
        <div className="flex items-center justify-between">
            {/* Title/Effective Date Skeleton */}
            <div>
                <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
            {/* Status Icon Skeleton */}
            <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
        </div>
        {/* Message Body Skeleton */}
        <div className="mt-4 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
    </li>
);

// --- Component Data and Props ---

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

const extractAirportCode = (value: string) => {
    if (!value) return '';
    const match = value.toUpperCase().match(/[A-Z]{3,4}$/);
    return match ? match[0] : value.trim().slice(-3).toUpperCase();
};
    
interface INotam {
    id: string | number; // Ensure id can be used as a key
    city: string; 
    created_at: string; 
    message: string; 
}

interface BookingFormState {
    departure: string;
    destination: string;
    departureDate: string;
    returnDate: string;
    pax: string;
    cabin: string;
}

interface WelcomeProps extends SharedData {
    flightNotams: INotam[]; 
    // New prop to indicate if the data is currently being fetched on the server
    isNotamsLoading?: boolean; 
}

interface AnimateOnScrollProps {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
}

const AnimateOnScroll = ({ children, className = '', style }: AnimateOnScrollProps) => (
    <div className={className} style={style}>
        {children}
    </div>
);


// --- Main Component ---

// Use the default value for flightNotams for safety, and for isNotamsLoading, default to false.
export default function Welcome({ flightNotams: incomingNotams, isNotamsLoading = false }: WelcomeProps) {
    // 1. Normalize the prop: If incomingNotams is null or undefined, use an empty array []
    const flightNotams = incomingNotams ?? []; 
    
    // Get the auth status from Inertia props
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = !!auth.user;
    
    const [tripType, setTripType] = useState<'one-way' | 'round-trip' | 'multi-city'>('round-trip');
    const [useMiles, setUseMiles] = useState(false);
    const [activeTab, setActiveTab] = useState('Book a flight');
    const [formState, setFormState] = useState<BookingFormState>({
        departure: 'Manila - MNL',
        destination: '',
        departureDate: '2025-11-05',
        returnDate: '2025-11-11',
        pax: '1 Adult',
        cabin: 'All Cabins',
    });

    const showLoading = isNotamsLoading;

    const tabs = [
        { name: 'Book a flight' },
        { name: 'Manage booking' },
        { name: 'Check-in' },
        { name: 'Flight status' },
    ];

    const paxOptions = ['1 Adult', '2 Travelers', 'Family', 'Group (10+)'];
    const cabinOptions = ['All Cabins', 'Economy', 'Premium Economy', 'Business', 'First'];

    const destinations = [
        {
            name: 'Cebu, Philippines',
            price: 'Starting at $120',
            image: 'https://i0.wp.com/wanderlustyle.com/wp-content/uploads/2017/12/boy-swims-w-whale-shark.jpg?fit=1600%2C970&ssl=1',
            description: 'Experience world-class beaches and vibrant city life.',
        },
        {
            name: 'Tokyo, Japan',
            price: 'Starting at $450',
            image: 'https://res.cloudinary.com/aenetworks/image/upload/c_fill,ar_2,w_1920,h_960,g_auto/dpr_auto/f_auto/q_auto:eco/v1/gettyimages-1390815938?_a=BAVAZGID0',
            description: 'Explore the fusion of ancient tradition and modern innovation.',
        },
        {
            name: 'New York, USA',
            price: 'Starting at $780',
            image: 'https://fullsuitcase.com/wp-content/uploads/2022/05/One-day-in-New-York-USA-NYC-day-trip-itinerary.jpg',
            description: 'The city that never sleeps offers endless excitement.',
        },
        {
            name: 'Paris, France',
            price: 'Starting at $620',
            image: 'https://static.independent.co.uk/2025/04/25/13/42/iStock-1498516775.jpg?quality=75&width=1368&crop=3%3A2%2Csmart&auto=webp',
            description: 'The romance capital, featuring iconic landmarks and cuisine.',
        },
    ];

    const operationalMetrics = [
        {
            label: 'On-time departures',
            value: '94.2%',
            delta: '+1.8% vs last week',
            icon: <Clock className="w-5 h-5 text-white" />,
        },
        {
            label: 'Fleet readiness',
            value: '38 / 40 aircraft',
            delta: 'All heavy checks cleared',
            icon: <Gauge className="w-5 h-5 text-white" />,
        },
        {
            label: 'Passenger NPS',
            value: '74',
            delta: 'Promoters up 6 pts',
            icon: <Activity className="w-5 h-5 text-white" />,
        },
        {
            label: 'Crew utilization',
            value: '89%',
            delta: 'Operating within plan',
            icon: <Users className="w-5 h-5 text-white" />,
        },
    ];

    const disruptionTimeline = [
        {
            route: 'MNL → NRT',
            eta: 'Delayed 18m',
            detail: 'ATC flow restrictions over Haneda',
            severity: 'medium',
        },
        {
            route: 'SYD → CEB',
            eta: 'On schedule',
            detail: 'Weather clearing, runway inspection complete',
            severity: 'low',
        },
        {
            route: 'LAX → MNL',
            eta: 'Monitoring',
            detail: 'Crew rest window tight, ops center notified',
            severity: 'high',
        },
    ];

    const reliabilityHighlights = [
        {
            title: 'Safety brief',
            description: 'Zero level-2 events reported in the last 120 days.',
            icon: Shield,
        },
        {
            title: 'Fuel efficiency',
            description: '2.4% burn improvement from optimized step climbs.',
            icon: Route,
        },
        {
            title: 'Turnaround speed',
            description: 'Average ground time trimmed to 42 minutes network-wide.',
            icon: Radar,
        },
    ];

    const crewRoster = [
        {
            base: 'Manila Control',
            captain: 'Capt. Santos',
            fo: 'First Officer Del Rosario',
            duty: 'Long-haul',
        },
        {
            base: 'Tokyo Forward Ops',
            captain: 'Capt. Nakamura',
            fo: 'First Officer Ruiz',
            duty: 'Regional',
        },
        {
            base: 'Los Angeles Operations',
            captain: 'Capt. Lee',
            fo: 'First Officer Mendoza',
            duty: 'Ultra long-haul',
        },
    ];

    const greeting = isAuthenticated ? `Welcome back, ${auth.user?.name?.split(' ')[0] ?? 'Captain'}` : 'Welcome aboard';

    const handleFormChange = (field: keyof BookingFormState, value: string) => {
        setFormState((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleBookingSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!formState.departure.trim() || !formState.destination.trim()) {
            alert('Please provide both departure and destination to search for flights.');
            return;
        }

        const query = {
            tripType,
            useMiles: useMiles ? '1' : '0',
            departure: formState.departure.trim(),
            departureCode: extractAirportCode(formState.departure),
            destination: formState.destination.trim(),
            destinationCode: extractAirportCode(formState.destination),
            departureDate: formState.departureDate,
            ...(tripType !== 'one-way' && { returnDate: formState.returnDate }),
            pax: formState.pax,
            cabin: formState.cabin,
        };

        router.visit(
            searchFlights.url({
                query,
            })
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            {/* --- Dashboard Content --- */}
            <div className="flex flex-1 flex-col gap-10 rounded-xl p-4">
                <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl">
                    <img
                        src="https://www.arup.com/globalassets/images/services/planning/airport-planning/plane-at-an-airport-terminal-airport-planning-hero.jpg?format=webp&width=1840&quality=80"
                        alt="Global operations"
                        className="absolute inset-0 h-full w-full object-cover opacity-40"
                    />
                    <div className="relative z-10 grid gap-8 p-8 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            <p className="text-sm uppercase tracking-[0.2em] text-orange-200">Integrated Aviation Operations System</p>
                            <h1 className="text-3xl font-semibold sm:text-4xl">
                                {greeting}. Here is the state of the network right now.
                            </h1>
                            <p className="text-lg text-slate-200">
                                Monitor fleet readiness, protect customer commitments, and deploy proactive service recovery
                                strategies—all from one cockpit view.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href={isAuthenticated ? dashboard().url : login().url}
                                    className="inline-flex items-center rounded-full bg-orange-400 px-5 py-2 font-semibold text-slate-900 shadow-lg shadow-orange-500/30 transition hover:bg-orange-300"
                                >
                                    {isAuthenticated ? 'Open flight deck' : 'Sign in to command center'}
                                </Link>
                                {!isAuthenticated && can('register') && (
                                    <Link
                                        href={register().url}
                                        className="inline-flex items-center rounded-full border border-white/40 px-5 py-2 font-semibold text-white hover:bg-white/10"
                                    >
                                        Create operator profile
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {operationalMetrics.map((metric) => (
                                <div
                                    key={metric.label}
                                    className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                                >
                                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-400/70">
                                        {metric.icon}
                                    </div>
                                    <p className="text-sm uppercase tracking-wide text-white/60">{metric.label}</p>
                                    <p className="text-2xl font-semibold">{metric.value}</p>
                                    <p className="text-xs text-emerald-300">{metric.delta}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white shadow-xl">
                        <div className="flex flex-wrap border-b border-slate-100">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={`flex-1 py-3 text-sm font-semibold transition ${
                                        activeTab === tab.name
                                            ? 'border-b-2 border-orange-500 text-orange-600'
                                            : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                >
                                    {tab.name}
                                </button>
                            ))}
                        </div>
                        <form className="space-y-8 p-6" onSubmit={handleBookingSubmit}>
                            <div className="flex flex-wrap gap-4">
                                {(['one-way', 'round-trip', 'multi-city'] as const).map((option) => (
                                    <label
                                        key={option}
                                        className="flex cursor-pointer items-center space-x-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium"
                                    >
                                        <input
                                            type="radio"
                                            className="text-orange-500 focus:ring-orange-500"
                                            name="trip-type"
                                            value={option}
                                            checked={tripType === option}
                                            onChange={() => setTripType(option)}
                                        />
                                        <span className="capitalize">{option.replace('-', ' ')}</span>
                                    </label>
                                ))}
                                <label className="ml-auto flex items-center space-x-2 text-sm text-slate-600">
                                    <span>Book with miles</span>
                                    <input
                                        type="checkbox"
                                        checked={useMiles}
                                        onChange={(event) => setUseMiles(event.target.checked)}
                                        className="h-5 w-10 rounded-full border-slate-300 text-orange-500 focus:ring-orange-400"
                                    />
                                </label>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <label className="text-xs font-semibold uppercase text-slate-500">Departure</label>
                                    <div className="mt-2 flex items-center rounded-2xl border border-slate-200 px-3 py-2">
                                        <PlaneTakeoff className="mr-2 h-5 w-5 text-orange-500" />
                                        <input
                                            type="text"
                                            value={formState.departure}
                                            onChange={(event) => handleFormChange('departure', event.target.value)}
                                            className="w-full border-none bg-transparent text-lg font-semibold text-slate-900 placeholder-slate-400 focus:ring-0"
                                            placeholder="From"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormState((prev) => ({
                                                    ...prev,
                                                    departure: prev.destination,
                                                    destination: prev.departure,
                                                }))
                                            }
                                            className="rounded-full border border-slate-200 p-2 text-slate-400 hover:text-slate-900"
                                            aria-label="Swap airports"
                                        >
                                            <ArrowRightIcon className="h-4 w-4 rotate-90 md:rotate-0" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase text-slate-500">Destination</label>
                                    <div className="mt-2 flex items-center rounded-2xl border border-slate-200 px-3 py-2">
                                        <PlaneLanding className="mr-2 h-5 w-5 text-orange-500" />
                                        <input
                                            type="text"
                                            value={formState.destination}
                                            onChange={(event) => handleFormChange('destination', event.target.value)}
                                            className="w-full border-none bg-transparent text-lg font-semibold text-slate-900 placeholder-slate-400 focus:ring-0"
                                            placeholder="To"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-3">
                                <div>
                                    <label className="text-xs font-semibold uppercase text-slate-500">Departure date</label>
                                    <div className="mt-2 flex items-center rounded-2xl border border-slate-200 px-3 py-2">
                                        <CalendarIcon className="mr-2 h-5 w-5 text-slate-400" />
                                        <input
                                            type="date"
                                            value={formState.departureDate}
                                            onChange={(event) => handleFormChange('departureDate', event.target.value)}
                                            className="w-full border-none bg-transparent text-lg font-semibold text-slate-900 focus:ring-0"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase text-slate-500">Return date</label>
                                    <div className="mt-2 flex items-center rounded-2xl border border-slate-200 px-3 py-2">
                                        <CalendarIcon className="mr-2 h-5 w-5 text-slate-400" />
                                        <input
                                            type="date"
                                            value={formState.returnDate}
                                            onChange={(event) => handleFormChange('returnDate', event.target.value)}
                                            disabled={tripType === 'one-way'}
                                            className="w-full border-none bg-transparent text-lg font-semibold text-slate-900 focus:ring-0 disabled:text-slate-400"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase text-slate-500">Pax & cabin</label>
                                    <div className="mt-2 rounded-2xl border border-slate-200 px-3 py-2">
                                        <div className="flex items-center text-sm font-semibold text-slate-500">
                                            <UserIcon className="mr-2 h-5 w-5 text-slate-400" />
                                            Traveler mix
                                        </div>
                                        <div className="mt-3 grid gap-2 md:grid-cols-2">
                                            <select
                                                value={formState.pax}
                                                onChange={(event) => handleFormChange('pax', event.target.value)}
                                                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 focus:border-orange-500 focus:ring-orange-500"
                                            >
                                                {paxOptions.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                            <select
                                                value={formState.cabin}
                                                onChange={(event) => handleFormChange('cabin', event.target.value)}
                                                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 focus:border-orange-500 focus:ring-orange-500"
                                            >
                                                {cabinOptions.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <button type="button" className="text-sm font-semibold text-orange-600">
                                    Add corporate or promo code
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center rounded-full bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
                                >
                                    Search flights
                                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-lg">
                        <p className="text-sm font-semibold uppercase text-slate-500">Ops center snapshot</p>
                        <div className="mt-4 space-y-5">
                            {disruptionTimeline.map((item) => (
                                <div key={item.route} className="rounded-2xl bg-white p-4 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <p className="text-base font-semibold text-slate-900">{item.route}</p>
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                item.severity === 'high'
                                                    ? 'bg-red-50 text-red-600'
                                                    : item.severity === 'medium'
                                                    ? 'bg-amber-50 text-amber-600'
                                                    : 'bg-emerald-50 text-emerald-600'
                                            }`}
                                        >
                                            {item.eta}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                    <section id="featured-destinations" className="w-full py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
                        <div className="container mx-auto max-w-7xl px-4 md:px-6">
                            <AnimateOnScroll className="mb-12 text-center">
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900 dark:text-white">
                                    Top Travel Deals
                                </h2>
                                <p className="mt-3 max-w-xl mx-auto text-gray-600 dark:text-gray-400">
                                    Discover the best flight deals to our most popular and exotic destinations.
                                </p>
                            </AnimateOnScroll>
                            
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {destinations.map((dest, i) => (
                                    <AnimateOnScroll key={dest.name} style={{ transitionDelay: `${i * 100}ms` }}>
                                        <a href="#" className="group relative block h-72 overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                            <img
                                                alt={dest.name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                src={dest.image}
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                                            <div className="absolute bottom-0 left-0 p-5 text-white">
                                                <h3 className="text-2xl font-bold leading-tight">{dest.name}</h3>
                                                <p className="text-sm font-semibold mt-1 text-yellow-300">{dest.price}</p>
                                                <p className="text-xs mt-1 opacity-90">{dest.description}</p>
                                            </div>
                                            <div className="absolute top-3 right-3 bg-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                Deal
                                            </div>
                                        </a>
                                    </AnimateOnScroll>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="travel-alerts" className="w-full max-w-7xl mx-auto px-4 md:px-6 mb-8">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                            <h2 className="text-2xl text-center font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight mb-4">
                                ✈️ Current Flight Advisories
                            </h2>

                            {/* NOTAMS Display Area */}
                            <div className="bg-white shadow-xl sm:rounded-lg overflow-hidden">
                                <ul role="list" className="divide-y divide-gray-200">
                                    {showLoading ? (
                                        // 1. Loading State (Display 3 loading skeletons)
                                        <>
                                            <NotamLoadingSkeleton />
                                            <NotamLoadingSkeleton />
                                            <NotamLoadingSkeleton />
                                        </>
                                    ) : flightNotams.length > 0 ? (
                                        // 2. Data Available State
                                        flightNotams.map((notam) => (
                                            <li key={notam.id} className="p-4 sm:p-6 hover:bg-gray-50">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        {/* Display ICAO/Title */}
                                                        <p className="text-lg font-semibold text-gray-900">
                                                            <Info className="inline-block w-5 h-5 mr-2 text-blue-600" />
                                                            {notam.city} Advisory
                                                        </p>
                                                        {/* Display Effective Date */}
                                                        <p className="text-sm text-gray-500 mt-1 pl-7">
                                                            Effective: {new Date(notam.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {/* Display NOTAM Message */}
                                                <p className="mt-3 text-gray-700 whitespace-pre-line text-sm border-l-4 border-red-100 pl-3">
                                                    {notam.message.substring(0, 200)}{notam.message.length > 500? '...' : ''}
                                                </p>
                                            </li>
                                        ))
                                    ) : (
                                        // 3. No Data Fallback State
                                        <li className="p-6 text-center text-gray-500">
                                            <InfoIcon className="inline-block w-5 h-5 mr-1 text-blue-500" />
                                            No current flight advisories available.
                                        </li>
                                    )}
                                </ul>
                            </div>
                            
                            {/* "View all advisories" link */}
                            <div className="text-right pt-2">
                                <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-end">
                                    View all advisories
                                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                                </a>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-6 md:grid-cols-2">
                        {reliabilityHighlights.map((highlight) => (
                            <div key={highlight.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                                    <highlight.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">{highlight.title}</h3>
                                <p className="mt-2 text-sm text-slate-600">{highlight.description}</p>
                            </div>
                        ))}
                        <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-xl">
                            <p className="text-sm uppercase tracking-[0.3em] text-orange-200">Crew readiness</p>
                            <h3 className="mt-3 text-2xl font-semibold">Global roster coverage</h3>
                            <ul className="mt-6 space-y-4">
                                {crewRoster.map((crew) => (
                                    <li key={crew.base} className="rounded-2xl bg-white/10 p-4">
                                        <p className="text-sm text-orange-200">{crew.base}</p>
                                        <p className="text-lg font-semibold">
                                            {crew.captain} &middot; {crew.fo}
                                        </p>
                                        <p className="text-sm text-slate-200">Duty: {crew.duty}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    <section id="loyalty-cta" className="w-full py-12 md:py-16 bg-orange-400 dark:bg-orange-800">
                        <div className="container mx-auto max-w-7xl px-4 md:px-6 text-center">
                            <div className="flex flex-col md:flex-row items-center justify-between bg-white/10 p-8 rounded-xl backdrop-blur-sm">
                                {/* Left side: Text and icons */}
                                <div className="md:text-left text-white mb-6 md:mb-0">
                                    <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                                        <ZapIcon className="w-8 h-8 text-yellow-300" />
                                        <h2 className="text-xl font-extrabold tracking-tight sm:text-4xl">
                                            Fly Smarter. Earn Rewards.
                                        </h2>
                                    </div>
                                    <p className="mt-2 text-md text-blue-100 max-w-2xl">
                                        Join our loyalty program today and start earning miles on every flight! Redeem for upgrades, free tickets, and more.
                                    </p>
                                </div>
                                
                                {/* Right side: Button */}
                                <a 
                                    href="#" 
                                    className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-orange-800 bg-yellow-300 hover:bg-yellow-400 md:text-lg transition-colors shadow-lg hover:shadow-xl"
                                >
                                    <GiftIcon className="w-5 h-5 mr-2" />
                                    Sign Up for Free
                                </a>
                            </div>
                        </div>
                    </section>
                </div>
        </AppLayout>
    );
}