import { userService } from '@/api/services/user';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import { extractErrorMessage } from '@/utils/error';
import { useState, useCallback, useEffect, useRef } from 'react';

interface UsePreferencesOptions {
  initialLikes?: string[];
  initialDislikes?: string[];
}

export const usePreferences = (options?: UsePreferencesOptions) => {
  const dispatch = useAppDispatch();
  const [likes, setLikes] = useState<string[]>(options?.initialLikes || []);
  const [dislikes, setDislikes] = useState<string[]>(options?.initialDislikes || []);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const prevInitialLikesRef = useRef<string[] | undefined>(options?.initialLikes);
  const prevInitialDislikesRef = useRef<string[] | undefined>(options?.initialDislikes);
  
  // 초기값이 변경되면 상태 업데이트 (Redux 상태 동기화)
  useEffect(() => {
    // 배열 참조 비교를 피하기 위해 JSON.stringify 사용 (간단한 배열이므로 안전)
    const currentLikes = JSON.stringify(options?.initialLikes);
    const currentDislikes = JSON.stringify(options?.initialDislikes);
    const prevLikes = JSON.stringify(prevInitialLikesRef.current);
    const prevDislikes = JSON.stringify(prevInitialDislikesRef.current);

    if (currentLikes !== prevLikes && options?.initialLikes !== undefined) {
      setLikes(options.initialLikes);
      prevInitialLikesRef.current = options.initialLikes;
    }
    if (currentDislikes !== prevDislikes && options?.initialDislikes !== undefined) {
      setDislikes(options.initialDislikes);
      prevInitialDislikesRef.current = options.initialDislikes;
    }
  }, [options?.initialLikes, options?.initialDislikes]);
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
    } catch (error: unknown) {
      console.error('취향 정보 조회 실패:', error);
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
      
      alert('취향 정보가 저장되었습니다.');
      return true; // 성공 시 true 반환
    } catch (error: unknown) {
      console.error('취향 정보 저장 실패:', error);
      alert(extractErrorMessage(error, '취향 정보를 저장하는 데 실패했습니다.'));
      return false;
    } finally {
      setIsSavingPreferences(false);
    }
  }, [likes, dislikes, loadPreferences, dispatch]);

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

