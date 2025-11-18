/**
 * localStorage에서 사용자 위치 정보를 가져오는 Hook
 * 로그인 시 저장된 latitude, longitude를 사용
 */

export function useUserLocation() {
  const latitude = localStorage.getItem('user_latitude');
  const longitude = localStorage.getItem('user_longitude');
  const address = localStorage.getItem('user_address');
  
  return {
    latitude: latitude ? parseFloat(latitude) : null,
    longitude: longitude ? parseFloat(longitude) : null,
    address: address || null,
    hasLocation: !!(latitude && longitude),
  };
}

