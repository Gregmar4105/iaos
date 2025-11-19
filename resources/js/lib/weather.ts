export type WeatherRecord = Record<string, unknown>;

export const isWeatherRecord = (payload: unknown): payload is WeatherRecord =>
    Boolean(payload) && typeof payload === 'object' && !Array.isArray(payload);

export const toWeatherRecord = (payload: unknown): WeatherRecord | null => {
    if (!payload) return null;

    if (isWeatherRecord(payload)) {
        return payload;
    }

    if (Array.isArray(payload)) {
        const firstObject = payload.find((entry) => isWeatherRecord(entry));

        if (firstObject) {
            return firstObject as WeatherRecord;
        }

        return {
            records: payload,
        };
    }

    if (typeof payload === 'object') {
        return payload as WeatherRecord;
    }

    return {
        value: payload,
    };
};

export const normalizeWeatherRecord = (payload: WeatherRecord | null | undefined): WeatherRecord => {
    if (!payload) return {};

    return Object.entries(payload).reduce<WeatherRecord>((acc, [key, value]) => {
        acc[key.toLowerCase()] = value;
        return acc;
    }, {});
};

const coercePrimitive = (value: unknown, hints: string[] = []): string | number | undefined => {
    if (value === null || value === undefined) {
        return undefined;
    }

    if (typeof value === 'number' || typeof value === 'string') {
        return value;
    }

    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }

    if (Array.isArray(value)) {
        for (const item of value) {
            const result = coercePrimitive(item, hints);
            if (result !== undefined) {
                return result;
            }
        }
        return undefined;
    }

    if (typeof value === 'object') {
        const record = value as Record<string, unknown>;

        for (const hint of hints) {
            if (hint in record) {
                const result = coercePrimitive(record[hint], hints);
                if (result !== undefined) {
                    return result;
                }
            }
        }

        for (const entry of Object.values(record)) {
            const result = coercePrimitive(entry, hints);
            if (result !== undefined) {
                return result;
            }
        }
    }

    return undefined;
};

export const extractWeatherSummary = (payload: WeatherRecord | null | undefined, fallbackCity?: string) => {
    const normalized = normalizeWeatherRecord(payload);
    const weatherEntry = Array.isArray(normalized.weather) ? normalized.weather[0] : undefined;
    const windRecord =
        typeof normalized.wind === 'object' && normalized.wind !== null
            ? (normalized.wind as Record<string, unknown>)
            : undefined;

    const conditionSource =
        normalized.condition ??
        normalized.weather ??
        normalized.status ??
        normalized.summary ??
        weatherEntry ??
        normalized.main;
    const temperatureSource =
        normalized.temperature ??
        normalized.temp ??
        normalized.temp_c ??
        normalized.temp_f ??
        normalized['temperature (c)'] ??
        normalized.main;
    const humiditySource =
        normalized.humidity ??
        normalized.relative_humidity ??
        normalized.humid ??
        normalized.main;
    const windSource =
        normalized.wind ??
        normalized.wind_speed ??
        normalized.wind_kts ??
        normalized.wind_mph ??
        windRecord;
    const updatedSource =
        normalized.updated_at ??
        normalized.timestamp ??
        normalized.time ??
        normalized.observed_at ??
        normalized.dt ??
        normalized.sys;

    return {
        city: (normalized.city ?? normalized.location ?? normalized.name ?? fallbackCity) as string | undefined,
        condition: coercePrimitive(conditionSource, ['condition', 'status', 'description'])?.toString(),
        temperature: coercePrimitive(temperatureSource, ['temp', 'temperature', 'value', 'feels_like']),
        humidity: coercePrimitive(humiditySource, ['humidity', 'relative', 'value', 'percent']),
        wind: coercePrimitive(windSource, ['speed', 'value', 'knots', 'kt', 'gust']),
        updatedAt: coercePrimitive(updatedSource, ['time', 'timestamp', 'updated', 'dt']),
    };
};

export const formatWeatherStat = (value: unknown, suffix?: string) => {
    if (value === null || value === undefined || value === '') return '—';

    const base =
        typeof value === 'number'
            ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
            : String(value);

    if (!suffix) {
        return base;
    }

    return base.toLowerCase().includes(suffix.trim().toLowerCase()) ? base : `${base} ${suffix}`;
};

export const formatWeatherTimestamp = (value?: unknown) => {
    if (!value) return 'Last update time unavailable';

    const parsed = new Date(String(value));

    return Number.isNaN(parsed.getTime())
        ? String(value)
        : parsed.toLocaleString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          });
};

