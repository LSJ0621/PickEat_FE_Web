/**
 * 홈화면 히어로 섹션 컴포넌트
 */

import { AuthPromptModal } from '@/components/common/AuthPromptModal';
import { Button } from '@/components/common/Button';
import { useAppSelector } from '@/store/hooks';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const HomeHero = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  return (
    <>
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.4em] text-orange-200/80 animate-fade-in">
            {t('home.hero.badge')}
          </p>
          <h1 className="mt-6 text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl animate-fade-in-up">
            {t('home.hero.title')}
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-500 bg-clip-text text-transparent">
              {t('home.hero.titleHighlight')}
            </span>
            {t('home.hero.titleSuffix')}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 sm:text-xl animate-fade-in-up-delay">
            {t('home.hero.description')}
            <br />
            {t('home.hero.descriptionContinued')}
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-in-up-delay-2">
          {!isAuthenticated ? (
            <>
              <Button size="lg" onClick={() => navigate('/login')} className="px-8 py-6 text-lg">
                {t('home.hero.loginButton')}
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setShowAuthPrompt(true)}
                className="px-8 py-6 text-lg"
              >
                {t('home.hero.previewButton')}
              </Button>
            </>
          ) : (
            <>
              <Button size="lg" onClick={() => navigate('/agent')} className="px-8 py-6 text-lg">
                {t('home.hero.startButton')}
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate('/recommendations/history')}
                className="px-8 py-6 text-lg"
              >
                {t('home.hero.historyButton')}
              </Button>
            </>
          )}
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
