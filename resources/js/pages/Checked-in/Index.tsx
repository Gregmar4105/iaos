import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlaneTakeoff, Users, Waypoints } from 'lucide-react';

type CheckedInPassenger = {
    id: number;
    user_id: number;
    flight_number: string;
    passenger_status: string;
    airline_code: string;
    aircraft_code: string;
    origin_code: string;
    destination_code: string;
    gate_code: string;
    baggage_code: string;
};

interface CheckedInProps extends SharedData {
    passengers: CheckedInPassenger[];
    error?: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Checked-in',
        href: '/checked-in',
    },
];

const statusVariants: Record<string, string> = {
    'checked-in': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    cancelled: 'bg-rose-100 text-rose-700 border border-rose-200',
};

export default function Index({ passengers = [], error }: CheckedInProps) {
    const checkedInCount = passengers.filter((passenger) => passenger.passenger_status?.toLowerCase() === 'checked-in').length;
    const cancelledCount = passengers.filter((passenger) => passenger.passenger_status?.toLowerCase() === 'cancelled').length;
    const destinations = Array.from(new Set(passengers.map((passenger) => passenger.destination_code))).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Checked-in" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Unable to load the checked-in manifest</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border border-slate-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Checked-in passengers</CardTitle>
                            <Users className="h-5 w-5 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">{checkedInCount}</p>
                            <p className="text-xs text-slate-500">Out of {passengers.length} total records</p>
                        </CardContent>
                    </Card>

                    <Card className="border border-slate-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Cancelled</CardTitle>
                            <PlaneTakeoff className="h-5 w-5 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">{cancelledCount}</p>
                            <p className="text-xs text-slate-500">Cancelled records reported by ATC</p>
                        </CardContent>
                    </Card>

                    <Card className="border border-slate-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Destinations</CardTitle>
                            <Waypoints className="h-5 w-5 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">{destinations}</p>
                            <p className="text-xs text-slate-500">Unique city-pairs in manifest</p>
                        </CardContent>
                    </Card>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between border-b border-slate-100 px-6 py-4">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">Passenger manifest</h2>
                            <p className="text-sm text-slate-600">Live data from PMS via ATC webhook</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            {new Date().toLocaleString()}
                        </Badge>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Passenger ID</TableHead>
                                    <TableHead>Flight</TableHead>
                                    <TableHead>Route</TableHead>
                                    <TableHead>Gate / Baggage</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {passengers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-12 text-center text-slate-500">
                                            No checked-in passengers were returned by the webhook.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {passengers.map((passenger) => {
                                    const variant = passenger.passenger_status?.toLowerCase() ?? 'checked-in';

                                    return (
                                        <TableRow key={`${passenger.id}-${passenger.user_id}`}>
                                            <TableCell>
                                                <div className="font-semibold text-slate-900">#{passenger.user_id}</div>
                                                <p className="text-xs text-slate-500">Record ID {passenger.id}</p>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold">{passenger.flight_number}</div>
                                                <p className="text-xs text-slate-500">
                                                    {passenger.airline_code} · {passenger.aircraft_code}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-medium text-slate-900">
                                                    {passenger.origin_code} → {passenger.destination_code}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm font-medium">{passenger.gate_code}</p>
                                                <p className="text-xs text-slate-500">Bag {passenger.baggage_code}</p>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${
                                                        statusVariants[variant] ?? 'bg-slate-100 text-slate-700 border border-slate-200'
                                                    }`}
                                                >
                                                    {passenger.passenger_status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
