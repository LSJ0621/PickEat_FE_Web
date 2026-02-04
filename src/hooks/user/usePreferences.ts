import { userService } from '@/api/services/user';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import type { AnalysisParagraphs } from '@/types/user';
import { useState, useCallback, useEffect, useRef } from 'react';

interface UsePreferencesOptions {
  initialLikes?: string[];
  initialDislikes?: string[];
  initialAnalysis?: string | null;
  initialAnalysisParagraphs?: AnalysisParagraphs | null;
}

export const usePreferences = (options?: UsePreferencesOptions) => {
  const dispatch = useAppDispatch();
  const { handleError, handleSuccess } = useErrorHandler();
  const [likes, setLikes] = useState<string[]>(options?.initialLikes || []);
  const [dislikes, setDislikes] = useState<string[]>(options?.initialDislikes || []);
  const [analysis, setAnalysis] = useState<string | null>(
    options?.initialAnalysis ?? null,
  );
  const [analysisParagraphs, setAnalysisParagraphs] = useState<AnalysisParagraphs | null>(
    options?.initialAnalysisParagraphs ?? null,
  );
  const prevInitialLikesRef = useRef<string[] | undefined>(options?.initialLikes);
  const prevInitialDislikesRef = useRef<string[] | undefined>(options?.initialDislikes);
  const prevInitialAnalysisRef = useRef<string | null | undefined>(
    options?.initialAnalysis,
  );
  const prevInitialAnalysisParagraphsRef = useRef<AnalysisParagraphs | null | undefined>(
    options?.initialAnalysisParagraphs,
  );
  
  // 초기값이 변경되면 상태 업데이트 (Redux 상태 동기화)
  useEffect(() => {
    // 배열 참조 비교를 피하기 위해 JSON.stringify 사용 (간단한 배열이므로 안전)
    const currentLikes = JSON.stringify(options?.initialLikes);
    const currentDislikes = JSON.stringify(options?.initialDislikes);
    const currentAnalysis = options?.initialAnalysis ?? null;
    const currentAnalysisParagraphs = JSON.stringify(options?.initialAnalysisParagraphs);
    const prevLikes = JSON.stringify(prevInitialLikesRef.current);
    const prevDislikes = JSON.stringify(prevInitialDislikesRef.current);
    const prevAnalysis = prevInitialAnalysisRef.current ?? null;
    const prevAnalysisParagraphs = JSON.stringify(prevInitialAnalysisParagraphsRef.current);

    if (currentLikes !== prevLikes && options?.initialLikes !== undefined) {
      setLikes(options.initialLikes);
      prevInitialLikesRef.current = options.initialLikes;
    }
    if (currentDislikes !== prevDislikes && options?.initialDislikes !== undefined) {
      setDislikes(options.initialDislikes);
      prevInitialDislikesRef.current = options.initialDislikes;
    }
    if (currentAnalysis !== prevAnalysis && options?.initialAnalysis !== undefined) {
      setAnalysis(currentAnalysis);
      prevInitialAnalysisRef.current = options.initialAnalysis ?? null;
    }
    if (currentAnalysisParagraphs !== prevAnalysisParagraphs && options?.initialAnalysisParagraphs !== undefined) {
      setAnalysisParagraphs(options.initialAnalysisParagraphs ?? null);
      prevInitialAnalysisParagraphsRef.current = options.initialAnalysisParagraphs ?? null;
    }
  }, [options?.initialLikes, options?.initialDislikes, options?.initialAnalysis, options?.initialAnalysisParagraphs]);
  const [newLike, setNewLike] = useState('');
  const [newDislike, setNewDislike] = useState('');
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  // 취향 정보 로드
  const loadPreferences = useCallback(async () => {
    setIsLoadingPreferences(true);
    try {
      const result = await userService.getPreferences();
      setLikes(result.preferences.likes || []);
      setDislikes(result.preferences.dislikes || []);
      setAnalysis(result.preferences.analysis ?? null);
      setAnalysisParagraphs(result.preferences.analysisParagraphs ?? null);
    } catch {
      // 취향 정보 조회 실패는 무시
    } finally {
      setIsLoadingPreferences(false);
    }
  }, []);

  // 좋아하는 것 추가
  const handleAddLike = useCallback(() => {
    if (newLike.trim() && !likes.includes(newLike.trim())) {
      setLikes([...likes, newLike.trim()]);
      setNewLike('');
    }
  }, [newLike, likes]);

  // 좋아하는 것 제거
  const handleRemoveLike = useCallback((item: string) => {
    setLikes(likes.filter((like) => like !== item));
  }, [likes]);

  // 싫어하는 것 추가
  const handleAddDislike = useCallback(() => {
    if (newDislike.trim() && !dislikes.includes(newDislike.trim())) {
      setDislikes([...dislikes, newDislike.trim()]);
      setNewDislike('');
    }
  }, [newDislike, dislikes]);

  // 싫어하는 것 제거
  const handleRemoveDislike = useCallback((item: string) => {
    setDislikes(dislikes.filter((dislike) => dislike !== item));
  }, [dislikes]);

  // 취향 정보 저장
  const handleSavePreferences = useCallback(async (): Promise<boolean> => {
    setIsSavingPreferences(true);
    try {
      await userService.setPreferences({
        likes: likes,
        dislikes: dislikes,
      });
      
      // Redux 상태도 업데이트 (화면 반영을 위해 필수)
      dispatch(updateUser({
        preferences: {
          likes,
          dislikes,
        },
      }));
      
      // 로컬 상태도 업데이트 (analysis 포함)
      await loadPreferences();

      handleSuccess('toast.preferences.saved');
      return true; // 성공 시 true 반환
    } catch (error: unknown) {
      handleError(error, 'usePreferences');
      return false;
    } finally {
      setIsSavingPreferences(false);
    }
  }, [likes, dislikes, loadPreferences, dispatch, handleError, handleSuccess]);

  // 취향 모달 초기화
  const resetPreferencesModal = useCallback(() => {
    setNewLike('');
    setNewDislike('');
  }, []);

  return {
    // 상태
    likes,
    dislikes,
    analysis,
    analysisParagraphs,
    newLike,
    newDislike,
    isLoadingPreferences,
    isSavingPreferences,
    // 상태 설정 함수
    setLikes,
    setDislikes,
    setNewLike,
    setNewDislike,
    // 함수
    loadPreferences,
    handleAddLike,
    handleRemoveLike,
    handleAddDislike,
    handleRemoveDislike,
    handleSavePreferences,
    resetPreferencesModal,
  };
};

