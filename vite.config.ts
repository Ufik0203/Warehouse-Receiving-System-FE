import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command, mode }) => {
  const override = process.env['API_PROXY_TARGET'];
  const target = mode === 'test' ? (override ?? 'http://127.0.0.1:3000') : 'http://127.0.0.1:3000';
  if (command === 'serve' && mode !== 'test' && override && override !== target) {
    throw new Error('Conflicting API_PROXY_TARGET terminal override. Remove it; development uses http://127.0.0.1:3000. Isolated test runtimes must use --mode test.');
  }
  return {
  plugins: [react(), tailwindcss()],
  server: {
    host: 'localhost', port: 5175, strictPort: true,
    proxy: {
      '/api': { target, changeOrigin: false },
      '/health': { target, changeOrigin: false }
    }
  }
  };
});
