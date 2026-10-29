import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Providers } from './app/providers';
import { AppRouter } from './app/router';
import './config/env';
import './styles/global.css';

const root = document.getElementById('root');
if (!root) throw new Error('Application root not found.');
createRoot(root).render(<StrictMode><Providers><AppRouter /></Providers></StrictMode>);
