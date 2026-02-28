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
            // Admin 번들 (앱 코드, lazy-load 라우트 - React 로드 순서 무관)
            if (
              id.includes('/features/admin/') ||
              id.includes('/app/layouts/AdminLayout')
            ) {
              return 'admin';
            }
            // node_modules는 Rollup 자동 분할에 위임
            // (수동 분리 시 청크 간 로드 순서 미보장으로 런타임 에러 발생)
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
  }
})
