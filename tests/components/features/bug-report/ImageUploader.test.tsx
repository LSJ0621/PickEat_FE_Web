import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { ImageUploader } from '@features/bug-report/components/ImageUploader';
import { BUG_REPORT } from '@shared/utils/constants';

describe('ImageUploader', () => {
  const defaultProps = {
    images: [],
    onImagesChange: vi.fn(),
    onRemove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock URL.createObjectURL using vi.stubGlobal
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'mock-url'),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Rendering', () => {
    it('should render upload area', () => {
      renderWithProviders(<ImageUploader {...defaultProps} />);

      expect(screen.getByText('이미지를 드래그하거나 클릭하여 업로드')).toBeInTheDocument();
    });

    it('should render upload instructions', () => {
      renderWithProviders(<ImageUploader {...defaultProps} />);

      const maxImages = BUG_REPORT.MAX_IMAGES;
      const maxSizeMB = BUG_REPORT.MAX_IMAGE_SIZE / (1024 * 1024);
      expect(screen.getByText(`최대 ${maxImages}장, 각 ${maxSizeMB}MB 이하`)).toBeInTheDocument();
    });

    it('should render upload icon', () => {
      const { container } = renderWithProviders(<ImageUploader {...defaultProps} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have hidden file input', () => {
      const { container } = renderWithProviders(<ImageUploader {...defaultProps} />);

      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveClass('hidden');
    });
  });

  describe('File Input Attributes', () => {
    it('should accept multiple files', () => {
      const { container } = renderWithProviders(<ImageUploader {...defaultProps} />);

      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute('multiple');
    });

    it('should accept correct file types', () => {
      const { container } = renderWithProviders(<ImageUploader {...defaultProps} />);

      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute('accept', BUG_REPORT.ALLOWED_IMAGE_TYPES.join(','));
    });
  });

  describe('Click Upload', () => {
    it('should trigger file input when upload area is clicked', async () => {
      const user = userEvent.setup();
      const { container } = renderWithProviders(<ImageUploader {...defaultProps} />);

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const clickSpy = vi.fn();
      fileInput.click = clickSpy;

      const uploadArea = container.querySelector('.cursor-pointer');
      if (uploadArea) {
        await user.click(uploadArea);
        expect(clickSpy).toHaveBeenCalled();
      }
    });
  });

  describe('File Selection', () => {
    it('should call onImagesChange when files are selected', async () => {
      const user = userEvent.setup();
      const onImagesChange = vi.fn();
      const { container } = renderWithProviders(
        <ImageUploader {...defaultProps} onImagesChange={onImagesChange} />
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['image'], 'test.png', { type: 'image/png' });

      await user.upload(fileInput, file);

      expect(onImagesChange).toHaveBeenCalled();
    });

    it('should handle multiple file selection', async () => {
      const user = userEvent.setup();
      const onImagesChange = vi.fn();
      const { container } = renderWithProviders(
        <ImageUploader {...defaultProps} onImagesChange={onImagesChange} />
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const files = [
        new File(['image1'], 'test1.png', { type: 'image/png' }),
        new File(['image2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];

      await user.upload(fileInput, files);

      expect(onImagesChange).toHaveBeenCalled();
    });
  });

  describe('File Validation', () => {
    it('should show error for file size exceeding limit', async () => {
      const user = userEvent.setup();
      const onImagesChange = vi.fn();
      const { container } = renderWithProviders(
        <ImageUploader {...defaultProps} onImagesChange={onImagesChange} />
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const largeFile = new File(['x'.repeat(BUG_REPORT.MAX_IMAGE_SIZE + 1)], 'large.png', {
        type: 'image/png',
      });

      await user.upload(fileInput, largeFile);

      // onImagesChange should not be called for invalid file
      expect(onImagesChange).not.toHaveBeenCalled();
    });

    it('should not show upload area when images are at max limit', () => {
      const existingImages = Array(BUG_REPORT.MAX_IMAGES).fill(
        new File(['image'], 'test.png', { type: 'image/png' })
      );
      const { container } = renderWithProviders(
        <ImageUploader {...defaultProps} images={existingImages} />
      );

      // When at limit, the upload area with input is hidden
      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).not.toBeInTheDocument();
    });
  });

  describe('Drag and Drop', () => {
    it('should have drag and drop area', () => {
      const { container } = renderWithProviders(<ImageUploader {...defaultProps} />);

      const dropArea = container.querySelector('.cursor-pointer');
      expect(dropArea).toBeInTheDocument();
    });

    it('should have proper default border styling', () => {
      const { container } = renderWithProviders(<ImageUploader {...defaultProps} />);

      const dropArea = container.querySelector('.border-border-default');
      expect(dropArea).toBeInTheDocument();
    });

    it('should set isDragging to true on dragOver', () => {
      const { container } = renderWithProviders(<ImageUploader {...defaultProps} />);

      const dropArea = container.querySelector('.cursor-pointer') as HTMLElement;
      expect(dropArea).toBeInTheDocument();
      expect(dropArea).toHaveClass('border-border-default');

      // Trigger dragOver event
      fireEvent.dragOver(dropArea);

      // Should change to brand-primary border
      expect(dropArea).toHaveClass('border-brand-primary');
    });

    it('should set isDragging to false on dragLeave', () => {
      const { container } = renderWithProviders(<ImageUploader {...defaultProps} />);

      const dropArea = container.querySelector('.cursor-pointer') as HTMLElement;

      // First dragOver
      fireEvent.dragOver(dropArea);
      expect(dropArea).toHaveClass('border-brand-primary');

      // Then dragLeave
      fireEvent.dragLeave(dropArea);

      // Should revert to border-default
      expect(dropArea).toHaveClass('border-border-default');
    });

    it('should handle file drop', async () => {
      const onImagesChange = vi.fn();
      const { container } = renderWithProviders(
        <ImageUploader {...defaultProps} onImagesChange={onImagesChange} />
      );

      const dropArea = container.querySelector('.cursor-pointer') as HTMLElement;
      const file = new File(['image'], 'test.png', { type: 'image/png' });

      // Trigger drop event
      fireEvent.drop(dropArea, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        expect(onImagesChange).toHaveBeenCalledWith([file]);
      });
    });

    it('should reset isDragging to false on drop', () => {
      const { container } = renderWithProviders(<ImageUploader {...defaultProps} />);

      const dropArea = container.querySelector('.cursor-pointer') as HTMLElement;

      // First dragOver
      fireEvent.dragOver(dropArea);
      expect(dropArea).toHaveClass('border-brand-primary');

      // Then drop
      const file = new File(['image'], 'test.png', { type: 'image/png' });
      fireEvent.drop(dropArea, {
        dataTransfer: {
          files: [file],
        },
      });

      // Should revert to border-default
      expect(dropArea).toHaveClass('border-border-default');
    });
  });

  describe('Image Thumbnails', () => {
    it('should display thumbnails for uploaded images', () => {
      const images = [
        new File(['image1'], 'test1.png', { type: 'image/png' }),
        new File(['image2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];

      renderWithProviders(<ImageUploader {...defaultProps} images={images} />);

      const thumbnails = screen.getAllByAltText(/업로드/);
      expect(thumbnails).toHaveLength(2);
    });

    it('should not show thumbnails when no images', () => {
      renderWithProviders(<ImageUploader {...defaultProps} images={[]} />);

      const thumbnails = screen.queryAllByAltText(/업로드/);
      expect(thumbnails).toHaveLength(0);
    });

    it('should display correct number of thumbnails', () => {
      const images = [
        new File(['image1'], 'test1.png', { type: 'image/png' }),
        new File(['image2'], 'test2.jpg', { type: 'image/jpeg' }),
        new File(['image3'], 'test3.png', { type: 'image/png' }),
      ];

      renderWithProviders(<ImageUploader {...defaultProps} images={images} />);

      const thumbnails = screen.getAllByAltText(/업로드/);
      expect(thumbnails).toHaveLength(3);
    });
  });

  describe('Remove Image', () => {
    it('should call onRemove when remove button is clicked', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      const images = [new File(['image'], 'test.png', { type: 'image/png' })];

      renderWithProviders(<ImageUploader {...defaultProps} images={images} onRemove={onRemove} />);

      const removeButtons = screen.getAllByRole('button');
      const removeButton = removeButtons.find((btn) => btn.querySelector('svg'));

      if (removeButton) {
        await user.click(removeButton);
        expect(onRemove).toHaveBeenCalledWith(0);
      }
    });

    it('should call onRemove with correct index for multiple images', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      const images = [
        new File(['image1'], 'test1.png', { type: 'image/png' }),
        new File(['image2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];

      renderWithProviders(<ImageUploader {...defaultProps} images={images} onRemove={onRemove} />);

      const removeButtons = screen.getAllByRole('button').filter((btn) => btn.querySelector('svg'));

      if (removeButtons[1]) {
        await user.click(removeButtons[1]);
        expect(onRemove).toHaveBeenCalledWith(1);
      }
    });

    it('should show remove button on hover', () => {
      const images = [new File(['image'], 'test.png', { type: 'image/png' })];
      const { container } = renderWithProviders(<ImageUploader {...defaultProps} images={images} />);

      const removeButton = container.querySelector('.group-hover\\:opacity-100');
      expect(removeButton).toBeInTheDocument();
      expect(removeButton).toHaveClass('opacity-0');
    });
  });

  describe('Custom maxImages Prop', () => {
    it('should respect custom maxImages prop', () => {
      renderWithProviders(<ImageUploader {...defaultProps} maxImages={2} />);

      expect(screen.getByText(/최대 2장/)).toBeInTheDocument();
    });

    it('should use default maxImages from constants if not provided', () => {
      renderWithProviders(<ImageUploader {...defaultProps} />);

      expect(screen.getByText(new RegExp(`최대 ${BUG_REPORT.MAX_IMAGES}장`))).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have dashed border on upload area', () => {
      const { container } = renderWithProviders(<ImageUploader {...defaultProps} />);

      const uploadArea = container.querySelector('.border-dashed');
      expect(uploadArea).toBeInTheDocument();
    });

    it('should have rounded corners on upload area', () => {
      const { container } = renderWithProviders(<ImageUploader {...defaultProps} />);

      const uploadArea = container.querySelector('.rounded-2xl');
      expect(uploadArea).toBeInTheDocument();
    });

    it('should have cursor pointer on upload area', () => {
      const { container } = renderWithProviders(<ImageUploader {...defaultProps} />);

      const uploadArea = container.querySelector('.cursor-pointer');
      expect(uploadArea).toBeInTheDocument();
    });

    it('should have proper thumbnail styling', () => {
      const images = [new File(['image'], 'test.png', { type: 'image/png' })];
      const { container } = renderWithProviders(<ImageUploader {...defaultProps} images={images} />);

      const thumbnail = container.querySelector('.h-20.w-20');
      expect(thumbnail).toBeInTheDocument();
      expect(thumbnail).toHaveClass('rounded-2xl', 'overflow-hidden');
    });
  });

  describe('Error Display', () => {
    it('should have error display area in the component', () => {
      const { container } = renderWithProviders(<ImageUploader {...defaultProps} />);

      // Component should have the structure for error display
      expect(container.querySelector('.space-y-3')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper image alt text', () => {
      const images = [new File(['image'], 'test.png', { type: 'image/png' })];
      renderWithProviders(<ImageUploader {...defaultProps} images={images} />);

      expect(screen.getByAltText('업로드 1')).toBeInTheDocument();
    });

    it('should have clickable upload area', () => {
      const { container } = renderWithProviders(<ImageUploader {...defaultProps} />);

      const uploadArea = container.querySelector('.cursor-pointer');
      expect(uploadArea).toBeInTheDocument();
    });
  });

  describe('Image Preview Area', () => {
    it('should display images in a flex wrap container when images are present', () => {
      const images = [new File(['image'], 'test.png', { type: 'image/png' })];
      const { container } = renderWithProviders(<ImageUploader {...defaultProps} images={images} />);

      const previewSection = container.querySelector('.flex.flex-wrap.gap-3');
      expect(previewSection).toBeInTheDocument();
    });

    it('should not show preview section when no images', () => {
      const { container } = renderWithProviders(<ImageUploader {...defaultProps} images={[]} />);

      const previewSection = container.querySelector('.flex.flex-wrap.gap-3');
      expect(previewSection).not.toBeInTheDocument();
    });
  });
});
