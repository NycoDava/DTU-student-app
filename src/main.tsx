import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { loadAppFile } from './data/appFile';
import { initAppData } from './data/appData';
import './index.css';

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
