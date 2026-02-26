import { scaleIn } from '@/utils/motion';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface StatItemProps {
  value: string;
  label: string;
  showDivider: boolean;
}

function StatItem({ value, label, showDivider }: StatItemProps) {
  return (
    <div className="flex items-center gap-6 sm:gap-10 md:gap-16">
      <div className="text-center">
        <p className="text-2xl sm:text-3xl font-black text-text-primary">{value}</p>
        <p className="text-sm text-text-secondary mt-1">{label}</p>
      </div>
      {showDivider && (
        <div className="h-8 border-r border-border-default" aria-hidden="true" />
      )}
    </div>
  );
}

export function SocialProofBar() {
  const { t } = useTranslation();

  const stats = [
    {
      value: t('home.socialProof.stat1Value'),
      label: t('home.socialProof.stat1Label'),
    },
    {
      value: t('home.socialProof.stat2Value'),
      label: t('home.socialProof.stat2Label'),
    },
    {
      value: t('home.socialProof.stat3Value'),
      label: t('home.socialProof.stat3Label'),
    },
  ];

  return (
    <section className="bg-white py-6 sm:py-8 md:py-10" aria-label={t('home.socialProof.sectionLabel')}>
      <motion.div
        variants={scaleIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="flex justify-center"
      >
        <div className="flex items-center">
          {stats.map((stat, index) => (
            <StatItem
              key={stat.label}
              value={stat.value}
              label={stat.label}
              showDivider={index < stats.length - 1}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
