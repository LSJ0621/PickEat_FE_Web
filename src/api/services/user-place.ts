/**
 * User Place 관련 API 서비스
 */

import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  CheckRegistrationRequest,
  CheckRegistrationResponse,
  CreateUserPlaceRequest,
  PaginatedUserPlaceResponse,
  UpdateUserPlaceRequest,
  UserPlace,
  UserPlaceListQuery,
} from '@/types/user-place';

export const userPlaceService = {
  // 등록 전 확인
  checkRegistration: async (
    data: CheckRegistrationRequest
  ): Promise<CheckRegistrationResponse> => {
    const response = await apiClient.post<CheckRegistrationResponse>(
      ENDPOINTS.USER_PLACE.CHECK,
      data
    );
    return response.data;
  },

  // 가게 등록
  createUserPlace: async (data: CreateUserPlaceRequest): Promise<UserPlace> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('address', data.address);
    formData.append('latitude', data.latitude.toString());
    formData.append('longitude', data.longitude.toString());

    if (data.phoneNumber) {
      formData.append('phoneNumber', data.phoneNumber);
    }
    if (data.category) {
      formData.append('category', data.category);
    }
    if (data.description) {
      formData.append('description', data.description);
    }
    if (data.openingHours) {
      formData.append('openingHours', data.openingHours);
    }

    // menuTypes 배열 추가
    data.menuTypes.forEach((menuType) => {
      formData.append('menuTypes', menuType);
    });

    // 이미지 파일 추가
    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await apiClient.post<UserPlace>(
      ENDPOINTS.USER_PLACE.CREATE,
      formData
    );
    return response.data;
  },

  // 가게 목록 조회
  getUserPlaces: async (
    query: UserPlaceListQuery = {}
  ): Promise<PaginatedUserPlaceResponse> => {
    const params: Record<string, string | number> = {};

    if (query.page !== undefined) {
      params.page = query.page;
    }
    if (query.limit !== undefined) {
      params.limit = query.limit;
    }
    if (query.status) {
      params.status = query.status;
    }
    if (query.search) {
      params.search = query.search;
    }

    const response = await apiClient.get<PaginatedUserPlaceResponse>(
      ENDPOINTS.USER_PLACE.LIST,
      { params: Object.keys(params).length > 0 ? params : undefined }
    );
    return response.data;
  },

  // 가게 상세 조회
  getUserPlace: async (id: number): Promise<UserPlace> => {
    const response = await apiClient.get<UserPlace>(
      ENDPOINTS.USER_PLACE.DETAIL(id)
    );
    return response.data;
  },

  // 가게 수정
  updateUserPlace: async (
    id: number,
    data: UpdateUserPlaceRequest
  ): Promise<UserPlace> => {
    const formData = new FormData();
    formData.append('version', data.version.toString());

    if (data.name) {
      formData.append('name', data.name);
    }
    if (data.address) {
      formData.append('address', data.address);
    }
    if (data.latitude !== undefined) {
      formData.append('latitude', data.latitude.toString());
    }
    if (data.longitude !== undefined) {
      formData.append('longitude', data.longitude.toString());
    }
    if (data.phoneNumber) {
      formData.append('phoneNumber', data.phoneNumber);
    }
    if (data.category) {
      formData.append('category', data.category);
    }
    if (data.description) {
      formData.append('description', data.description);
    }
    if (data.openingHours) {
      formData.append('openingHours', data.openingHours);
    }

    // menuTypes 배열 추가
    if (data.menuTypes) {
      data.menuTypes.forEach((menuType) => {
        formData.append('menuTypes', menuType);
      });
    }

    // 유지할 기존 사진 URL
    if (data.existingPhotos) {
      data.existingPhotos.forEach((url) => {
        formData.append('existingPhotos', url);
      });
    }

    // 새로 업로드할 이미지 파일
    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await apiClient.patch<UserPlace>(
      ENDPOINTS.USER_PLACE.UPDATE(id),
      formData
    );
    return response.data;
  },

  // 가게 삭제
  deleteUserPlace: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.USER_PLACE.DELETE(id));
  },
};
