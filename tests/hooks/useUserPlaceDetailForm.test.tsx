/**
 * useUserPlaceDetailForm 테스트
 * 편집 모드 진입/취소/저장 검증(관찰 가능한 상태 기준)
 */

import { renderHook, act } from '@testing-library/react';
import { useUserPlaceDetailForm } from '@features/admin/hooks/useUserPlaceDetailForm';

const mockToastError = vi.fn();
vi.mock('@shared/hooks/useToast', () => ({
  useToast: () => ({
    error: mockToastError,
    success: vi.fn(),
    info: vi.fn(),
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, opts?: Record<string, unknown>) => (opts ? `${k}:${JSON.stringify(opts)}` : k),
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
}));

const basePlace = {
  id: 1,
  version: 2,
  name: '원본이름',
  address: '원본주소',
  phoneNumber: '010-1234-5678',
  category: 'KOREAN',
  description: '설명',
  photos: ['p1.jpg'],
  menuItems: [{ name: '김치찌개', price: 8000 }],
  businessHours: { isOpen247: false, is24Hours: false, days: {} },
} as never;

describe('useUserPlaceDetailForm', () => {
  beforeEach(() => {
    mockToastError.mockClear();
  });

  it('초기 상태 — isEditing false, editForm 기본값', () => {
    const { result } = renderHook(() =>
      useUserPlaceDetailForm({ place: basePlace, isOpen: true, onUpdate: vi.fn() }),
    );
    expect(result.current.isEditing).toBe(false);
    expect(result.current.editForm.name).toBe('');
  });

  it('setIsEditing(true) — place 값으로 editForm 초기화', () => {
    const { result } = renderHook(() =>
      useUserPlaceDetailForm({ place: basePlace, isOpen: true, onUpdate: vi.fn() }),
    );
    act(() => { result.current.setIsEditing(true); });
    expect(result.current.isEditing).toBe(true);
    expect(result.current.editForm.name).toBe('원본이름');
    expect(result.current.editForm.address).toBe('원본주소');
    expect(result.current.editForm.phoneNumber).toBe('010-1234-5678');
    expect(result.current.editForm.existingPhotos).toEqual(['p1.jpg']);
  });

  it('place props 변경 — editForm이 새 값으로 재초기화(편집 모드일 때)', () => {
    const { result, rerender } = renderHook(
      ({ place }: { place: typeof basePlace }) =>
        useUserPlaceDetailForm({ place, isOpen: true, onUpdate: vi.fn() }),
      { initialProps: { place: basePlace } },
    );
    act(() => { result.current.setIsEditing(true); });
    expect(result.current.editForm.name).toBe('원본이름');

    const newPlace = { ...basePlace, name: '새이름' } as never;
    rerender({ place: newPlace });
    expect(result.current.editForm.name).toBe('새이름');
  });

  it('handleSave — name 누락 시 에러 토스트, onUpdate 호출 안 함', () => {
    const onUpdate = vi.fn();
    const { result } = renderHook(() =>
      useUserPlaceDetailForm({ place: basePlace, isOpen: true, onUpdate }),
    );
    act(() => { result.current.setIsEditing(true); });
    act(() => { result.current.setEditForm({ ...result.current.editForm, name: '   ' }); });
    act(() => { result.current.handleEditSave(); });
    expect(mockToastError).toHaveBeenCalled();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('handleSave — address 누락 시 에러 토스트', () => {
    const onUpdate = vi.fn();
    const { result } = renderHook(() =>
      useUserPlaceDetailForm({ place: basePlace, isOpen: true, onUpdate }),
    );
    act(() => { result.current.setIsEditing(true); });
    act(() => { result.current.setEditForm({ ...result.current.editForm, address: '' }); });
    act(() => { result.current.handleEditSave(); });
    expect(mockToastError).toHaveBeenCalled();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('handleSave — name 100자 초과 시 에러 처리', () => {
    const onUpdate = vi.fn();
    const { result } = renderHook(() =>
      useUserPlaceDetailForm({ place: basePlace, isOpen: true, onUpdate }),
    );
    act(() => { result.current.setIsEditing(true); });
    act(() => {
      result.current.setEditForm({ ...result.current.editForm, name: 'a'.repeat(101) });
    });
    act(() => { result.current.handleEditSave(); });
    expect(mockToastError).toHaveBeenCalled();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('handleSave — 변경된 필드만 updateData에 포함하여 onUpdate 호출', () => {
    const onUpdate = vi.fn();
    const { result } = renderHook(() =>
      useUserPlaceDetailForm({ place: basePlace, isOpen: true, onUpdate }),
    );
    act(() => { result.current.setIsEditing(true); });
    act(() => {
      result.current.setEditForm({ ...result.current.editForm, name: '수정된이름' });
    });
    act(() => { result.current.handleEditSave(); });

    expect(onUpdate).toHaveBeenCalledTimes(1);
    const [calledId, calledData] = onUpdate.mock.calls[0];
    expect(calledId).toBe(1);
    expect(calledData.name).toBe('수정된이름');
    expect(calledData.version).toBe(2);
    expect(calledData.address).toBeUndefined();
  });

  it('handleSave — 이미지 변경 없으면 photos 필드 생략', () => {
    const onUpdate = vi.fn();
    const { result } = renderHook(() =>
      useUserPlaceDetailForm({ place: basePlace, isOpen: true, onUpdate }),
    );
    act(() => { result.current.setIsEditing(true); });
    act(() => {
      result.current.setEditForm({ ...result.current.editForm, name: '다른이름' });
    });
    act(() => { result.current.handleEditSave(); });
    const [, data] = onUpdate.mock.calls[0];
    expect(data.existingPhotos).toBeUndefined();
    expect(data.images).toBeUndefined();
  });

  it('handleSave — 변경 사항 없음 시 onUpdate 호출 안 함 + isEditing false', () => {
    const onUpdate = vi.fn();
    const { result } = renderHook(() =>
      useUserPlaceDetailForm({ place: basePlace, isOpen: true, onUpdate }),
    );
    act(() => { result.current.setIsEditing(true); });
    act(() => { result.current.handleEditSave(); });
    expect(onUpdate).not.toHaveBeenCalled();
    expect(result.current.isEditing).toBe(false);
  });

  it('handleEditCancel — editForm을 place 원본으로 복원 + isEditing false', () => {
    const { result } = renderHook(() =>
      useUserPlaceDetailForm({ place: basePlace, isOpen: true, onUpdate: vi.fn() }),
    );
    act(() => { result.current.setIsEditing(true); });
    act(() => {
      result.current.setEditForm({ ...result.current.editForm, name: '임시수정' });
    });
    expect(result.current.editForm.name).toBe('임시수정');

    act(() => { result.current.handleEditCancel(); });
    expect(result.current.isEditing).toBe(false);
    expect(result.current.editForm.name).toBe('원본이름');
  });

  it('모달 닫힘 (isOpen false) → 편집 상태 리셋', () => {
    const { result, rerender } = renderHook(
      ({ isOpen }: { isOpen: boolean }) =>
        useUserPlaceDetailForm({ place: basePlace, isOpen, onUpdate: vi.fn() }),
      { initialProps: { isOpen: true } },
    );
    act(() => { result.current.setIsEditing(true); });
    expect(result.current.isEditing).toBe(true);

    rerender({ isOpen: false });
    expect(result.current.isEditing).toBe(false);
  });
});
