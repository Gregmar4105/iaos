import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { dashboard, home, sendFlight } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import {
    ArrowLeftIcon,
    CalendarIcon,
    MapPinIcon,
    PlaneIcon,
    PlaneTakeoff,
    PlaneLanding,
    UserIcon,
    MailIcon,
    PhoneIcon,
    CreditCardIcon,
    FileTextIcon,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Book a Flight',
        href: '/bookings',
    },
];

interface BookingFormData {
    // Flight Details
    flight_number: string;
    airline_code: string;
    origin_code: string;
    destination_code: string;
    scheduled_departure_time: string;
    scheduled_arrival_time: string;
    aircraft_icao_code: string;
    trip_type: 'one-way' | 'round-trip' | 'multi-city';
    
    // Passenger Details
    passenger_title: string;
    passenger_first_name: string;
    passenger_last_name: string;
    passenger_email: string;
    passenger_phone: string;
    passenger_date_of_birth: string;
    passenger_passport_number: string;
    passenger_passport_expiry: string;
    passenger_nationality: string;
    
    // Contact Information
    contact_email: string;
    contact_phone: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    
    // Additional Details
    special_requests: string;
    seat_preference: string;
    meal_preference: string;
    baggage: string;
    cabin_class: string;
    number_of_passengers: string;
}

export default function Bookings() {
    const { auth } = usePage<SharedData>().props;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitFeedback, setSubmitFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    
    const [formData, setFormData] = useState<BookingFormData>({
        flight_number: '',
        airline_code: '',
        origin_code: '',
        destination_code: '',
        scheduled_departure_time: '',
        scheduled_arrival_time: '',
        aircraft_icao_code: '',
        trip_type: 'round-trip',
        passenger_title: 'Mr',
        passenger_first_name: auth?.user?.name?.split(' ')[0] || '',
        passenger_last_name: auth?.user?.name?.split(' ').slice(1).join(' ') || '',
        passenger_email: auth?.user?.email || '',
        passenger_phone: '',
        passenger_date_of_birth: '',
        passenger_passport_number: '',
        passenger_passport_expiry: '',
        passenger_nationality: '',
        contact_email: auth?.user?.email || '',
        contact_phone: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        special_requests: '',
        seat_preference: 'No preference',
        meal_preference: 'Standard',
        baggage: '1 checked bag',
        cabin_class: 'Economy',
        number_of_passengers: '1',
    });

    const handleInputChange = (field: keyof BookingFormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setSubmitFeedback(null);

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content;

            // Prepare flight data for the webhook
            const flightData = {
                id: Date.now(), // Temporary ID
                flight_number: formData.flight_number,
                airline_code: formData.airline_code,
                origin_code: formData.origin_code,
                destination_code: formData.destination_code,
                scheduled_departure_time: formData.scheduled_departure_time,
                scheduled_arrival_time: formData.scheduled_arrival_time,
                aircraft_icao_code: formData.aircraft_icao_code,
                fk_id_terminal_code: null,
                fk_id_gate_code: null,
                fk_id_status_code: '1-SCH',
            };

            const payload = {
                flight: flightData,
                user: {
                    id: auth?.user?.id || null,
                    name: `${formData.passenger_first_name} ${formData.passenger_last_name}`.trim(),
                    email: formData.passenger_email,
                },
                passenger_details: {
                    title: formData.passenger_title,
                    first_name: formData.passenger_first_name,
                    last_name: formData.passenger_last_name,
                    email: formData.passenger_email,
                    phone: formData.passenger_phone,
                    date_of_birth: formData.passenger_date_of_birth,
                    passport_number: formData.passenger_passport_number,
                    passport_expiry: formData.passenger_passport_expiry,
                    nationality: formData.passenger_nationality,
                },
                contact_information: {
                    email: formData.contact_email,
                    phone: formData.contact_phone,
                    emergency_contact_name: formData.emergency_contact_name,
                    emergency_contact_phone: formData.emergency_contact_phone,
                },
                booking_preferences: {
                    trip_type: formData.trip_type,
                    cabin_class: formData.cabin_class,
                    number_of_passengers: formData.number_of_passengers,
                    seat_preference: formData.seat_preference,
                    meal_preference: formData.meal_preference,
                    baggage: formData.baggage,
                    special_requests: formData.special_requests,
                },
                search_context: {},
                meta: {
                    source: 'iaos-booking-form',
                    timestamp: new Date().toISOString(),
                },
            };

            const response = await fetch(sendFlight.url(), {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken ?? '',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const problem = await response.json().catch(() => null);
                throw new Error(problem?.message ?? 'Unable to create booking');
            }

            setSubmitFeedback({
                type: 'success',
                message: 'Booking created successfully! Your booking has been sent to the PMS system.',
            });

            // Reset form after successful submission
            setTimeout(() => {
                setFormData({
                    flight_number: '',
                    airline_code: '',
                    origin_code: '',
                    destination_code: '',
                    scheduled_departure_time: '',
                    scheduled_arrival_time: '',
                    aircraft_icao_code: '',
                    trip_type: 'round-trip',
                    passenger_title: 'Mr',
                    passenger_first_name: '',
                    passenger_last_name: '',
                    passenger_email: '',
                    passenger_phone: '',
                    passenger_date_of_birth: '',
                    passenger_passport_number: '',
                    passenger_passport_expiry: '',
                    passenger_nationality: '',
                    contact_email: '',
                    contact_phone: '',
                    emergency_contact_name: '',
                    emergency_contact_phone: '',
                    special_requests: '',
                    seat_preference: 'No preference',
                    meal_preference: 'Standard',
                    baggage: '1 checked bag',
                    cabin_class: 'Economy',
                    number_of_passengers: '1',
                });
            }, 3000);
        } catch (error) {
            setSubmitFeedback({
                type: 'error',
                message: error instanceof Error ? error.message : 'Failed to create booking. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Book a Flight" />
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
                                <h1 className="text-2xl font-bold text-slate-900">Book a Flight</h1>
                                <p className="text-sm text-slate-600">Complete the form below to create a new booking</p>
                            </div>
                        </div>
                        <PlaneIcon className="h-8 w-8 text-orange-500" />
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-8">
                        {/* Flight Details Section */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <PlaneIcon className="h-5 w-5 text-orange-500" />
                                Flight Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Flight Number *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.flight_number}
                                        onChange={(e) => handleInputChange('flight_number', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                        placeholder="PR100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Airline Code *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.airline_code}
                                        onChange={(e) => handleInputChange('airline_code', e.target.value.toUpperCase())}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                        placeholder="PR"
                                        maxLength={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Trip Type *</label>
                                    <select
                                        required
                                        value={formData.trip_type}
                                        onChange={(e) => handleInputChange('trip_type', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                    >
                                        <option value="one-way">One Way</option>
                                        <option value="round-trip">Round Trip</option>
                                        <option value="multi-city">Multi City</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Origin Code *</label>
                                    <div className="relative">
                                        <PlaneTakeoff className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.origin_code}
                                            onChange={(e) => handleInputChange('origin_code', e.target.value.toUpperCase())}
                                            className="w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                            placeholder="MNL"
                                            maxLength={3}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Destination Code *</label>
                                    <div className="relative">
                                        <PlaneLanding className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.destination_code}
                                            onChange={(e) => handleInputChange('destination_code', e.target.value.toUpperCase())}
                                            className="w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                            placeholder="SIN"
                                            maxLength={3}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Aircraft Type *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.aircraft_icao_code}
                                        onChange={(e) => handleInputChange('aircraft_icao_code', e.target.value.toUpperCase())}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                        placeholder="A359"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Departure Date & Time *</label>
                                    <div className="relative">
                                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="datetime-local"
                                            required
                                            value={formData.scheduled_departure_time}
                                            onChange={(e) => handleInputChange('scheduled_departure_time', e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Arrival Date & Time *</label>
                                    <div className="relative">
                                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="datetime-local"
                                            required
                                            value={formData.scheduled_arrival_time}
                                            onChange={(e) => handleInputChange('scheduled_arrival_time', e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Passenger Details Section */}
                        <div className="space-y-4 border-t border-slate-100 pt-6">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <UserIcon className="h-5 w-5 text-orange-500" />
                                Passenger Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                                    <select
                                        required
                                        value={formData.passenger_title}
                                        onChange={(e) => handleInputChange('passenger_title', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                    >
                                        <option value="Mr">Mr</option>
                                        <option value="Mrs">Mrs</option>
                                        <option value="Ms">Ms</option>
                                        <option value="Miss">Miss</option>
                                        <option value="Dr">Dr</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.passenger_first_name}
                                        onChange={(e) => handleInputChange('passenger_first_name', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.passenger_last_name}
                                        onChange={(e) => handleInputChange('passenger_last_name', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                                    <div className="relative">
                                        <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="email"
                                            required
                                            value={formData.passenger_email}
                                            onChange={(e) => handleInputChange('passenger_email', e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                                    <div className="relative">
                                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="tel"
                                            required
                                            value={formData.passenger_phone}
                                            onChange={(e) => handleInputChange('passenger_phone', e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.passenger_date_of_birth}
                                        onChange={(e) => handleInputChange('passenger_date_of_birth', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Passport Number *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.passenger_passport_number}
                                        onChange={(e) => handleInputChange('passenger_passport_number', e.target.value.toUpperCase())}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Passport Expiry *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.passenger_passport_expiry}
                                        onChange={(e) => handleInputChange('passenger_passport_expiry', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nationality *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.passenger_nationality}
                                        onChange={(e) => handleInputChange('passenger_nationality', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                        placeholder="Philippines"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Information Section */}
                        <div className="space-y-4 border-t border-slate-100 pt-6">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <PhoneIcon className="h-5 w-5 text-orange-500" />
                                Contact Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email *</label>
                                    <div className="relative">
                                        <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="email"
                                            required
                                            value={formData.contact_email}
                                            onChange={(e) => handleInputChange('contact_email', e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone *</label>
                                    <div className="relative">
                                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="tel"
                                            required
                                            value={formData.contact_phone}
                                            onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.emergency_contact_name}
                                        onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact Phone *</label>
                                    <div className="relative">
                                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="tel"
                                            required
                                            value={formData.emergency_contact_phone}
                                            onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Booking Preferences Section */}
                        <div className="space-y-4 border-t border-slate-100 pt-6">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <CreditCardIcon className="h-5 w-5 text-orange-500" />
                                Booking Preferences
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Cabin Class *</label>
                                    <select
                                        required
                                        value={formData.cabin_class}
                                        onChange={(e) => handleInputChange('cabin_class', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                    >
                                        <option value="Economy">Economy</option>
                                        <option value="Premium Economy">Premium Economy</option>
                                        <option value="Business">Business</option>
                                        <option value="First">First</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Number of Passengers *</label>
                                    <select
                                        required
                                        value={formData.number_of_passengers}
                                        onChange={(e) => handleInputChange('number_of_passengers', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                            <option key={num} value={num.toString()}>
                                                {num} {num === 1 ? 'Passenger' : 'Passengers'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Seat Preference</label>
                                    <select
                                        value={formData.seat_preference}
                                        onChange={(e) => handleInputChange('seat_preference', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                    >
                                        <option value="No preference">No preference</option>
                                        <option value="Window">Window</option>
                                        <option value="Aisle">Aisle</option>
                                        <option value="Middle">Middle</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meal Preference</label>
                                    <select
                                        value={formData.meal_preference}
                                        onChange={(e) => handleInputChange('meal_preference', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                    >
                                        <option value="Standard">Standard</option>
                                        <option value="Vegetarian">Vegetarian</option>
                                        <option value="Vegan">Vegan</option>
                                        <option value="Halal">Halal</option>
                                        <option value="Kosher">Kosher</option>
                                        <option value="Gluten-free">Gluten-free</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Baggage</label>
                                    <select
                                        value={formData.baggage}
                                        onChange={(e) => handleInputChange('baggage', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                    >
                                        <option value="1 checked bag">1 checked bag</option>
                                        <option value="2 checked bags">2 checked bags</option>
                                        <option value="Carry-on only">Carry-on only</option>
                                        <option value="No baggage">No baggage</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Special Requests</label>
                                <textarea
                                    value={formData.special_requests}
                                    onChange={(e) => handleInputChange('special_requests', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                    placeholder="Any special requests or notes..."
                                />
                            </div>
                        </div>

                        {/* Submit Section */}
                        {submitFeedback && (
                            <div
                                className={`rounded-lg p-4 ${
                                    submitFeedback.type === 'success'
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                        : 'bg-red-50 text-red-800 border border-red-200'
                                }`}
                            >
                                {submitFeedback.message}
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-4 border-t border-slate-100 pt-6">
                            <button
                                type="button"
                                onClick={() => router.visit(home().url)}
                                className="rounded-lg border border-slate-200 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded-lg bg-orange-500 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting ? 'Creating Booking...' : 'Create Booking'}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </AppLayout>
    );
}
