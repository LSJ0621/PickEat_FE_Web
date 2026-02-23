import { AuthPromptModal } from '@/components/common/AuthPromptModal';
import { useHomeCtaAction } from '@/hooks/home/useHomeCtaAction';
import { fadeInUp } from '@/utils/motion';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export function CtaSection() {
  const { t } = useTranslation();
  const { showAuthPrompt, handleCtaClick, handleAuthConfirm, handleAuthClose } =
    useHomeCtaAction();

  return (
    <>
      <section
        className="bg-brand-primary relative overflow-hidden py-14 sm:py-16 md:py-20"
        aria-labelledby="cta-heading"
      >
        {/* Noise overlay */}
        <div
          className="absolute inset-0 opacity-[0.05] cta-noise-overlay pointer-events-none"
          aria-hidden="true"
        />

        {/* Decorative blob */}
        <div
          className="absolute w-[35vw] h-[35vw] max-w-[300px] max-h-[300px] rounded-full bg-white/10 blur-[80px] -top-20 -right-20 pointer-events-none"
          aria-hidden="true"
        />

        {/* Content */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative z-10 text-center max-w-3xl mx-auto px-4 sm:px-6"
        >
          <h2
            id="cta-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight"
          >
            {t('home.cta.title')}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-white/80 mt-3 sm:mt-4 max-w-xl mx-auto">
            {t('home.cta.description')}
          </p>
          <button
            onClick={handleCtaClick}
            className="mt-6 sm:mt-8 bg-white text-text-primary rounded-full px-8 py-3.5 sm:px-10 sm:py-4 text-base sm:text-lg font-bold hover:bg-white/90 shadow-xl hover:scale-[1.02] transition-all duration-300"
            type="button"
          >
            {t('home.cta.button')}
          </button>
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
