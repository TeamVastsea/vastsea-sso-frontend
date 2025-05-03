import { resolve } from 'node:path';
import { cwd } from 'node:process';
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const plugins = [vue(), tsconfigPaths(), UnoCSS()];
  const env = loadEnv(mode, cwd());
  const define = {
    'process.env': { TINY_MODE: 'pc' },
    'BASE_URL': JSON.stringify(env.BASE_URL ?? '/api'),
    'MOBILE_WIDTH': 648,
    '__AUTH_SERVER__': JSON.stringify(env.VITE_AUTH_SERVER_CLIENT_ID),
    '__GT_ID__': JSON.stringify(env.VITE_GT_ID),
  };

  return {
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
    plugins,
    define,
  };
});
