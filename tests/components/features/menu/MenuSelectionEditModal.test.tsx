import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { MenuSelectionEditModal } from '@features/agent/components/menu/MenuSelectionEditModal';
import { server } from '@tests/mocks/server';
import { http, HttpResponse } from 'msw';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeHistoryResponse = (places: { menuName: string; placeId: string; name: string; reason: string }[]) =>
  HttpResponse.json({
    history: {
      id: 1,
      type: 'MENU',
      prompt: 'test',
      reason: 'test reason',
      recommendedAt: new Date().toISOString(),
      requestAddress: null,
      hasPlaceRecommendations: true,
    },
    places,
  });

const setupGetHandler = (
  places: { menuName: string; placeId: string; name: string; reason: string }[] = []
) =>
  http.get('*/menu/recommendations/1', () => makeHistoryResponse(places));

const setupPatchHandler = (onCall?: (body: unknown) => void) =>
  http.patch('*/menu/selections/:id', async ({ request }) => {
    const body = await request.json();
    onCall?.(body);
    return HttpResponse.json({ success: true });
  });

const THREE_MENUS = [
  { menuName: '김치찌개', placeId: 'place1', name: 'Restaurant 1', reason: 'test' },
  { menuName: '불고기', placeId: 'place2', name: 'Restaurant 2', reason: 'test' },
  { menuName: '비빔밥', placeId: 'place3', name: 'Restaurant 3', reason: 'test' },
];

const TWO_MENUS = THREE_MENUS.slice(0, 2);
const ONE_MENU = THREE_MENUS.slice(0, 1);

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('MenuSelectionEditModal', () => {
  const mockOnClose = vi.fn();
  const mockOnComplete = vi.fn();

  const defaultProps = {
    open: true,
    selectionId: 1,
    currentMenuNames: ['김치찌개', '불고기'],
    historyId: 1,
    slot: 'lunch' as const,
    onClose: mockOnClose,
    onComplete: mockOnComplete,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  describe('Rendering', () => {
    it('should render modal with heading when open', async () => {
      server.use(setupGetHandler(ONE_MENU));

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(document.body.querySelector('.fixed.inset-0')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '메뉴 수정하기' })).toBeInTheDocument();
      });
    });

    it('should not render when closed', () => {
      renderWithProviders(<MenuSelectionEditModal {...defaultProps} open={false} />);
      expect(document.body.querySelector('.fixed.inset-0')).not.toBeInTheDocument();
    });

    it('should show loading state while fetching menus', () => {
      server.use(
        http.get('*/menu/recommendations/1', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return makeHistoryResponse([]);
        })
      );

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Menu Loading
  // -------------------------------------------------------------------------

  describe('Menu Loading', () => {
    it('should load menus from history when historyId is provided', async () => {
      server.use(setupGetHandler(THREE_MENUS));

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('김치찌개')).toBeInTheDocument();
        expect(screen.getByText('불고기')).toBeInTheDocument();
        expect(screen.getByText('비빔밥')).toBeInTheDocument();
      });
    });

    it('should use current menu names when API fails', async () => {
      server.use(
        http.get('*/menu/recommendations/1', () => new HttpResponse(null, { status: 500 }))
      );

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('김치찌개')).toBeInTheDocument();
        expect(screen.getByText('불고기')).toBeInTheDocument();
      });
    });

    it('should pre-select current menus after load', async () => {
      server.use(setupGetHandler(TWO_MENUS));

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('김치찌개').closest('button')).toHaveClass('border-brand-primary/60');
        expect(screen.getByText('불고기').closest('button')).toHaveClass('border-brand-primary/60');
      });
    });
  });

  // -------------------------------------------------------------------------
  // Menu Selection
  // -------------------------------------------------------------------------

  describe('Menu Selection', () => {
    it('should toggle selection on click (select then deselect)', async () => {
      const user = userEvent.setup();
      server.use(setupGetHandler(THREE_MENUS));

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => expect(screen.getByText('비빔밥')).toBeInTheDocument());

      const menuButton = screen.getByText('비빔밥').closest('button')!;
      expect(menuButton).not.toHaveClass('border-brand-primary/60');

      // Select
      await user.click(menuButton);
      await waitFor(() => expect(menuButton).toHaveClass('border-brand-primary/60'));

      // Deselect
      await user.click(menuButton);
      await waitFor(() => expect(menuButton).not.toHaveClass('border-brand-primary/60'));
    });

    it('should show checkmark for pre-selected menus', async () => {
      server.use(setupGetHandler(ONE_MENU));

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} currentMenuNames={['김치찌개']} />);

      await waitFor(() => {
        expect(screen.getByTestId('selected-indicator')).toBeInTheDocument();
      });
    });

    it('should update selection count in save button', async () => {
      const user = userEvent.setup();
      server.use(setupGetHandler(TWO_MENUS));

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => expect(screen.getByText(/수정 완료 \(2개\)/)).toBeInTheDocument());

      await user.click(screen.getByText('김치찌개').closest('button')!);

      await waitFor(() => expect(screen.getByText(/수정 완료 \(1개\)/)).toBeInTheDocument());
    });
  });

  // -------------------------------------------------------------------------
  // Save Functionality
  // -------------------------------------------------------------------------

  describe('Save Functionality', () => {
    it('should call API with correct data and invoke onComplete + onClose after save', async () => {
      const user = userEvent.setup();
      let apiCalledWith: unknown = null;

      server.use(
        setupGetHandler(ONE_MENU),
        setupPatchHandler((body) => { apiCalledWith = body; })
      );

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => expect(screen.getByText('김치찌개')).toBeInTheDocument());

      await user.click(screen.getByText(/수정 완료/));

      await waitFor(() => {
        expect(apiCalledWith).toEqual({ lunch: ['김치찌개', '불고기'] });
        expect(mockOnComplete).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should disable save button when no menus selected', async () => {
      const user = userEvent.setup();
      server.use(setupGetHandler(TWO_MENUS));

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => expect(screen.getByText('김치찌개')).toBeInTheDocument());

      await user.click(screen.getByText('김치찌개').closest('button')!);
      await user.click(screen.getByText('불고기').closest('button')!);

      await waitFor(() => {
        expect(screen.getByText(/수정 완료 \(0개\)/)).toBeDisabled();
      });
    });
  });

  // -------------------------------------------------------------------------
  // Slot-Specific Request Data
  // -------------------------------------------------------------------------

  describe('Slot-Specific Request Data', () => {
    it.each([
      { slot: 'breakfast' as const, menuName: '시리얼', expected: { breakfast: ['시리얼'] } },
      { slot: 'lunch' as const,     menuName: '김치찌개', expected: { lunch: ['김치찌개'] } },
      { slot: 'dinner' as const,    menuName: '스테이크', expected: { dinner: ['스테이크'] } },
      { slot: 'etc' as const,       menuName: '커피',   expected: { etc: ['커피'] } },
    ])('should send $slot slot data when slot is $slot', async ({ slot, menuName, expected }) => {
      const user = userEvent.setup();
      let apiCalledWith: unknown = null;

      server.use(
        setupGetHandler([{ menuName, placeId: 'place1', name: 'Restaurant 1', reason: 'test' }]),
        setupPatchHandler((body) => { apiCalledWith = body; })
      );

      renderWithProviders(
        <MenuSelectionEditModal {...defaultProps} slot={slot} currentMenuNames={[menuName]} />
      );

      await waitFor(() => expect(screen.getByText(menuName)).toBeInTheDocument());

      await user.click(screen.getByText(/수정 완료/));

      await waitFor(() => expect(apiCalledWith).toEqual(expected));
    });
  });

  // -------------------------------------------------------------------------
  // Close Functionality
  // -------------------------------------------------------------------------

  describe('Close Functionality', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      server.use(setupGetHandler());

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument());

      await user.click(screen.getByRole('button', { name: '취소' }));

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Empty State
  // -------------------------------------------------------------------------

  describe('Empty State', () => {
    it('should show message when no menus available', async () => {
      server.use(setupGetHandler());

      renderWithProviders(<MenuSelectionEditModal {...defaultProps} currentMenuNames={[]} />);

      await waitFor(() => {
        expect(screen.getByText('선택 가능한 메뉴가 없습니다.')).toBeInTheDocument();
      });
    });
  });

  // -------------------------------------------------------------------------
  // State Reset After Save
  // -------------------------------------------------------------------------

  describe('Selected Menus Reset After Save', () => {
    it('should reset selectedMenus when modal is reopened after save', async () => {
      const user = userEvent.setup();

      server.use(setupGetHandler(TWO_MENUS), setupPatchHandler());

      const { rerender } = renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => expect(screen.getByText('김치찌개')).toBeInTheDocument());

      await user.click(screen.getByText(/수정 완료/));

      await waitFor(() => expect(mockOnClose).toHaveBeenCalled());

      // Reopen modal - selections should be reset
      rerender(<MenuSelectionEditModal {...defaultProps} open={false} />);
      rerender(<MenuSelectionEditModal {...defaultProps} open={true} />);

      await waitFor(() => {
        expect(screen.getByText(/수정 완료 \(2개\)/)).toBeInTheDocument();
      });
    });
  });

  // -------------------------------------------------------------------------
  // Animation Timer
  // -------------------------------------------------------------------------

  describe('Animation Timer', () => {
    it('should keep modal in DOM during 300ms close animation then remove it', async () => {
      server.use(setupGetHandler());

      const { rerender } = renderWithProviders(<MenuSelectionEditModal {...defaultProps} />);

      await waitFor(() => {
        expect(document.body.querySelector('.fixed.inset-0')).toBeInTheDocument();
      });

      rerender(<MenuSelectionEditModal {...defaultProps} open={false} />);

      // Modal must still be present immediately (animation in progress)
      expect(document.body.querySelector('.fixed.inset-0')).toBeInTheDocument();

      // Modal must be removed after animation completes (~300ms)
      await waitFor(
        () => {
          expect(document.body.querySelector('.fixed.inset-0')).not.toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });
  });
});
