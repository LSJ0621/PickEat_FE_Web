/**
 * 사용자 초기 설정 관련 유틸리티 함수
 */

export interface UserSetupStatus {
  needsName: boolean;
  needsAddress: boolean;
  needsPreferences: boolean;
  hasAnyMissing: boolean;
}

/**
 * 사용자 정보에서 필요한 설정 항목을 체크
 * @param user - 사용자 정보
 * @returns 필요한 설정 항목들
 */
export const checkUserSetupStatus = (user: {
  name?: string | null;
  address?: string | null;
  preferences?: {
    likes: string[];
    dislikes: string[];
  } | null;
}): UserSetupStatus => {
  const needsName = !user.name || user.name.trim() === '';
  
  const needsAddress = !user.address || user.address.trim() === '';
  
  // 취향정보는 Jsonb 타입이므로 배열이 비어있는지로 판단
  const hasPreferences = 
    user.preferences !== null && 
    user.preferences !== undefined &&
    (user.preferences.likes?.length > 0 || user.preferences.dislikes?.length > 0);
  const needsPreferences = !hasPreferences;
  
  const hasAnyMissing = needsName || needsAddress || needsPreferences;
  
  return {
    needsName,
    needsAddress,
    needsPreferences,
    hasAnyMissing,
  };
};

