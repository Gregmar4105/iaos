import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, Circle } from 'lucide-react';

type NotamRecord = {
    id: number;
    airport_id: string;
    city: string;
    message: string;
    created_at?: string;
    updated_at?: string;
};

interface NotamsProps extends SharedData {
    notams: NotamRecord[];
    error?: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'NOTAMs', href: '/notams' },
];

const classify = (message: string) => {
    const normalized = message.toLowerCase();

    if (normalized.includes('severe') || normalized.includes('not advised')) {
        return { label: 'Critical', tone: 'bg-rose-100 text-rose-700 border border-rose-200', icon: AlertTriangle };
    }

    if (normalized.includes('delay') || normalized.includes('light rain')) {
        return { label: 'Caution', tone: 'bg-amber-100 text-amber-700 border border-amber-200', icon: AlertTriangle };
    }

    return { label: 'Advisory', tone: 'bg-emerald-100 text-emerald-700 border border-emerald-200', icon: CheckCircle2 };
};

const formatTimestamp = (value?: string) => {
    if (!value) return '';
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

export default function Notams({ notams = [], error }: NotamsProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="NOTAMs" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Unable to load NOTAMs</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">Active NOTAMs</h1>
                            <p className="text-sm text-slate-600">Straight from ATC automation via n8n webhook</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            {new Date().toLocaleString()}
                        </Badge>
                    </div>

                    {notams.length === 0 ? (
                        <div className="py-12 text-center text-slate-500">No NOTAMs were returned.</div>
                    ) : (
                        <div className="grid gap-4 lg:grid-cols-2">
                            {notams.map((notam) => {
                                const marker = classify(notam.message ?? '');
                                const Icon = marker.icon ?? Circle;

                                return (
                                    <Card key={notam.id} className="border border-slate-200 shadow-sm">
                                        <CardHeader className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-lg font-semibold text-slate-900">
                                                        {notam.airport_id} · {notam.city}
                                                    </CardTitle>
                                                    <p className="text-xs text-slate-500">#{notam.id}</p>
                                                </div>
                                                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${marker.tone}`}>
                                                    <Icon className="h-3.5 w-3.5" />
                                                    {marker.label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                Updated {formatTimestamp(notam.updated_at ?? notam.created_at)}
                                            </p>
                                        </CardHeader>
                                        <CardContent>
                                            <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                                                {notam.message}
                                            </pre>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}

