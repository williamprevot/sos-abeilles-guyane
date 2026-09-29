import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Le CSS historique du site (public/css/styles.css) est servi tel quel ;
// seul le code React (src/) passe par Vite.
export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist', sourcemap: false }
});
