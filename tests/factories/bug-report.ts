import type {
  BugReport,
  BugReportCategory,
  BugReportStatus,
  CreateBugReportResponse,
  GetBugReportListResponse,
  GetBugReportDetailResponse,
} from '@features/bug-report/types';

/**
 * Creates a mock BugReport object with optional overrides
 */
export function createMockBugReport(overrides?: Partial<BugReport>): BugReport {
  return {
    id: 1,
    user: {
      id: 1,
    },
    category: 'BUG',
    title: '테스트 버그 리포트',
    description: '테스트 버그 설명입니다. 이 버그는 특정 상황에서 발생합니다.',
    images: null,
    status: 'UNCONFIRMED',
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
    ...overrides,
  };
}

/**
 * Creates a mock BugReport with images
 */
export function createMockBugReportWithImages(
  overrides?: Partial<BugReport>
): BugReport {
  return createMockBugReport({
    images: [
      'https://example.com/images/bug-screenshot-1.png',
      'https://example.com/images/bug-screenshot-2.png',
    ],
    ...overrides,
  });
}

/**
 * Creates multiple mock bug reports
 */
export function createMockBugReports(count: number): BugReport[] {
  const categories: BugReportCategory[] = ['BUG', 'INQUIRY', 'OTHER'];
  const statuses: BugReportStatus[] = ['UNCONFIRMED', 'CONFIRMED'];
  const titles = [
    '로그인 버튼이 작동하지 않습니다',
    '메뉴 추천이 느립니다',
    '주소 검색 오류',
    '앱이 갑자기 종료됩니다',
    '알림이 오지 않습니다',
  ];

  return Array.from({ length: count }, (_, index) =>
    createMockBugReport({
      id: index + 1,
      user: { id: (index % 5) + 1 },
      category: categories[index % categories.length],
      title: titles[index % titles.length],
      status: statuses[index % statuses.length],
      images: index % 3 === 0 ? [`https://example.com/images/bug-${index + 1}.png`] : null,
      createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
    })
  );
}

/**
 * Creates a mock CreateBugReportResponse
 */
export function createMockCreateBugReportResponse(
  overrides?: Partial<CreateBugReportResponse>
): CreateBugReportResponse {
  return {
    id: 1,
    ...overrides,
  };
}

/**
 * Creates a mock GetBugReportListResponse
 */
export function createMockBugReportListResponse(
  overrides?: Partial<GetBugReportListResponse>
): GetBugReportListResponse {
  const items = createMockBugReports(10);
  return {
    items,
    pageInfo: {
      page: 1,
      limit: 10,
      totalCount: 25,
      hasNext: true,
    },
    ...overrides,
  };
}

/**
 * Creates an empty bug report list response
 */
export function createEmptyBugReportListResponse(): GetBugReportListResponse {
  return {
    items: [],
    pageInfo: {
      page: 1,
      limit: 10,
      totalCount: 0,
      hasNext: false,
    },
  };
}

/**
 * Creates a mock GetBugReportDetailResponse
 */
export function createMockBugReportDetailResponse(
  overrides?: Partial<GetBugReportDetailResponse>
): GetBugReportDetailResponse {
  return {
    id: 1,
    user: {
      id: 1,
      nickname: 'TestUser',
      email: 'test@example.com',
    },
    category: 'BUG',
    title: '테스트 버그 리포트',
    description: '테스트 버그 설명입니다. 이 버그는 특정 상황에서 발생합니다.',
    images: null,
    status: 'UNCONFIRMED',
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
    ...overrides,
  };
}

/**
 * Creates a mock GetBugReportDetailResponse with images
 */
export function createMockBugReportDetailWithImages(
  overrides?: Partial<GetBugReportDetailResponse>
): GetBugReportDetailResponse {
  return createMockBugReportDetailResponse({
    images: [
      'https://example.com/images/bug-screenshot-1.png',
      'https://example.com/images/bug-screenshot-2.png',
      'https://example.com/images/bug-screenshot-3.png',
    ],
    ...overrides,
  });
}
