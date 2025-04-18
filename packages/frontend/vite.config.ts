import { resolve } from 'node:path';
import process from 'node:process';
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tsconfigPaths(),
    UnoCSS(),
  ],
  define: {
    'process.env': { ...process.env },
    'BASE_URL': JSON.stringify('/api'),
    MOBILE_WIDTH: 648,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src/'),
    },
  },
  server: {
    proxy: {
      '^/api': {
        target: 'http://localhost:3000',
        rewrite(path) {
          return path.replace(/^\/api/, '');
        },
        autoRewrite: true,
        changeOrigin: true,
      },
    },
  },
});
