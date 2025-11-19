import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

type SafetyGuideline = {
    airport_id: string;
    city: string;
    severity: 'critical' | 'caution' | 'normal';
    summary: string;
    recommendations: string[];
};

interface SafetyProps extends SharedData {
    guidelines: SafetyGuideline[];
    error?: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Safety measures', href: '/safety-measures' },
];

const severityConfig: Record<SafetyGuideline['severity'], { label: string; tone: string; icon: typeof Shield }> = {
    critical: { label: 'Critical', tone: 'bg-rose-100 text-rose-700 border border-rose-200', icon: ShieldAlert },
    caution: { label: 'Caution', tone: 'bg-amber-100 text-amber-700 border border-amber-200', icon: Shield },
    normal: { label: 'Normal', tone: 'bg-emerald-100 text-emerald-700 border border-emerald-200', icon: ShieldCheck },
};

export default function SafetyMeasures({ guidelines = [], error }: SafetyProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Safety Measures" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Unable to generate guidelines</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">ATC-driven safety measures</h1>
                            <p className="text-sm text-slate-600">Automatically generated based on the latest NOTAMs</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            Refreshed {new Date().toLocaleTimeString()}
                        </Badge>
                    </div>

                    {guidelines.length === 0 ? (
                        <div className="py-12 text-center text-slate-500">
                            No safety advisories are available at the moment.
                        </div>
                    ) : (
                        <div className="grid gap-4 lg:grid-cols-2">
                            {guidelines.map((guideline, index) => {
                                const config = severityConfig[guideline.severity] ?? severityConfig.normal;
                                const Icon = config.icon;

                                return (
                                    <Card key={`${guideline.airport_id}-${index}`} className="border border-slate-200 shadow-sm">
                                        <CardHeader className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg font-semibold text-slate-900">
                                                    {guideline.airport_id} · {guideline.city}
                                                </CardTitle>
                                                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${config.tone}`}>
                                                    <Icon className="h-3.5 w-3.5" />
                                                    {config.label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600">{guideline.summary}</p>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
                                                {guideline.recommendations.map((recommendation, idx) => (
                                                    <li key={idx}>{recommendation}</li>
                                                ))}
                                            </ul>
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

