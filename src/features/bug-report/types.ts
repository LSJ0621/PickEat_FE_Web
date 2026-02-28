/**
 * 버그 리포트 관련 타입 정의
 */

// 프론트엔드에서 제한하는 카테고리 (백엔드는 string으로만 검증)
export type BugReportCategory = 'BUG' | 'INQUIRY' | 'OTHER';
// 표시용 라벨: '버그 제보', '문의 사항', '기타'

export type BugReportStatus = 'UNCONFIRMED' | 'CONFIRMED' | 'FIXED';

export interface BugReport {
  id: number;
  user: {
    id: number;
  };
  category: BugReportCategory;
  title: string;
  description: string;
  /**
   * S3에 저장된 이미지 URL 리스트
   */
  images: string[] | null;
  status: BugReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBugReportRequest {
  category: BugReportCategory;
  title: string; // 최대 30자
  description: string; // 최대 500자
  images?: File[]; // 최대 5장
}

export interface CreateBugReportResponse {
  id: number;
}

export interface GetBugReportListResponse {
  items: BugReport[];
  pageInfo: {
    page: number;
    limit: number;
    totalCount: number;
    hasNext: boolean;
  };
}

export interface GetBugReportDetailResponse {
  id: number;
  user?: {
    id: number;
    nickname?: string;
    email: string;
  };
  category: BugReportCategory;
  title: string;
  description: string;
  images: string[] | null;
  status: BugReportStatus;
  createdAt: string;
  updatedAt: string;
}

// 상태 이력
export interface BugReportStatusHistory {
  id: string;
  previousStatus: string;
  status: string;
  changedAt: string;
  changedBy: {
    id: number;
    email: string;
  };
}

// 상세 응답 (확장)
export interface AdminBugReportDetail {
  id: number;
  category: string;
  title: string;
  description: string;
  images: string[] | null;
  status: BugReportStatus;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    email: string;
    name: string | null;
    createdAt: string;
  };
  statusHistory: BugReportStatusHistory[];
}

// 통계 타입
export interface BugReportStatistics {
  byStatus: {
    UNCONFIRMED: number;
    CONFIRMED: number;
    FIXED: number;
  };
  byCategory: {
    BUG: number;
    INQUIRY: number;
    OTHER: number;
  };
  processingTime: {
    averageHours: number;
    pendingAverageHours: number;
  };
}
