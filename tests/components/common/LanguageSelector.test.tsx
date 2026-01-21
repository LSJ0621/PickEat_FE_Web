/**
 * LanguageSelector Component Unit Tests
 *
 * Tests for LanguageSelector UI component including rendering,
 * button interactions, accessibility, and language switching.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import type { Language } from '@/types/common';

// Mock useLanguage hook
const mockChangeLanguage = vi.fn();
const mockUseLanguage = vi.fn(() => ({
  currentLanguage: 'ko' as Language,
  changeLanguage: mockChangeLanguage,
  isKorean: true,
  isEnglish: false,
}));

vi.mock('@/hooks/common/useLanguage', () => ({
  useLanguage: () => mockUseLanguage(),
}));

describe('LanguageSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLanguage.mockReturnValue({
      currentLanguage: 'ko' as Language,
      changeLanguage: mockChangeLanguage,
      isKorean: true,
      isEnglish: false,
    });
  });

  describe('Rendering', () => {
    it('should render KOR and ENG buttons', () => {
      render(<LanguageSelector />);

      const korButton = screen.getByText('KOR');
      const engButton = screen.getByText('ENG');

      expect(korButton).toBeInTheDocument();
      expect(engButton).toBeInTheDocument();
    });

    it('should apply active style to Korean button when language is "ko"', () => {
      mockUseLanguage.mockReturnValue({
        currentLanguage: 'ko' as Language,
        changeLanguage: mockChangeLanguage,
        isKorean: true,
        isEnglish: false,
      });

      render(<LanguageSelector />);

      const korButton = screen.getByText('KOR');
      const engButton = screen.getByText('ENG');

      // Check aria-pressed attribute to verify active state
      expect(korButton.closest('button')).toHaveAttribute('aria-pressed', 'true');
      expect(engButton.closest('button')).toHaveAttribute('aria-pressed', 'false');
    });

    it('should apply active style to English button when language is "en"', () => {
      mockUseLanguage.mockReturnValue({
        currentLanguage: 'en' as Language,
        changeLanguage: mockChangeLanguage,
        isKorean: false,
        isEnglish: true,
      });

      render(<LanguageSelector />);

      const korButton = screen.getByText('KOR');
      const engButton = screen.getByText('ENG');

      // Check aria-pressed attribute to verify active state
      expect(korButton.closest('button')).toHaveAttribute('aria-pressed', 'false');
      expect(engButton.closest('button')).toHaveAttribute('aria-pressed', 'true');
    });

    it('should render with custom className', () => {
      const customClass = 'custom-test-class';
      const { container } = render(<LanguageSelector className={customClass} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain(customClass);
    });
  });

  describe('Click Events', () => {
    it('should call changeLanguage with "ko" when KOR button is clicked', async () => {
      mockUseLanguage.mockReturnValue({
        currentLanguage: 'en' as Language,
        changeLanguage: mockChangeLanguage,
        isKorean: false,
        isEnglish: true,
      });

      render(<LanguageSelector />);

      const korButton = screen.getByText('KOR');
      fireEvent.click(korButton);

      await waitFor(() => {
        expect(mockChangeLanguage).toHaveBeenCalledWith('ko');
        expect(mockChangeLanguage).toHaveBeenCalledTimes(1);
      });
    });

    it('should call changeLanguage with "en" when ENG button is clicked', async () => {
      mockUseLanguage.mockReturnValue({
        currentLanguage: 'ko' as Language,
        changeLanguage: mockChangeLanguage,
        isKorean: true,
        isEnglish: false,
      });

      render(<LanguageSelector />);

      const engButton = screen.getByText('ENG');
      fireEvent.click(engButton);

      await waitFor(() => {
        expect(mockChangeLanguage).toHaveBeenCalledWith('en');
        expect(mockChangeLanguage).toHaveBeenCalledTimes(1);
      });
    });

    it('should not call changeLanguage when clicking already selected language (KOR)', async () => {
      mockUseLanguage.mockReturnValue({
        currentLanguage: 'ko' as Language,
        changeLanguage: mockChangeLanguage,
        isKorean: true,
        isEnglish: false,
      });

      render(<LanguageSelector />);

      const korButton = screen.getByText('KOR');
      fireEvent.click(korButton);

      // Should not call changeLanguage when clicking current language
      await waitFor(() => {
        expect(mockChangeLanguage).not.toHaveBeenCalled();
      });
    });

    it('should not call changeLanguage when clicking already selected language (ENG)', async () => {
      mockUseLanguage.mockReturnValue({
        currentLanguage: 'en' as Language,
        changeLanguage: mockChangeLanguage,
        isKorean: false,
        isEnglish: true,
      });

      render(<LanguageSelector />);

      const engButton = screen.getByText('ENG');
      fireEvent.click(engButton);

      // Should not call changeLanguage when clicking current language
      await waitFor(() => {
        expect(mockChangeLanguage).not.toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label attributes on buttons', () => {
      render(<LanguageSelector />);

      const korButton = screen.getByLabelText('Switch to Korean');
      const engButton = screen.getByLabelText('Switch to English');

      expect(korButton).toBeInTheDocument();
      expect(engButton).toBeInTheDocument();
    });

    it('should have aria-pressed="true" on active Korean button', () => {
      mockUseLanguage.mockReturnValue({
        currentLanguage: 'ko' as Language,
        changeLanguage: mockChangeLanguage,
        isKorean: true,
        isEnglish: false,
      });

      render(<LanguageSelector />);

      const korButton = screen.getByLabelText('Switch to Korean');
      const engButton = screen.getByLabelText('Switch to English');

      expect(korButton).toHaveAttribute('aria-pressed', 'true');
      expect(engButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('should have aria-pressed="true" on active English button', () => {
      mockUseLanguage.mockReturnValue({
        currentLanguage: 'en' as Language,
        changeLanguage: mockChangeLanguage,
        isKorean: false,
        isEnglish: true,
      });

      render(<LanguageSelector />);

      const korButton = screen.getByLabelText('Switch to Korean');
      const engButton = screen.getByLabelText('Switch to English');

      expect(korButton).toHaveAttribute('aria-pressed', 'false');
      expect(engButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should be keyboard accessible', () => {
      render(<LanguageSelector />);

      const korButton = screen.getByLabelText('Switch to Korean');
      const engButton = screen.getByLabelText('Switch to English');

      // Buttons should be focusable
      expect(korButton.tagName).toBe('BUTTON');
      expect(engButton.tagName).toBe('BUTTON');
    });
  });

  describe('Visual Feedback', () => {
    it('should render both buttons correctly', () => {
      mockUseLanguage.mockReturnValue({
        currentLanguage: 'ko' as Language,
        changeLanguage: mockChangeLanguage,
        isKorean: true,
        isEnglish: false,
      });

      render(<LanguageSelector />);

      const korButton = screen.getByLabelText('Switch to Korean');
      const engButton = screen.getByLabelText('Switch to English');

      // Both buttons should be present and clickable
      expect(korButton).toBeInTheDocument();
      expect(engButton).toBeInTheDocument();
    });

    it('should have proper button structure', () => {
      render(<LanguageSelector />);

      const korButton = screen.getByLabelText('Switch to Korean');
      const engButton = screen.getByLabelText('Switch to English');

      // Buttons should be actual button elements
      expect(korButton.tagName).toBe('BUTTON');
      expect(engButton.tagName).toBe('BUTTON');
    });

    it('should show different states for active and inactive buttons', () => {
      mockUseLanguage.mockReturnValue({
        currentLanguage: 'ko' as Language,
        changeLanguage: mockChangeLanguage,
        isKorean: true,
        isEnglish: false,
      });

      render(<LanguageSelector />);

      const korButton = screen.getByLabelText('Switch to Korean');
      const engButton = screen.getByLabelText('Switch to English');

      // Active button (KOR) should have aria-pressed="true"
      expect(korButton).toHaveAttribute('aria-pressed', 'true');
      // Inactive button (ENG) should have aria-pressed="false"
      expect(engButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid button clicks', async () => {
      mockUseLanguage.mockReturnValue({
        currentLanguage: 'ko' as Language,
        changeLanguage: mockChangeLanguage,
        isKorean: true,
        isEnglish: false,
      });

      render(<LanguageSelector />);

      const engButton = screen.getByText('ENG');

      // Rapidly click the button
      fireEvent.click(engButton);
      fireEvent.click(engButton);
      fireEvent.click(engButton);

      await waitFor(() => {
        // Should be called 3 times (component doesn't prevent rapid clicks)
        expect(mockChangeLanguage).toHaveBeenCalledTimes(3);
        expect(mockChangeLanguage).toHaveBeenCalledWith('en');
      });
    });

    it('should render correctly without className prop', () => {
      const { container } = render(<LanguageSelector />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toBeInTheDocument();
      expect(wrapper.className).toContain('inline-flex');
    });

    it('should handle language toggle back and forth', async () => {
      const { rerender } = render(<LanguageSelector />);

      // Click English
      const engButton = screen.getByText('ENG');
      fireEvent.click(engButton);

      await waitFor(() => {
        expect(mockChangeLanguage).toHaveBeenCalledWith('en');
      });

      // Update mock to English
      mockUseLanguage.mockReturnValue({
        currentLanguage: 'en' as Language,
        changeLanguage: mockChangeLanguage,
        isKorean: false,
        isEnglish: true,
      });

      rerender(<LanguageSelector />);

      // Click Korean
      const korButton = screen.getByText('KOR');
      fireEvent.click(korButton);

      await waitFor(() => {
        expect(mockChangeLanguage).toHaveBeenCalledWith('ko');
      });
    });
  });

  describe('Component Structure', () => {
    it('should have proper container structure', () => {
      const { container } = render(<LanguageSelector />);

      const wrapper = container.firstChild as HTMLElement;
      // Container should exist
      expect(wrapper).toBeInTheDocument();
      expect(wrapper.tagName).toBe('DIV');
    });

    it('should render buttons with correct structure', () => {
      render(<LanguageSelector />);

      const korButton = screen.getByLabelText('Switch to Korean');
      const engButton = screen.getByLabelText('Switch to English');

      expect(korButton.tagName).toBe('BUTTON');
      expect(engButton.tagName).toBe('BUTTON');

      // Buttons should contain text
      expect(korButton.textContent).toContain('KOR');
      expect(engButton.textContent).toContain('ENG');
    });
  });
});
