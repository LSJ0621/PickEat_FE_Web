import { useAppSelector } from '@/store/hooks';

/**
 * Redux에서 사용자 위치 정보를 가져오는 Hook
 */
export function useUserLocation() {
  const user = useAppSelector((state) => state.auth?.user);
  const latitude = typeof user?.latitude === 'number' ? user.latitude : null;
  const longitude = typeof user?.longitude === 'number' ? user.longitude : null;
  const address = user?.address ?? null;

  return {
    latitude,
    longitude,
    address,
    hasLocation: latitude !== null && longitude !== null,
  };
}

