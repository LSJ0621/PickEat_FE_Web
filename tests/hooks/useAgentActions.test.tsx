/**
 * useAgentActions 테스트
 * 메뉴 선택, AI 맛집 추천(SSE 스트림 병렬 시작/에러 처리/placeId 정규화/캐시), 백그라운드 중단 검증
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import agentReducer from '@app/store/slices/agentSlice';
import authReducer from '@app/store/slices/authSlice';
import { useAgentActions } from '@features/agent/hooks/useAgentActions';

// useErrorHandler 모킹 — ToastContext 의존성 제거
vi.mock('@shared/hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
    handleSuccess: vi.fn(),
  }),
}));

// 스트림 함수 모킹 — vi.hoisted()로 호이스팅 이전에 생성하여 factory에서 안전하게 참조
const mockSearchStream = vi.hoisted(() => vi.fn());
const mockCommunityStream = vi.hoisted(() => vi.fn());

vi.mock('@features/agent/api', () => ({
  menuService: {
    recommendSearchPlacesStream: mockSearchStream,
    recommendCommunityPlacesStream: mockCommunityStream,
  },
}));

// ── 테스트 스토어 팩토리 ──────────────────────────────────────────

interface AuthPreload {
  isAuthenticated?: boolean;
}

interface AgentPreload {
  selectedMenu?: string | null;
  menuHistoryId?: number | null;
  showConfirmCard?: boolean;
  searchAiRecommendationGroups?: { menuName: string; recommendations: { placeId: string; name: string; reason: string; menuName: string }[] }[];
}

function createTestStore(auth: AuthPreload = {}, agent: AgentPreload = {}) {
  return configureStore({
    reducer: {
      auth: authReducer,
      agent: agentReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        isAuthenticated: auth.isAuthenticated ?? false,
        loading: false,
        error: null,
        language: 'ko' as const,
      },
      agent: {
        menuRecommendations: [],
        menuRecommendationHistoryId: null,
        menuRecommendationPrompt: '',
        menuRecommendationRequestAddress: null,
        menuRecommendationIntro: null,
        menuRecommendationClosing: null,
        isMenuRecommendationLoading: false,
        selectedMenu: agent.selectedMenu ?? null,
        menuHistoryId: agent.menuHistoryId ?? null,
        menuRequestAddress: null,
        searchAiRecommendationGroups: agent.searchAiRecommendationGroups ?? [],
        isSearchAiLoading: false,
        searchAiLoadingMenu: null,
        searchAiRetrying: false,
        communityAiRecommendationGroups: [],
        isCommunityAiLoading: false,
        communityAiLoadingMenu: null,
        communityAiRetrying: false,
        selectedPlace: null,
        showConfirmCard: agent.showConfirmCard ?? false,
        hasMenuSelectionCompleted: false,
      },
    },
  });
}

function createWrapper(store: ReturnType<typeof createTestStore>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

// ── 테스트 ──────────────────────────────────────────────────────

describe('useAgentActions', () => {
  const LAT = 37.5172;
  const LNG = 127.0473;

  beforeEach(() => {
    mockSearchStream.mockReset();
    mockCommunityStream.mockReset();
    // 기본: 즉시 resolve
    mockSearchStream.mockResolvedValue(undefined);
    mockCommunityStream.mockResolvedValue(undefined);
    // visibilityState 초기화
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
  });

  it('handleMenuClick — 메뉴 선택 시 Redux 상태 갱신', () => {
    const store = createTestStore();
    const { result } = renderHook(
      () => useAgentActions({ latitude: LAT, longitude: LNG }),
      { wrapper: createWrapper(store) }
    );

    act(() => {
      result.current.handleMenuClick('김치찌개', 1, { requestAddress: '서울시 강남구' });
    });

    const state = store.getState().agent;
    expect(state.selectedMenu).toBe('김치찌개');
    expect(state.menuHistoryId).toBe(1);
    expect(state.showConfirmCard).toBe(true);
  });

  it('handleCancel — 추천 확인카드 닫기', () => {
    const store = createTestStore({}, { showConfirmCard: true });
    const { result } = renderHook(
      () => useAgentActions({ latitude: LAT, longitude: LNG }),
      { wrapper: createWrapper(store) }
    );

    act(() => {
      result.current.handleCancel();
    });

    expect(store.getState().agent.showConfirmCard).toBe(false);
  });

  it('handleAiRecommendation — search + community 두 SSE 스트림 병렬 시작', async () => {
    const store = createTestStore(
      { isAuthenticated: true },
      { selectedMenu: '김치찌개', menuHistoryId: 1 }
    );
    const { result } = renderHook(
      () => useAgentActions({ latitude: LAT, longitude: LNG }),
      { wrapper: createWrapper(store) }
    );

    await act(async () => {
      await result.current.handleAiRecommendation();
    });

    expect(mockSearchStream).toHaveBeenCalledTimes(1);
    expect(mockCommunityStream).toHaveBeenCalledTimes(1);

    // 두 스트림 모두 selectedMenu와 menuHistoryId를 전달받아야 함
    expect(mockSearchStream).toHaveBeenCalledWith(
      expect.objectContaining({ menuName: '김치찌개', menuRecommendationId: 1 }),
      expect.objectContaining({ onEvent: expect.any(Function) }),
      expect.any(AbortSignal)
    );
    expect(mockCommunityStream).toHaveBeenCalledWith(
      expect.objectContaining({ menuName: '김치찌개', menuRecommendationId: 1 }),
      expect.objectContaining({ onEvent: expect.any(Function) }),
      expect.any(AbortSignal)
    );
  });

  it('handleAiRecommendation — 하나의 스트림 실패 시 다른 스트림은 계속 진행', async () => {
    const store = createTestStore(
      { isAuthenticated: true },
      { selectedMenu: '불고기', menuHistoryId: 2 }
    );
    // search 스트림은 에러, community 스트림은 정상 완료
    mockSearchStream.mockRejectedValue(new Error('네트워크 오류'));
    mockCommunityStream.mockResolvedValue(undefined);

    const { result } = renderHook(
      () => useAgentActions({ latitude: LAT, longitude: LNG }),
      { wrapper: createWrapper(store) }
    );

    await act(async () => {
      await result.current.handleAiRecommendation();
    });

    // 두 스트림 모두 호출되었는지 확인
    expect(mockSearchStream).toHaveBeenCalledTimes(1);
    expect(mockCommunityStream).toHaveBeenCalledTimes(1);
  });

  it('handleAiRecommendation — 앱 백그라운드 전환 시 요청 중단', async () => {
    let capturedSearchSignal: AbortSignal | undefined;
    let capturedCommunitySignal: AbortSignal | undefined;

    // 스트림이 AbortSignal을 캡처하고 절대 resolve되지 않음
    mockSearchStream.mockImplementation((_params: unknown, _callbacks: unknown, signal: AbortSignal) => {
      capturedSearchSignal = signal;
      return new Promise<void>(() => {}); // 의도적으로 pending
    });
    mockCommunityStream.mockImplementation((_params: unknown, _callbacks: unknown, signal: AbortSignal) => {
      capturedCommunitySignal = signal;
      return new Promise<void>(() => {});
    });

    const store = createTestStore(
      { isAuthenticated: true },
      { selectedMenu: '비빔밥', menuHistoryId: 3 }
    );
    const { result } = renderHook(
      () => useAgentActions({ latitude: LAT, longitude: LNG }),
      { wrapper: createWrapper(store) }
    );

    // 스트림 시작 (await 없이 — 백그라운드로 실행 중)
    act(() => {
      void result.current.handleAiRecommendation();
    });

    // Promise 마이크로태스크 flush — 첫 번째 await 이전까지의 동기 코드 실행 보장
    await act(async () => {
      await Promise.resolve();
    });

    // 스트림이 시작되어 시그널이 캡처됐는지 확인
    expect(capturedSearchSignal).toBeDefined();
    expect(capturedCommunitySignal).toBeDefined();
    expect(capturedSearchSignal!.aborted).toBe(false);

    // 앱 백그라운드 전환
    act(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // 두 스트림 모두 중단 확인
    expect(capturedSearchSignal!.aborted).toBe(true);
    expect(capturedCommunitySignal!.aborted).toBe(true);
  });

  it('handleAiRecommendation — placeId 정규화 (places/ 프리픽스 제거)', async () => {
    mockSearchStream.mockImplementation(
      (_params: unknown, callbacks: { onEvent: (e: unknown) => void }, _signal: AbortSignal) => {
        callbacks.onEvent({
          type: 'result',
          data: {
            recommendations: [
              { placeId: 'places/ChIJ1234567890', name: '테스트 가게', reason: '이유', menuName: '파스타' },
            ],
          },
        });
        return Promise.resolve();
      }
    );

    const store = createTestStore(
      { isAuthenticated: true },
      { selectedMenu: '파스타', menuHistoryId: 10 }
    );
    const { result } = renderHook(
      () => useAgentActions({ latitude: LAT, longitude: LNG }),
      { wrapper: createWrapper(store) }
    );

    await act(async () => {
      await result.current.handleAiRecommendation();
    });

    // 스트림 완료 대기 (Promise 체이닝 처리)
    await act(async () => {
      await Promise.resolve();
    });

    const groups = store.getState().agent.searchAiRecommendationGroups;
    expect(groups).toHaveLength(1);
    expect(groups[0].recommendations[0].placeId).toBe('ChIJ1234567890'); // places/ 제거됨
  });

  it('handleAiRecommendation �� 추천 진행 중 재클릭 시 결과 도착 후 중복 요청 방지', async () => {
    // 첫 번째 호출: 결과를 반환하는 스트림
    let firstCallDone = false;
    mockSearchStream.mockImplementation(
      (_params: unknown, callbacks: { onEvent: (e: unknown) => void }, _signal: AbortSignal) => {
        callbacks.onEvent({
          type: 'result',
          data: {
            recommendations: [
              { placeId: 'ChIJ-first', name: '첫째 식당', reason: '맛있음', menuName: '김치찌개' },
            ],
          },
        });
        firstCallDone = true;
        return Promise.resolve();
      }
    );
    mockCommunityStream.mockResolvedValue(undefined);

    const store = createTestStore(
      { isAuthenticated: true },
      { selectedMenu: '김치찌개', menuHistoryId: 1 }
    );
    const { result } = renderHook(
      () => useAgentActions({ latitude: LAT, longitude: LNG }),
      { wrapper: createWrapper(store) }
    );

    // 첫 번째 호출: 스트림 완료 → Redux에 결과 저장
    await act(async () => {
      await result.current.handleAiRecommendation();
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(firstCallDone).toBe(true);
    expect(mockSearchStream).toHaveBeenCalledTimes(1);

    // 두 번째 호출: 이미 결과가 있으므로 API 호출 없이 캐시 사용
    mockSearchStream.mockClear();
    mockCommunityStream.mockClear();

    await act(async () => {
      await result.current.handleAiRecommendation();
    });

    expect(mockSearchStream).not.toHaveBeenCalled();
    expect(mockCommunityStream).not.toHaveBeenCalled();
  });

  it('handleAiRecommendation — 두 스트림 모두 실패 시 에러 처리', async () => {
    const store = createTestStore(
      { isAuthenticated: true },
      { selectedMenu: '파스타', menuHistoryId: 5 }
    );
    // 두 스트림 모두 에러
    mockSearchStream.mockRejectedValue(new Error('검색 스트림 오류'));
    mockCommunityStream.mockRejectedValue(new Error('커뮤니티 스트림 오류'));

    const { result } = renderHook(
      () => useAgentActions({ latitude: LAT, longitude: LNG }),
      { wrapper: createWrapper(store) }
    );

    await act(async () => {
      await result.current.handleAiRecommendation();
    });

    // 두 스트림 모두 호출되었지만 실패
    expect(mockSearchStream).toHaveBeenCalledTimes(1);
    expect(mockCommunityStream).toHaveBeenCalledTimes(1);

    // 로딩 상태 해제 확인
    const state = store.getState().agent;
    expect(state.isSearchAiLoading).toBe(false);
    expect(state.isCommunityAiLoading).toBe(false);
  });

  it('handleAiRecommendation — 이미 추천 결과가 있으면 캐시된 데이터 반환', async () => {
    const store = createTestStore(
      { isAuthenticated: true },
      {
        selectedMenu: '김치찌개',
        menuHistoryId: 1,
        searchAiRecommendationGroups: [
          {
            menuName: '김치찌개',
            recommendations: [
              { placeId: 'ChIJ1234', name: '명동 김치찌개', reason: '맛있음', menuName: '김치찌개' },
            ],
          },
        ],
      }
    );
    const { result } = renderHook(
      () => useAgentActions({ latitude: LAT, longitude: LNG }),
      { wrapper: createWrapper(store) }
    );

    await act(async () => {
      await result.current.handleAiRecommendation();
    });

    // 스트림이 호출되지 않아야 함 (캐시 사용)
    expect(mockSearchStream).not.toHaveBeenCalled();
    expect(mockCommunityStream).not.toHaveBeenCalled();
  });
});
