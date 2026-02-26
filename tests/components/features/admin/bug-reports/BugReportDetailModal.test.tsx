import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { createMockBugReportDetailResponse, createMockBugReportDetailWithImages } from '@tests/factories';
import { BugReportDetailModal } from '@features/admin/components/bug-reports/BugReportDetailModal';
import { server } from '@tests/mocks/server';
import { http, HttpResponse } from 'msw';

describe('BugReportDetailModal', () => {
  const mockOnClose = vi.fn();
  const mockOnStatusChange = vi.fn();

  const defaultProps = {
    bugReportId: 1,
    isOpen: true,
    onClose: mockOnClose,
    onStatusChange: mockOnStatusChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Renders the modal and waits for the default title to appear.
  const renderLoadedModal = async (overrides?: Parameters<typeof createMockBugReportDetailResponse>[0]) => {
    const mockData = createMockBugReportDetailResponse(overrides);
    server.use(
      http.get('*/admin/bug-reports/1', () => HttpResponse.json(mockData))
    );
    renderWithProviders(<BugReportDetailModal {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('테스트 버그 리포트')).toBeInTheDocument();
    });
    return mockData;
  };

  describe('Rendering and Data Loading', () => {
    it('should show loading spinner then render modal content with title and description', async () => {
      const mockData = createMockBugReportDetailResponse({
        title: '로딩 테스트 버그',
        description: '버그 설명 테스트',
      });
      server.use(
        http.get('*/admin/bug-reports/1', () => HttpResponse.json(mockData))
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      expect(document.body.querySelector('.animate-spin')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('로딩 테스트 버그')).toBeInTheDocument();
        expect(screen.getByText('버그 설명 테스트')).toBeInTheDocument();
      });
    });

    it('should not render when isOpen is false', () => {
      renderWithProviders(<BugReportDetailModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('테스트 버그 리포트')).not.toBeInTheDocument();
    });

    it('should display bug report category', async () => {
      await renderLoadedModal({ category: 'BUG' });
      expect(screen.getByText('버그 제보')).toBeInTheDocument();
    });
  });

  describe('Status Display', () => {
    it.each([
      ['UNCONFIRMED', '미확인', true],
      ['CONFIRMED', '확인', false],
    ] as const)(
      'status %s should show badge "%s" and status-change button visibility = %s',
      async (status, badgeText, showsButton) => {
        await renderLoadedModal({ status });
        expect(screen.getByText(badgeText)).toBeInTheDocument();
        if (showsButton) {
          expect(screen.getByText('확인 처리')).toBeInTheDocument();
        } else {
          expect(screen.queryByText('확인 처리')).not.toBeInTheDocument();
        }
      }
    );
  });

  describe('Image Gallery', () => {
    it('should render image section when images exist', async () => {
      const mockData = createMockBugReportDetailWithImages();
      server.use(
        http.get('*/admin/bug-reports/1', () => HttpResponse.json(mockData))
      );
      renderWithProviders(<BugReportDetailModal {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByText('이미지')).toBeInTheDocument();
      });
    });

    it('should not render image section when no images', async () => {
      await renderLoadedModal({ images: null });
      expect(screen.queryByText('이미지')).not.toBeInTheDocument();
    });
  });

  describe('Meta Information', () => {
    it('should display creation and update date labels', async () => {
      await renderLoadedModal({
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-16T10:00:00.000Z',
      });
      expect(screen.getByText('생성일')).toBeInTheDocument();
      expect(screen.getByText('수정일')).toBeInTheDocument();
    });

    it('should display user ID when user exists', async () => {
      await renderLoadedModal({
        user: { id: 123, nickname: 'TestUser', email: 'test@example.com' },
      });
      expect(screen.getByText('유저 ID')).toBeInTheDocument();
      expect(screen.getByText('123')).toBeInTheDocument();
    });

    it('should display N/A when user is null', async () => {
      await renderLoadedModal({ user: null });
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });

  describe('Status Change Functionality', () => {
    const setupStatusChange = async (delay = 0) => {
      const user = userEvent.setup();
      const mockData = createMockBugReportDetailResponse({ status: 'UNCONFIRMED' });
      server.use(
        http.get('*/admin/bug-reports/1', () => HttpResponse.json(mockData)),
        http.patch('*/admin/bug-reports/1/status', async () => {
          if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
          return HttpResponse.json({ success: true });
        })
      );
      renderWithProviders(<BugReportDetailModal {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByText('확인 처리')).toBeInTheDocument();
      });
      return user;
    };

    it('should call onStatusChange and show processing / disabled state during update', async () => {
      const user = await setupStatusChange(100);

      await user.click(screen.getByText('확인 처리'));

      const processingButton = screen.getByText('처리 중...');
      expect(processingButton).toBeInTheDocument();
      expect(processingButton).toBeDisabled();

      await waitFor(() => {
        expect(mockOnStatusChange).toHaveBeenCalled();
      });
    });
  });

  describe('Modal Close Functionality', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      await renderLoadedModal();

      const closeButtons = screen.getAllByRole('button', { name: /닫기/i });
      await user.click(closeButtons[0]);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when ESC key is pressed', async () => {
      const user = userEvent.setup();
      await renderLoadedModal();

      await user.keyboard('{Escape}');

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();
      await renderLoadedModal();

      const backdrop = document.body.querySelector('.fixed.inset-0');
      expect(backdrop).toBeInTheDocument();
      await user.click(backdrop!);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not close modal when non-ESC key is pressed', async () => {
      const user = userEvent.setup();
      await renderLoadedModal();

      await user.keyboard('{Enter}');

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should not close modal when clicking inside modal content', async () => {
      const user = userEvent.setup();
      await renderLoadedModal();

      await user.click(screen.getByText('테스트 버그 리포트'));

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it.each([
      ['network error', () => HttpResponse.error()],
      ['API 500 error', () => new HttpResponse(null, { status: 500 })],
    ] as const)('should close modal on %s', async (_label, handler) => {
      server.use(http.get('*/admin/bug-reports/1', handler));
      renderWithProviders(<BugReportDetailModal {...defaultProps} />);
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Animation', () => {
    it('should remove from DOM after close animation completes', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const mockData = createMockBugReportDetailResponse();
      server.use(
        http.get('*/admin/bug-reports/1', () => HttpResponse.json(mockData))
      );

      const { rerender } = renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('테스트 버그 리포트')).toBeInTheDocument();
      });

      act(() => {
        rerender(<BugReportDetailModal {...defaultProps} isOpen={false} />);
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.queryByText('테스트 버그 리포트')).not.toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });
});
