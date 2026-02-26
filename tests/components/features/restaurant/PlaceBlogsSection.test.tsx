import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { PlaceBlogsSection } from '@features/agent/components/restaurant/PlaceBlogsSection';
import { createMockRestaurantBlog, createAuthenticatedState } from '@tests/factories';
import { menuService } from '@features/agent/api';

vi.mock('@features/agent/api', () => ({
  menuService: {
    getRestaurantBlogs: vi.fn(),
  },
}));

describe('PlaceBlogsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('placeName이 null일 때 아무것도 렌더링되지 않는다', () => {
      const { container } = renderWithProviders(<PlaceBlogsSection placeName={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('placeName이 undefined일 때 아무것도 렌더링되지 않는다', () => {
      const { container } = renderWithProviders(<PlaceBlogsSection placeName={undefined} />);
      expect(container.firstChild).toBeNull();
    });

    it('placeName이 있을 때 섹션 제목이 렌더링된다', async () => {
      vi.mocked(menuService.getRestaurantBlogs).mockResolvedValue({ blogs: [] });

      renderWithProviders(<PlaceBlogsSection placeName="맛집" />);

      await waitFor(() => {
        expect(screen.getByText(/추가 탐색 · 블로그\/웹 리뷰/)).toBeInTheDocument();
        expect(screen.getByText(/맛집에 대한 다른 사람들의 후기와 리뷰를 확인해 보세요/)).toBeInTheDocument();
      });
    });
  });

  describe('로딩 상태 테스트', () => {
    it('블로그 로딩 중일 때 스피너가 표시된다', async () => {
      vi.mocked(menuService.getRestaurantBlogs).mockImplementation(() => new Promise(() => {}));

      renderWithProviders(<PlaceBlogsSection placeName="맛집" />);

      await waitFor(() => {
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
      });
    });
  });

  describe('블로그 목록 테스트', () => {
    it('블로그 데이터가 있을 때 블로그 목록이 표시된다', async () => {
      const mockBlogs = [
        createMockRestaurantBlog({ title: '맛집 리뷰 1', url: 'https://blog1.com' }),
        createMockRestaurantBlog({ title: '맛집 리뷰 2', url: 'https://blog2.com' }),
      ];
      vi.mocked(menuService.getRestaurantBlogs).mockResolvedValue({ blogs: mockBlogs });

      renderWithProviders(<PlaceBlogsSection placeName="맛집" />);

      await waitFor(() => {
        expect(screen.getByText('맛집 리뷰 1')).toBeInTheDocument();
        expect(screen.getByText('맛집 리뷰 2')).toBeInTheDocument();
      });
    });

    it('블로그 스니펫이 표시된다', async () => {
      const mockBlogs = [
        createMockRestaurantBlog({ snippet: '정말 맛있는 곳입니다.' }),
      ];
      vi.mocked(menuService.getRestaurantBlogs).mockResolvedValue({ blogs: mockBlogs });

      renderWithProviders(<PlaceBlogsSection placeName="맛집" />);

      await waitFor(() => {
        expect(screen.getByText('정말 맛있는 곳입니다.')).toBeInTheDocument();
      });
    });

    it('블로그 소스가 표시된다', async () => {
      const mockBlogs = [
        createMockRestaurantBlog({ source: '네이버 블로그' }),
      ];
      vi.mocked(menuService.getRestaurantBlogs).mockResolvedValue({ blogs: mockBlogs });

      renderWithProviders(<PlaceBlogsSection placeName="맛집" />);

      await waitFor(() => {
        expect(screen.getByText('네이버 블로그')).toBeInTheDocument();
      });
    });

    it('블로그 썸네일이 표시된다', async () => {
      const mockBlogs = [
        createMockRestaurantBlog({
          title: '테스트 블로그',
          thumbnailUrl: 'https://example.com/thumb.jpg'
        }),
      ];
      vi.mocked(menuService.getRestaurantBlogs).mockResolvedValue({ blogs: mockBlogs });

      renderWithProviders(<PlaceBlogsSection placeName="맛집" />);

      await waitFor(() => {
        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', 'https://example.com/thumb.jpg');
      });
    });
  });

  describe('링크 테스트', () => {
    it('블로그 링크가 새 탭에서 열리도록 설정된다', async () => {
      const mockBlogs = [
        createMockRestaurantBlog({ title: '블로그 링크 테스트', url: 'https://blog.example.com' }),
      ];
      vi.mocked(menuService.getRestaurantBlogs).mockResolvedValue({ blogs: mockBlogs });

      renderWithProviders(<PlaceBlogsSection placeName="맛집" />);

      await waitFor(() => {
        const link = screen.getByRole('link', { name: /블로그 링크 테스트/i });
        expect(link).toHaveAttribute('href', 'https://blog.example.com');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noreferrer');
      });
    });
  });

  describe('빈 상태 테스트', () => {
    it('블로그가 없을 때 빈 상태 메시지가 표시된다', async () => {
      vi.mocked(menuService.getRestaurantBlogs).mockResolvedValue({ blogs: [] });

      renderWithProviders(<PlaceBlogsSection placeName="맛집" />);

      await waitFor(() => {
        expect(screen.getByText('아직 연관 블로그/웹 문서를 찾지 못했습니다.')).toBeInTheDocument();
      });
    });
  });

  describe('에러 상태 테스트', () => {
    it('API 에러 시 에러 메시지가 표시된다', async () => {
      vi.mocked(menuService.getRestaurantBlogs).mockRejectedValue(new Error('API Error'));

      renderWithProviders(<PlaceBlogsSection placeName="맛집" />);

      await waitFor(() => {
        // Error message could be the raw error or the fallback
        const errorElement = screen.getByText(/API Error|블로그 검색에 실패했습니다/);
        expect(errorElement).toBeInTheDocument();
      });
    });
  });

  describe('API 호출 테스트', () => {
    it('placeName으로 블로그 API가 호출된다', async () => {
      vi.mocked(menuService.getRestaurantBlogs).mockResolvedValue({ blogs: [] });

      renderWithProviders(<PlaceBlogsSection placeName="김치찌개" />);

      await waitFor(() => {
        expect(menuService.getRestaurantBlogs).toHaveBeenCalledWith(
          expect.stringContaining('김치찌개'),
          '김치찌개',
          expect.any(String),
          undefined,
          undefined
        );
      });
    });

    it('사용자 주소가 있으면 주소와 함께 검색한다', async () => {
      vi.mocked(menuService.getRestaurantBlogs).mockResolvedValue({ blogs: [] });

      const preloadedState = createAuthenticatedState({
        address: '서울시 강남구',
        latitude: 37.5,
        longitude: 127.0,
      });

      renderWithProviders(<PlaceBlogsSection placeName="김치찌개" />, { preloadedState });

      await waitFor(() => {
        expect(menuService.getRestaurantBlogs).toHaveBeenCalledWith(
          '서울시 강남구 김치찌개',
          '김치찌개',
          expect.any(String),
          undefined,
          undefined
        );
      });
    });
  });

  describe('null 값 처리 테스트', () => {
    it('블로그 제목이 null이면 기본 텍스트가 표시된다', async () => {
      const mockBlogs = [
        createMockRestaurantBlog({ title: null, url: 'https://blog.com' }),
      ];
      vi.mocked(menuService.getRestaurantBlogs).mockResolvedValue({ blogs: mockBlogs });

      renderWithProviders(<PlaceBlogsSection placeName="맛집" />);

      await waitFor(() => {
        expect(screen.getByText('제목 없는 문서')).toBeInTheDocument();
      });
    });

    it('블로그 소스가 null이면 기본 소스가 표시된다', async () => {
      const mockBlogs = [
        createMockRestaurantBlog({ source: null, title: '테스트' }),
      ];
      vi.mocked(menuService.getRestaurantBlogs).mockResolvedValue({ blogs: mockBlogs });

      renderWithProviders(<PlaceBlogsSection placeName="맛집" />);

      await waitFor(() => {
        expect(screen.getByText('블로그/웹 문서')).toBeInTheDocument();
      });
    });

    it('response.blogs가 null이면 빈 배열로 처리된다', async () => {
      vi.mocked(menuService.getRestaurantBlogs).mockResolvedValue({ blogs: null as unknown as [] });

      renderWithProviders(<PlaceBlogsSection placeName="맛집" />);

      await waitFor(() => {
        expect(screen.getByText('아직 연관 블로그/웹 문서를 찾지 못했습니다.')).toBeInTheDocument();
      });
    });

    it('response.blogs가 undefined이면 빈 배열로 처리된다', async () => {
      vi.mocked(menuService.getRestaurantBlogs).mockResolvedValue({ blogs: undefined as unknown as [] });

      renderWithProviders(<PlaceBlogsSection placeName="맛집" />);

      await waitFor(() => {
        expect(screen.getByText('아직 연관 블로그/웹 문서를 찾지 못했습니다.')).toBeInTheDocument();
      });
    });
  });

  describe('동시 실행 취소 테스트', () => {
    it('placeName이 빠르게 변경되면 이전 실행 결과를 무시한다', async () => {
      let firstResolve: (value: { blogs: unknown[] }) => void;
      let secondResolve: (value: { blogs: unknown[] }) => void;

      const firstPromise = new Promise<{ blogs: unknown[] }>((resolve) => {
        firstResolve = resolve;
      });

      const secondPromise = new Promise<{ blogs: unknown[] }>((resolve) => {
        secondResolve = resolve;
      });

      let callCount = 0;
      vi.mocked(menuService.getRestaurantBlogs).mockImplementation(() => {
        callCount++;
        if (callCount === 1) return firstPromise;
        return secondPromise;
      });

      const { rerender } = renderWithProviders(<PlaceBlogsSection placeName="첫번째" />);

      // Wait for loading to start
      await waitFor(() => {
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
      });

      // Quickly change placeName before first request completes
      rerender(<PlaceBlogsSection placeName="두번째" />);

      // Resolve second request first with blogs
      secondResolve!({
        blogs: [createMockRestaurantBlog({ title: '두번째 블로그' })],
      });

      await waitFor(() => {
        expect(screen.getByText('두번째 블로그')).toBeInTheDocument();
      });

      // Now resolve first request (should be ignored)
      firstResolve!({
        blogs: [createMockRestaurantBlog({ title: '첫번째 블로그' })],
      });

      // Wait a bit and verify final state
      await waitFor(() => {
        expect(screen.getByText('두번째 블로그')).toBeInTheDocument();
      });

      // Should still show second result, not first
      expect(screen.queryByText('첫번째 블로그')).not.toBeInTheDocument();
    });

    it('placeName이 빠르게 변경되면 이전 실행 에러를 무시한다', async () => {
      let firstReject: ((error: Error) => void) | undefined;
      let secondResolve: ((value: { blogs: unknown[] }) => void) | undefined;

      const firstPromise = new Promise<{ blogs: unknown[] }>((_, reject) => {
        firstReject = reject;
      });

      const secondPromise = new Promise<{ blogs: unknown[] }>((resolve) => {
        secondResolve = resolve;
      });

      let callCount = 0;
      vi.mocked(menuService.getRestaurantBlogs).mockImplementation(() => {
        callCount++;
        if (callCount === 1) return firstPromise;
        return secondPromise;
      });

      const { rerender } = renderWithProviders(<PlaceBlogsSection placeName="첫번째" />);

      // Wait for loading to start
      await waitFor(() => {
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
      });

      // Quickly change placeName before first request completes
      rerender(<PlaceBlogsSection placeName="두번째" />);

      // Resolve second request successfully
      secondResolve!({
        blogs: [createMockRestaurantBlog({ title: '성공 블로그' })],
      });

      await waitFor(() => {
        expect(screen.getByText('성공 블로그')).toBeInTheDocument();
      });

      // Now reject first request (should be ignored)
      firstReject!(new Error('첫번째 에러'));

      // Wait a bit and verify final state
      await waitFor(() => {
        expect(screen.getByText('성공 블로그')).toBeInTheDocument();
      });

      // Should still show success result, no error message
      expect(screen.queryByText(/첫번째 에러/)).not.toBeInTheDocument();
    });
  });

  describe('StrictMode 대응 테스트', () => {
    it('placeName과 userAddress가 변경되지 않으면 재요청하지 않는다', async () => {
      vi.mocked(menuService.getRestaurantBlogs).mockResolvedValue({
        blogs: [createMockRestaurantBlog({ title: '테스트 블로그' })],
      });

      const { rerender } = renderWithProviders(<PlaceBlogsSection placeName="맛집" />);

      await waitFor(() => {
        expect(screen.getByText('테스트 블로그')).toBeInTheDocument();
      });

      const callCount = vi.mocked(menuService.getRestaurantBlogs).mock.calls.length;

      // Rerender with same props
      rerender(<PlaceBlogsSection placeName="맛집" />);

      // Wait for any potential state updates
      await waitFor(() => {
        expect(screen.getByText('테스트 블로그')).toBeInTheDocument();
      });

      // Should not call API again (StrictMode check)
      expect(vi.mocked(menuService.getRestaurantBlogs).mock.calls.length).toBe(callCount);
    });
  });
});
