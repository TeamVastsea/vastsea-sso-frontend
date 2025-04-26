import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import { visualizer } from 'rollup-plugin-visualizer';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';
import { Plugin as importToCDN } from 'vite-plugin-cdn-import';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tsconfigPaths(),
    UnoCSS(),
    visualizer({ open: true }),
    importToCDN({
      modules: [
        'vue',
        'vue-router',
      ],
      enableInDevMode: true,
    }),
  ],
  define: {
    'process.env': { TINY_MODE: 'pc' },
    'BASE_URL': JSON.stringify('/api'),
    'MOBILE_WIDTH': 648,
    '__AUTH_SERVER__': JSON.stringify('oagoiasdjgioa'),
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
  build: {
    rollupOptions: {
      external: ['vue', 'vue-router'],
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
  },
});
