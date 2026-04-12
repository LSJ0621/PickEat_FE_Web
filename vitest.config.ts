import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('http://localhost:3000'),
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    pool: 'forks',
    minForks: 2,
    maxForks: 6,
    isolate: true,
    execArgv: ['--max-old-space-size=3072', '--expose-gc'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      // 테스트 대상만 측정: Hook + Utils (전략 문서 원칙)
      // 컴포넌트/페이지/store/API service 는 테스트 대상이 아니므로 제외
      include: [
        'src/**/hooks/**/*.{ts,tsx}',
        'src/shared/utils/**/*.{ts,tsx}',
      ],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        'src/vite-env.d.ts',
        'src/main.tsx',
        'src/App.tsx',
        // 선언적/정적 파일
        '**/*.config.{ts,js}',
        '**/index.ts',
        '**/types.ts',
        '**/constants.ts',
        // 테스트 대상 아님 (전략 문서 부록 "테스트하지 않는 것")
        'src/**/pages/**',
        'src/**/components/**',
        'src/app/store/**',
        'src/app/routes/**',
        'src/app/layouts/**',
        'src/app/providers/**',
        'src/**/api.ts',
        'src/shared/api/**',
        'src/shared/ui/**', // shadcn/ui
        'src/i18n/**',
        'src/locales/**',
        'src/styles/**',
        'src/assets/**',
        // trivial 위임 함수만 있는 유틸 (전략 문서에 명시)
        'src/shared/utils/motion.ts',
        'src/shared/utils/naverMap.ts',
        'src/shared/utils/googleMapLoader.ts',
        'src/shared/utils/translateMessage.ts',
        // UI/Trivial Hook — 단순 이벤트 리스너/Context 래퍼 (전략 문서 "테스트하지 않는 Hook")
        'src/shared/hooks/useToast.ts',
        'src/shared/hooks/useEscapeKey.ts',
        'src/shared/hooks/useFocusTrap.ts',
        'src/shared/hooks/useModalAnimation.ts',
        'src/shared/hooks/useModalScrollLock.ts',
        'src/shared/hooks/useScrollToSection.ts',
        'src/shared/hooks/useScrollAnimation.ts',
        'src/shared/hooks/useLanguage.ts',
        'src/shared/hooks/useLocalStorage.ts',
        'src/shared/hooks/usePrevious.ts',
      ],
      thresholds: {
        global: {
          statements: 90,
          branches: 90,
          functions: 90,
          lines: 90,
        },
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@features': path.resolve(__dirname, './src/features'),
      '@app': path.resolve(__dirname, './src/app'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
});
