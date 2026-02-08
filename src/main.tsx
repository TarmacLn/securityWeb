import { createRoot } from 'react-dom/client';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import './index.css';

import Entry from './index.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('Root element not found');
}

// from mui doc
const nonce = window.__CSP_NONCE__;

const emotionCache = createCache({
    key: 'mui',
    nonce,
    prepend: true,
});

createRoot(rootElement).render(
    <CacheProvider value={emotionCache}>
        <Entry />
    </CacheProvider>
);
