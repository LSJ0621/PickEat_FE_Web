import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { OAuthLoadingScreen } from '@shared/components/OAuthLoadingScreen';

describe('OAuthLoadingScreen', () => {
  describe('카카오 로그인 렌더링 테스트', () => {
    it('카카오 로딩 화면이 렌더링된다', () => {
      renderWithProviders(<OAuthLoadingScreen provider="kakao" />);

      expect(screen.getByText('카카오 로그인 진행 중...')).toBeInTheDocument();
    });

    it('카카오 스피너가 렌더링된다', () => {
      renderWithProviders(<OAuthLoadingScreen provider="kakao" />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('카카오 색상이 적용된다', () => {
      renderWithProviders(<OAuthLoadingScreen provider="kakao" />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('border-yellow-500');
    });
  });

  describe('구글 로그인 렌더링 테스트', () => {
    it('구글 로딩 화면이 렌더링된다', () => {
      renderWithProviders(<OAuthLoadingScreen provider="google" />);

      expect(screen.getByText('구글 로그인 진행 중...')).toBeInTheDocument();
    });

    it('구글 스피너가 렌더링된다', () => {
      renderWithProviders(<OAuthLoadingScreen provider="google" />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('구글 색상이 적용된다', () => {
      renderWithProviders(<OAuthLoadingScreen provider="google" />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('border-blue-500');
    });
  });

  describe('스타일 테스트', () => {
    it('전체 화면 중앙 정렬이 적용된다', () => {
      const { container } = renderWithProviders(<OAuthLoadingScreen provider="kakao" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('items-center');
      expect(wrapper).toHaveClass('justify-center');
      expect(wrapper).toHaveClass('min-h-screen');
    });

    it('스피너가 회전 애니메이션을 가진다', () => {
      renderWithProviders(<OAuthLoadingScreen provider="kakao" />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('animate-spin');
    });

    it('스피너가 원형이다', () => {
      renderWithProviders(<OAuthLoadingScreen provider="kakao" />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('rounded-full');
    });

    it('스피너 크기가 올바르게 설정된다', () => {
      renderWithProviders(<OAuthLoadingScreen provider="kakao" />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('h-12');
      expect(spinner).toHaveClass('w-12');
    });
  });

  describe('Provider별 설정 테스트', () => {
    it('카카오는 노란색 테두리를 가진다', () => {
      renderWithProviders(<OAuthLoadingScreen provider="kakao" />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('border-yellow-500');
    });

    it('구글은 파란색 테두리를 가진다', () => {
      renderWithProviders(<OAuthLoadingScreen provider="google" />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('border-blue-500');
    });

    it('카카오와 구글의 텍스트가 다르다', () => {
      const { rerender } = renderWithProviders(<OAuthLoadingScreen provider="kakao" />);
      expect(screen.getByText('카카오 로그인 진행 중...')).toBeInTheDocument();

      rerender(<OAuthLoadingScreen provider="google" />);
      expect(screen.getByText('구글 로그인 진행 중...')).toBeInTheDocument();
    });
  });

  describe('텍스트 스타일 테스트', () => {
    it('로딩 텍스트가 적절한 크기와 스타일을 가진다', () => {
      renderWithProviders(<OAuthLoadingScreen provider="kakao" />);

      const text = screen.getByText('카카오 로그인 진행 중...');
      expect(text).toHaveClass('text-lg');
      expect(text).toHaveClass('font-medium');
    });
  });

  describe('레이아웃 테스트', () => {
    it('텍스트가 중앙 정렬된다', () => {
      const { container } = renderWithProviders(<OAuthLoadingScreen provider="kakao" />);

      const textContainer = container.querySelector('.text-center');
      expect(textContainer).toBeInTheDocument();
    });
  });
});
