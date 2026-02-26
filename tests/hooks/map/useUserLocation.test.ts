import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUserLocation } from '@features/map/hooks/useUserLocation';
import { useAppSelector } from '@app/store/hooks';
import type { User } from '@shared/types/auth';

vi.mock('@app/store/hooks');

describe('useUserLocation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when user is not available', () => {
    vi.mocked(useAppSelector).mockImplementation(<T,>(selector: (state: { auth: { user: null } }) => T): T => {
      return selector({ auth: { user: null } });
    });

    const { result } = renderHook(() => useUserLocation());

    expect(result.current.latitude).toBe(null);
    expect(result.current.longitude).toBe(null);
    expect(result.current.address).toBe(null);
    expect(result.current.hasLocation).toBe(false);
  });

  it('should return user location when available', () => {
    const mockUser: Partial<User> = {
      latitude: 37.123,
      longitude: 127.456,
      address: '서울시 강남구',
    };

    vi.mocked(useAppSelector).mockImplementation(<T,>(selector: (state: { auth: { user: Partial<User> } }) => T): T => {
      return selector({ auth: { user: mockUser } });
    });

    const { result } = renderHook(() => useUserLocation());

    expect(result.current.latitude).toBe(37.123);
    expect(result.current.longitude).toBe(127.456);
    expect(result.current.address).toBe('서울시 강남구');
    expect(result.current.hasLocation).toBe(true);
  });

  it('should handle user with null latitude/longitude', () => {
    const mockUser: Partial<User> = {
      latitude: null,
      longitude: null,
      address: '서울시 강남구',
    };

    vi.mocked(useAppSelector).mockImplementation(<T,>(selector: (state: { auth: { user: Partial<User> } }) => T): T => {
      return selector({ auth: { user: mockUser } });
    });

    const { result } = renderHook(() => useUserLocation());

    expect(result.current.latitude).toBe(null);
    expect(result.current.longitude).toBe(null);
    expect(result.current.address).toBe('서울시 강남구');
    expect(result.current.hasLocation).toBe(false);
  });

  it('should handle user with only latitude', () => {
    const mockUser: Partial<User> = {
      latitude: 37.123,
      longitude: null,
      address: '서울시 강남구',
    };

    vi.mocked(useAppSelector).mockImplementation(<T,>(selector: (state: { auth: { user: Partial<User> } }) => T): T => {
      return selector({ auth: { user: mockUser } });
    });

    const { result } = renderHook(() => useUserLocation());

    expect(result.current.latitude).toBe(37.123);
    expect(result.current.longitude).toBe(null);
    expect(result.current.hasLocation).toBe(false);
  });

  it('should handle user without address', () => {
    const mockUser: Partial<User> = {
      latitude: 37.123,
      longitude: 127.456,
      address: null,
    };

    vi.mocked(useAppSelector).mockImplementation(<T,>(selector: (state: { auth: { user: Partial<User> } }) => T): T => {
      return selector({ auth: { user: mockUser } });
    });

    const { result } = renderHook(() => useUserLocation());

    expect(result.current.latitude).toBe(37.123);
    expect(result.current.longitude).toBe(127.456);
    expect(result.current.address).toBe(null);
    expect(result.current.hasLocation).toBe(true);
  });

  it('should filter out non-number latitude/longitude', () => {
    const mockUser: Partial<User> & { latitude: string; longitude: undefined } = {
      latitude: 'not-a-number' as unknown as number,
      longitude: undefined,
      address: '서울시 강남구',
    };

    vi.mocked(useAppSelector).mockImplementation(<T,>(selector: (state: { auth: { user: Partial<User> } }) => T): T => {
      return selector({ auth: { user: mockUser } });
    });

    const { result } = renderHook(() => useUserLocation());

    expect(result.current.latitude).toBe(null);
    expect(result.current.longitude).toBe(null);
    expect(result.current.hasLocation).toBe(false);
  });
});
