/**
 * 홈화면 히어로 섹션 컴포넌트
 */

import { Button } from '@/components/common/Button';
import { useAppSelector } from '@/store/hooks';
import { ChefHat, ChevronDown, Soup, UtensilsCrossed } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const HomeHero = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);

  const handleLearnMore = () => {
    const featuresElement = document.getElementById('features-section');
    if (featuresElement) {
      featuresElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative flex min-h-[55vh] flex-col items-center justify-center px-4 py-20 text-center md:min-h-[70vh] overflow-hidden bg-[#FFF8F0] hero-bg-gradient">
      {/* Hero blob decorations */}
      <div className="hero-blob absolute top-20 left-[15%] h-64 w-64 bg-brand-primary/20" />
      <div className="hero-blob absolute bottom-32 right-[10%] h-80 w-80 bg-brand-coral/15" style={{ animationDelay: '-5s' }} />
      <div className="hero-blob absolute top-1/2 left-[5%] h-48 w-48 bg-brand-amber/20" style={{ animationDelay: '-10s' }} />

      {/* Decorative Lucide icons - desktop only */}
      <UtensilsCrossed aria-hidden="true" className="absolute top-16 left-[10%] h-16 w-16 text-text-primary opacity-[0.12] animate-float hidden sm:block" />
      <ChefHat aria-hidden="true" className="absolute bottom-24 right-[12%] h-14 w-14 text-text-primary opacity-[0.12] animate-float hidden sm:block" style={{ animationDelay: '-3s' }} />
      <Soup aria-hidden="true" className="absolute top-1/3 right-[8%] h-12 w-12 text-text-primary opacity-[0.12] animate-float hidden sm:block" style={{ animationDelay: '-6s' }} />

      {/* Content */}
      <div className="relative z-10 mb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-text-secondary animate-fade-in font-medium">
          {t('home.hero.badge')}
        </p>
        <h1 className="mt-6 text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight text-text-primary animate-fade-in-up">
          {t('home.hero.title')}
          <br />
          <span className="hero-text-gradient">
            {t('home.hero.titleHighlight')}
          </span>
          {t('home.hero.titleSuffix')}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary sm:text-xl animate-fade-in-up-delay">
          {t('home.hero.description')}
        </p>
      </div>

      <div className="relative z-10 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up-delay-2">
        {isAuthenticated ? (
          <>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/agent')}
              className="px-8 py-4 text-base sm:text-lg rounded-xl shadow-lg animate-pulse-glow"
            >
              {t('home.hero.startButton')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleLearnMore}
              className="px-6 py-4 text-base sm:text-lg"
            >
              {t('home.hero.learnMore')}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/login')}
              className="px-8 py-4 text-base sm:text-lg rounded-xl shadow-lg animate-pulse-glow"
            >
              {t('home.hero.loginButton')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleLearnMore}
              className="px-6 py-4 text-base sm:text-lg"
            >
              {t('home.hero.learnMore')}
            </Button>
          </>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown aria-hidden="true" className="h-8 w-8 text-text-tertiary" />
      </div>
    </section>
  );
};
