import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WeatherResult } from '@/components/weather-result';
import {
    extractWeatherSummary,
    formatWeatherStat,
    formatWeatherTimestamp,
    toWeatherRecord,
    type WeatherRecord,
} from '@/lib/weather';
import { FormEvent, useEffect, useState } from 'react';
import { Cloud, CloudFog, Clock3, Droplets, Loader2, MapPin, ThermometerSun, Wind, Sparkles } from 'lucide-react';

type WeatherPayload = WeatherRecord | null;

interface WeatherProps extends SharedData {
    query?: string;
    weather: WeatherPayload;
    error?: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Weather updates', href: '/weather-updates' },
];

export default function WeatherUpdates({ query = '', weather, error }: WeatherProps) {
    const [city, setCity] = useState(query);
    const [isSubmitting, setSubmitting] = useState(false);

    useEffect(() => {
        setCity(query);
    }, [query]);

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true);
        router.get(
            '/weather-updates',
            { city },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setSubmitting(false),
            },
        );
    };

    const weatherData = toWeatherRecord(weather);
    const hasResult = Boolean(weatherData && Object.keys(weatherData).length > 0);
    const summary = extractWeatherSummary(weatherData, query);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Weather Updates" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Weather feed unavailable</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Card className="border border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold text-slate-900">Search by city</CardTitle>
                        <p className="text-sm text-slate-600">Lookup live conditions from the ATC weather feed</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
                            <div className="flex-1">
                                <Input
                                    placeholder="Enter city (e.g. Abu Dhabi)"
                                    value={city}
                                    onChange={(event) => setCity(event.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={!city || isSubmitting} className="sm:w-40">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Search
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-col gap-2">
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                            <Cloud className="h-5 w-5 text-blue-500" />
                            Weather result
                        </CardTitle>
                        {query && (
                            <p className="text-sm text-slate-600">
                                Showing the latest data for <span className="font-semibold">{query}</span>
                            </p>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {!query && (
                            <div className="flex flex-col items-center gap-3 py-12 text-center text-slate-500">
                                <CloudFog className="h-10 w-10" />
                                <p>Search for a city to pull data from the ATC weather webhook.</p>
                            </div>
                        )}

                        {query && !hasResult && !error && (
                            <div className="flex flex-col items-center gap-3 py-12 text-center text-slate-500">
                                <MapPin className="h-10 w-10" />
                                <p>No weather data was returned for {query}.</p>
                            </div>
                        )}

                        {hasResult && weatherData && (
                            <>
                                <div className="grid gap-4 lg:grid-cols-3">
                                    <Card className="lg:col-span-3 border-0 bg-gradient-to-br from-sky-500 via-indigo-500 to-blue-600 text-white shadow-lg">
                                        <CardHeader className="space-y-1">
                                            <p className="text-sm uppercase tracking-widest text-white/80">Live conditions</p>
                                            <CardTitle className="flex flex-wrap items-center gap-3 text-3xl font-semibold">
                                                <Sparkles className="h-7 w-7" />
                                                {summary.city ?? query}
                                                {summary.condition && (
                                                    <Badge className="bg-white/20 text-white">
                                                        {summary.condition}
                                                    </Badge>
                                                )}
                                            </CardTitle>
                                            <p className="text-sm text-white/80">{formatWeatherTimestamp(summary.updatedAt)}</p>
                                        </CardHeader>
                                    </Card>

                                    {[
                                        {
                                            label: 'Temperature',
                                            value: formatWeatherStat(summary.temperature, '°'),
                                            icon: ThermometerSun,
                                        },
                                        {
                                            label: 'Humidity',
                                            value: formatWeatherStat(summary.humidity, '%'),
                                            icon: Droplets,
                                        },
                                        {
                                            label: 'Wind',
                                            value: formatWeatherStat(summary.wind, 'knots'),
                                            icon: Wind,
                                        },
                                        {
                                            label: 'Updated',
                                            value: formatWeatherTimestamp(summary.updatedAt),
                                            icon: Clock3,
                                        },
                                    ].map(({ label, value, icon: Icon }) => (
                                        <Card key={label} className="border border-slate-100 shadow-sm">
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    {label}
                                                </CardTitle>
                                                <Icon className="h-4 w-4 text-slate-400" />
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-2xl font-semibold text-slate-900">{value}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                <WeatherResult data={weatherData} />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

