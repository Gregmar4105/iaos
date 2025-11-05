import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { can } from '@/lib/can'; // For the register link check
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { ArrowRightIcon, CalendarIcon, PlaneIcon, UserIcon } from 'lucide-react';
import { ChevronRightIcon, InfoIcon, ShieldAlertIcon } from 'lucide-react';
import { GiftIcon, ZapIcon } from 'lucide-react';


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

    const destinations = [
        {
            name: "Cebu, Philippines",
            price: "Starting at $120",
            image: "https://i0.wp.com/wanderlustyle.com/wp-content/uploads/2017/12/boy-swims-w-whale-shark.jpg?fit=1600%2C970&ssl=1", // Placeholder URL
            description: "Experience world-class beaches and vibrant city life.",
        },
        {
            name: "Tokyo, Japan",
            price: "Starting at $450",
            image: "https://res.cloudinary.com/aenetworks/image/upload/c_fill,ar_2,w_1920,h_960,g_auto/dpr_auto/f_auto/q_auto:eco/v1/gettyimages-1390815938?_a=BAVAZGID0", // Placeholder URL
            description: "Explore the fusion of ancient tradition and modern innovation.",
        },
        {
            name: "New York, USA",
            price: "Starting at $780",
            image: "https://fullsuitcase.com/wp-content/uploads/2022/05/One-day-in-New-York-USA-NYC-day-trip-itinerary.jpg", // Placeholder URL
            description: "The city that never sleeps offers endless excitement.",
        },
        {
            name: "Paris, France",
            price: "Starting at $620",
            image: "https://static.independent.co.uk/2025/04/25/13/42/iStock-1498516775.jpg?quality=75&width=1368&crop=3%3A2%2Csmart&auto=webp", // Placeholder URL
            description: "The romance capital, featuring iconic landmarks and cuisine.",
        },
    ];

    const AnimateOnScroll = ({ children, className, style }) => <div className={className} style={style}>{children}</div>;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            {/* --- Your Dashboard Content Below --- */}
            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                
                <div className="relative">
                    <img src="https://www.arup.com/globalassets/images/services/planning/airport-planning/plane-at-an-airport-terminal-airport-planning-hero.jpg?format=webp&width=1840&quality=80" alt="Airline Background" />
                    <section className="relative -mt-60 z-10 w-full max-w-7xl mx-auto px-4 md:px-6">
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
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 md:p-6 space-y-4">
                {/* Section Header */}
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <InfoIcon className="w-6 h-6 text-blue-600 mr-2" />
                    Important Information & Travel Advisories
                </h3>

                {/* List of Alerts/Information Blocks */}
                <div className="space-y-3">
                    {/* Advisory 1: Flight Changes */}
                    <div className="flex items-center justify-between p-3 bg-red-50 border-l-4 border-red-500 rounded-md transition-shadow hover:shadow-md cursor-pointer">
                        <div className="flex items-center space-x-3">
                            <ShieldAlertIcon className="w-5 h-5 text-red-600" />
                            <p className="text-sm font-medium text-gray-700">
                                <span className="font-bold text-red-600">COVID-19 Updates:</span> Review the latest entry requirements for all international travel.
                            </p>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-red-500" />
                    </div>

                    {/* Advisory 2: Baggage Policy */}
                    <div className="flex items-center justify-between p-3 bg-blue-50 border-l-4 border-blue-500 rounded-md transition-shadow hover:shadow-md cursor-pointer">
                        <div className="flex items-center space-x-3">
                            <InfoIcon className="w-5 h-5 text-blue-600" />
                            <p className="text-sm font-medium text-gray-700">
                                <span className="font-bold">Baggage Policy:</span> New checked luggage size and weight restrictions effective November 10, 2025.
                            </p>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-blue-500" />
                    </div>
                </div>

                <div className="text-right pt-2">
                    <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-end">
                        View all advisories
                        <ChevronRightIcon className="w-4 h-4 ml-1" />
                    </a>
                </div>
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
            </div>
        </AppLayout>
    );
}