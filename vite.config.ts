import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    UnoCSS({
      configFile: './config/unocss.config.ts',
    }),
  ],
  server:{
    proxy:{
      '/api': {
        target: 'https://auth.vastsea.cc/api',
        changeOrigin: true,
        rewrite: (path: string) => {
          return path.replace(/^\/api/, '');
        },
      }
    }
  }
});
