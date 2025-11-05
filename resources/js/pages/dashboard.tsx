import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { can } from '@/lib/can'; // For the register link check
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { ArrowRightIcon, CalendarIcon, PlaneIcon, UserIcon } from 'lucide-react';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Welcome() {
    // Get the auth status from Inertia props
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = !!auth.user;

    const tabs = [
    { name: "Book a flight", current: true },
    { name: "Manage booking", current: false },
    { name: "Check-in", current: false },
    { name: "Flight status", current: false },
];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            {/* --- Your Dashboard Content Below --- */}
            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                
                <div className="relative">
                    <img src="https://www.arup.com/globalassets/images/services/planning/airport-planning/plane-at-an-airport-terminal-airport-planning-hero.jpg?format=webp&width=1840&quality=80" alt="Airline Background" />
                    <section className="relative -mt-70 z-10 w-full max-w-7xl mx-auto px-4 md:px-6">
                        {/* Tab Navigation */}
                        <div className="flex bg-white/90 backdrop-blur-sm rounded-t-xl shadow-lg overflow-hidden">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.name}
                                    className={`py-3 px-6 text-sm font-medium transition-colors duration-200 ${
                                        tab.current
                                            ? 'bg-orange-400 text-white shadow-inner'
                                            : 'text-gray-700 hover:bg-orange-200'
                                    }`}
                                >
                                    {tab.name}
                                </button>
                            ))}
                        </div>

                        {/* Search Form Card */}
                        <div className="bg-white p-6 md:p-8 rounded-b-xl shadow-2xl">
                            {/* Trip Type Radios */}
                            <div className="flex space-x-6 mb-6">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="radio" name="trip-type" value="one-way" className="form-radio text-blue-600 focus:ring-blue-500" />
                                    <span className="text-gray-700 font-medium">One way</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="radio" name="trip-type" value="round-trip" defaultChecked className="form-radio text-blue-600 focus:ring-blue-500" />
                                    <span className="text-gray-700 font-medium">Round trip</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="radio" name="trip-type" value="multi-city" className="form-radio text-blue-600 focus:ring-blue-500" />
                                    <span className="text-gray-700 font-medium">Multi city</span>
                                </label>

                                {/* Sign in with miles toggle */}
                                <div className="flex items-center ml-auto space-x-2">
                                    <span className="text-sm text-gray-600">Sign in to book with miles</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" value="" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-400"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Input Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center border-b pb-4 mb-4">
                                {/* Departure */}
                                <div className="col-span-2 flex flex-col space-y-1">
                                    <label className="text-xs font-semibold text-gray-500">Departure</label>
                                    <div className="flex items-center space-x-2">
                                        <PlaneIcon className="w-5 h-5 text-blue-600" />
                                        <input
                                            type="text"
                                            defaultValue="Manila - MNL"
                                            className="w-full text-lg font-bold text-gray-800 p-0 border-none focus:ring-0"
                                        />
                                    </div>
                                </div>

                                {/* Swap Icon */}
                                <div className="flex justify-center">
                                    <button className="p-2 border rounded-full text-gray-500 hover:bg-gray-50 transition-colors">
                                        <ArrowRightIcon className="w-4 h-4 transform rotate-90 md:rotate-0" />
                                    </button>
                                </div>

                                {/* Destination */}
                                <div className="col-span-2 flex flex-col space-y-1">
                                    <label className="text-xs font-semibold text-gray-500">Destination</label>
                                    <input
                                        type="text"
                                        placeholder="To"
                                        className="w-full text-lg font-bold text-gray-800 p-0 border-none focus:ring-0"
                                    />
                                </div>

                                {/* Dates and Pax (Adjusted for better layout) */}
                                <div className="col-span-6 grid grid-cols-3 gap-4">
                                    {/* Departure Date */}
                                    <div className="flex flex-col space-y-1">
                                        <label className="text-xs font-semibold text-gray-500">Departure date</label>
                                        <div className="flex items-center space-x-2">
                                            <CalendarIcon className="w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                defaultValue="05-Nov-2025"
                                                className="w-full text-lg font-bold text-gray-800 p-0 border-none focus:ring-0"
                                            />
                                        </div>
                                    </div>

                                    {/* Return Date */}
                                    <div className="flex flex-col space-y-1">
                                        <label className="text-xs font-semibold text-gray-500">Return date</label>
                                        <div className="flex items-center space-x-2">
                                            <CalendarIcon className="w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                defaultValue="11-Nov-2025"
                                                className="w-full text-lg font-bold text-gray-800 p-0 border-none focus:ring-0"
                                            />
                                        </div>
                                    </div>

                                    {/* Pax and Cabin */}
                                    <div className="flex flex-col space-y-1">
                                        <label className="text-xs font-semibold text-gray-500">Pax and Cabin</label>
                                        <div className="flex items-center space-x-2">
                                            <UserIcon className="w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                defaultValue="1 pax, All Cabins"
                                                className="w-full text-lg font-bold text-gray-800 p-0 border-none focus:ring-0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Promo Code and Search Button */}
                            <div className="flex justify-between items-center">
                                <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    Add promo code
                                </a>
                                <button className="bg-orange-400 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-md">
                                    Search flights
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}