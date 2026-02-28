import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [
      react(),
    ],
    server: {
      port: 8080,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@shared': path.resolve(__dirname, './src/shared'),
        '@features': path.resolve(__dirname, './src/features'),
        '@app': path.resolve(__dirname, './src/app'),
      },
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: [
        '@reduxjs/toolkit',
        'react-redux',
        'react-router-dom',
        'axios',
        '@radix-ui/react-dialog',
        '@radix-ui/react-select',
      ],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Chart 라이브러리 (React 비의존, lazy-load 대상)
            if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
              return 'chart-vendor';
            }

            // Admin 번들 (lazy-load 라우트)
            if (
              id.includes('/features/admin/') ||
              id.includes('/app/layouts/AdminLayout')
            ) {
              return 'admin';
            }

            // 나머지 node_modules는 Rollup 자동 분할에 위임
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
  }
})
