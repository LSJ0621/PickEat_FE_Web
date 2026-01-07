import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { PageLoadingFallback } from '@/components/common/PageLoadingFallback';

describe('PageLoadingFallback', () => {
  describe('렌더링 테스트', () => {
    it('로딩 화면이 렌더링된다', () => {
      renderWithProviders(<PageLoadingFallback />);

      expect(screen.getByText('페이지를 불러오는 중...')).toBeInTheDocument();
    });

    it('스피너가 렌더링된다', () => {
      renderWithProviders(<PageLoadingFallback />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('스타일 테스트', () => {
    it('전체 화면 중앙 정렬이 적용된다', () => {
      const { container } = renderWithProviders(<PageLoadingFallback />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('min-h-screen');
      expect(wrapper).toHaveClass('items-center');
      expect(wrapper).toHaveClass('justify-center');
    });

    it('다크 배경이 적용된다', () => {
      const { container } = renderWithProviders(<PageLoadingFallback />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('bg-slate-950');
    });

    it('스피너가 회전 애니메이션을 가진다', () => {
      renderWithProviders(<PageLoadingFallback />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('animate-spin');
    });

    it('스피너가 원형이다', () => {
      renderWithProviders(<PageLoadingFallback />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('rounded-full');
    });

    it('스피너가 오렌지색 테두리를 가진다', () => {
      renderWithProviders(<PageLoadingFallback />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('border-orange-500');
    });

    it('스피너 상단이 투명하다', () => {
      renderWithProviders(<PageLoadingFallback />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('border-t-transparent');
    });

    it('스피너 크기가 올바르게 설정된다', () => {
      renderWithProviders(<PageLoadingFallback />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('h-12');
      expect(spinner).toHaveClass('w-12');
    });

    it('스피너가 4px 테두리를 가진다', () => {
      renderWithProviders(<PageLoadingFallback />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('border-4');
    });
  });

  describe('텍스트 스타일 테스트', () => {
    it('로딩 텍스트가 회색이다', () => {
      renderWithProviders(<PageLoadingFallback />);

      const text = screen.getByText('페이지를 불러오는 중...');
      expect(text).toHaveClass('text-gray-400');
    });

    it('로딩 텍스트가 스피너 아래에 위치한다', () => {
      renderWithProviders(<PageLoadingFallback />);

      const text = screen.getByText('페이지를 불러오는 중...');
      expect(text).toHaveClass('mt-4');
    });
  });

  describe('레이아웃 테스트', () => {
    it('텍스트가 중앙 정렬된다', () => {
      const { container } = renderWithProviders(<PageLoadingFallback />);

      const textContainer = container.querySelector('.text-center');
      expect(textContainer).toBeInTheDocument();
    });

    it('스피너가 자동 수평 중앙 정렬된다', () => {
      renderWithProviders(<PageLoadingFallback />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('mx-auto');
    });
  });
});
