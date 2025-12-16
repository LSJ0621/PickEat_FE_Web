/**
 * 버그 리포트 관련 API 서비스
 */

import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  BugReport,
  CreateBugReportRequest,
  CreateBugReportResponse,
  GetBugReportDetailResponse,
  GetBugReportListResponse,
} from '@/types/bug-report';

export const bugReportService = {
  /**
   * 버그 제보 생성
   * @param data - 버그 제보 데이터
   * @returns 생성된 버그 제보 ID
   */
  createBugReport: async (
    data: CreateBugReportRequest
  ): Promise<CreateBugReportResponse> => {
    const formData = new FormData();
    formData.append('category', data.category);
    formData.append('title', data.title);
    formData.append('description', data.description);

    // 이미지 파일 추가
    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await apiClient.post<CreateBugReportResponse>(
      ENDPOINTS.BUG_REPORT.CREATE,
      formData
      // FormData 전송 시 Content-Type 헤더를 명시하지 않음 (axios가 자동으로 boundary 포함하여 설정)
    );
    return response.data;
  },

  /**
   * 버그 제보 목록 조회 (관리자용)
   * @param params - 조회 파라미터
   * @returns 버그 제보 목록 및 페이지 정보
   */
  getBugReportList: async (params: {
    page?: number;
    limit?: number;
    status?: 'UNCONFIRMED' | 'CONFIRMED';
    date?: string;
  }): Promise<GetBugReportListResponse> => {
    const response = await apiClient.get<GetBugReportListResponse>(
      ENDPOINTS.ADMIN.BUG_REPORTS,
      { params }
    );
    return response.data;
  },

  /**
   * 버그 제보 상세 조회 (관리자용)
   * @param id - 버그 제보 ID
   * @returns 버그 제보 상세 정보
   */
  getBugReportDetail: async (
    id: number | string
  ): Promise<GetBugReportDetailResponse> => {
    const response = await apiClient.get<GetBugReportDetailResponse>(
      ENDPOINTS.ADMIN.BUG_REPORT_DETAIL(id)
    );
    return response.data;
  },

  /**
   * 버그 제보 상태 변경 (관리자용)
   * @param id - 버그 제보 ID
   * @param status - 변경할 상태
   * @returns 업데이트된 버그 제보
   */
  updateBugReportStatus: async (
    id: number | string,
    status: 'UNCONFIRMED' | 'CONFIRMED'
  ): Promise<BugReport> => {
    const response = await apiClient.patch<BugReport>(
      ENDPOINTS.ADMIN.BUG_REPORT_UPDATE_STATUS(id),
      { status }
    );
    return response.data;
  },
};

