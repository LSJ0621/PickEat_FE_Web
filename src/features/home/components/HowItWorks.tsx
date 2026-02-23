import { fadeInUp, staggerContainer } from '@shared/utils/motion';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface StepCardProps {
  stepNumber: number;
  title: string;
  description: string;
  showConnector: boolean;
}

function StepCard({ stepNumber, title, description, showConnector }: StepCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      className="relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-3xl p-5 sm:p-6 md:p-8"
    >
      {/* Watermark number */}
      <p
        className="text-5xl sm:text-6xl md:text-7xl font-black text-brand-primary/20 leading-none"
        aria-hidden="true"
      >
        {stepNumber}
      </p>

      {/* Title */}
      <h3 className="text-xl font-bold text-white mt-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-base text-zinc-400 mt-3 leading-relaxed">{description}</p>

      {/* Desktop connector line to next card */}
      {showConnector && (
        <div
          className="absolute top-10 left-full w-8 h-px border-t-2 border-dashed border-zinc-700 hidden md:block"
          aria-hidden="true"
        />
      )}
    </motion.div>
  );
}

export function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      number: 1,
      title: t('home.howItWorks.step1.title'),
      description: t('home.howItWorks.step1.description'),
    },
    {
      number: 2,
      title: t('home.howItWorks.step2.title'),
      description: t('home.howItWorks.step2.description'),
    },
    {
      number: 3,
      title: t('home.howItWorks.step3.title'),
      description: t('home.howItWorks.step3.description'),
    },
  ];

  return (
    <section className="bg-zinc-950 py-12 sm:py-16 md:py-20" aria-labelledby="how-it-works-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2
            id="how-it-works-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight"
          >
            {t('home.howItWorks.title')}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-zinc-400 mt-4 max-w-2xl mx-auto">
            {t('home.howItWorks.subtitle')}
          </p>
        </div>

        {/* Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          role="group"
          aria-label={t('home.howItWorks.title')}
        >
          {steps.map((step, index) => (
            <StepCard
              key={step.number}
              stepNumber={step.number}
              title={step.title}
              description={step.description}
              showConnector={index < steps.length - 1}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
