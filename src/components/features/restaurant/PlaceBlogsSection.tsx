/**
 * 장소 블로그 섹션 컴포넌트
 * 블로그 검색 및 표시 UI를 제공합니다.
 */

import { menuService } from '@/api/services/menu';
import { useUserLocation } from '@/hooks/map/useUserLocation';
import type { RestaurantBlog } from '@/types/menu';
import { extractErrorMessage } from '@/utils/error';
import { startTransition, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PlaceBlogsSectionProps {
  placeName: string | null | undefined;
  searchName?: string | null | undefined;
  searchAddress?: string | null | undefined;
}

export const PlaceBlogsSection = ({ placeName, searchName, searchAddress }: PlaceBlogsSectionProps) => {
  const { t } = useTranslation();
  const [blogs, setBlogs] = useState<RestaurantBlog[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [blogsError, setBlogsError] = useState<string | null>(null);
  const { address: userAddress } = useUserLocation();
  const prevPlaceNameRef = useRef<string | null | undefined>(null);
  const prevUserAddressRef = useRef<string | null | undefined>(null);
  const currentExecutionIdRef = useRef<number | null>(null);

  useEffect(() => {
    const name = placeName?.trim();
    const address = userAddress?.trim();

    if (!name) return;

    if (prevPlaceNameRef.current === placeName && prevUserAddressRef.current === userAddress) return;
    prevPlaceNameRef.current = placeName;
    prevUserAddressRef.current = userAddress;

    const query =
      searchAddress || address
        ? `${searchAddress || address} ${searchName || name}`
        : searchName || name;

    const executionId = Date.now();
    currentExecutionIdRef.current = executionId;

    const fetchBlogs = async () => {
      try {
        startTransition(() => {
          setBlogsLoading(true);
          setBlogsError(null);
        });

        const response = await menuService.getRestaurantBlogs(
          query,
          name,
          'ko',
          searchName || undefined,
          searchAddress || undefined
        );

        if (currentExecutionIdRef.current !== executionId) return;

        startTransition(() => {
          setBlogs(response.blogs ?? []);
          setBlogsLoading(false);
        });
      } catch (error) {
        if (currentExecutionIdRef.current !== executionId) return;

        startTransition(() => {
          setBlogsError(extractErrorMessage(error, t('place.blogSearchFailed')));
          setBlogsLoading(false);
        });
      }
    };

    void fetchBlogs();

    return () => {
      // cleanup에서는 currentExecutionIdRef를 변경하지 않음
    };
  }, [placeName, userAddress, searchName, searchAddress, t]);

  if (!placeName) return null;

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-text-primary">{t('place.blogsTitle')}</h4>
        <p className="mt-1 text-xs text-text-tertiary">{t('place.blogsDescription', { placeName })}</p>
      </div>

      {blogsLoading && (
        <div className="flex justify-center py-6">
          <div className="inline-block h-7 w-7 animate-spin rounded-full border-b-2 border-orange-500" />
        </div>
      )}

      {!blogsLoading && blogsError && <p className="text-xs text-rose-300">{blogsError}</p>}

      {!blogsLoading && !blogsError && blogs.length === 0 && (
        <p className="text-xs text-text-tertiary">{t('place.noBlogsFound')}</p>
      )}

      {!blogsLoading && !blogsError && blogs.length > 0 && (
        <div className="space-y-2">
          {blogs.map((blog, index) => (
            <a
              key={`${blog.url ?? index}`}
              href={blog.url ?? undefined}
              target="_blank"
              rel="noreferrer"
              className="flex gap-3 rounded-xl border border-border-default bg-bg-surface p-3 text-left text-sm text-text-primary transition-all duration-150 hover:border-brand-primary/40 hover:bg-bg-hover hover:shadow-sm"
            >
              {blog.thumbnailUrl && (
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-bg-tertiary">
                  <img
                    src={blog.thumbnailUrl}
                    alt={blog.title ?? placeName}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-xs font-medium text-text-secondary">
                  {blog.source ?? t('place.blogWebDoc')}
                </p>
                <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-text-primary">
                  {blog.title ?? t('place.noTitle')}
                </p>
                {blog.snippet && (
                  <p className="mt-1 line-clamp-2 text-xs text-text-tertiary">{blog.snippet}</p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};
