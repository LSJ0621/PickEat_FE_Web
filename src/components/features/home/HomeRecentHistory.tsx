import { SkeletonCard } from '@/components/common/SkeletonCard';
import { useHomeRecentHistory } from '@/hooks/home/useHomeRecentHistory';
import { formatMonthDay } from '@/utils/format';
import { fadeInUp, staggerContainer } from '@/utils/motion';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function HomeRecentHistory() {
  const { t } = useTranslation();
  const { items, isLoading, isVisible } = useHomeRecentHistory();

  if (!isVisible) return null;

  return (
    <section className="px-5 py-10 sm:px-6 sm:py-14 md:py-16 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Section header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
            {t('home.recentHistory.title')}
          </h2>
          <Link
            to="/recommendations/history"
            className="text-sm font-medium text-brand-primary transition-opacity hover:opacity-70"
          >
            {t('home.recentHistory.viewAll')}
          </Link>
        </div>

        {/* Skeleton state */}
        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[280px] snap-start md:min-w-0">
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : (
          /* Cards */
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible"
          >
            {items.map((item) => (
              <motion.div
                key={item.id}
                variants={fadeInUp}
                className="min-w-[280px] snap-start md:min-w-0"
              >
                <Link
                  to="/recommendations/history"
                  className="block h-full rounded-2xl border-t-2 border-brand-primary bg-bg-primary p-5 card-interactive"
                >
                  {/* Date */}
                  <p className="mb-2 text-xs text-text-tertiary">
                    {item.recommendedAt
                      ? formatMonthDay(item.recommendedAt)
                      : t('home.recentHistory.noDate')}
                  </p>

                  {/* Menu names as title */}
                  <p className="mb-1 truncate font-semibold text-text-primary">
                    {item.recommendations.map((r) => r.menu).join(', ')}
                  </p>

                  {/* Address / context */}
                  {item.requestAddress && (
                    <p className="mb-3 truncate text-sm text-text-secondary">
                      {item.requestAddress}
                    </p>
                  )}

                  {/* Tags from recommendations */}
                  <div className="flex flex-wrap gap-1.5">
                    {item.recommendations.slice(0, 3).map((rec) => (
                      <span
                        key={rec.menu}
                        className="rounded-full bg-bg-tertiary px-3 py-1 text-xs font-medium text-text-secondary"
                      >
                        {rec.menu}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <p className="mt-4 text-xs font-medium text-brand-primary">
                    {t('home.recentHistory.viewDetail')} &rarr;
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
