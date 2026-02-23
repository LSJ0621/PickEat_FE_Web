// Public API for the agent feature
// Cross-domain consumers should import from here

// Page
export { AgentPage } from './pages/Agent';

// Types (re-exported for cross-domain use)
export type {
  MenuRecommendationItemData,
  MenuRecommendationResponse,
  PlaceRecommendationItem,
  PlaceRecommendationItemV2,
  PlaceRecommendationResponse,
  PlaceRecommendationV2Response,
  RestaurantBlog,
  RestaurantBlogsResponse,
  PlaceDetail,
  PlaceDetailResponse,
  PlaceLocation,
  PlaceReview,
  PlaceHistoryPlace,
  PlaceHistoryMeta,
  PlaceHistoryResponse,
  MenuSlot,
  MenuPayload,
  MenuSelection,
  CreateMenuSelectionRequest,
  CreateMenuSelectionResponse,
  GetMenuSelectionsResponse,
  UpdateMenuSelectionRequest,
  UpdateMenuSelectionResponse,
} from './types';

// API service (re-exported for cross-domain use)
export { menuService } from './api';
export type { StreamEvent, StreamEventType } from './api';

// Cross-domain components
export { AiPlaceRecommendations } from './components/restaurant/AiPlaceRecommendations';
export { PlaceDetailsModal } from './components/restaurant/PlaceDetailsModal';
export { PlaceSelectionModal } from './components/restaurant/PlaceSelectionModal';
export { MenuSelectionEditModal } from './components/menu/MenuSelectionEditModal';
