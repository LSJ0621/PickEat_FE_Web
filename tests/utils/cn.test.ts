/**
 * cn 유틸리티 테스트
 * Tailwind 클래스 병합 및 충돌 해결 동작 검증
 */

import { cn } from '@shared/utils/cn';

describe('cn', () => {
  it('단일 클래스 그대로 반환', () => {
    expect(cn('text-red-500')).toBe('text-red-500');
  });

  it('서로 다른 클래스 여럿 병합', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('충돌하는 텍스트 색상 — 후순위 클래스 유지', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('충돌하는 배경색 — 후순위 클래스 유지', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('충돌하는 font-size — 후순위 클래스 유지', () => {
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
  });

  it('조건부 false 클래스 무시', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('undefined / null 무시', () => {
    expect(cn('text-sm', undefined, null, 'font-bold')).toBe('text-sm font-bold');
  });

  it('인수 없으면 빈 문자열 반환', () => {
    expect(cn()).toBe('');
  });

  it('배열 형태 클래스 처리', () => {
    expect(cn(['flex', 'items-center'])).toBe('flex items-center');
  });

  it('객체 형태 조건부 클래스 처리', () => {
    expect(cn({ hidden: false, flex: true })).toBe('flex');
  });
});
