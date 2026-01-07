import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { Button } from '@/components/common/Button';

describe('Button', () => {
  describe('Rendering', () => {
    it('should render with children text', () => {
      renderWithProviders(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('should render with default variant (primary) and size (md)', () => {
      renderWithProviders(<Button>Default Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('from-orange-500', 'via-pink-500', 'to-fuchsia-600');
      expect(button).toHaveClass('px-6', 'py-2.5', 'text-base');
    });

    it('should apply custom className', () => {
      renderWithProviders(<Button className="custom-class">Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    it('should render primary variant with gradient background', () => {
      renderWithProviders(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gradient-to-r', 'from-orange-500', 'via-pink-500', 'to-fuchsia-600');
    });

    it('should render secondary variant with white background', () => {
      renderWithProviders(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-white/90', 'text-slate-900');
    });

    it('should render ghost variant with border and transparent background', () => {
      renderWithProviders(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border', 'border-white/20', 'bg-white/5');
    });
  });

  describe('Sizes', () => {
    it('should render small size with appropriate padding', () => {
      renderWithProviders(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-sm');
    });

    it('should render medium size with appropriate padding', () => {
      renderWithProviders(<Button size="md">Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-2.5', 'text-base');
    });

    it('should render large size with appropriate padding', () => {
      renderWithProviders(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-8', 'py-3', 'text-lg');
    });
  });

  describe('States', () => {
    it('should show loading text when isLoading is true', () => {
      renderWithProviders(<Button isLoading>Submit</Button>);
      expect(screen.getByText('로딩 중...')).toBeInTheDocument();
      expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    });

    it('should be disabled when isLoading is true', () => {
      renderWithProviders(<Button isLoading>Submit</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should be disabled when disabled prop is true', () => {
      renderWithProviders(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should have disabled styles when disabled', () => {
      renderWithProviders(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toHaveClass('disabled:opacity-60', 'disabled:cursor-not-allowed');
    });
  });

  describe('User Interactions', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      renderWithProviders(<Button onClick={handleClick}>Click me</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      renderWithProviders(<Button onClick={handleClick} disabled>Click me</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when loading', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      renderWithProviders(<Button onClick={handleClick} isLoading>Click me</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('HTML Attributes', () => {
    it('should accept and apply type attribute', () => {
      renderWithProviders(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('should accept and apply aria-label attribute', () => {
      renderWithProviders(<Button aria-label="Custom label">Button</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Custom label');
    });

    it('should accept and apply data attributes', () => {
      renderWithProviders(<Button data-testid="custom-button">Button</Button>);
      expect(screen.getByTestId('custom-button')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper focus-visible styles', () => {
      renderWithProviders(<Button>Accessible Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      renderWithProviders(<Button onClick={handleClick}>Press me</Button>);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalled();
    });
  });
});
