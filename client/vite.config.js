import { defineConfig } from 'vite';
import react from 'react';

export default defineConfig({
  plugins: [react()],
  base: '/taskflow/',
  server: {
    port: 5173
  }
});
