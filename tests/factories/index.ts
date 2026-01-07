// User factories
export {
  createMockUser,
  createMockLoginResponse,
  createMockAddress,
  createMockAddresses,
  createMockPreferences,
  createMockRecommendationHistory,
  createMockRecommendationHistories,
  createAuthenticatedState,
  createUnauthenticatedState,
} from './user';

// Menu factories
export {
  createMockRestaurant,
  createMockMenuRecommendation,
  createMockPlaceRecommendationItem,
  createMockPlaceRecommendations,
  createMockPlaceReview,
  createMockPlaceDetail,
  createMockPlaceDetailResponse,
  createMockPlaceHistoryPlace,
  createMockPlaceHistory,
  createMockRestaurantBlog,
  createMockRestaurantBlogs,
  createMockMenuPayload,
  createMockMenuSelection,
  createMockMenuSelections,
  createAgentStateWithMenu,
  createAgentStateWithRestaurants,
} from './menu';

// Address factories
export {
  createMockAddressSearchResult,
  createMockAddressSearchResponse,
  createMockSelectedAddress,
  createMockUserAddress,
  createMockUserAddresses,
  createEmptyAddressSearchResponse,
  addressSearchResultToSelected,
  userAddressToCoordinates,
} from './address';

// Bug report factories
export {
  createMockBugReport,
  createMockBugReportWithImages,
  createMockBugReports,
  createMockCreateBugReportResponse,
  createMockBugReportListResponse,
  createEmptyBugReportListResponse,
  createMockBugReportDetailResponse,
  createMockBugReportDetailWithImages,
} from './bug-report';

// Agent factories
export {
  createMockAgentState,
  createMockRecommendationGroup,
  createAgentStateWithMenuRecommendations,
  createAgentStateWithSelectedMenu,
  createAgentStateWithAiLoading,
  createAgentStateWithAiRecommendations,
  createAgentStateSearching,
  createAgentStateWithRestaurantList,
  createAgentStateWithSelectedPlace,
  createEmptyAgentState,
  defaultAgentState,
} from './agent';
export type { AgentState, MenuPlaceRecommendationGroup } from './agent';

// Auth factories
export { createMockEmailVerification } from './auth';
