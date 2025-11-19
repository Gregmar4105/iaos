
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    // FIX: Modified the resolve function to handle the case-sensitive path lookup.
    // Laravel requests the component as 'SearchFlights' (PascalCase), but the file 
    // on disk is named 'search-flights.tsx' (kebab-case).
    resolve: (name) => {
        let fileName = name;
        
        // Explicitly map 'SearchFlights' to its actual file name 'search-flights'
        if (name === 'SearchFlights') {
            fileName = 'search-flights';
        }
        
        return resolvePageComponent(
            `./pages/${fileName}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        );
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();