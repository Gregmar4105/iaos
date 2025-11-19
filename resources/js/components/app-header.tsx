import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu,
        NavigationMenuContent,
        NavigationMenuItem,
        NavigationMenuLink,
        NavigationMenuList,
        NavigationMenuTrigger,
        navigationMenuTriggerStyle, } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { WeatherResult } from '@/components/weather-result';
import { extractWeatherSummary, formatWeatherStat, formatWeatherTimestamp, toWeatherRecord } from '@/lib/weather';
import { cn } from '@/lib/utils';
import { login } from '@/routes';
import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Folder,
    LayoutGrid,
    Menu,
    Search,
    CircleHelpIcon,
    CircleCheckIcon,
    CircleIcon,
    Loader2,
    CloudSun,
    ThermometerSun,
    Droplets,
    Wind,
    Clock3,
    Sparkles,
} from 'lucide-react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';
import { useIsMobile } from "@/hooks/use-mobile"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormEvent, useEffect, useRef, useState } from 'react';

const Book: NavItem[] = [
    {
    title: "Bookings",
    href: "/bookings",
    description:
      "Book your flight by ARS",
  },
  {
    title: "Flight Schedules",
    href: "/flight-schedule",
    description:
      "View flight schedules by FIS",
  },
  {
    title: "Arrival",
    href: "/arrivals",
    description:
      "View flight arrival information by FIS",
  },
  {
    title: "Departure",
    href: "/departures",
    description:
      "View flight departure information by FIS",
  },
];

const Manage: NavItem[] = [
    {
    title: "Checked-in",
    href: "/checked-in",
    description:
      "Manage checked-in by PMS",
  },
  {
    title: "Baggage",
    href: "/baggage",
    description:
      "Manage baggage tracking by BHS",
  },
];
const Prepare: NavItem[] = [
    {
    title: "Safety Measures",
    href: "/safety-measures",
    description:
      "Fly safe by ATC",
  },
  {
    title: "Notams",
    href: "/notams",
    description:
      "Notice to Airmen by ATC",
  },
  {
    title: "Weather Updates",
    href: "/weather-updates",
    description:
      "Real Time Weather Updates by ATC",
  },
];

const OtherSystems: NavItem[] = [
    {
    title: "PMS",
    href: "https://pms.larable.dev",
    description:
      "Passenger Management System for IAOS",
  },
  {
    title: "FIS",
    href: "https://fis.larable.dev",
    description:
      "Flight Information System for IAOS",
  },
  {
    title: "ARS",
    href: "https://ars.larable.dev",
    description:
      "Airline Reservation System for IAOS",
  },
  {
    title: "BHS",
    href: "https://bhs.larable.dev",
    description: 
        "Baggage Handling System for IAOS",
  },
  {
    title: "ATC",
    href: "https://atc.larable.dev",
    description:
      "Air Traffic Control System for IAOS",
  },
];

const rightNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/Gregmar4105/iaos',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://larable.dev',
        icon: BookOpen,
    },
];

const activeItemStyles = 'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    const isMobile = useIsMobile()
    const [isWeatherDialogOpen, setWeatherDialogOpen] = useState(false);
    const [isWeatherPanelOpen, setWeatherPanelOpen] = useState(false);
    const [weatherQuery, setWeatherQuery] = useState('');
    const [lastWeatherQuery, setLastWeatherQuery] = useState('');
    const [weatherResult, setWeatherResult] = useState<Record<string, unknown> | null>(null);
    const [weatherError, setWeatherError] = useState<string | null>(null);
    const [isWeatherLoading, setWeatherLoading] = useState(false);
    const weatherPanelRef = useRef<HTMLDivElement | null>(null);
    const weatherButtonRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        const handleClickAway = (event: MouseEvent) => {
            if (!isWeatherPanelOpen) return;

            const target = event.target as Node;
            if (
                weatherPanelRef.current &&
                !weatherPanelRef.current.contains(target) &&
                weatherButtonRef.current &&
                !weatherButtonRef.current.contains(target)
            ) {
                setWeatherPanelOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickAway);
        return () => document.removeEventListener('mousedown', handleClickAway);
    }, [isWeatherPanelOpen]);

    const dialogSummary = weatherResult
        ? extractWeatherSummary(weatherResult, lastWeatherQuery || weatherQuery)
        : null;

    const handleWeatherSearch = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmedQuery = weatherQuery.trim();

        if (!trimmedQuery) {
            setWeatherError('Please enter a city name.');
            return;
        }

        setWeatherLoading(true);
        setWeatherError(null);

        try {
            const response = await fetch(`/api/weather?city=${encodeURIComponent(trimmedQuery)}`);
            const payload = await response.json();

            if (!response.ok || payload.error) {
                throw new Error(payload.error ?? 'Unable to reach the weather service.');
            }

            const record = toWeatherRecord(payload.data);

            if (!record) {
                throw new Error('Weather service returned an empty payload.');
            }

            setWeatherResult(record);
            setLastWeatherQuery(trimmedQuery);
            setWeatherDialogOpen(true);
            setWeatherPanelOpen(false);
        } catch (error) {
            setWeatherResult(null);
            setWeatherError(error instanceof Error ? error.message : 'Unable to reach the weather service.');
        } finally {
            setWeatherLoading(false);
        }
    };

    const handleWeatherDialogChange = (open: boolean) => {
        setWeatherDialogOpen(open);

        if (!open) {
            setWeatherResult(null);
            setLastWeatherQuery('');
        }
    };
    return (
        <>
            <div className="border-b border-sidebar-border/80">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="mr-2 h-[34px] w-[34px]">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar">
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" />
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-4">
                                            {Book.map((item) => (
                                                <Link key={item.title} href={item.href} className="flex items-center space-x-2 font-medium">
                                                    {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="flex flex-col space-y-4">
                                            {rightNavItems.map((item) => (
                                                <a
                                                    key={item.title}
                                                    href={item.href as string}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center space-x-2 font-medium"
                                                >
                                                    {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                    <span>{item.title}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link href="/dashboard" prefetch className="flex items-center space-x-2">
                        <AppLogo />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
                        <NavigationMenu>
                            <NavigationMenuList className="flex-wrap">
                                <NavigationMenuItem>
                                <NavigationMenuTrigger>Home</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                                    <li className="row-span-3">
                                        <NavigationMenuLink asChild>
                                            {/* IMPORTANT: Replace <a> with Inertia's <Link> component */}
                                            <Link
                                                // Inertia Link component
                                                href="/"
                                                className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-4 no-underline outline-hidden transition-all duration-200 select-none focus:shadow-md md:p-6"
                                            >
                                                {/* 1. Insert the AppLogoIcon here */}
                                                <AppLogoIcon className="h-20 w-20 fill-current text-black dark:text-white ml-8" />

                                                {/* 2. Content below the icon */}
                                                <div className="mb-2 text-lg font-medium sm:mt-4">
                                                    IAOS
                                                </div>
                                                <p className="text-muted-foreground text-sm leading-tight">
                                                    The Integrated Aviation Operations System
                                                </p>
                                            </Link>
                                        </NavigationMenuLink>
                                    </li>
                                    <ListItem href="/docs" title="Introduction">
                                        Get started with IAOS and learn how to use the system.
                                    </ListItem>
                                    <ListItem href="/docs/installation" title="Tech Stack & Setup">
                                        Learn about the technologies used and how the setup works.
                                    </ListItem>
                                    <ListItem href="/docs/primitives/typography" title="Deployment">
                                        Deployed with ease using Larable Home Server.
                                    </ListItem>
                                    </ul>
                                </NavigationMenuContent>
                                </NavigationMenuItem>

                                <NavigationMenuItem>
                                <NavigationMenuTrigger>Book</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                    {Book.map((Item) => (
                                        <ListItem
                                        key={Item.title}
                                        title={Item.title}
                                        href={Item.href as string}
                                        >
                                        {Item.description}
                                        </ListItem>
                                    ))}
                                    </ul>
                                </NavigationMenuContent>
                                </NavigationMenuItem>

                                <NavigationMenuItem>
                                <NavigationMenuTrigger>Manage</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                    {Manage.map((Item) => (
                                        <ListItem
                                        key={Item.title}
                                        title={Item.title}
                                        href={Item.href as string}
                                        >
                                        {Item.description}
                                        </ListItem>
                                    ))}
                                    </ul>
                                </NavigationMenuContent>
                                </NavigationMenuItem>

                                <NavigationMenuItem>
                                <NavigationMenuTrigger>Prepare</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                    {Prepare.map((Item) => (
                                        <ListItem
                                        key={Item.title}
                                        title={Item.title}
                                        href={Item.href as string}
                                        >
                                        {Item.description}
                                        </ListItem>
                                    ))}
                                    </ul>
                                </NavigationMenuContent>
                                </NavigationMenuItem>

                                <NavigationMenuItem>
                                <NavigationMenuTrigger>Other Systems</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                    {OtherSystems.map((Item) => (
                                        <ListItem
                                        key={Item.title}
                                        title={Item.title}
                                        href={Item.href as string}
                                        target="_blank"
                                        >
                                        {Item.description}
                                        </ListItem>
                                    ))}
                                    </ul>
                                </NavigationMenuContent>
                                </NavigationMenuItem>

                            </NavigationMenuList>
                            </NavigationMenu>
                    </div>

                    <div className="ml-auto flex items-center space-x-2">
                        <div className="relative flex items-center space-x-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="group h-9 w-9 cursor-pointer"
                                ref={weatherButtonRef}
                                onClick={() => {
                                    setWeatherPanelOpen((prev) => !prev);
                                    setWeatherError(null);
                                }}
                                aria-label="Quick weather search"
                            >
                                <Search className="!size-5 opacity-80 group-hover:opacity-100" />
                            </Button>
                            {isWeatherPanelOpen && (
                                <div
                                    ref={weatherPanelRef}
                                    className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xl"
                                >
                                    <p className="text-sm font-semibold text-slate-900">Quick weather lookup</p>
                                    <p className="text-xs text-slate-500">Search a city via ATC weather feed.</p>
                                    <form onSubmit={handleWeatherSearch} className="mt-3 space-y-3">
                                        <Input
                                            placeholder="e.g. Manila"
                                            value={weatherQuery}
                                            onChange={(event) => setWeatherQuery(event.target.value)}
                                            autoFocus
                                        />
                                        <Button type="submit" className="w-full" disabled={isWeatherLoading}>
                                            {isWeatherLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Fetch weather
                                        </Button>
                                    </form>
                                    {weatherError && (
                                        <p className="mt-2 text-xs text-rose-600">{weatherError}</p>
                                    )}
                                </div>
                            )}
                            <div className="hidden lg:flex">
                                {rightNavItems.map((item) => (
                                    <TooltipProvider key={item.title} delayDuration={0}>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <a
                                                    href={item.href as string}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium text-accent-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                                >
                                                    <span className="sr-only">{item.title}</span>
                                                    {item.icon && <Icon iconNode={item.icon} className="size-5 opacity-80 group-hover:opacity-100" />}
                                                </a>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{item.title}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        </div>
                        {/* 🚨 CRITICAL FIX: Wrap the entire block in the conditional based on user status */}
                        {auth.user ? (
                            // State 1: User IS Logged In (Show Avatar and Dropdown Menu)
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="size-10 rounded-full p-1" // Button keeps its rounded-full class for the avatar
                                    >
                                        <Avatar className="size-8 overflow-hidden rounded-full">
                                            {/* Inner Avatar logic */}
                                            <AvatarImage
                                                src={auth.user.avatar}
                                                alt={auth.user.name}
                                            />
                                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                
                                <DropdownMenuContent className="w-56" align="end">
                                    <UserMenuContent user={auth.user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            // State 2: User IS NOT Logged In (Show a standalone Button with the Log In Link)
                            // This button is NOT a DropdownMenuTrigger, so the Link will redirect.
                            <div className="flex justify-end">
                                <Button
                                    asChild // Use 'asChild' to render the Link as the Button's child
                                    variant="default"
                                    size="sm"
                                    className="px-3 py-1 text-sm font-medium bg-orange-400 hover:bg-orange-700" 
                                >
                                    <Link
                                        href={login()}
                                        className="rounded-md border border-transparent"
                                    >
                                        Log in
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/70">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}

            <Dialog open={isWeatherDialogOpen} onOpenChange={handleWeatherDialogChange}>
                <DialogContent className="sm:max-w-7xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <CloudSun className="h-5 w-5 text-blue-500" />
                            ATC weather intelligence
                        </DialogTitle>
                        <DialogDescription>
                            Results are fetched live from the weather webhook and shown once ready.
                        </DialogDescription>
                    </DialogHeader>

                    {weatherResult && dialogSummary ? (
                        <div className="space-y-3">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs uppercase tracking-wide text-slate-500">Live conditions</p>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-lg font-semibold text-slate-900">
                                    <Sparkles className="h-5 w-5 text-blue-500" />
                                    {dialogSummary.city ?? lastWeatherQuery ?? 'Unknown city'}
                                    {dialogSummary.condition && (
                                        <Badge variant="secondary">{dialogSummary.condition}</Badge>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500">
                                    {formatWeatherTimestamp(dialogSummary.updatedAt)}
                                </p>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2">
                                {[
                                    {
                                        label: 'Temperature',
                                        value: formatWeatherStat(dialogSummary.temperature, '°'),
                                        icon: ThermometerSun,
                                    },
                                    {
                                        label: 'Humidity',
                                        value: formatWeatherStat(dialogSummary.humidity, '%'),
                                        icon: Droplets,
                                    },
                                    {
                                        label: 'Wind',
                                        value: formatWeatherStat(dialogSummary.wind, 'knots'),
                                        icon: Wind,
                                    },
                                    {
                                        label: 'Updated',
                                        value: formatWeatherTimestamp(dialogSummary.updatedAt),
                                        icon: Clock3,
                                    },
                                ].map(({ label, value, icon: Icon }) => (
                                    <div
                                        key={label}
                                        className="rounded-lg border border-slate-100 p-3 text-sm"
                                    >
                                        <div className="flex items-center gap-1 text-xs uppercase tracking-wide text-slate-500">
                                            <Icon className="h-3.5 w-3.5 text-slate-400" />
                                            {label}
                                        </div>
                                        <p className="mt-1 text-base font-semibold text-slate-900">{value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="max-h-56 overflow-y-auto pr-1">
                                <WeatherResult data={weatherResult} compact className="gap-3" />
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-600">
                            Run a quick city search via the magnifying glass to pull the latest data.
                        </p>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

function ListItem({
  title,
  children,
  href,
  target,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string; target?: React.HTMLAttributeAnchorTarget }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <a
          href={href}
          target={target}
        >
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
}
