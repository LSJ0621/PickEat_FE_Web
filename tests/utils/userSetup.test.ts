/**
 * userSetup 유틸리티 테스트
 * 사용자 초기 설정 상태 체크 동작 검증
 */

import { checkUserSetupStatus } from '@shared/utils/userSetup';

describe('checkUserSetupStatus', () => {
  const completeUser = {
    name: '테스트유저',
    address: '서울시 강남구',
    preferences: { likes: ['한식'], dislikes: ['매운 음식'] },
    birthDate: '1990-01-01',
    gender: 'male' as const,
  };

  it('모든 정보 완료 → hasAnyMissing false', () => {
    const status = checkUserSetupStatus(completeUser);

    expect(status.needsName).toBe(false);
    expect(status.needsAddress).toBe(false);
    expect(status.needsPreferences).toBe(false);
    expect(status.needsBirthDate).toBe(false);
    expect(status.needsGender).toBe(false);
    expect(status.hasAnyMissing).toBe(false);
  });

  it('모든 정보 없음 → hasAnyMissing true', () => {
    const status = checkUserSetupStatus({});

    expect(status.needsName).toBe(true);
    expect(status.needsAddress).toBe(true);
    expect(status.needsPreferences).toBe(true);
    expect(status.needsBirthDate).toBe(true);
    expect(status.needsGender).toBe(true);
    expect(status.hasAnyMissing).toBe(true);
  });

  it('이름이 공백만 → needsName true', () => {
    const status = checkUserSetupStatus({ ...completeUser, name: '   ' });
    expect(status.needsName).toBe(true);
    expect(status.hasAnyMissing).toBe(true);
  });

  it('이름이 null → needsName true', () => {
    const status = checkUserSetupStatus({ ...completeUser, name: null });
    expect(status.needsName).toBe(true);
  });

  it('주소가 빈 문자열 → needsAddress true', () => {
    const status = checkUserSetupStatus({ ...completeUser, address: '' });
    expect(status.needsAddress).toBe(true);
  });

  it('preferences가 null → needsPreferences true', () => {
    const status = checkUserSetupStatus({ ...completeUser, preferences: null });
    expect(status.needsPreferences).toBe(true);
  });

  it('preferences의 likes만 있음 → needsPreferences false', () => {
    const status = checkUserSetupStatus({
      ...completeUser,
      preferences: { likes: ['한식'], dislikes: [] },
    });
    expect(status.needsPreferences).toBe(false);
  });

  it('preferences의 dislikes만 있음 → needsPreferences false', () => {
    const status = checkUserSetupStatus({
      ...completeUser,
      preferences: { likes: [], dislikes: ['매운 음식'] },
    });
    expect(status.needsPreferences).toBe(false);
  });

  it('preferences의 likes/dislikes 모두 비어있음 → needsPreferences true', () => {
    const status = checkUserSetupStatus({
      ...completeUser,
      preferences: { likes: [], dislikes: [] },
    });
    expect(status.needsPreferences).toBe(true);
  });

  it('birthDate가 null → needsBirthDate true', () => {
    const status = checkUserSetupStatus({ ...completeUser, birthDate: null });
    expect(status.needsBirthDate).toBe(true);
  });

  it('gender가 null → needsGender true', () => {
    const status = checkUserSetupStatus({ ...completeUser, gender: null });
    expect(status.needsGender).toBe(true);
  });
});
