import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

// Under GitHub Pages the app is served from a subpath (e.g. /cyber-academy/).
// Vite injects the configured base as BASE_URL at build time; pass it to the
// router as basename so routes resolve correctly. Locally the base is '/' and
// no basename is needed.
const base: string = import.meta.env.BASE_URL;
const routerBasename = base && base !== '/' ? base : undefined;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={routerBasename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
