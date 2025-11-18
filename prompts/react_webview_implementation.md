# React 웹뷰 구현 가이드

## 개요
React로 웹사이트를 구축하여 Flutter 웹뷰에서 표시하는 프로젝트입니다. 다음 기능들을 구현합니다:
1. 카카오 로그인
2. 메뉴 추천 받기
3. 메뉴 선택 시 주변 식당 검색 및 리스트 표시

## Flutter 웹뷰 고려사항

### 1. 통신 방식
- **위치 정보**: 로그인 응답에서 받은 latitude, longitude를 localStorage에 저장하여 사용
- **GPS 실시간 사용 안 함**: 로그인 시 받은 위치 정보만 사용
- **Flutter는 단순히 웹뷰를 보여주기만 하면 됨**
- 모든 에러 처리, 라우팅, UI는 React에서 자체 처리

### 2. 토큰 관리
- JWT 토큰은 `localStorage`에 저장
- 토큰 만료 시 React에서 자동으로 로그인 페이지로 리다이렉트
- 모든 인증 상태 관리는 React에서 처리

### 3. 환경 변수
- Base URL은 환경 변수로 관리 (개발/프로덕션 분리)
- `.env` 파일 사용 권장
- **Vite 사용 시**: `VITE_` 접두사 사용 (예: `VITE_API_BASE_URL`)
- 환경 변수 접근: `import.meta.env.VITE_API_BASE_URL`

### 4. CORS 설정
- 서버에서 웹뷰 도메인 허용 필요
- 개발 환경: `http://localhost:3000` (또는 웹뷰에서 사용하는 URL)

---

## 1. 카카오 로그인 (OAuth 리다이렉트 방식)

### 로그인 플로우

1. 사용자가 "카카오로 계속하기" 버튼 클릭
2. 카카오 OAuth 인증 페이지로 리다이렉트
3. 카카오 로그인 완료 후 리다이렉트 URL로 돌아옴 (코드 포함)
4. 리다이렉트 페이지에서 코드를 서버로 전달
5. 서버에서 JWT 토큰 받아서 localStorage에 저장
6. 메인 페이지로 이동

### 카카오 OAuth 설정

#### 카카오 인증 URL
```
https://kauth.kakao.com/oauth/authorize?client_id={KAKAO_CLIENT_ID}&redirect_uri={REDIRECT_URI}&response_type=code
```

#### 변수명 정리
- `KAKAO_CLIENT_ID`: 카카오 앱 키 (REST API 키)
- `REDIRECT_URI`: 카카오 로그인 후 리다이렉트될 URL (예: `http://localhost:3000/oauth/kakao/redirect`)

### API 엔드포인트

**URL**: `POST /auth/kakao/doLogin`  
**Base URL**: `http://localhost:3000` (개발 환경) 또는 실제 서버 URL  
**인증**: 불필요

#### 요청 구조

**HTTP 헤더**
```
Content-Type: application/json
```

**요청 Body (JSON)**
```json
{
  "code": "카카오_인증_코드"
}
```

#### 변수명 정리
- `code`: 카카오 OAuth 인증 후 받은 인증 코드

### 응답 데이터 구조

```json
{
  "id": number,
  "token": string,
  "address": string | null,
  "latitude": number | null,
  "longitude": number | null
}
```

#### 변수명 정리
- `id`: 유저 ID
- `token`: JWT 토큰 (이후 API 호출 시 사용)
- `address`: 저장된 주소 (없으면 null)
- `latitude`: 저장된 위도 (없으면 null)
- `longitude`: 저장된 경도 (없으면 null)

### 구현 예시

#### 1. 로그인 페이지 - 카카오 로그인 버튼

```typescript
// pages/Login.tsx 또는 components/features/auth/LoginForm.tsx
import { useNavigate } from 'react-router-dom';

const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID || 'your-kakao-client-id';
const KAKAO_REDIRECT_URI = `${window.location.origin}/oauth/kakao/redirect`;

export const LoginPage = () => {
  const navigate = useNavigate();

  const handleKakaoLogin = () => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}&response_type=code`;
    window.location.href = kakaoAuthUrl;
  };

  return (
    <div className="p-4">
      <button
        onClick={handleKakaoLogin}
        className="w-full bg-[#FFB300] py-3 text-sm font-semibold text-gray-800 rounded-lg"
      >
        카카오로 계속하기
      </button>
    </div>
  );
};
```

#### 2. 카카오 리다이렉트 페이지

```typescript
// pages/OAuthKakaoRedirect.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/api/services/auth';

export const OAuthKakaoRedirect = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKakaoCallback = async () => {
      try {
        // URL에서 code 파라미터 추출
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (!code) {
          throw new Error('인증 코드를 받지 못했습니다.');
        }

        // 서버에 코드 전달하여 로그인
        const loginData = await authService.kakaoLogin(code);
        
        // 토큰 및 위치 정보 저장
        if (loginData.token) {
          localStorage.setItem('token', loginData.token);
          localStorage.setItem('user_id', loginData.id.toString());
          
          // 주소 및 위치 정보 저장
          if (loginData.address) {
            localStorage.setItem('user_address', loginData.address);
          }
          if (loginData.latitude !== null) {
            localStorage.setItem('user_latitude', loginData.latitude.toString());
          }
          if (loginData.longitude !== null) {
            localStorage.setItem('user_longitude', loginData.longitude.toString());
          }
        }

        // 메인 페이지로 이동
        navigate('/');
      } catch (err) {
        console.error('카카오 로그인 실패:', err);
        setError('로그인에 실패했습니다.');
        setLoading(false);
      }
    };

    handleKakaoCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">카카오 로그인 진행 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return null;
};
```

#### 3. API 서비스

```typescript
// api/services/auth.ts
import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import type { KakaoLoginResponse } from '@/types/auth';

export const authService = {
  /**
   * 카카오 로그인 (OAuth 코드 방식)
   * @param code - 카카오 OAuth 인증 후 받은 코드
   */
  kakaoLogin: async (code: string): Promise<KakaoLoginResponse> => {
    const response = await apiClient.post<KakaoLoginResponse>(
      ENDPOINTS.AUTH.KAKAO_LOGIN,
      { code }
    );
    
    return response.data;
  },
};
```

**참고**: 
- `apiClient`는 이미 설정된 Axios 인스턴스 (인터셉터 포함)
- 토큰은 인터셉터에서 자동으로 헤더에 추가됨
- 에러 처리도 인터셉터에서 자동 처리됨

---

## 2. 메뉴 추천 받기

### API 엔드포인트

**URL**: `POST /menu/recommend`  
**Base URL**: `http://localhost:3000` (개발 환경) 또는 실제 서버 URL  
**인증**: JWT 토큰 필요 (Authorization 헤더에 Bearer 토큰 포함)

### 요청 구조

#### HTTP 헤더
```
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}
```

#### 요청 Body (JSON)
```json
{
  "prompt": "오늘 기분이 안좋은데 메뉴 추천해줘"
}
```

#### 변수명 정리
- `prompt`: 사용자가 입력한 메뉴 추천 요청 텍스트

### 응답 데이터 구조

```json
{
  "recommendations": [
    "떡볶이",
    "마라탕",
    "치킨"
  ],
  "recommendedAt": "2025-01-15T12:00:00Z"
}
```

#### 변수명 정리
- `recommendations`: 추천된 메뉴 이름 배열
- `recommendedAt`: 추천 받은 시간 (ISO 8601 형식)

### 구현 예시

```typescript
// api/services/menu.ts
import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import type { MenuRecommendationResponse, MenuRecommendationRequest } from '@/types/menu';

export const menuService = {
  /**
   * 메뉴 추천 받기
   * @param prompt - 사용자가 입력한 메뉴 추천 요청 텍스트
   */
  recommend: async (prompt: string): Promise<MenuRecommendationResponse> => {
    const response = await apiClient.post<MenuRecommendationResponse>(
      ENDPOINTS.MENU.RECOMMEND,
      { prompt }
    );
    return response.data;
  },
};
```

**참고**:
- `apiClient`의 인터셉터가 자동으로 토큰을 헤더에 추가
- 401 에러는 인터셉터에서 자동 처리 (로그인 페이지로 리다이렉트)
- 별도로 토큰을 전달할 필요 없음

### 사용 예시

```typescript
// components/features/menu/MenuRecommendation.tsx
import { useState } from 'react';
import { menuService } from '@/api/services/menu';
import { useAppSelector } from '@/store/hooks';
import { Button } from '@/components/common/Button';

export const MenuRecommendation = () => {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  
  // Redux에서 인증 상태 확인
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);

  const handleRecommend = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!prompt.trim()) {
      alert('메뉴 추천 요청을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const result = await menuService.recommend(prompt);
      setRecommendations(result.recommendations);
    } catch (error) {
      console.error('메뉴 추천 실패:', error);
      alert('메뉴 추천에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="오늘 기분이 안좋은데 메뉴 추천해줘"
        className="w-full p-2 border rounded"
      />
      <Button onClick={handleRecommend} isLoading={loading} className="mt-2">
        메뉴 추천 받기
      </Button>
      {recommendations.length > 0 && (
        <ul className="mt-4">
          {recommendations.map((menu, index) => (
            <li key={index} className="p-2 border-b">
              {menu}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

---

## 3. 메뉴 선택 시 주변 식당 검색

### API 엔드포인트

**URL**: `POST /search/restaurants`  
**Base URL**: `http://localhost:3000` (개발 환경) 또는 실제 서버 URL  
**인증**: JWT 토큰 필요 (Authorization 헤더에 Bearer 토큰 포함)

### 요청 구조

#### HTTP 헤더
```
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}
```

#### 요청 Body (JSON)
```json
{
  "menuName": "마라탕",
  "latitude": 37.585686,
  "longitude": 127.214138,
  "includeRoadAddress": false
}
```

#### 변수명 정리
- `menuName`: 선택한 메뉴 이름 (추천된 메뉴 중 하나)
- `latitude`: 사용자가 등록한 위도 (로그인 응답에서 받은 latitude)
- `longitude`: 사용자가 등록한 경도 (로그인 응답에서 받은 longitude)
- `includeRoadAddress`: 도로명 주소 포함 여부 (선택, 기본값: false)

### 응답 데이터 구조

```json
{
  "restaurants": [
    {
      "name": "마라탕 전문점",
      "address": "경기도 남양주시 와부읍 덕소리 123-45",
      "roadAddress": "경기도 남양주시 와부읍 덕소로97번길 12",
      "phone": "031-123-4567",
      "mapx": 127214138,
      "mapy": 37585686,
      "distance": 0.5,
      "link": "https://map.naver.com/..."
    }
  ]
}
```

#### 변수명 정리
- `restaurants`: 검색된 식당 리스트 (최대 5개)
  - `name`: 식당 이름
  - `address`: 지번 주소
  - `roadAddress`: 도로명 주소 (있으면 문자열, 없으면 undefined)
  - `phone`: 전화번호 (있으면 문자열, 없으면 undefined)
  - `mapx`: 네이버 지도 X 좌표 (TM 좌표계)
  - `mapy`: 네이버 지도 Y 좌표 (TM 좌표계)
  - `distance`: 사용자 위치로부터의 거리 (km)
  - `link`: 네이버 지도 링크 (있으면 문자열, 없으면 undefined)

### 구현 예시

```typescript
// api/services/search.ts
import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import type { 
  SearchRestaurantsRequest, 
  SearchRestaurantsResponse 
} from '@/types/search';

export const searchService = {
  /**
   * 주변 식당 검색
   * @param request - 검색 요청 데이터 (메뉴명, 위도, 경도 등)
   */
  restaurants: async (
    request: SearchRestaurantsRequest
  ): Promise<SearchRestaurantsResponse> => {
    const response = await apiClient.post<SearchRestaurantsResponse>(
      ENDPOINTS.SEARCH.RESTAURANTS,
      request
    );
    return response.data;
  },
};
```

**참고**:
- 토큰은 인터셉터에서 자동으로 헤더에 추가
- 에러 처리도 인터셉터에서 자동 처리

### 사용자 위치 정보 가져오기

```typescript
// hooks/useUserLocation.ts
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
```

### 사용 예시

```typescript
// components/features/restaurant/RestaurantList.tsx
import { useState } from 'react';
import { useUserLocation } from '@/hooks/useUserLocation';
import { searchService } from '@/api/services/search';
import { useAppSelector } from '@/store/hooks';
import { Button } from '@/components/common/Button';
import type { Restaurant } from '@/types/search';

interface RestaurantListProps {
  menuName: string;
}

export const RestaurantList = ({ menuName }: RestaurantListProps) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const { latitude, longitude, address, hasLocation } = useUserLocation();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);

  const handleSearch = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!hasLocation || latitude === null || longitude === null) {
      alert('위치 정보가 없습니다. 주소를 등록해주세요.');
      // 주소 등록 페이지로 이동
      return;
    }

    setLoading(true);
    try {
      const result = await searchService.restaurants({
        menuName,
        latitude,
        longitude,
        includeRoadAddress: false,
      });
      setRestaurants(result.restaurants);
    } catch (error) {
      console.error('식당 검색 실패:', error);
      alert('식당 검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">주변 식당 찾기</h2>
      <p className="mb-2">메뉴: {menuName}</p>
      {address && (
        <p className="mb-2 text-sm text-gray-600">검색 위치: {address}</p>
      )}
      
      <Button 
        onClick={handleSearch} 
        isLoading={loading}
        disabled={!hasLocation}
        className="mt-2"
      >
        주변 식당 찾기
      </Button>
      
      {!hasLocation && (
        <p className="mt-2 text-sm text-red-500">
          위치 정보가 없습니다. 주소를 등록해야 식당을 검색할 수 있습니다.
        </p>
      )}
      
      {restaurants.length > 0 && (
        <ul className="mt-4 space-y-4">
          {restaurants.map((restaurant, index) => (
            <li key={index} className="p-4 border rounded-lg">
              <h3 className="font-bold text-lg">{restaurant.name}</h3>
              <p className="text-gray-600">
                {restaurant.roadAddress || restaurant.address}
              </p>
              {restaurant.distance && (
                <p className="text-sm text-gray-500">
                  거리: {restaurant.distance.toFixed(1)}km
                </p>
              )}
              {restaurant.phone && (
                <p className="text-sm">전화: {restaurant.phone}</p>
              )}
              {restaurant.link && (
                <a 
                  href={restaurant.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  지도 보기
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

---

## 전체 플로우 예시

### 1. 로그인 플로우
```
1. 사용자가 "카카오로 계속하기" 버튼 클릭
2. 카카오 OAuth 인증 페이지로 리다이렉트
3. 카카오 로그인 완료 후 리다이렉트 URL로 돌아옴 (코드 포함)
4. 리다이렉트 페이지에서 코드를 서버로 전달 (POST /auth/kakao/doLogin)
5. 응답 받기: { id, token, address, latitude, longitude }
6. localStorage에 저장:
   - token: JWT 토큰
   - user_id: 유저 ID
   - user_address: 주소 (있으면)
   - user_latitude: 위도 (있으면)
   - user_longitude: 경도 (있으면)
7. 메인 페이지로 이동
```

### 2. 메뉴 추천 플로우
```
1. 사용자가 프롬프트 입력 (예: "오늘 기분이 안좋은데 메뉴 추천해줘")
2. POST /menu/recommend 호출 (JWT 토큰 포함)
3. 추천된 메뉴 리스트 받기
4. 화면에 메뉴 리스트 표시
```

### 3. 식당 검색 플로우
```
1. 사용자가 추천된 메뉴 중 하나 선택
2. localStorage에서 사용자 위치 정보 가져오기 (latitude, longitude)
3. POST /search/restaurants 호출 (메뉴명, 위도, 경도 포함)
4. 검색된 식당 리스트 받기
5. 화면에 식당 리스트 표시
```

---

## 에러 처리

### API Client 인터셉터에서 자동 처리

```typescript
// api/client.ts
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 자동 처리
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      
      // 로그인 페이지로 리다이렉트
      window.location.href = '/login';
    }
    
    // 네트워크 에러 처리
    if (error.code === 'ERR_NETWORK') {
      console.error('네트워크 연결 오류');
      // Toast나 알림 표시
    }
    
    return Promise.reject(error);
  }
);
```

### 컴포넌트에서 에러 처리

```typescript
import { useState } from 'react';
import { menuService } from '@/api/services/menu';
import { ApiError } from '@/types/common';

const handleRecommend = async () => {
  try {
    const result = await menuService.recommend(prompt);
    setRecommendations(result.recommendations);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiError;
      alert(apiError?.message || '오류가 발생했습니다.');
    } else {
      console.error('예상치 못한 오류:', error);
      alert('오류가 발생했습니다.');
    }
  }
};
```

---

## 환경 변수 설정

### .env 파일 (Vite)
```env
# 개발 환경
VITE_API_BASE_URL=http://localhost:3000/api

# 프로덕션 환경 (.env.production)
# VITE_API_BASE_URL=https://api.pickeat.com/api
```

**주의**: Vite는 `VITE_` 접두사가 있는 변수만 클라이언트에 노출됩니다.

### 환경 변수 접근
```typescript
// api/client.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
```

### TypeScript 타입 정의

```typescript
// types/auth.ts
export interface KakaoLoginResponse {
  id: number;
  token: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

// types/menu.ts
export interface MenuRecommendationRequest {
  prompt: string;
}

export interface MenuRecommendationResponse {
  recommendations: string[];
  recommendedAt: string;
}

// types/search.ts
export interface Restaurant {
  name: string;
  address: string;
  roadAddress?: string;
  phone?: string;
  mapx?: number;
  mapy?: number;
  distance?: number;
  link?: string;
}

export interface SearchRestaurantsRequest {
  menuName: string;
  latitude: number;
  longitude: number;
  includeRoadAddress?: boolean;
}

export interface SearchRestaurantsResponse {
  restaurants: Restaurant[];
}

// types/common.ts
// Location 타입은 필요 시 사용 가능
export interface Location {
  latitude: number;
  longitude: number;
}
```

### API 엔드포인트 추가

```typescript
// api/endpoints.ts
export const ENDPOINTS = {
  AUTH: {
    KAKAO_LOGIN: '/auth/kakao/doLogin',
    // ... 기타 인증 엔드포인트
  },
  MENU: {
    RECOMMEND: '/menu/recommend',
    // ... 기타 메뉴 엔드포인트
  },
  SEARCH: {
    RESTAURANTS: '/search/restaurants',
    // ... 기타 검색 엔드포인트
  },
} as const;
```

---

## 주의사항

1. **토큰 관리**: 
   - JWT 토큰은 `localStorage`에 저장 (또는 `sessionStorage` 사용 가능)
   - 토큰은 `api/client.ts`의 인터셉터에서 자동으로 헤더에 추가
   - 만료 시 인터셉터에서 자동 로그아웃 처리

2. **위치 정보**: 
   - 로그인 응답에서 받은 latitude, longitude를 localStorage에 저장
   - 식당 검색 시 저장된 latitude, longitude 사용
   - `useUserLocation` Hook을 사용하여 위치 정보 관리

3. **에러 처리**: 
   - 네트워크 에러, 인증 에러는 인터셉터에서 자동 처리
   - 컴포넌트에서는 비즈니스 로직 에러만 처리

4. **로딩 상태**: 
   - API 호출 중 로딩 상태 표시 (Button 컴포넌트의 `isLoading` prop 활용)
   - React Query나 SWR 사용 시 자동 로딩 상태 관리 가능

5. **웹뷰 통신**: 
   - GPS 정보를 사용하지 않으므로 Flutter와의 통신 불필요
   - Flutter는 단순히 웹뷰를 보여주기만 하면 됨

6. **상태 관리**: 
   - 전역 상태는 Redux Toolkit 사용
   - 로컬 상태는 `useState` 사용
   - 서버 상태는 React Query 고려 (선택사항)

7. **타입 안정성**: 
   - 모든 API 응답에 타입 정의
   - `types/` 폴더에서 타입 관리

8. **코드 구조**: 
   - 절대 경로 사용 (`@/` alias)
   - 도메인별로 파일 분리 (`api/services/`, `components/features/`)
   - 재사용 가능한 컴포넌트는 `components/common/`에 배치

## 프로젝트 구조 예시

```
src/
├── api/
│   ├── client.ts              # Axios 인스턴스 및 인터셉터
│   ├── endpoints.ts            # API 엔드포인트 상수
│   └── services/
│       ├── auth.ts            # 인증 API
│       ├── menu.ts            # 메뉴 API
│       └── search.ts          # 검색 API
├── components/
│   ├── common/                # 공통 컴포넌트
│   └── features/              # 기능별 컴포넌트
│       ├── menu/
│       └── restaurant/
├── hooks/
│   └── useUserLocation.ts      # 사용자 위치 정보 관리 (localStorage에서 가져오기)
├── store/
│   ├── slices/
│   │   └── authSlice.ts       # 인증 상태 관리
│   └── index.ts
└── types/
    ├── auth.ts
    ├── menu.ts
    ├── search.ts
    └── common.ts
```

