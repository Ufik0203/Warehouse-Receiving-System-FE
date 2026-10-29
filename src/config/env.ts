import { z } from 'zod';

// Restrict the foundation to same-origin API requests through the gateway/dev proxy.
export const environment = z.object({
  VITE_API_BASE_URL: z.literal('/api/v1').default('/api/v1')
}).parse({ VITE_API_BASE_URL: import.meta.env['VITE_API_BASE_URL'] });
