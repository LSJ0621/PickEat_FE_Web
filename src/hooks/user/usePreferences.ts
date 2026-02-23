import { userService } from '@/api/services/user';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import { fetchPreferences, invalidatePreferences } from '@/store/slices/userDataSlice';
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

  // Redux에서 취향 정보 가져오기
  const reduxPreferences = useAppSelector((state) => state.userData.preferences.data);
  const isLoadingFromRedux = useAppSelector((state) => state.userData.preferences.isLoading);

  // 초기값 결정: options > Redux > 빈 배열
  const initialLikes = options?.initialLikes ?? reduxPreferences?.likes ?? [];
  const initialDislikes = options?.initialDislikes ?? reduxPreferences?.dislikes ?? [];
  const initialAnalysis = options?.initialAnalysis ?? reduxPreferences?.analysis ?? null;
  const initialAnalysisParagraphs =
    options?.initialAnalysisParagraphs ?? reduxPreferences?.analysisParagraphs ?? null;

  const [likes, setLikes] = useState<string[]>(initialLikes);
  const [dislikes, setDislikes] = useState<string[]>(initialDislikes);
  const [analysis, setAnalysis] = useState<string | null>(initialAnalysis);
  const [analysisParagraphs, setAnalysisParagraphs] = useState<AnalysisParagraphs | null>(
    initialAnalysisParagraphs
  );

  const prevInitialLikesRef = useRef<string[] | undefined>(options?.initialLikes);
  const prevInitialDislikesRef = useRef<string[] | undefined>(options?.initialDislikes);
  const prevInitialAnalysisRef = useRef<string | null | undefined>(options?.initialAnalysis);
  const prevInitialAnalysisParagraphsRef = useRef<AnalysisParagraphs | null | undefined>(
    options?.initialAnalysisParagraphs
  );
  const prevReduxPreferencesRef = useRef(reduxPreferences);

  // 초기값이 변경되면 상태 업데이트 (options 또는 Redux 동기화)
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
    if (
      currentAnalysisParagraphs !== prevAnalysisParagraphs &&
      options?.initialAnalysisParagraphs !== undefined
    ) {
      setAnalysisParagraphs(options.initialAnalysisParagraphs ?? null);
      prevInitialAnalysisParagraphsRef.current = options.initialAnalysisParagraphs ?? null;
    }

    // Redux 상태 변경 감지 (options가 없을 때)
    if (!options && reduxPreferences !== prevReduxPreferencesRef.current) {
      if (reduxPreferences) {
        setLikes(reduxPreferences.likes ?? []);
        setDislikes(reduxPreferences.dislikes ?? []);
        setAnalysis(reduxPreferences.analysis ?? null);
        setAnalysisParagraphs(reduxPreferences.analysisParagraphs ?? null);
      }
      prevReduxPreferencesRef.current = reduxPreferences;
    }
  }, [
    options,
    options?.initialLikes,
    options?.initialDislikes,
    options?.initialAnalysis,
    options?.initialAnalysisParagraphs,
    reduxPreferences,
  ]);

  const [newLike, setNewLike] = useState('');
  const [newDislike, setNewDislike] = useState('');
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  // 취향 정보 로드 (Redux thunk 사용)
  const loadPreferences = useCallback(async () => {
    const resultAction = await dispatch(fetchPreferences());
    // Unwrap result to sync local state
    if (fetchPreferences.fulfilled.match(resultAction) && resultAction.payload) {
      setLikes(resultAction.payload.likes || []);
      setDislikes(resultAction.payload.dislikes || []);
      setAnalysis(resultAction.payload.analysis ?? null);
      setAnalysisParagraphs(resultAction.payload.analysisParagraphs ?? null);
    }
  }, [dispatch]);

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

      // Redux auth 상태도 업데이트 (화면 반영을 위해 필수)
      dispatch(
        updateUser({
          preferences: {
            likes,
            dislikes,
          },
        })
      );

      // Redux 캐시 무효화 후 재로드 (analysis 포함)
      dispatch(invalidatePreferences());
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
    isLoadingPreferences: isLoadingFromRedux,
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

