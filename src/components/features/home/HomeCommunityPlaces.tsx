import { SkeletonCard } from '@/components/common/SkeletonCard';
import { Button } from '@/components/common/Button';
import { useHomeCommunityPlaces } from '@/hooks/home/useHomeCommunityPlaces';
import { fadeInUp, staggerContainer } from '@/utils/motion';
import { motion } from 'framer-motion';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

export function HomeCommunityPlaces() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { places, isLoading, isVisible } = useHomeCommunityPlaces();

  const handleRegisterClick = useCallback(() => {
    navigate('/user-places/create');
  }, [navigate]);

  if (!isVisible) return null;

  return (
    <section className="px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Section header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">
            {t('home.communityPlaces.title')}
          </h2>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegisterClick}
              className="rounded-full"
            >
              {t('home.communityPlaces.register')}
            </Button>
            <Link
              to="/user-places"
              className="text-sm font-medium text-brand-primary transition-opacity hover:opacity-70"
            >
              {t('home.communityPlaces.viewAll')}
            </Link>
          </div>
        </div>

        {/* Skeleton state */}
        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible">
            {[1, 2, 3, 4].map((i) => (
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
            className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible"
          >
            {places.map((place) => (
              <motion.div
                key={place.id}
                variants={fadeInUp}
                className="min-w-[280px] snap-start md:min-w-0"
              >
                <Link
                  to={`/user-places/${place.id}`}
                  className="block h-full overflow-hidden rounded-2xl bg-bg-primary card-interactive"
                >
                  {/* Image area */}
                  {place.photos && place.photos.length > 0 ? (
                    <img
                      src={place.photos[0]}
                      alt={place.name}
                      className="h-40 w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-gradient-to-br from-bg-tertiary to-brand-tertiary">
                      <span className="text-sm text-text-secondary">
                        {t('home.communityPlaces.noImage')}
                      </span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5">
                    <p className="truncate font-semibold text-text-primary">
                      {place.name}
                    </p>

                    {place.category && (
                      <span className="mt-1.5 inline-block rounded-full bg-bg-tertiary px-2.5 py-0.5 text-xs text-text-secondary">
                        {place.category}
                      </span>
                    )}

                    {place.address && (
                      <p className="mt-2 truncate text-sm text-text-secondary">
                        {place.address}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
