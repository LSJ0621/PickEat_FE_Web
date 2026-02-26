import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { RecentActivityList } from '@features/admin/components/dashboard/RecentActivityList';
import type { RecentActivities } from '@features/admin/types';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RecentActivityList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockActivities: RecentActivities = {
    recentUsers: [
      {
        id: 1,
        email: 'user1@example.com',
        socialType: 'kakao',
        createdAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
      },
      {
        id: 2,
        email: 'user2@example.com',
        socialType: 'google',
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
      },
      {
        id: 3,
        email: 'user3@example.com',
        socialType: null,
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 days ago
      },
    ],
    recentBugReports: [
      {
        id: 1,
        title: 'Login Bug',
        category: 'BUG',
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(), // 15 minutes ago
      },
      {
        id: 2,
        title: 'General Inquiry',
        category: 'INQUIRY',
        createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), // 5 hours ago
      },
      {
        id: 3,
        title: 'Other Issue',
        category: 'OTHER',
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), // 10 days ago
      },
    ],
    recentDeletedUsers: [
      {
        id: 4,
        email: 'deleted1@example.com',
        deletedAt: new Date(Date.now() - 60 * 60000).toISOString(), // 1 hour ago
      },
      {
        id: 5,
        email: 'deleted2@example.com',
        deletedAt: new Date(Date.now() - 4 * 86400000).toISOString(), // 4 days ago
      },
    ],
  };

  describe('Rendering', () => {
    it('should render with title', () => {
      renderWithProviders(<RecentActivityList activities={mockActivities} />);

      expect(screen.getByText('최근 활동')).toBeInTheDocument();
    });

    it('should render all three tabs', () => {
      renderWithProviders(<RecentActivityList activities={mockActivities} />);

      expect(screen.getByText('최근 가입자')).toBeInTheDocument();
      expect(screen.getByText('버그 리포트')).toBeInTheDocument();
      expect(screen.getByText('최근 탈퇴자')).toBeInTheDocument();
    });

    it('should show users tab by default', () => {
      renderWithProviders(<RecentActivityList activities={mockActivities} />);

      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
    });
  });

  describe('Recent Users Tab', () => {
    it('should render all recent users', () => {
      renderWithProviders(<RecentActivityList activities={mockActivities} />);

      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
      expect(screen.getByText('user3@example.com')).toBeInTheDocument();
    });

    it('should display social type for kakao users', () => {
      renderWithProviders(<RecentActivityList activities={mockActivities} />);

      expect(screen.getByText('카카오 계정')).toBeInTheDocument();
    });

    it('should display social type for google users', () => {
      renderWithProviders(<RecentActivityList activities={mockActivities} />);

      expect(screen.getByText('구글 계정')).toBeInTheDocument();
    });

    it('should not display social type when null', () => {
      const { container } = renderWithProviders(
        <RecentActivityList activities={mockActivities} />
      );

      const user3Email = screen.getByText('user3@example.com');
      const user3Container = user3Email.closest('.flex');
      expect(user3Container).toBeInTheDocument();
      // Should not have social type text
      expect(user3Container?.textContent).not.toContain('카카오');
      expect(user3Container?.textContent).not.toContain('구글');
    });

    it('should show empty state when no users', () => {
      const emptyActivities: RecentActivities = {
        recentUsers: [],
        recentBugReports: mockActivities.recentBugReports,
        recentDeletedUsers: mockActivities.recentDeletedUsers,
      };

      renderWithProviders(<RecentActivityList activities={emptyActivities} />);

      expect(screen.getByText('최근 가입한 사용자가 없습니다.')).toBeInTheDocument();
    });
  });

  describe('Bug Reports Tab', () => {
    it('should switch to bug reports tab', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RecentActivityList activities={mockActivities} />);

      await user.click(screen.getByText('버그 리포트'));

      expect(screen.getByText('Login Bug')).toBeInTheDocument();
      expect(screen.getByText('General Inquiry')).toBeInTheDocument();
    });

    it('should display BUG category correctly', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RecentActivityList activities={mockActivities} />);

      await user.click(screen.getByText('버그 리포트'));

      expect(screen.getByText('버그 제보')).toBeInTheDocument();
    });

    it('should display INQUIRY category correctly', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RecentActivityList activities={mockActivities} />);

      await user.click(screen.getByText('버그 리포트'));

      expect(screen.getByText('문의 사항')).toBeInTheDocument();
    });

    it('should display OTHER category correctly', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RecentActivityList activities={mockActivities} />);

      await user.click(screen.getByText('버그 리포트'));

      expect(screen.getByText('기타')).toBeInTheDocument();
    });

    it('should navigate to bug report detail on click', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RecentActivityList activities={mockActivities} />, {
        useMemoryRouter: true,
      });

      await user.click(screen.getByText('버그 리포트'));
      await user.click(screen.getByText('Login Bug'));

      expect(mockNavigate).toHaveBeenCalledWith('/admin/bug-reports/1');
    });

    it('should show empty state when no bug reports', async () => {
      const user = userEvent.setup();
      const emptyActivities: RecentActivities = {
        recentUsers: mockActivities.recentUsers,
        recentBugReports: [],
        recentDeletedUsers: mockActivities.recentDeletedUsers,
      };

      renderWithProviders(<RecentActivityList activities={emptyActivities} />);
      await user.click(screen.getByText('버그 리포트'));

      expect(screen.getByText('최근 버그 리포트가 없습니다.')).toBeInTheDocument();
    });
  });

  describe('Deleted Users Tab', () => {
    it('should switch to deleted users tab', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RecentActivityList activities={mockActivities} />);

      await user.click(screen.getByText('최근 탈퇴자'));

      expect(screen.getByText('deleted1@example.com')).toBeInTheDocument();
      expect(screen.getByText('deleted2@example.com')).toBeInTheDocument();
    });

    it('should show empty state when no deleted users', async () => {
      const user = userEvent.setup();
      const emptyActivities: RecentActivities = {
        recentUsers: mockActivities.recentUsers,
        recentBugReports: mockActivities.recentBugReports,
        recentDeletedUsers: [],
      };

      renderWithProviders(<RecentActivityList activities={emptyActivities} />);
      await user.click(screen.getByText('최근 탈퇴자'));

      expect(screen.getByText('최근 탈퇴한 사용자가 없습니다.')).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('should show minutes ago for recent activity', () => {
      renderWithProviders(<RecentActivityList activities={mockActivities} />);

      expect(screen.getByText(/\d+분 전/)).toBeInTheDocument();
    });

    it('should show hours ago for activity within 24 hours', () => {
      renderWithProviders(<RecentActivityList activities={mockActivities} />);

      expect(screen.getByText(/\d+시간 전/)).toBeInTheDocument();
    });

    it('should show days ago for activity within a week', () => {
      renderWithProviders(<RecentActivityList activities={mockActivities} />);

      expect(screen.getByText(/\d+일 전/)).toBeInTheDocument();
    });

    it('should show full date for older activity', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RecentActivityList activities={mockActivities} />);

      await user.click(screen.getByText('버그 리포트'));

      // 10 days ago should show as YYYY-MM-DD formatted date
      const tenDaysAgo = new Date(Date.now() - 10 * 86400000);
      const year = tenDaysAgo.getFullYear();
      const month = String(tenDaysAgo.getMonth() + 1).padStart(2, '0');
      const day = String(tenDaysAgo.getDate()).padStart(2, '0');
      const oldDate = `${year}-${month}-${day}`;
      expect(screen.getByText(oldDate)).toBeInTheDocument();
    });
  });

  describe('Interactive Elements', () => {
    it('should have hover effect on user items', () => {
      const { container } = renderWithProviders(
        <RecentActivityList activities={mockActivities} />
      );

      // User items have hover:bg-bg-hover class via transition-colors
      const userItems = container.querySelectorAll('.transition-colors');
      expect(userItems.length).toBeGreaterThan(0);
    });

    it('should have clickable bug report items', async () => {
      const user = userEvent.setup();
      renderWithProviders(<RecentActivityList activities={mockActivities} />);

      await user.click(screen.getByText('버그 리포트'));

      const bugReportButton = screen.getByText('Login Bug').closest('button');
      expect(bugReportButton).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty activities object', () => {
      const emptyActivities: RecentActivities = {
        recentUsers: [],
        recentBugReports: [],
        recentDeletedUsers: [],
      };

      renderWithProviders(<RecentActivityList activities={emptyActivities} />);

      expect(screen.getByText('최근 가입한 사용자가 없습니다.')).toBeInTheDocument();
    });

    it('should handle activities with single item', () => {
      const singleItemActivities: RecentActivities = {
        recentUsers: [mockActivities.recentUsers[0]],
        recentBugReports: [mockActivities.recentBugReports[0]],
        recentDeletedUsers: [mockActivities.recentDeletedUsers[0]],
      };

      renderWithProviders(<RecentActivityList activities={singleItemActivities} />);

      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    });
  });
});
