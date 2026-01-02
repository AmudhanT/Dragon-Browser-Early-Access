
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify('AIzaSyAyaPu5IhBf-UmM5oKizChD4Vd9WINUQW0')
  }
});
