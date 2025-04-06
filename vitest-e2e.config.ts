import { resolve } from 'path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts'],
    globals: true,
    root: './',
    alias: {
      '@app/config': resolve(__dirname, './libs/config/src'),
      '@app/constant': resolve(__dirname, './libs/constant/src'),
      '@app/decorator': resolve(__dirname, './libs/decorator/src'),
      '@app/jwt': resolve(__dirname, './libs/jwt/src'),
      '@app/prisma': resolve(__dirname, './libs/prisma/src'),
      '@app/redis-cache': resolve(__dirname, './libs/redis-cache/src'),
      '@app/global-counter': resolve(__dirname, './libs/global-counter/src'),
    },
  },
  plugins: [swc.vite()],
  define: {
    __dirname: JSON.stringify(`'${resolve('.')}'`),
    __TEST__: true,
  },
  resolve: {
    alias: {
      '@app/config': resolve(__dirname, './libs/config/src'),
      '@app/constant': resolve(__dirname, './libs/constant/src'),
      '@app/decorator': resolve(__dirname, './libs/decorator/src'),
      '@app/jwt': resolve(__dirname, './libs/jwt/src'),
      '@app/prisma': resolve(__dirname, './libs/prisma/src'),
      '@app/redis-cache': resolve(__dirname, './libs/redis-cache/src'),
      '@app/global-counter': resolve(__dirname, './libs/global-counter/src'),
    },
  },
});
