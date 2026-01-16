/**
 * 홈화면 최종 CTA 섹션 컴포넌트
 */

import { AuthPromptModal } from '@/components/common/AuthPromptModal';
import { Button } from '@/components/common/Button';
import { useScrollAnimation } from '@/hooks/common/useScrollAnimation';
import { useAppSelector } from '@/store/hooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const HomeCTA = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2, delay: 100 });

  return (
    <>
      <section
        ref={ref}
        className={`py-20 px-4 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-white/5 p-12 text-center shadow-2xl shadow-black/30 backdrop-blur">
            <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              {t('home.cta.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300 sm:text-xl">
              {t('home.cta.description')}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {!isAuthenticated ? (
                <>
                  <Button size="lg" onClick={() => navigate('/login')} className="px-8 py-6 text-lg">
                    {t('home.cta.loginButton')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setShowAuthPrompt(true)}
                    className="px-8 py-6 text-lg"
                  >
                    {t('home.cta.previewButton')}
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" onClick={() => navigate('/agent')} className="px-8 py-6 text-lg">
                    {t('home.cta.startButton')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => navigate('/mypage')}
                    className="px-8 py-6 text-lg"
                  >
                    {t('home.cta.mypageButton')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <AuthPromptModal
        open={showAuthPrompt}
        onConfirm={() => {
          setShowAuthPrompt(false);
          navigate('/login');
        }}
        onClose={() => setShowAuthPrompt(false)}
      />
    </>
  );
};
