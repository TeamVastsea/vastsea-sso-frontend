import { resolve } from 'node:path';
import { env } from 'node:process';
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
    'process.env': { TINY_MODE: 'pc' },
    'BASE_URL': JSON.stringify(env.BASE_URL ?? '/api'),
    'MOBILE_WIDTH': 648,
    '__AUTH_SERVER__': JSON.stringify(env.AUTH_SERVER_CLIENT_ID),
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
