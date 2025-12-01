import { menuService } from '@/api/services/menu';
import { useUserLocation } from '@/hooks/useUserLocation';
import type { PlaceDetail, PlaceReview, RestaurantBlog } from '@/types/menu';
import { extractErrorMessage } from '@/utils/error';
import { formatDateTime } from '@/utils/format';
import { startTransition, useEffect, useRef, useState } from 'react';

interface PlaceDetailsModalProps {
  placeId: string | null;
  placeName?: string | null;
  onClose: () => void;
}

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

export const PlaceDetailsModal = ({ placeId, placeName, onClose }: PlaceDetailsModalProps) => {
  const [status, setStatus] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [placeDetail, setPlaceDetail] = useState<PlaceDetail | null>(null);
  const [blogs, setBlogs] = useState<RestaurantBlog[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [blogsError, setBlogsError] = useState<string | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photoTransition, setPhotoTransition] = useState<'fade' | 'none'>('none');
  const { address: userAddress } = useUserLocation();
  const miniMapRef = useRef<HTMLDivElement | null>(null);
  const naverClientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;

  // 네이버 지도 로더 (간단 버전)
  useEffect(() => {
    if (!placeDetail?.location || !naverClientId || !miniMapRef.current) {
      return;
    }

    let cancelled = false;

    const loadScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
          reject(new Error('브라우저 환경이 아닙니다.'));
          return;
        }

        if (window.naver?.maps) {
          resolve();
          return;
        }

        const existingScript = document.getElementById('naver-map-sdk') as HTMLScriptElement | null;
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve());
          existingScript.addEventListener('error', () => reject(new Error('네이버 지도 스크립트 로드 실패')));
          return;
        }

        const script = document.createElement('script');
        script.id = 'naver-map-sdk';
        // 검색 결과 지도와 동일한 방식으로 로드 (oapi + ncpKeyId 사용)
        script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${naverClientId}`;
        script.async = true;
        script.addEventListener('load', () => resolve());
        script.addEventListener('error', () => reject(new Error('네이버 지도 스크립트 로드 실패')));
        document.head.appendChild(script);
      });
    };

    const initMiniMap = async () => {
      try {
        await loadScript();
        if (cancelled || !miniMapRef.current || !window.naver?.maps || !placeDetail.location) {
          return;
        }

        const { latitude, longitude } = placeDetail.location;
        const naverMaps = window.naver.maps;
        const center = new naverMaps.LatLng(latitude, longitude);

        const map = new naverMaps.Map(miniMapRef.current, {
          center,
          zoom: 16,
        });

        // 마커 표시
        new naverMaps.Marker({
          map,
          position: center,
          title: placeDetail.name ?? placeName ?? '가게 위치',
        });
      } catch (error) {
        console.error('네이버 미니 지도 초기화 실패:', error);
      }
    };

    void initMiniMap();

    return () => {
      cancelled = true;
    };
  }, [placeDetail, naverClientId, placeName]);

  // 가게 상세 정보 조회 (/menu/places/:placeId/detail)
  useEffect(() => {
    if (!placeId) {
      setPlaceDetail(null);
      return;
    }

    let cancelled = false;

    const fetchPlaceDetail = async () => {
      try {
        startTransition(() => {
          setStatus('loading');
          setErrorMessage(null);
        });

        const response = await menuService.getPlaceDetail(placeId);
        if (cancelled) return;

        startTransition(() => {
          setPlaceDetail(response.place);
          setStatus('ready');
        });
      } catch (error) {
        if (cancelled) return;
        console.error('가게 상세 조회 실패:', error);
        startTransition(() => {
          setStatus('error');
          setErrorMessage(extractErrorMessage(error, '가게 상세 정보를 불러오지 못했습니다.'));
        });
      }
    };

    void fetchPlaceDetail();

    return () => {
      cancelled = true;
    };
  }, [placeId]);

  // 블로그 검색
  useEffect(() => {
    const name = placeName?.trim();
    const address = userAddress?.trim();

    if (!name) {
      return;
    }

    const query = address ? `${address} ${name}` : name;

    let cancelled = false;

    const fetchBlogs = async () => {
      try {
        startTransition(() => {
          setBlogsLoading(true);
          setBlogsError(null);
        });

        const response = await menuService.getRestaurantBlogs(query);
        if (cancelled) return;

        startTransition(() => {
          setBlogs(response.blogs ?? []);
        });
      } catch (error) {
        if (cancelled) return;
        console.error('블로그 검색 실패:', error);
        startTransition(() => {
          setBlogsError(extractErrorMessage(error, '블로그 검색에 실패했습니다.'));
        });
      } finally {
        if (!cancelled) {
          startTransition(() => {
            setBlogsLoading(false);
          });
        }
      }
    };

    void fetchBlogs();

    return () => {
      cancelled = true;
    };
  }, [placeName, userAddress]);

  // 사진 인덱스 초기화
  useEffect(() => {
    if (placeDetail?.photos && placeDetail.photos.length > 0) {
      setCurrentPhotoIndex(0);
    }
  }, [placeDetail?.photos]);

  // 리뷰 펼치기/접기 토글
  const toggleReviewExpanded = (index: number) => {
    setExpandedReviews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // 사진 네비게이션
  const handlePreviousPhoto = () => {
    if (placeDetail?.photos && placeDetail.photos.length > 0) {
      setPhotoTransition('fade');
      setTimeout(() => {
        setCurrentPhotoIndex((prev) => (prev === 0 ? placeDetail.photos!.length - 1 : prev - 1));
        setTimeout(() => setPhotoTransition('none'), 50);
      }, 150);
    }
  };

  const handleNextPhoto = () => {
    if (placeDetail?.photos && placeDetail.photos.length > 0) {
      setPhotoTransition('fade');
      setTimeout(() => {
        setCurrentPhotoIndex((prev) => (prev === placeDetail.photos!.length - 1 ? 0 : prev + 1));
        setTimeout(() => setPhotoTransition('none'), 50);
      }, 150);
    }
  };

  if (!placeId) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur">
      <div className="relative w-full max-w-2xl rounded-[32px] border border-white/10 bg-slate-950/95 p-6 text-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-400 transition hover:text-white"
          aria-label="닫기"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {status === 'loading' && (
          <div className="flex items-center justify-center py-16">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500" />
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        {status === 'ready' && (
          <div className="max-h-[80vh] overflow-y-auto rounded-xl custom-scroll space-y-6">
            {/* 가게 이름 (제목) */}
            <div>
              <h3 className="text-2xl font-bold text-white">
                {placeName ?? placeDetail?.name ?? '선택된 가게'}
              </h3>
              {placeDetail?.rating != null && (
                <p className="mt-1 text-sm text-slate-300">
                  평점 {placeDetail.rating.toFixed(1)} · 리뷰 {placeDetail.userRatingCount ?? 0}개
                </p>
              )}
              {placeDetail?.openNow !== null && placeDetail?.openNow !== undefined && (
                <span
                  className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    placeDetail.openNow
                      ? 'border border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
                      : 'border border-rose-400/40 bg-rose-500/15 text-rose-200'
                  }`}
                >
                  {placeDetail.openNow ? '현재 영업 중' : '현재 영업 종료'}
                </span>
              )}
            </div>

            {/* 사진 슬라이드 */}
            {placeDetail?.photos && placeDetail.photos.length > 0 && (
              <div>
                <h4 className="mb-3 text-sm font-semibold text-slate-100">사진</h4>
                <div className="relative">
                  <div className="relative h-64 w-full overflow-hidden rounded-xl bg-slate-800">
                    <img
                      src={placeDetail.photos[currentPhotoIndex]}
                      alt={`${placeDetail?.name ?? placeName ?? '가게 사진'} ${currentPhotoIndex + 1}`}
                      className={`h-full w-full object-cover transition-opacity duration-300 ${
                        photoTransition === 'fade' ? 'opacity-0' : 'opacity-100'
                      }`}
                      loading="lazy"
                    />
                    {/* 사진 카운터 */}
                    <div className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                      {currentPhotoIndex + 1} / {placeDetail.photos.length}
                    </div>
                    {/* 이전 버튼 */}
                    {placeDetail.photos.length > 1 && (
                      <button
                        onClick={handlePreviousPhoto}
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80 backdrop-blur-sm"
                        aria-label="이전 사진"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}
                    {/* 다음 버튼 */}
                    {placeDetail.photos.length > 1 && (
                      <button
                        onClick={handleNextPhoto}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80 backdrop-blur-sm"
                        aria-label="다음 사진"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {placeDetail.photos.length > 1 && (
                    <p className="mt-1 text-[11px] text-slate-500">
                      좌우 버튼을 눌러 다른 사진을 확인할 수 있습니다.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 미니 네이버 지도 */}
            {placeDetail?.location && naverClientId && (
              <div>
                <h4 className="mb-3 text-sm font-semibold text-slate-100">위치 정보</h4>
                <div className="rounded-xl border border-white/10 bg-slate-900/80 p-3">
                  <div
                    ref={miniMapRef}
                    className="h-40 w-full overflow-hidden rounded-lg bg-slate-800"
                  />
                  <p className="mt-2 text-[11px] text-slate-500">
                    지도를 드래그해 주변 위치를 살펴볼 수 있습니다.
                  </p>
                </div>
              </div>
            )}

            {placeDetail?.reviews && placeDetail.reviews.length > 0 && (
              <div>
                <h4 className="mb-3 text-sm font-semibold text-slate-100">리뷰</h4>
                <p className="mb-4 text-xs text-slate-400">
                  일부 리뷰를 가져왔어요.
                </p>

                <div className="flex gap-3 overflow-x-auto custom-scroll pb-2">
                  {placeDetail.reviews.map((review: PlaceReview, index: number) => {
                    const isExpanded = expandedReviews.has(index);
                    const shouldShowExpand = review.text && review.text.length > 150;
                    const displayText = isExpanded || !shouldShowExpand 
                      ? review.text 
                      : review.text.substring(0, 150) + '...';

                    return (
                      <div
                        key={index}
                        className="flex w-64 flex-shrink-0 flex-col gap-2 rounded-xl border border-white/10 bg-slate-900/80 p-3 text-left text-sm text-slate-100"
                      >
                        <div className="flex items-center justify-between text-xs text-slate-300">
                          {review.authorName && <span className="font-medium">{review.authorName}</span>}
                          {review.rating != null && (
                            <span className="ml-2 text-amber-300">★ {review.rating.toFixed(1)}</span>
                          )}
                        </div>
                        {review.publishTime && (
                          <p className="text-[11px] text-slate-500">
                            {formatDateTime(review.publishTime)}
                          </p>
                        )}
                        {review.text && (
                          <>
                            <p className="mt-1 text-xs text-slate-200 whitespace-pre-line">
                              {displayText}
                            </p>
                            {shouldShowExpand && (
                              <button
                                onClick={() => toggleReviewExpanded(index)}
                                className="mt-1 self-start text-xs font-medium text-orange-400 hover:text-orange-300 transition"
                              >
                                {isExpanded ? '접기' : '펼쳐보기'}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {placeName && (
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

