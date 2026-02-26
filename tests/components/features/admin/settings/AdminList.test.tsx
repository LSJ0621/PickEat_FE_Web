import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminList } from '@features/admin/components/settings/AdminList';
import type { AdminUser } from '@features/admin/types-settings';

// Mock AdminListItem component
vi.mock('@features/admin/components/settings/AdminListItem', () => ({
  AdminListItem: ({
    admin,
    currentUserId,
    onRemove,
  }: {
    admin: AdminUser;
    currentUserId?: number;
    onRemove: (admin: AdminUser) => void;
  }) => (
    <div data-testid={`admin-item-${admin.id}`}>
      <span>{admin.email}</span>
      {admin.id !== currentUserId && (
        <button onClick={() => onRemove(admin)} data-testid={`remove-${admin.id}`}>
          Remove
        </button>
      )}
    </div>
  ),
}));

describe('AdminList', () => {
  const mockAdmins: AdminUser[] = [
    {
      id: 1,
      email: 'admin1@example.com',
      name: 'Admin One',
      role: 'ADMIN',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      email: 'admin2@example.com',
      name: 'Admin Two',
      role: 'ADMIN',
      isActive: true,
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
    {
      id: 3,
      email: 'admin3@example.com',
      name: 'Admin Three',
      role: 'ADMIN',
      isActive: false,
      createdAt: '2024-01-03T00:00:00.000Z',
      updatedAt: '2024-01-03T00:00:00.000Z',
    },
  ];

  describe('Rendering with Admins', () => {
    it('should render all admins', () => {
      const mockOnRemove = vi.fn();
      render(<AdminList admins={mockAdmins} onRemove={mockOnRemove} />);

      expect(screen.getByTestId('admin-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('admin-item-2')).toBeInTheDocument();
      expect(screen.getByTestId('admin-item-3')).toBeInTheDocument();
    });

    it('should render admin emails via AdminListItem', () => {
      const mockOnRemove = vi.fn();
      render(<AdminList admins={mockAdmins} onRemove={mockOnRemove} />);

      expect(screen.getByText('admin1@example.com')).toBeInTheDocument();
      expect(screen.getByText('admin2@example.com')).toBeInTheDocument();
      expect(screen.getByText('admin3@example.com')).toBeInTheDocument();
    });

    it('should render correct number of admin items', () => {
      const mockOnRemove = vi.fn();
      const { container } = render(<AdminList admins={mockAdmins} onRemove={mockOnRemove} />);

      const adminItems = container.querySelectorAll('[data-testid^="admin-item-"]');
      expect(adminItems).toHaveLength(3);
    });

    it('should render admins in correct order', () => {
      const mockOnRemove = vi.fn();
      const { container } = render(<AdminList admins={mockAdmins} onRemove={mockOnRemove} />);

      const adminItems = container.querySelectorAll('[data-testid^="admin-item-"]');
      expect(adminItems[0]).toHaveAttribute('data-testid', 'admin-item-1');
      expect(adminItems[1]).toHaveAttribute('data-testid', 'admin-item-2');
      expect(adminItems[2]).toHaveAttribute('data-testid', 'admin-item-3');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no admins', () => {
      const mockOnRemove = vi.fn();
      render(<AdminList admins={[]} onRemove={mockOnRemove} />);

      expect(screen.getByText('등록된 관리자가 없습니다.')).toBeInTheDocument();
    });

    it('should not render admin items when empty', () => {
      const mockOnRemove = vi.fn();
      const { container } = render(<AdminList admins={[]} onRemove={mockOnRemove} />);

      const adminItems = container.querySelectorAll('[data-testid^="admin-item-"]');
      expect(adminItems).toHaveLength(0);
    });
  });

  describe('Current User Handling', () => {
    it('should pass currentUserId to AdminListItem', () => {
      const mockOnRemove = vi.fn();
      render(
        <AdminList
          admins={mockAdmins}
          currentUserId={1}
          onRemove={mockOnRemove}
        />
      );

      // Current user (id=1) should not have remove button
      expect(screen.queryByTestId('remove-1')).not.toBeInTheDocument();
      // Other admins should have remove button
      expect(screen.getByTestId('remove-2')).toBeInTheDocument();
      expect(screen.getByTestId('remove-3')).toBeInTheDocument();
    });

    it('should handle when currentUserId is not provided', () => {
      const mockOnRemove = vi.fn();
      render(<AdminList admins={mockAdmins} onRemove={mockOnRemove} />);

      // All admins should have remove button
      expect(screen.getByTestId('remove-1')).toBeInTheDocument();
      expect(screen.getByTestId('remove-2')).toBeInTheDocument();
      expect(screen.getByTestId('remove-3')).toBeInTheDocument();
    });

    it('should handle when currentUserId does not match any admin', () => {
      const mockOnRemove = vi.fn();
      render(
        <AdminList
          admins={mockAdmins}
          currentUserId={999}
          onRemove={mockOnRemove}
        />
      );

      // All admins should have remove button
      expect(screen.getByTestId('remove-1')).toBeInTheDocument();
      expect(screen.getByTestId('remove-2')).toBeInTheDocument();
      expect(screen.getByTestId('remove-3')).toBeInTheDocument();
    });
  });

  describe('Remove Functionality', () => {
    it('should call onRemove when remove button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnRemove = vi.fn();
      render(<AdminList admins={mockAdmins} onRemove={mockOnRemove} />);

      await user.click(screen.getByTestId('remove-1'));

      expect(mockOnRemove).toHaveBeenCalledTimes(1);
      expect(mockOnRemove).toHaveBeenCalledWith(mockAdmins[0]);
    });

    it('should call onRemove with correct admin data', async () => {
      const user = userEvent.setup();
      const mockOnRemove = vi.fn();
      render(<AdminList admins={mockAdmins} onRemove={mockOnRemove} />);

      await user.click(screen.getByTestId('remove-2'));

      expect(mockOnRemove).toHaveBeenCalledWith(mockAdmins[1]);
    });

    it('should handle multiple remove clicks', async () => {
      const user = userEvent.setup();
      const mockOnRemove = vi.fn();
      render(<AdminList admins={mockAdmins} onRemove={mockOnRemove} />);

      await user.click(screen.getByTestId('remove-1'));
      await user.click(screen.getByTestId('remove-2'));
      await user.click(screen.getByTestId('remove-3'));

      expect(mockOnRemove).toHaveBeenCalledTimes(3);
    });

    it('should not call onRemove for current user', async () => {
      const mockOnRemove = vi.fn();
      render(
        <AdminList
          admins={mockAdmins}
          currentUserId={1}
          onRemove={mockOnRemove}
        />
      );

      // Current user should not have remove button
      expect(screen.queryByTestId('remove-1')).not.toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have proper spacing between items', () => {
      const mockOnRemove = vi.fn();
      const { container } = render(<AdminList admins={mockAdmins} onRemove={mockOnRemove} />);

      const listContainer = container.querySelector('.space-y-3');
      expect(listContainer).toBeInTheDocument();
    });

    it('should render items in a vertical layout', () => {
      const mockOnRemove = vi.fn();
      const { container } = render(<AdminList admins={mockAdmins} onRemove={mockOnRemove} />);

      const listContainer = container.querySelector('.space-y-3');
      expect(listContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single admin', () => {
      const mockOnRemove = vi.fn();
      const singleAdmin = [mockAdmins[0]];

      render(<AdminList admins={singleAdmin} onRemove={mockOnRemove} />);

      expect(screen.getByTestId('admin-item-1')).toBeInTheDocument();
      expect(screen.queryByText('등록된 관리자가 없습니다.')).not.toBeInTheDocument();
    });

    it('should handle inactive admins', () => {
      const mockOnRemove = vi.fn();
      render(<AdminList admins={mockAdmins} onRemove={mockOnRemove} />);

      // Admin 3 is inactive (isActive: false), should still render
      expect(screen.getByTestId('admin-item-3')).toBeInTheDocument();
    });

    it('should preserve admin order', () => {
      const mockOnRemove = vi.fn();
      const reversedAdmins = [...mockAdmins].reverse();

      const { container } = render(
        <AdminList admins={reversedAdmins} onRemove={mockOnRemove} />
      );

      const adminItems = container.querySelectorAll('[data-testid^="admin-item-"]');
      expect(adminItems[0]).toHaveAttribute('data-testid', 'admin-item-3');
      expect(adminItems[1]).toHaveAttribute('data-testid', 'admin-item-2');
      expect(adminItems[2]).toHaveAttribute('data-testid', 'admin-item-1');
    });

    it('should not crash with empty array', () => {
      const mockOnRemove = vi.fn();

      expect(() => {
        render(<AdminList admins={[]} onRemove={mockOnRemove} />);
      }).not.toThrow();
    });

    it('should handle admin id comparison correctly', () => {
      const mockOnRemove = vi.fn();
      render(
        <AdminList
          admins={mockAdmins}
          currentUserId={2}
          onRemove={mockOnRemove}
        />
      );

      // Admin 2 is current user, should not have remove button
      expect(screen.queryByTestId('remove-2')).not.toBeInTheDocument();
      // Others should have remove button
      expect(screen.getByTestId('remove-1')).toBeInTheDocument();
      expect(screen.getByTestId('remove-3')).toBeInTheDocument();
    });
  });

  describe('Callback Stability', () => {
    it('should work with different onRemove callbacks', async () => {
      const user = userEvent.setup();
      const mockOnRemove1 = vi.fn();
      const { rerender } = render(<AdminList admins={mockAdmins} onRemove={mockOnRemove1} />);

      await user.click(screen.getByTestId('remove-1'));
      expect(mockOnRemove1).toHaveBeenCalledTimes(1);

      const mockOnRemove2 = vi.fn();
      rerender(<AdminList admins={mockAdmins} onRemove={mockOnRemove2} />);

      await user.click(screen.getByTestId('remove-1'));
      expect(mockOnRemove2).toHaveBeenCalledTimes(1);
      expect(mockOnRemove1).toHaveBeenCalledTimes(1); // Should not be called again
    });
  });

  describe('Props Validation', () => {
    it('should render with only required props', () => {
      const mockOnRemove = vi.fn();

      expect(() => {
        render(<AdminList admins={mockAdmins} onRemove={mockOnRemove} />);
      }).not.toThrow();
    });

    it('should render with all props', () => {
      const mockOnRemove = vi.fn();

      expect(() => {
        render(
          <AdminList
            admins={mockAdmins}
            currentUserId={1}
            onRemove={mockOnRemove}
          />
        );
      }).not.toThrow();
    });
  });
});
