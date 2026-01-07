import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { BugReportForm } from '@/components/features/bug-report/BugReportForm';
import { BUG_REPORT } from '@/utils/constants';
import type { CreateBugReportRequest } from '@/types/bug-report';

describe('BugReportForm', () => {
  const defaultData: CreateBugReportRequest = {
    category: 'BUG',
    title: '',
    description: '',
    images: [],
  };

  const defaultProps = {
    data: defaultData,
    errors: {},
    isSubmitting: false,
    onCategoryChange: vi.fn(),
    onTitleChange: vi.fn(),
    onDescriptionChange: vi.fn(),
    onImagesChange: vi.fn(),
    onRemoveImage: vi.fn(),
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all category radio buttons', () => {
      renderWithProviders(<BugReportForm {...defaultProps} />);

      expect(screen.getByLabelText(BUG_REPORT.CATEGORIES.BUG)).toBeInTheDocument();
      expect(screen.getByLabelText(BUG_REPORT.CATEGORIES.INQUIRY)).toBeInTheDocument();
      expect(screen.getByLabelText(BUG_REPORT.CATEGORIES.OTHER)).toBeInTheDocument();
    });

    it('should render title input field', () => {
      renderWithProviders(<BugReportForm {...defaultProps} />);

      expect(screen.getByLabelText('제목')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('버그 제보 제목을 입력해주세요')).toBeInTheDocument();
    });

    it('should render description textarea', () => {
      renderWithProviders(<BugReportForm {...defaultProps} />);

      expect(screen.getByLabelText('상세 내용')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('버그에 대한 상세한 설명을 입력해주세요')).toBeInTheDocument();
    });

    it('should render image uploader section', () => {
      renderWithProviders(<BugReportForm {...defaultProps} />);

      expect(screen.getByText('이미지 (선택)')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      renderWithProviders(<BugReportForm {...defaultProps} />);

      expect(screen.getByRole('button', { name: '제출하기' })).toBeInTheDocument();
    });
  });

  describe('Category Selection', () => {
    it('should call onCategoryChange when category is selected', async () => {
      const user = userEvent.setup();
      const onCategoryChange = vi.fn();

      renderWithProviders(
        <BugReportForm {...defaultProps} onCategoryChange={onCategoryChange} />
      );

      await user.click(screen.getByLabelText(BUG_REPORT.CATEGORIES.INQUIRY));
      expect(onCategoryChange).toHaveBeenCalledWith('INQUIRY');
    });

    it('should show selected category as checked', () => {
      renderWithProviders(
        <BugReportForm {...defaultProps} data={{ ...defaultData, category: 'INQUIRY' }} />
      );

      const inquiryRadio = screen.getByLabelText(BUG_REPORT.CATEGORIES.INQUIRY) as HTMLInputElement;
      expect(inquiryRadio.checked).toBe(true);
    });

    it('should display category error message', () => {
      const errors = { category: '카테고리를 선택해주세요' };
      renderWithProviders(<BugReportForm {...defaultProps} errors={errors} />);

      expect(screen.getByText('카테고리를 선택해주세요')).toBeInTheDocument();
    });
  });

  describe('Title Input', () => {
    it('should call onTitleChange when title input changes', async () => {
      const user = userEvent.setup();
      const onTitleChange = vi.fn();

      renderWithProviders(
        <BugReportForm {...defaultProps} onTitleChange={onTitleChange} />
      );

      const titleInput = screen.getByLabelText('제목');
      await user.type(titleInput, '버그 제목');

      expect(onTitleChange).toHaveBeenCalled();
      expect(onTitleChange).toHaveBeenCalledWith('버');
    });

    it('should display title value', () => {
      renderWithProviders(
        <BugReportForm {...defaultProps} data={{ ...defaultData, title: '버그 제목' }} />
      );

      expect(screen.getByLabelText('제목')).toHaveValue('버그 제목');
    });

    it('should have maxLength attribute', () => {
      renderWithProviders(<BugReportForm {...defaultProps} />);

      expect(screen.getByLabelText('제목')).toHaveAttribute(
        'maxLength',
        BUG_REPORT.TITLE_MAX_LENGTH.toString()
      );
    });

    it('should display character count', () => {
      renderWithProviders(
        <BugReportForm {...defaultProps} data={{ ...defaultData, title: '제목' }} />
      );

      expect(screen.getByText(`2/${BUG_REPORT.TITLE_MAX_LENGTH}`)).toBeInTheDocument();
    });

    it('should display title error message', () => {
      const errors = { title: '제목을 입력해주세요' };
      renderWithProviders(<BugReportForm {...defaultProps} errors={errors} />);

      expect(screen.getByText('제목을 입력해주세요')).toBeInTheDocument();
    });

    it('should show error message and character count together', () => {
      const errors = { title: '제목을 입력해주세요' };
      renderWithProviders(
        <BugReportForm
          {...defaultProps}
          data={{ ...defaultData, title: '제목' }}
          errors={errors}
        />
      );

      expect(screen.getByText('제목을 입력해주세요')).toBeInTheDocument();
      expect(screen.getByText(`2/${BUG_REPORT.TITLE_MAX_LENGTH}`)).toBeInTheDocument();
    });
  });

  describe('Description Textarea', () => {
    it('should call onDescriptionChange when description textarea changes', async () => {
      const user = userEvent.setup();
      const onDescriptionChange = vi.fn();

      renderWithProviders(
        <BugReportForm {...defaultProps} onDescriptionChange={onDescriptionChange} />
      );

      const descriptionTextarea = screen.getByLabelText('상세 내용');
      await user.type(descriptionTextarea, '버그 설명');

      expect(onDescriptionChange).toHaveBeenCalled();
      expect(onDescriptionChange).toHaveBeenCalledWith('버');
    });

    it('should display description value', () => {
      renderWithProviders(
        <BugReportForm {...defaultProps} data={{ ...defaultData, description: '버그 설명' }} />
      );

      expect(screen.getByLabelText('상세 내용')).toHaveValue('버그 설명');
    });

    it('should have maxLength attribute', () => {
      renderWithProviders(<BugReportForm {...defaultProps} />);

      expect(screen.getByLabelText('상세 내용')).toHaveAttribute(
        'maxLength',
        BUG_REPORT.DESCRIPTION_MAX_LENGTH.toString()
      );
    });

    it('should have 6 rows', () => {
      renderWithProviders(<BugReportForm {...defaultProps} />);

      expect(screen.getByLabelText('상세 내용')).toHaveAttribute('rows', '6');
    });

    it('should display character count', () => {
      renderWithProviders(
        <BugReportForm {...defaultProps} data={{ ...defaultData, description: '설명' }} />
      );

      expect(screen.getByText(`2/${BUG_REPORT.DESCRIPTION_MAX_LENGTH}`)).toBeInTheDocument();
    });

    it('should display description error message', () => {
      const errors = { description: '상세 내용을 입력해주세요' };
      renderWithProviders(<BugReportForm {...defaultProps} errors={errors} />);

      expect(screen.getByText('상세 내용을 입력해주세요')).toBeInTheDocument();
    });

    it('should show error message and character count together', () => {
      const errors = { description: '상세 내용을 입력해주세요' };
      renderWithProviders(
        <BugReportForm
          {...defaultProps}
          data={{ ...defaultData, description: '설명' }}
          errors={errors}
        />
      );

      expect(screen.getByText('상세 내용을 입력해주세요')).toBeInTheDocument();
      expect(screen.getByText(`2/${BUG_REPORT.DESCRIPTION_MAX_LENGTH}`)).toBeInTheDocument();
    });
  });

  describe('Image Uploader', () => {
    it('should render ImageUploader component', () => {
      renderWithProviders(<BugReportForm {...defaultProps} />);

      expect(screen.getByText('이미지를 드래그하거나 클릭하여 업로드')).toBeInTheDocument();
    });

    it('should display images error message', () => {
      const errors = { images: '이미지 업로드에 실패했습니다' };
      renderWithProviders(<BugReportForm {...defaultProps} errors={errors} />);

      expect(screen.getByText('이미지 업로드에 실패했습니다')).toBeInTheDocument();
    });
  });

  describe('Submit Button', () => {
    it('should call onSubmit when form is submitted', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      renderWithProviders(<BugReportForm {...defaultProps} onSubmit={onSubmit} />);

      await user.click(screen.getByRole('button', { name: '제출하기' }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('should prevent default form submission', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      const { container } = renderWithProviders(
        <BugReportForm {...defaultProps} onSubmit={onSubmit} />
      );

      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '제출하기' }));
      expect(onSubmit).toHaveBeenCalled();
    });

    it('should show loading text when isSubmitting is true', () => {
      renderWithProviders(<BugReportForm {...defaultProps} isSubmitting={true} />);

      expect(screen.getByText('제출 중...')).toBeInTheDocument();
      expect(screen.queryByText('제출하기')).not.toBeInTheDocument();
    });

    it('should be disabled when isSubmitting is true', () => {
      renderWithProviders(<BugReportForm {...defaultProps} isSubmitting={true} />);

      expect(screen.getByRole('button', { name: '제출 중...' })).toBeDisabled();
    });

    it('should have submit type', () => {
      renderWithProviders(<BugReportForm {...defaultProps} />);

      expect(screen.getByRole('button', { name: '제출하기' })).toHaveAttribute('type', 'submit');
    });

    it('should have proper styling', () => {
      renderWithProviders(<BugReportForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: '제출하기' });
      expect(submitButton).toHaveClass(
        'w-full',
        'rounded-lg',
        'bg-gradient-to-r',
        'from-pink-500',
        'to-rose-500'
      );
    });

    it('should have disabled styling when submitting', () => {
      renderWithProviders(<BugReportForm {...defaultProps} isSubmitting={true} />);

      const submitButton = screen.getByRole('button', { name: '제출 중...' });
      expect(submitButton).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });
  });

  describe('Form Layout', () => {
    it('should have proper spacing between form fields', () => {
      const { container } = renderWithProviders(<BugReportForm {...defaultProps} />);

      const form = container.querySelector('form');
      expect(form).toHaveClass('space-y-6');
    });

    it('should have sticky submit button', () => {
      const { container } = renderWithProviders(<BugReportForm {...defaultProps} />);

      const submitButtonContainer = container.querySelector('.sticky.bottom-0');
      expect(submitButtonContainer).toBeInTheDocument();
    });
  });

  describe('Input Styling', () => {
    it('should have proper title input styling', () => {
      renderWithProviders(<BugReportForm {...defaultProps} />);

      const titleInput = screen.getByLabelText('제목');
      expect(titleInput).toHaveClass(
        'w-full',
        'rounded-lg',
        'border',
        'border-slate-700',
        'bg-slate-900/50',
        'px-4',
        'py-3',
        'text-white'
      );
    });

    it('should have proper description textarea styling', () => {
      renderWithProviders(<BugReportForm {...defaultProps} />);

      const descriptionTextarea = screen.getByLabelText('상세 내용');
      expect(descriptionTextarea).toHaveClass(
        'w-full',
        'rounded-lg',
        'border',
        'border-slate-700',
        'bg-slate-900/50',
        'px-4',
        'py-3',
        'text-white'
      );
    });

    it('should have focus styles on inputs', () => {
      renderWithProviders(<BugReportForm {...defaultProps} />);

      const titleInput = screen.getByLabelText('제목');
      expect(titleInput).toHaveClass(
        'focus:border-pink-500',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-pink-500/20'
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper label associations', () => {
      renderWithProviders(<BugReportForm {...defaultProps} />);

      const titleInput = screen.getByLabelText('제목');
      const descriptionTextarea = screen.getByLabelText('상세 내용');

      expect(titleInput).toHaveAttribute('id', 'title');
      expect(descriptionTextarea).toHaveAttribute('id', 'description');
    });

    it('should have semantic form element', () => {
      const { container } = renderWithProviders(<BugReportForm {...defaultProps} />);

      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should have radio group for categories', () => {
      renderWithProviders(<BugReportForm {...defaultProps} />);

      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(3);
    });
  });

  describe('Complete Form Interaction', () => {
    it('should handle complete form filling and submission', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      const onCategoryChange = vi.fn();
      const onTitleChange = vi.fn();
      const onDescriptionChange = vi.fn();

      renderWithProviders(
        <BugReportForm
          {...defaultProps}
          onSubmit={onSubmit}
          onCategoryChange={onCategoryChange}
          onTitleChange={onTitleChange}
          onDescriptionChange={onDescriptionChange}
        />
      );

      // Select category - BUG is already selected by default
      // Just verify it's there
      expect(screen.getByLabelText(BUG_REPORT.CATEGORIES.BUG)).toBeInTheDocument();

      // Fill title
      const titleInput = screen.getByLabelText('제목');
      await user.type(titleInput, '버그');
      expect(onTitleChange).toHaveBeenCalled();

      // Fill description
      const descriptionInput = screen.getByLabelText('상세 내용');
      await user.type(descriptionInput, '버그');
      expect(onDescriptionChange).toHaveBeenCalled();

      // Submit
      await user.click(screen.getByRole('button', { name: '제출하기' }));
      expect(onSubmit).toHaveBeenCalled();
    });
  });
});
