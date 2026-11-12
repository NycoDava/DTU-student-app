import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { loadAppFile } from './data/appFile';
import { initAppData } from './data/appData';
import './index.css';

// Installed as an app (PWA): no phone frame, safe areas (see index.css). iOS sets navigator.standalone.
const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
if (standalone) document.documentElement.classList.add('is-standalone');

// The service worker only makes the app installable (no cache). Browsers allow it on https and localhost only.
if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

// Load app-data.json once, then render: every screen reads the data synchronously from appData.ts.
loadAppFile().then((file) => {
  initAppData(file);
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
});
