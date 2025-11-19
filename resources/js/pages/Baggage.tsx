import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Luggage, Scale, Truck } from 'lucide-react';

type BaggageRecord = {
    id: number;
    passenger_id: string;
    tag: string;
    flight_number: string;
    destination: string;
    type: string;
    weight: number;
    max_weight: number;
    status: string;
    check_in_at?: string | null;
    loaded_at?: string | null;
    unloaded_at?: string | null;
};

interface BaggageProps extends SharedData {
    baggages: BaggageRecord[];
    error?: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Baggage', href: '/baggage' },
];

const formatDate = (value?: string | null) => {
    if (!value) return '—';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
        ? value
        : parsed.toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          });
};

const statusStyles: Record<string, string> = {
    loaded: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    pending: 'bg-amber-100 text-amber-700 border border-amber-200',
    unloaded: 'bg-blue-100 text-blue-700 border border-blue-200',
};

export default function Baggage({ baggages = [], error }: BaggageProps) {
    const overweightCount = baggages.filter((bag) => Number(bag.weight) > Number(bag.max_weight)).length;
    const loadedCount = baggages.filter((bag) => bag.status?.toLowerCase() === 'loaded').length;
    const totalWeight = baggages.reduce((sum, bag) => sum + Number(bag.weight || 0), 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Baggage" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Unable to load baggage feed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border border-slate-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Loaded bags</CardTitle>
                            <Luggage className="h-5 w-5 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">{loadedCount}</p>
                            <p className="text-xs text-slate-500">{baggages.length} total tracked</p>
                        </CardContent>
                    </Card>

                    <Card className="border border-slate-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Overweight alerts</CardTitle>
                            <Scale className="h-5 w-5 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">{overweightCount}</p>
                            <p className="text-xs text-slate-500">Weight &gt; max allowance</p>
                        </CardContent>
                    </Card>

                    <Card className="border border-slate-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Total mass</CardTitle>
                            <Truck className="h-5 w-5 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">{totalWeight.toFixed(1)} kg</p>
                            <p className="text-xs text-slate-500">All tagged baggage</p>
                        </CardContent>
                    </Card>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between border-b border-slate-100 px-6 py-4">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">Baggage inventory</h2>
                            <p className="text-sm text-slate-600">Live feed from BHS via ATC webhook</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            Updated {new Date().toLocaleTimeString()}
                        </Badge>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tag</TableHead>
                                    <TableHead>Flight</TableHead>
                                    <TableHead>Destination</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Weight</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="min-w-[220px]">Timeline</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {baggages.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-12 text-center text-slate-500">
                                            No baggage data is currently available.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {baggages.map((bag) => {
                                    const isOverweight = Number(bag.weight) > Number(bag.max_weight);
                                    const statusKey = bag.status?.toLowerCase() ?? 'pending';

                                    return (
                                        <TableRow key={`${bag.id}-${bag.tag}`}>
                                            <TableCell>
                                                <div className="font-semibold text-slate-900">{bag.tag}</div>
                                                <p className="text-xs text-slate-500">Passenger #{bag.passenger_id}</p>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{bag.flight_number}</div>
                                                <p className="text-xs text-slate-500">Max {bag.max_weight} kg</p>
                                            </TableCell>
                                            <TableCell className="capitalize">{bag.destination}</TableCell>
                                            <TableCell className="capitalize">{bag.type}</TableCell>
                                            <TableCell>
                                                <span className={`font-semibold ${isOverweight ? 'text-amber-600' : 'text-slate-900'}`}>
                                                    {bag.weight} kg
                                                </span>
                                                {isOverweight && (
                                                    <p className="text-xs text-amber-600">Over by {(bag.weight - bag.max_weight).toFixed(1)} kg</p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${
                                                        statusStyles[statusKey] ?? 'bg-slate-100 text-slate-700 border border-slate-200'
                                                    }`}
                                                >
                                                    {bag.status || 'Pending'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs text-slate-600">
                                                    <p>
                                                        <span className="font-semibold">Check-in:</span> {formatDate(bag.check_in_at)}
                                                    </p>
                                                    <p>
                                                        <span className="font-semibold">Loaded:</span> {formatDate(bag.loaded_at)}
                                                    </p>
                                                    <p>
                                                        <span className="font-semibold">Unloaded:</span> {formatDate(bag.unloaded_at)}
                                                    </p>
                                                </div>
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

