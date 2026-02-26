import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '@features/admin/components/dashboard/StatCard';
import { Users, AlertTriangle, XCircle } from 'lucide-react';

describe('StatCard', () => {
  describe('Rendering', () => {
    it('should render with required props', () => {
      render(<StatCard title="Total Users" value={100} icon={Users} />);

      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should render string value', () => {
      render(<StatCard title="Status" value="Active" icon={Users} />);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render numeric value', () => {
      render(<StatCard title="Count" value={42} icon={Users} />);

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(
        <StatCard
          title="Total Users"
          value={100}
          icon={Users}
          description="+12% from last month"
        />
      );

      expect(screen.getByText('+12% from last month')).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      const { container } = render(<StatCard title="Total Users" value={100} icon={Users} />);

      const description = container.querySelector('.text-xs.text-text-tertiary');
      expect(description).not.toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should apply default variant styles by default', () => {
      const { container } = render(<StatCard title="Test" value={100} icon={Users} />);

      const card = container.querySelector('.bg-bg-surface');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('border-border-default');
    });

    it('should apply default variant when explicitly specified', () => {
      const { container } = render(
        <StatCard title="Test" value={100} icon={Users} variant="default" />
      );

      const card = container.querySelector('.bg-bg-surface');
      expect(card).toHaveClass('border-border-default');
    });

    it('should apply warning variant styles', () => {
      const { container } = render(
        <StatCard title="Warnings" value={5} icon={AlertTriangle} variant="warning" />
      );

      const card = container.querySelector('.bg-yellow-50');
      expect(card).toBeInTheDocument();
    });

    it('should apply danger variant styles', () => {
      const { container } = render(
        <StatCard title="Errors" value={3} icon={XCircle} variant="danger" />
      );

      const card = container.querySelector('.bg-red-50');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Icon Variants', () => {
    it('should apply default icon color for default variant', () => {
      const { container } = render(<StatCard title="Test" value={100} icon={Users} />);

      const icon = container.querySelector('.text-blue-500');
      expect(icon).toBeInTheDocument();
    });

    it('should apply warning icon color for warning variant', () => {
      const { container } = render(
        <StatCard title="Test" value={100} icon={AlertTriangle} variant="warning" />
      );

      const icon = container.querySelector('.text-yellow-500');
      expect(icon).toBeInTheDocument();
    });

    it('should apply danger icon color for danger variant', () => {
      const { container } = render(
        <StatCard title="Test" value={100} icon={XCircle} variant="danger" />
      );

      const icon = container.querySelector('.text-red-500');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have proper header layout', () => {
      const { container } = render(<StatCard title="Test" value={100} icon={Users} />);

      const header = container.querySelector('.flex.flex-row.items-center.justify-between');
      expect(header).toBeInTheDocument();
    });

    it('should render title in header', () => {
      render(<StatCard title="Total Users" value={100} icon={Users} />);

      const title = screen.getByText('Total Users');
      expect(title).toHaveClass('text-sm', 'font-medium', 'text-text-secondary');
    });

    it('should render value with proper styling', () => {
      render(<StatCard title="Test" value={100} icon={Users} />);

      const value = screen.getByText('100');
      expect(value).toHaveClass('text-2xl', 'font-bold', 'text-text-primary');
    });

    it('should render description with proper styling', () => {
      render(<StatCard title="Test" value={100} icon={Users} description="Description" />);

      const description = screen.getByText('Description');
      expect(description).toHaveClass('text-xs', 'text-text-tertiary', 'mt-1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero value', () => {
      render(<StatCard title="Count" value={0} icon={Users} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle negative value', () => {
      render(<StatCard title="Balance" value={-50} icon={Users} />);

      expect(screen.getByText('-50')).toBeInTheDocument();
    });

    it('should handle large numbers', () => {
      render(<StatCard title="Total" value={1000000} icon={Users} />);

      expect(screen.getByText('1000000')).toBeInTheDocument();
    });

    it('should handle empty string value', () => {
      render(<StatCard title="Status" value="" icon={Users} />);

      const card = screen.getByText('Status').closest('.bg-bg-surface');
      expect(card).toBeInTheDocument();
    });

    it('should handle long description', () => {
      const longDescription = 'This is a very long description that might wrap to multiple lines';
      render(<StatCard title="Test" value={100} icon={Users} description={longDescription} />);

      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });
  });
});
