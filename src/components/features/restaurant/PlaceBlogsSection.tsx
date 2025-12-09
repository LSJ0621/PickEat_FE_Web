/**
 * 장소 블로그 섹션 컴포넌트
 * 블로그 검색 및 표시 UI를 제공합니다.
 */

import { menuService } from '@/api/services/menu';
import { useUserLocation } from '@/hooks/useUserLocation';
import type { RestaurantBlog } from '@/types/menu';
import { extractErrorMessage } from '@/utils/error';
import { startTransition, useEffect, useRef, useState } from 'react';

interface PlaceBlogsSectionProps {
  placeName: string | null | undefined;
}

export const PlaceBlogsSection = ({ placeName }: PlaceBlogsSectionProps) => {
  const [blogs, setBlogs] = useState<RestaurantBlog[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [blogsError, setBlogsError] = useState<string | null>(null);
  const { address: userAddress } = useUserLocation();
  const prevPlaceNameRef = useRef<string | null | undefined>(null);
  const prevUserAddressRef = useRef<string | null | undefined>(null);
  const currentExecutionIdRef = useRef<number | null>(null);

  // 블로그 검색
  useEffect(() => {
    const name = placeName?.trim();
    const address = userAddress?.trim();

    if (!name) {
      return;
    }

    // StrictMode 대응: placeName과 userAddress가 변경되지 않았으면 스킵
    if (prevPlaceNameRef.current === placeName && prevUserAddressRef.current === userAddress) {
      return;
    }
    prevPlaceNameRef.current = placeName;
    prevUserAddressRef.current = userAddress;

    const query = address ? `${address} ${name}` : name;

    // 이 실행의 고유 ID
    const executionId = Date.now();
    currentExecutionIdRef.current = executionId;

    const fetchBlogs = async () => {
      try {
        startTransition(() => {
          setBlogsLoading(true);
          setBlogsError(null);
        });

        const response = await menuService.getRestaurantBlogs(query, name);
        
        // 새로운 실행이 시작되었는지 확인
        if (currentExecutionIdRef.current !== executionId) {
          return;
        }

        startTransition(() => {
          setBlogs(response.blogs ?? []);
          setBlogsLoading(false);
        });
      } catch (error) {
        // 새로운 실행이 시작되었는지 확인
        if (currentExecutionIdRef.current !== executionId) {
          return;
        }
        
        console.error('블로그 검색 실패:', error);
        startTransition(() => {
          setBlogsError(extractErrorMessage(error, '블로그 검색에 실패했습니다.'));
          setBlogsLoading(false);
        });
      }
    };

    void fetchBlogs();

    return () => {
      // cleanup에서는 currentExecutionIdRef를 변경하지 않음
    };
  }, [placeName, userAddress]);

  if (!placeName) {
    return null;
  }

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-100">추가 탐색 · 블로그/웹 리뷰</h4>
      <p className="mb-4 text-xs text-slate-400">
        {placeName}에 대한 다른 사람들의 후기와 리뷰를 확인해 보세요.
      </p>

      {blogsLoading && (
        <div className="flex justify-center py-6">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500" />
        </div>
      )}

      {!blogsLoading && blogsError && (
        <p className="text-xs text-rose-300">{blogsError}</p>
      )}

      {!blogsLoading && !blogsError && blogs.length === 0 && (
        <p className="text-xs text-slate-400">아직 연관 블로그/웹 문서를 찾지 못했습니다.</p>
      )}

      {!blogsLoading && !blogsError && blogs.length > 0 && (
        <div className="space-y-3">
          {blogs.map((blog, index) => (
            <a
              key={`${blog.url ?? index}`}
              href={blog.url ?? undefined}
              target="_blank"
              rel="noreferrer"
              className="flex gap-3 rounded-xl border border-white/10 bg-slate-900/80 p-3 text-left text-sm text-slate-100 transition hover:border-orange-400/60 hover:bg-slate-800/80"
            >
              {blog.thumbnailUrl && (
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-800">
                  <img
                    src={blog.thumbnailUrl}
                    alt={blog.title ?? placeName}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-xs font-medium text-slate-300">
                  {blog.source ?? '블로그/웹 문서'}
                </p>
                <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-slate-50">
                  {blog.title ?? '제목 없는 문서'}
                </p>
                {blog.snippet && (
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">{blog.snippet}</p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

