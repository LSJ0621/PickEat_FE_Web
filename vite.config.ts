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
            // Chart 라이브러리 분리
            if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
              return 'chart-vendor';
            }

            // 애니메이션 라이브러리 분리
            if (id.includes('node_modules/framer-motion')) {
              return 'animation-vendor';
            }

            // Admin 번들 분리 - admin 관련 페이지/컴포넌트를 별도 chunk로
            if (
              id.includes('/features/admin/') ||
              id.includes('/app/layouts/AdminLayout')
            ) {
              return 'admin';
            }

            // React 생태계
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
              return 'react-vendor';
            }

            // Redux 생태계
            if (id.includes('node_modules/@reduxjs/toolkit') || id.includes('node_modules/react-redux')) {
              return 'redux-vendor';
            }

            // UI 라이브러리 - 모든 @radix-ui/* 패키지를 단일 청크로 묶어
            // 내부 패키지(@radix-ui/react-primitive 등)가 다른 청크에 분산되어
            // 발생하는 TDZ(Temporal Dead Zone) 런타임 에러를 방지한다.
            if (
              id.includes('node_modules/@radix-ui/') ||
              id.includes('node_modules/class-variance-authority') ||
              id.includes('node_modules/lucide-react')
            ) {
              return 'ui-vendor';
            }

            // 유틸리티
            if (
              id.includes('node_modules/axios') ||
              id.includes('node_modules/clsx') ||
              id.includes('node_modules/tailwind-merge') ||
              id.includes('node_modules/@googlemaps/js-api-loader')
            ) {
              return 'utils-vendor';
            }
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
  }
})
