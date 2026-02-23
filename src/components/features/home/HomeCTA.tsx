/**
 * 홈화면 최종 CTA 섹션 컴포넌트
 */

import { Button } from '@/components/common/Button';
import { useScrollAnimation } from '@/hooks/common/useScrollAnimation';
import { useAppSelector } from '@/store/hooks';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const HomeCTA = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.1,
    rootMargin: '150px 0px',
  });

  return (
    <section
      ref={ref}
      className={`py-20 px-4 bg-bg-surface transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-gradient-to-br from-brand-primary via-brand-coral to-brand-amber p-8 sm:p-12 text-center shadow-lg">
          {/* Subtle overlay pattern */}
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              {t('home.cta.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90 sm:text-xl">
              {t('home.cta.description')}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => navigate('/agent')}
                    className="bg-white text-brand-primary hover:bg-white/90 px-8 py-4 text-lg shadow-md hover:shadow-lg rounded-xl animate-pulse-glow"
                  >
                    {t('home.cta.startButton')}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/mypage')}
                    className="border-white/50 text-white hover:bg-white/10 px-6 py-4 text-lg"
                  >
                    {t('home.cta.mypageButton')}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => navigate('/login')}
                    className="bg-white text-brand-primary hover:bg-white/90 px-8 py-4 text-lg shadow-md hover:shadow-lg rounded-xl animate-pulse-glow"
                  >
                    {t('home.cta.loginButton')}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/agent')}
                    className="border-white/50 text-white hover:bg-white/10 px-6 py-4 text-lg"
                  >
                    {t('home.cta.previewButton')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
