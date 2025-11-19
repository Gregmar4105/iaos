import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type WeatherRecord } from '@/lib/weather';
import {
    CloudSun,
    Droplets,
    Gauge,
    MapPin,
    SunMedium,
    ThermometerSun,
    Wind,
    Clock3,
    type LucideIcon,
} from 'lucide-react';

const iconMap: Record<
    string,
    {
        icon: LucideIcon;
        badge: string;
        iconColor: string;
    }
> = {
    city: { icon: MapPin, badge: 'bg-rose-50 text-rose-700', iconColor: 'text-rose-500' },
    location: { icon: MapPin, badge: 'bg-rose-50 text-rose-700', iconColor: 'text-rose-500' },
    condition: { icon: CloudSun, badge: 'bg-amber-50 text-amber-700', iconColor: 'text-amber-500' },
    status: { icon: CloudSun, badge: 'bg-amber-50 text-amber-700', iconColor: 'text-amber-500' },
    weather: { icon: CloudSun, badge: 'bg-amber-50 text-amber-700', iconColor: 'text-amber-500' },
    summary: { icon: CloudSun, badge: 'bg-amber-50 text-amber-700', iconColor: 'text-amber-500' },
    temperature: { icon: ThermometerSun, badge: 'bg-orange-50 text-orange-700', iconColor: 'text-orange-500' },
    temp: { icon: ThermometerSun, badge: 'bg-orange-50 text-orange-700', iconColor: 'text-orange-500' },
    temp_c: { icon: ThermometerSun, badge: 'bg-orange-50 text-orange-700', iconColor: 'text-orange-500' },
    temp_f: { icon: ThermometerSun, badge: 'bg-orange-50 text-orange-700', iconColor: 'text-orange-500' },
    humidity: { icon: Droplets, badge: 'bg-cyan-50 text-cyan-700', iconColor: 'text-cyan-500' },
    relative_humidity: { icon: Droplets, badge: 'bg-cyan-50 text-cyan-700', iconColor: 'text-cyan-500' },
    wind: { icon: Wind, badge: 'bg-blue-50 text-blue-700', iconColor: 'text-blue-500' },
    wind_speed: { icon: Wind, badge: 'bg-blue-50 text-blue-700', iconColor: 'text-blue-500' },
    wind_kts: { icon: Wind, badge: 'bg-blue-50 text-blue-700', iconColor: 'text-blue-500' },
    wind_mph: { icon: Wind, badge: 'bg-blue-50 text-blue-700', iconColor: 'text-blue-500' },
    pressure: { icon: Gauge, badge: 'bg-purple-50 text-purple-700', iconColor: 'text-purple-500' },
    barometer: { icon: Gauge, badge: 'bg-purple-50 text-purple-700', iconColor: 'text-purple-500' },
    uv_index: { icon: SunMedium, badge: 'bg-yellow-50 text-yellow-700', iconColor: 'text-yellow-500' },
    updated_at: { icon: Clock3, badge: 'bg-slate-100 text-slate-700', iconColor: 'text-slate-500' },
    timestamp: { icon: Clock3, badge: 'bg-slate-100 text-slate-700', iconColor: 'text-slate-500' },
};

const defaultIconStyle = {
    icon: CloudSun,
    badge: 'bg-blue-50 text-blue-700',
    iconColor: 'text-blue-500',
};

const normalizeLabel = (label: string) =>
    label
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .trim();

const formatPrimitive = (value: unknown) => {
    if (value === null || value === undefined) return '—';

    if (typeof value === 'number') {
        return Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : String(value);
    }

    return String(value);
};

const renderNested = (value: unknown) => {
    if (Array.isArray(value)) {
        return (
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {value.map((item, index) => (
                    <li key={`${index}-${String(item)}`} className="rounded bg-slate-100/70 px-2 py-1">
                        {formatPrimitive(item)}
                    </li>
                ))}
            </ul>
        );
    }

    if (value && typeof value === 'object') {
        return (
            <dl className="mt-2 space-y-1 text-sm">
                {Object.entries(value as Record<string, unknown>).map(([nestedKey, nestedValue]) => (
                    <div key={nestedKey} className="flex items-center justify-between gap-4 rounded bg-slate-50 px-2 py-1">
                        <dt className="text-slate-500">{normalizeLabel(nestedKey)}</dt>
                        <dd className="font-medium text-slate-900">{formatPrimitive(nestedValue)}</dd>
                    </div>
                ))}
            </dl>
        );
    }

    return (
        <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatPrimitive(value)}
        </p>
    );
};

export interface WeatherResultProps {
    data: WeatherRecord;
    compact?: boolean;
    className?: string;
}

export function WeatherResult({ data, compact = false, className }: WeatherResultProps) {
    const entries = Object.entries(data ?? {});

    if (!entries.length) return null;

    return (
        <div
            className={cn(
                'grid gap-4',
                compact ? 'md:grid-cols-1' : 'md:grid-cols-2',
                className,
            )}
        >
            {entries.map(([key, value]) => {
                const normalizedKey = key.toLowerCase();
                const iconConfig = iconMap[normalizedKey] ?? defaultIconStyle;
                const Icon = iconConfig.icon;

                return (
                    <Card
                        key={key}
                        className="border border-slate-100 bg-gradient-to-br from-white via-slate-50 to-white shadow-sm"
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                {normalizeLabel(key)}
                            </CardTitle>
                            <Badge
                                variant="secondary"
                                className={cn('flex items-center gap-1 border border-transparent', iconConfig.badge)}
                            >
                                <Icon className={cn('h-3.5 w-3.5', iconConfig.iconColor)} />
                                {normalizedKey}
                            </Badge>
                        </CardHeader>
                        <CardContent>{renderNested(value)}</CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

