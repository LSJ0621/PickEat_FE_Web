import { AuthPromptModal } from '@/components/common/AuthPromptModal';
import { useHomeCtaAction } from '@/hooks/home/useHomeCtaAction';
import { fadeInUp, revealUp, staggerContainer } from '@/utils/motion';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export function HeroSection() {
  const { t } = useTranslation();
  const { showAuthPrompt, handleCtaClick, handleAuthConfirm, handleAuthClose } =
    useHomeCtaAction();

  const headline = t('home.hero.headline');
  const lines = headline.split('\n');

  return (
    <>
      <section
        className="bg-zinc-950 min-h-[60dvh] md:min-h-[70dvh] relative overflow-hidden flex items-center justify-center"
        aria-label={t('home.greeting.heroSection')}
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] rounded-full bg-brand-primary/20 blur-[80px] md:blur-[100px] animate-gentle-orbit" />
          <div
            className="absolute bottom-1/3 right-1/4 w-[30vw] h-[30vw] max-w-[320px] max-h-[320px] rounded-full bg-brand-amber/15 blur-[60px] md:blur-[80px] animate-gentle-orbit [animation-delay:1.5s]"
          />
        </div>

        {/* Noise overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] cta-noise-overlay pointer-events-none"
          aria-hidden="true"
        />

        {/* Content */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="flex justify-center">
            <span className="inline-flex items-center bg-brand-primary/20 text-brand-secondary border border-brand-primary/30 rounded-full px-4 py-1.5 text-sm font-medium">
              {t('home.hero.badge')}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={revealUp}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.04em] text-white mt-5 sm:mt-6 whitespace-pre-line"
          >
            {lines.map((line, i) => {
              if (i === 0) {
                const words = line.split(' ');
                return (
                  <span key={i} className="block">
                    <span className="text-brand-primary">{words[0]}</span>
                    {words.length > 1 && ` ${words.slice(1).join(' ')}`}
                  </span>
                );
              }
              return <span key={i} className="block">{line}</span>;
            })}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mt-3 sm:mt-4"
          >
            {t('home.hero.subtext')}
          </motion.p>

          {/* CTA Button */}
          <motion.div variants={fadeInUp} className="mt-6 sm:mt-8">
            <button
              onClick={handleCtaClick}
              className="bg-brand-primary text-white rounded-full px-8 py-3.5 sm:px-10 sm:py-4 text-base sm:text-lg font-bold hover:shadow-[0_0_40px_rgba(255,107,53,0.4)] hover:scale-[1.02] transition-all duration-300"
              type="button"
            >
              {t('home.hero.cta')}
            </button>
          </motion.div>
        </motion.div>
      </section>

      <AuthPromptModal
        open={showAuthPrompt}
        onConfirm={handleAuthConfirm}
        onClose={handleAuthClose}
      />
    </>
  );
}
