import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createHtmlPlugin } from 'vite-plugin-html'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      createHtmlPlugin({
        inject: {
          data: {
            VITE_GOOGLE_API_KEY: env.VITE_GOOGLE_API_KEY || env.GOOGLE_API_KEY,
          },
        },
      }),
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

            // UI 라이브러리
            if (
              id.includes('node_modules/@radix-ui/react-dialog') ||
              id.includes('node_modules/@radix-ui/react-checkbox') ||
              id.includes('node_modules/@radix-ui/react-label') ||
              id.includes('node_modules/@radix-ui/react-radio-group') ||
              id.includes('node_modules/@radix-ui/react-select') ||
              id.includes('node_modules/@radix-ui/react-separator') ||
              id.includes('node_modules/@radix-ui/react-slot') ||
              id.includes('node_modules/@radix-ui/react-tabs')
            ) {
              return 'ui-vendor';
            }

            // 유틸리티
            if (
              id.includes('node_modules/axios') ||
              id.includes('node_modules/class-variance-authority') ||
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
