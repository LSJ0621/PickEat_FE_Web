import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserList } from '@/components/features/admin/users/UserList';
import type { AdminUserListItem } from '@/types/admin';

// Mock UserListItem component
vi.mock('@/components/features/admin/users/UserListItem', () => ({
  UserListItem: ({ user, onClick }: { user: AdminUserListItem; onClick: () => void }) => (
    <div data-testid={`user-item-${user.id}`} onClick={onClick}>
      {user.email}
    </div>
  ),
}));

describe('UserList', () => {
  const mockUsers: AdminUserListItem[] = [
    {
      id: 1,
      email: 'user1@example.com',
      name: 'User One',
      role: 'USER',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      lastLoginAt: '2024-01-15T00:00:00.000Z',
    },
    {
      id: 2,
      email: 'user2@example.com',
      name: 'User Two',
      role: 'USER',
      isActive: false,
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
      lastLoginAt: null,
    },
    {
      id: 3,
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
      isActive: true,
      createdAt: '2024-01-03T00:00:00.000Z',
      updatedAt: '2024-01-03T00:00:00.000Z',
      lastLoginAt: '2024-01-20T00:00:00.000Z',
    },
  ];

  describe('Rendering with Users', () => {
    it('should render all users', () => {
      const mockOnItemClick = vi.fn();
      render(<UserList users={mockUsers} onItemClick={mockOnItemClick} />);

      expect(screen.getByTestId('user-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('user-item-2')).toBeInTheDocument();
      expect(screen.getByTestId('user-item-3')).toBeInTheDocument();
    });

    it('should render user emails via UserListItem', () => {
      const mockOnItemClick = vi.fn();
      render(<UserList users={mockUsers} onItemClick={mockOnItemClick} />);

      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    });

    it('should render correct number of user items', () => {
      const mockOnItemClick = vi.fn();
      const { container } = render(<UserList users={mockUsers} onItemClick={mockOnItemClick} />);

      const userItems = container.querySelectorAll('[data-testid^="user-item-"]');
      expect(userItems).toHaveLength(3);
    });

    it('should render users in correct order', () => {
      const mockOnItemClick = vi.fn();
      const { container } = render(<UserList users={mockUsers} onItemClick={mockOnItemClick} />);

      const userItems = container.querySelectorAll('[data-testid^="user-item-"]');
      expect(userItems[0]).toHaveAttribute('data-testid', 'user-item-1');
      expect(userItems[1]).toHaveAttribute('data-testid', 'user-item-2');
      expect(userItems[2]).toHaveAttribute('data-testid', 'user-item-3');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no users', () => {
      const mockOnItemClick = vi.fn();
      render(<UserList users={[]} onItemClick={mockOnItemClick} />);

      expect(screen.getByText('사용자가 없습니다.')).toBeInTheDocument();
    });

    it('should render user icon in empty state', () => {
      const mockOnItemClick = vi.fn();
      const { container } = render(<UserList users={[]} onItemClick={mockOnItemClick} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('h-12', 'w-12', 'text-text-placeholder');
    });

    it('should have proper empty state styling', () => {
      const mockOnItemClick = vi.fn();
      const { container } = render(<UserList users={[]} onItemClick={mockOnItemClick} />);

      const emptyState = container.querySelector('.flex.flex-col.items-center.justify-center');
      expect(emptyState).toBeInTheDocument();
      expect(emptyState).toHaveClass(
        'rounded-lg',
        'border',
        'border-[var(--border-default)]',
        'bg-bg-surface',
        'py-12'
      );
    });

    it('should not render user items when empty', () => {
      const mockOnItemClick = vi.fn();
      const { container } = render(<UserList users={[]} onItemClick={mockOnItemClick} />);

      const userItems = container.querySelectorAll('[data-testid^="user-item-"]');
      expect(userItems).toHaveLength(0);
    });
  });

  describe('User Interactions', () => {
    it('should call onItemClick when user item is clicked', async () => {
      const user = userEvent.setup();
      const mockOnItemClick = vi.fn();
      render(<UserList users={mockUsers} onItemClick={mockOnItemClick} />);

      await user.click(screen.getByTestId('user-item-1'));

      expect(mockOnItemClick).toHaveBeenCalledTimes(1);
      expect(mockOnItemClick).toHaveBeenCalledWith(mockUsers[0]);
    });

    it('should call onItemClick with correct user data', async () => {
      const user = userEvent.setup();
      const mockOnItemClick = vi.fn();
      render(<UserList users={mockUsers} onItemClick={mockOnItemClick} />);

      await user.click(screen.getByTestId('user-item-2'));

      expect(mockOnItemClick).toHaveBeenCalledWith(mockUsers[1]);
    });

    it('should handle multiple user clicks', async () => {
      const user = userEvent.setup();
      const mockOnItemClick = vi.fn();
      render(<UserList users={mockUsers} onItemClick={mockOnItemClick} />);

      await user.click(screen.getByTestId('user-item-1'));
      await user.click(screen.getByTestId('user-item-2'));
      await user.click(screen.getByTestId('user-item-3'));

      expect(mockOnItemClick).toHaveBeenCalledTimes(3);
    });

    it('should call onItemClick with admin user', async () => {
      const user = userEvent.setup();
      const mockOnItemClick = vi.fn();
      render(<UserList users={mockUsers} onItemClick={mockOnItemClick} />);

      await user.click(screen.getByTestId('user-item-3'));

      expect(mockOnItemClick).toHaveBeenCalledWith(mockUsers[2]);
      expect(mockUsers[2].role).toBe('ADMIN');
    });
  });

  describe('Layout', () => {
    it('should have proper spacing between items', () => {
      const mockOnItemClick = vi.fn();
      const { container } = render(<UserList users={mockUsers} onItemClick={mockOnItemClick} />);

      const listContainer = container.querySelector('.space-y-3');
      expect(listContainer).toBeInTheDocument();
    });

    it('should render items in a vertical layout', () => {
      const mockOnItemClick = vi.fn();
      const { container } = render(<UserList users={mockUsers} onItemClick={mockOnItemClick} />);

      const listContainer = container.querySelector('.space-y-3');
      expect(listContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single user', () => {
      const mockOnItemClick = vi.fn();
      const singleUser = [mockUsers[0]];

      render(<UserList users={singleUser} onItemClick={mockOnItemClick} />);

      expect(screen.getByTestId('user-item-1')).toBeInTheDocument();
      expect(screen.queryByText('사용자가 없습니다.')).not.toBeInTheDocument();
    });

    it('should handle user with null lastLoginAt', () => {
      const mockOnItemClick = vi.fn();
      render(<UserList users={mockUsers} onItemClick={mockOnItemClick} />);

      expect(screen.getByTestId('user-item-2')).toBeInTheDocument();
      // User 2 has lastLoginAt: null, should still render
    });

    it('should handle inactive users', () => {
      const mockOnItemClick = vi.fn();
      render(<UserList users={mockUsers} onItemClick={mockOnItemClick} />);

      expect(screen.getByTestId('user-item-2')).toBeInTheDocument();
      // User 2 is inactive (isActive: false), should still render
    });

    it('should handle users with different roles', () => {
      const mockOnItemClick = vi.fn();
      render(<UserList users={mockUsers} onItemClick={mockOnItemClick} />);

      // User 1, 2 are USER role
      expect(screen.getByTestId('user-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('user-item-2')).toBeInTheDocument();
      // User 3 is ADMIN role
      expect(screen.getByTestId('user-item-3')).toBeInTheDocument();
    });

    it('should preserve user order', () => {
      const mockOnItemClick = vi.fn();
      const reversedUsers = [...mockUsers].reverse();

      const { container } = render(
        <UserList users={reversedUsers} onItemClick={mockOnItemClick} />
      );

      const userItems = container.querySelectorAll('[data-testid^="user-item-"]');
      expect(userItems[0]).toHaveAttribute('data-testid', 'user-item-3');
      expect(userItems[1]).toHaveAttribute('data-testid', 'user-item-2');
      expect(userItems[2]).toHaveAttribute('data-testid', 'user-item-1');
    });

    it('should not crash with empty array', () => {
      const mockOnItemClick = vi.fn();

      expect(() => {
        render(<UserList users={[]} onItemClick={mockOnItemClick} />);
      }).not.toThrow();
    });
  });

  describe('Callback Stability', () => {
    it('should work with different onItemClick callbacks', async () => {
      const user = userEvent.setup();
      const mockOnItemClick1 = vi.fn();
      const { rerender } = render(
        <UserList users={mockUsers} onItemClick={mockOnItemClick1} />
      );

      await user.click(screen.getByTestId('user-item-1'));
      expect(mockOnItemClick1).toHaveBeenCalledTimes(1);

      const mockOnItemClick2 = vi.fn();
      rerender(<UserList users={mockUsers} onItemClick={mockOnItemClick2} />);

      await user.click(screen.getByTestId('user-item-1'));
      expect(mockOnItemClick2).toHaveBeenCalledTimes(1);
      expect(mockOnItemClick1).toHaveBeenCalledTimes(1); // Should not be called again
    });
  });
});
