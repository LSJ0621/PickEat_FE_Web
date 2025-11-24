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
      include: ['@reduxjs/toolkit', 'react-redux'],
    },
  }
})
