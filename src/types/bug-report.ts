/**
 * 버그 리포트 관련 타입 정의
 */

// 프론트엔드에서 제한하는 카테고리 (백엔드는 string으로만 검증)
export type BugReportCategory = 'BUG' | 'INQUIRY' | 'OTHER';
// 표시용 라벨: '버그 제보', '문의 사항', '기타'

export type BugReportStatus = 'UNCONFIRMED' | 'CONFIRMED';

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

export interface GetBugReportDetailResponse extends BugReport {
  // 현재 백엔드는 유저 정보를 포함하지 않음 (userId만 포함)
  // 향후 확장 가능성을 위해 optional로 정의
  user?: {
    id: number;
    nickname?: string;
    email: string;
  };
}

