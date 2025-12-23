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
          manualChunks: {
            // React 생태계
            'react-vendor': [
              'react',
              'react-dom',
              'react-router-dom',
            ],

            // Redux 생태계
            'redux-vendor': [
              '@reduxjs/toolkit',
              'react-redux',
            ],

            // UI 라이브러리
            'ui-vendor': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-checkbox',
              '@radix-ui/react-label',
              '@radix-ui/react-radio-group',
              '@radix-ui/react-select',
              '@radix-ui/react-separator',
              '@radix-ui/react-slot',
              '@radix-ui/react-tabs',
            ],

            // 유틸리티
            'utils-vendor': [
              'axios',
              'class-variance-authority',
              'clsx',
              'tailwind-merge',
              '@googlemaps/js-api-loader',
            ],
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
  }
})
