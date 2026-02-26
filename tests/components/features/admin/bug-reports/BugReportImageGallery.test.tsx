import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { BugReportImageGallery } from '@features/admin/components/bug-reports/BugReportImageGallery';

describe('BugReportImageGallery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering with Images', () => {
    it('should render image gallery with single image', () => {
      const images = ['https://example.com/image1.png'];
      renderWithProviders(<BugReportImageGallery images={images} />);

      const img = screen.getByAltText('이미지 1');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', images[0]);
    });

    it('should render image gallery with multiple images', () => {
      const images = [
        'https://example.com/image1.png',
        'https://example.com/image2.png',
        'https://example.com/image3.png',
      ];
      renderWithProviders(<BugReportImageGallery images={images} />);

      const img = screen.getByAltText('이미지 1');
      expect(img).toBeInTheDocument();
    });

    it('should render gallery heading', () => {
      const images = ['https://example.com/image1.png'];
      renderWithProviders(<BugReportImageGallery images={images} />);

      expect(screen.getByText('이미지')).toBeInTheDocument();
    });

    it('should render image counter', () => {
      const images = [
        'https://example.com/image1.png',
        'https://example.com/image2.png',
        'https://example.com/image3.png',
      ];
      renderWithProviders(<BugReportImageGallery images={images} />);

      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('should start with first image', () => {
      const images = [
        'https://example.com/image1.png',
        'https://example.com/image2.png',
      ];
      renderWithProviders(<BugReportImageGallery images={images} />);

      const img = screen.getByAltText('이미지 1');
      expect(img).toHaveAttribute('src', images[0]);
    });
  });

  describe('Empty State', () => {
    it('should not render when images array is empty', () => {
      const { container } = renderWithProviders(<BugReportImageGallery images={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('should not render when images is null', () => {
      const { container } = renderWithProviders(<BugReportImageGallery images={null as unknown as string[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('should not render when images is undefined', () => {
      const { container } = renderWithProviders(<BugReportImageGallery images={undefined as unknown as string[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Navigation Controls', () => {
    it('should show navigation buttons for multiple images', () => {
      const images = [
        'https://example.com/image1.png',
        'https://example.com/image2.png',
      ];
      renderWithProviders(<BugReportImageGallery images={images} />);

      expect(screen.getByLabelText('이전 이미지')).toBeInTheDocument();
      expect(screen.getByLabelText('다음 이미지')).toBeInTheDocument();
    });

    it('should not show navigation buttons for single image', () => {
      const images = ['https://example.com/image1.png'];
      renderWithProviders(<BugReportImageGallery images={images} />);

      expect(screen.queryByLabelText('이전 이미지')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('다음 이미지')).not.toBeInTheDocument();
    });

    it('should navigate to next image when next button is clicked', async () => {
      const user = userEvent.setup();
      const images = [
        'https://example.com/image1.png',
        'https://example.com/image2.png',
      ];
      renderWithProviders(<BugReportImageGallery images={images} />);

      const nextButton = screen.getByLabelText('다음 이미지');
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('2 / 2')).toBeInTheDocument();
      });
    });

    it('should navigate to previous image when previous button is clicked', async () => {
      const user = userEvent.setup();
      const images = [
        'https://example.com/image1.png',
        'https://example.com/image2.png',
      ];
      renderWithProviders(<BugReportImageGallery images={images} />);

      // Go to second image first
      const nextButton = screen.getByLabelText('다음 이미지');
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('2 / 2')).toBeInTheDocument();
      });

      // Go back to first image
      const prevButton = screen.getByLabelText('이전 이미지');
      await user.click(prevButton);

      await waitFor(() => {
        expect(screen.getByText('1 / 2')).toBeInTheDocument();
      });
    });

    it('should loop to last image when previous is clicked on first image', async () => {
      const user = userEvent.setup();
      const images = [
        'https://example.com/image1.png',
        'https://example.com/image2.png',
        'https://example.com/image3.png',
      ];
      renderWithProviders(<BugReportImageGallery images={images} />);

      const prevButton = screen.getByLabelText('이전 이미지');
      await user.click(prevButton);

      await waitFor(() => {
        expect(screen.getByText('3 / 3')).toBeInTheDocument();
      });
    });

    it('should loop to first image when next is clicked on last image', async () => {
      const user = userEvent.setup();
      const images = [
        'https://example.com/image1.png',
        'https://example.com/image2.png',
      ];
      renderWithProviders(<BugReportImageGallery images={images} />);

      // Go to last image
      const nextButton = screen.getByLabelText('다음 이미지');
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('2 / 2')).toBeInTheDocument();
      });

      // Click next again to loop to first
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('1 / 2')).toBeInTheDocument();
      });
    });
  });

  describe('Thumbnail Navigation', () => {
    it('should render thumbnails for multiple images', () => {
      const images = [
        'https://example.com/image1.png',
        'https://example.com/image2.png',
        'https://example.com/image3.png',
      ];
      renderWithProviders(<BugReportImageGallery images={images} />);

      expect(screen.getByAltText('썸네일 1')).toBeInTheDocument();
      expect(screen.getByAltText('썸네일 2')).toBeInTheDocument();
      expect(screen.getByAltText('썸네일 3')).toBeInTheDocument();
    });

    it('should not render thumbnails for single image', () => {
      const images = ['https://example.com/image1.png'];
      renderWithProviders(<BugReportImageGallery images={images} />);

      expect(screen.queryByAltText('썸네일 1')).not.toBeInTheDocument();
    });

    it('should navigate to clicked thumbnail', async () => {
      const user = userEvent.setup();
      const images = [
        'https://example.com/image1.png',
        'https://example.com/image2.png',
        'https://example.com/image3.png',
      ];
      renderWithProviders(<BugReportImageGallery images={images} />);

      const thumbnail3 = screen.getByAltText('썸네일 3');
      await user.click(thumbnail3);

      await waitFor(() => {
        expect(screen.getByText('3 / 3')).toBeInTheDocument();
      });
    });

    it('should highlight active thumbnail', () => {
      const images = [
        'https://example.com/image1.png',
        'https://example.com/image2.png',
      ];
      renderWithProviders(<BugReportImageGallery images={images} />);

      const thumbnail1Button = screen.getByAltText('썸네일 1').closest('button');
      expect(thumbnail1Button).toHaveClass('border-brand-primary');
    });

    it('should change highlighted thumbnail when navigating', async () => {
      const user = userEvent.setup();
      const images = [
        'https://example.com/image1.png',
        'https://example.com/image2.png',
      ];
      renderWithProviders(<BugReportImageGallery images={images} />);

      const nextButton = screen.getByLabelText('다음 이미지');
      await user.click(nextButton);

      await waitFor(() => {
        const thumbnail2Button = screen.getByAltText('썸네일 2').closest('button');
        expect(thumbnail2Button).toHaveClass('border-brand-primary');
      });
    });
  });

  describe('Image Attributes', () => {
    it('should set lazy loading on images', () => {
      const images = ['https://example.com/image1.png'];
      renderWithProviders(<BugReportImageGallery images={images} />);

      const img = screen.getByAltText('이미지 1');
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('should set async decoding on images', () => {
      const images = ['https://example.com/image1.png'];
      renderWithProviders(<BugReportImageGallery images={images} />);

      const img = screen.getByAltText('이미지 1');
      expect(img).toHaveAttribute('decoding', 'async');
    });

    it('should set object-contain for main image', () => {
      const images = ['https://example.com/image1.png'];
      renderWithProviders(<BugReportImageGallery images={images} />);

      const img = screen.getByAltText('이미지 1');
      expect(img).toHaveClass('object-contain');
    });

    it('should set object-cover for thumbnails', () => {
      const images = [
        'https://example.com/image1.png',
        'https://example.com/image2.png',
      ];
      renderWithProviders(<BugReportImageGallery images={images} />);

      const thumbnail = screen.getByAltText('썸네일 1');
      expect(thumbnail).toHaveClass('object-cover');
    });
  });

  describe('Transition Effects', () => {
    it('should apply fade transition class', () => {
      const images = ['https://example.com/image1.png'];
      renderWithProviders(<BugReportImageGallery images={images} />);

      const img = screen.getByAltText('이미지 1');
      expect(img).toHaveClass('transition-opacity', 'duration-300');
    });
  });

  describe('Image Counter Display', () => {
    it('should show counter with single image', () => {
      const images = ['https://example.com/image1.png'];
      renderWithProviders(<BugReportImageGallery images={images} />);

      expect(screen.getByText('1 / 1')).toBeInTheDocument();
    });

    it('should show counter with multiple images', () => {
      const images = [
        'https://example.com/image1.png',
        'https://example.com/image2.png',
        'https://example.com/image3.png',
        'https://example.com/image4.png',
      ];
      renderWithProviders(<BugReportImageGallery images={images} />);

      expect(screen.getByText('1 / 4')).toBeInTheDocument();
    });

    it('should update counter when navigating', async () => {
      const user = userEvent.setup();
      const images = [
        'https://example.com/image1.png',
        'https://example.com/image2.png',
        'https://example.com/image3.png',
      ];
      renderWithProviders(<BugReportImageGallery images={images} />);

      expect(screen.getByText('1 / 3')).toBeInTheDocument();

      const nextButton = screen.getByLabelText('다음 이미지');
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('2 / 3')).toBeInTheDocument();
      });

      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('3 / 3')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      const images = [
        'https://example.com/image1.png',
        'https://example.com/image2.png',
      ];
      renderWithProviders(<BugReportImageGallery images={images} />);

      expect(screen.getByLabelText('이전 이미지')).toBeInTheDocument();
      expect(screen.getByLabelText('다음 이미지')).toBeInTheDocument();
    });

    it('should have descriptive alt text for images', () => {
      const images = [
        'https://example.com/image1.png',
        'https://example.com/image2.png',
      ];
      renderWithProviders(<BugReportImageGallery images={images} />);

      expect(screen.getByAltText('이미지 1')).toBeInTheDocument();
      expect(screen.getByAltText('썸네일 1')).toBeInTheDocument();
      expect(screen.getByAltText('썸네일 2')).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      const images = [
        'https://example.com/image1.png',
        'https://example.com/image2.png',
      ];
      renderWithProviders(<BugReportImageGallery images={images} />);

      const nextButton = screen.getByLabelText('다음 이미지');
      nextButton.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('2 / 2')).toBeInTheDocument();
      });
    });
  });

  describe('Layout and Styling', () => {
    it('should apply proper container styling', () => {
      const images = ['https://example.com/image1.png'];
      const { container } = renderWithProviders(<BugReportImageGallery images={images} />);

      const galleryContainer = container.querySelector('.space-y-3');
      expect(galleryContainer).toBeInTheDocument();
    });

    it('should render image in fixed height container', () => {
      const images = ['https://example.com/image1.png'];
      const { container } = renderWithProviders(<BugReportImageGallery images={images} />);

      const imageContainer = container.querySelector('.h-64');
      expect(imageContainer).toBeInTheDocument();
    });

    it('should apply rounded corners to image container', () => {
      const images = ['https://example.com/image1.png'];
      const { container } = renderWithProviders(<BugReportImageGallery images={images} />);

      const imageContainer = container.querySelector('.rounded-xl');
      expect(imageContainer).toBeInTheDocument();
    });
  });
});
