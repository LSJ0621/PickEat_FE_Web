/**
 * User Place 관련 타입 정의
 */

export type UserPlaceStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface MenuItem {
  name: string;
  price: number;
}

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface DayHours {
  open: string;
  close: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface BusinessHours {
  isOpen247: boolean;
  is24Hours: boolean;
  days?: Partial<Record<DayOfWeek, DayHours>>;
}

export interface UserPlace {
  id: number;
  userId: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phoneNumber: string | null;
  category: string | null;
  description: string | null;
  menuItems: MenuItem[];
  photos: string[] | null;
  businessHours: BusinessHours | null;
  rejectionCount: number;
  lastRejectedAt: string | null;
  lastSubmittedAt: string | null;
  status: UserPlaceStatus;
  rejectionReason: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPlaceRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phoneNumber?: string;
  category?: string;
  description?: string;
  menuItems: MenuItem[];
  images?: File[];
  businessHours?: BusinessHours;
}

export interface UpdateUserPlaceRequest extends Partial<CreateUserPlaceRequest> {
  version: number;
  existingPhotos?: string[]; // URLs of photos to keep
  images?: File[]; // New files to upload
}

export interface CheckRegistrationRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface NearbyPlace {
  id: number;
  name: string;
  address: string;
  distance: number;
}

export interface CheckRegistrationResponse {
  canRegister: boolean;
  dailyRemaining: number;
  duplicateExists: boolean;
  nearbyPlaces: NearbyPlace[];
}

export interface UserPlaceListQuery {
  page?: number;
  limit?: number;
  status?: UserPlaceStatus;
  search?: string;
}

export interface PaginatedUserPlaceResponse {
  items: UserPlace[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const USER_PLACE_CATEGORIES = [
  'korean', 'chinese', 'japanese', 'western', 'bunsik',
  'cafe', 'bakery', 'dessert', 'bar', 'other',
] as const;

export type UserPlaceCategory = typeof USER_PLACE_CATEGORIES[number];
