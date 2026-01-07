import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { createMockBugReportDetailResponse, createMockBugReportDetailWithImages } from '@tests/factories';
import { BugReportDetailModal } from '@/components/features/admin/bug-reports/BugReportDetailModal';
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

  describe('Rendering and Data Loading', () => {
    it('should render modal when open', async () => {
      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(createMockBugReportDetailResponse());
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('테스트 버그 리포트')).toBeInTheDocument();
      });
    });

    it('should not render when isOpen is false', () => {
      renderWithProviders(<BugReportDetailModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('테스트 버그 리포트')).not.toBeInTheDocument();
    });

    it('should show loading spinner while fetching data', () => {
      renderWithProviders(<BugReportDetailModal {...defaultProps} />);
      const spinner = document.body.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should load and display bug report details', async () => {
      const mockData = createMockBugReportDetailResponse({
        title: '로딩 테스트 버그',
        description: '버그 설명 테스트',
      });

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('로딩 테스트 버그')).toBeInTheDocument();
        expect(screen.getByText('버그 설명 테스트')).toBeInTheDocument();
      });
    });

    it('should display bug report category', async () => {
      const mockData = createMockBugReportDetailResponse({ category: 'BUG' });

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('버그 제보')).toBeInTheDocument();
      });
    });
  });

  describe('Status Display', () => {
    it('should display UNCONFIRMED status badge', async () => {
      const mockData = createMockBugReportDetailResponse({ status: 'UNCONFIRMED' });

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('미확인')).toBeInTheDocument();
      });
    });

    it('should display CONFIRMED status badge', async () => {
      const mockData = createMockBugReportDetailResponse({ status: 'CONFIRMED' });

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('확인')).toBeInTheDocument();
      });
    });

    it('should show status change button for UNCONFIRMED status', async () => {
      const mockData = createMockBugReportDetailResponse({ status: 'UNCONFIRMED' });

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('확인 처리')).toBeInTheDocument();
      });
    });

    it('should not show status change button for CONFIRMED status', async () => {
      const mockData = createMockBugReportDetailResponse({ status: 'CONFIRMED' });

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText('확인 처리')).not.toBeInTheDocument();
      });
    });
  });

  describe('Image Gallery', () => {
    it('should render image gallery when images exist', async () => {
      const mockData = createMockBugReportDetailWithImages();

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('이미지')).toBeInTheDocument();
      });
    });

    it('should not render image gallery when no images', async () => {
      const mockData = createMockBugReportDetailResponse({ images: null });

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText('이미지')).not.toBeInTheDocument();
      });
    });
  });

  describe('Meta Information', () => {
    it('should display creation date', async () => {
      const mockData = createMockBugReportDetailResponse({
        createdAt: '2024-01-15T10:00:00.000Z'
      });

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('생성일')).toBeInTheDocument();
      });
    });

    it('should display update date', async () => {
      const mockData = createMockBugReportDetailResponse({
        updatedAt: '2024-01-16T10:00:00.000Z'
      });

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('수정일')).toBeInTheDocument();
      });
    });

    it('should display user ID', async () => {
      const mockData = createMockBugReportDetailResponse({
        user: { id: 123, nickname: 'TestUser', email: 'test@example.com' }
      });

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('유저 ID')).toBeInTheDocument();
        expect(screen.getByText('123')).toBeInTheDocument();
      });
    });

    it('should display N/A when user ID is null', async () => {
      const mockData = createMockBugReportDetailResponse({
        user: null
      });

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('N/A')).toBeInTheDocument();
      });
    });
  });

  describe('Status Change Functionality', () => {
    it('should call status change API when button is clicked', async () => {
      const user = userEvent.setup();
      const mockData = createMockBugReportDetailResponse({ status: 'UNCONFIRMED' });

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        }),
        http.patch('*/admin/bug-reports/1/status', () => {
          return HttpResponse.json({ success: true });
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('확인 처리')).toBeInTheDocument();
      });

      const button = screen.getByText('확인 처리');
      await user.click(button);

      await waitFor(() => {
        expect(mockOnStatusChange).toHaveBeenCalled();
      });
    });

    it('should show processing state during status update', async () => {
      const user = userEvent.setup();
      const mockData = createMockBugReportDetailResponse({ status: 'UNCONFIRMED' });

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        }),
        http.patch('*/admin/bug-reports/1/status', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({ success: true });
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('확인 처리')).toBeInTheDocument();
      });

      const button = screen.getByText('확인 처리');
      await user.click(button);

      expect(screen.getByText('처리 중...')).toBeInTheDocument();
    });

    it('should disable button during status update', async () => {
      const user = userEvent.setup();
      const mockData = createMockBugReportDetailResponse({ status: 'UNCONFIRMED' });

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        }),
        http.patch('*/admin/bug-reports/1/status', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({ success: true });
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('확인 처리')).toBeInTheDocument();
      });

      const button = screen.getByText('확인 처리');
      await user.click(button);

      const processingButton = screen.getByText('처리 중...');
      expect(processingButton).toBeDisabled();
    });
  });

  describe('Modal Close Functionality', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const mockData = createMockBugReportDetailResponse();

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('테스트 버그 리포트')).toBeInTheDocument();
      });

      const closeButtons = screen.getAllByRole('button', { name: /닫기/i });
      await user.click(closeButtons[0]);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when ESC key is pressed', async () => {
      const user = userEvent.setup();
      const mockData = createMockBugReportDetailResponse();

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('테스트 버그 리포트')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();
      const mockData = createMockBugReportDetailResponse();

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('테스트 버그 리포트')).toBeInTheDocument();
      });

      const backdrop = document.body.querySelector('.fixed.inset-0.z-\\[10000\\]');
      expect(backdrop).toBeInTheDocument();
      await user.click(backdrop!);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should close modal on network error', async () => {
      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.error();
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should close modal on API error', async () => {
      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Portal Rendering', () => {
    it('should render modal in document body', async () => {
      const mockData = createMockBugReportDetailResponse();

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        const modalInBody = document.body.querySelector('.fixed.inset-0.z-\\[10000\\]');
        expect(modalInBody).toBeInTheDocument();
      });
    });
  });

  describe('Animation', () => {
    it('should apply animation classes when opening', async () => {
      const mockData = createMockBugReportDetailResponse();

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        const backdrop = document.querySelector('.modal-backdrop-enter');
        expect(backdrop).toBeInTheDocument();
      });
    });

    it('should remove from DOM after close animation completes', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const mockData = createMockBugReportDetailResponse();

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        })
      );

      const { rerender } = renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('테스트 버그 리포트')).toBeInTheDocument();
      });

      // Close the modal
      act(() => {
        rerender(<BugReportDetailModal {...defaultProps} isOpen={false} />);
      });

      // Advance timers to complete animation
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Wait for DOM updates after animation
      await waitFor(() => {
        expect(screen.queryByText('테스트 버그 리포트')).not.toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });

  describe('Keyboard Event Handling', () => {
    it('should not close modal when non-ESC key is pressed', async () => {
      const user = userEvent.setup();
      const mockData = createMockBugReportDetailResponse();

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('테스트 버그 리포트')).toBeInTheDocument();
      });

      await user.keyboard('{Enter}');

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Modal Content Click', () => {
    it('should not close modal when clicking inside modal content', async () => {
      const user = userEvent.setup();
      const mockData = createMockBugReportDetailResponse();

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('테스트 버그 리포트')).toBeInTheDocument();
      });

      const title = screen.getByText('테스트 버그 리포트');
      await user.click(title);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Network Error vs General Error', () => {
    it('should handle network error differently from general error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.error();
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible close button with role and name', async () => {
      const mockData = createMockBugReportDetailResponse();

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('테스트 버그 리포트')).toBeInTheDocument();
      });

      const closeButtons = screen.getAllByRole('button', { name: /닫기/i });
      expect(closeButtons.length).toBeGreaterThan(0);
    });

    it('should have accessible status change button when available', async () => {
      const mockData = createMockBugReportDetailResponse({ status: 'UNCONFIRMED' });

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: '확인 처리' });
        expect(button).toBeInTheDocument();
        expect(button).not.toHaveAttribute('aria-disabled', 'true');
      });
    });

    it('should indicate disabled state during status update', async () => {
      const user = userEvent.setup();
      const mockData = createMockBugReportDetailResponse({ status: 'UNCONFIRMED' });

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        }),
        http.patch('*/admin/bug-reports/1/status', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({ success: true });
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('확인 처리')).toBeInTheDocument();
      });

      const button = screen.getByText('확인 처리');
      await user.click(button);

      const processingButton = screen.getByRole('button', { name: '처리 중...' });
      expect(processingButton).toBeDisabled();
    });

    it('should use semantic button elements for interactive actions', async () => {
      const mockData = createMockBugReportDetailResponse({ status: 'UNCONFIRMED' });

      server.use(
        http.get('*/admin/bug-reports/1', () => {
          return HttpResponse.json(mockData);
        })
      );

      renderWithProviders(<BugReportDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('확인 처리')).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach((button) => {
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });
});
