import { http, HttpResponse } from 'msw';
import { ENDPOINTS } from '@/api/endpoints';

const BASE_URL = 'http://localhost:3000';

export interface BugReport {
  id: number;
  title: string;
  description: string;
  category: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  images: string[];
  userEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBugReportResponse {
  id: number;
  message: string;
}

export interface GetBugReportsResponse {
  items: BugReport[];
  pageInfo: {
    page: number;
    limit: number;
    totalCount: number;
    hasNext: boolean;
  };
}

export const mockBugReports: BugReport[] = [
  {
    id: 1,
    title: '로그인 버튼이 작동하지 않습니다',
    description: '로그인 페이지에서 로그인 버튼을 클릭해도 아무 반응이 없습니다.',
    category: 'BUG',
    status: 'PENDING',
    priority: 'HIGH',
    images: ['https://example.com/bug1.jpg'],
    userEmail: 'user1@example.com',
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
  },
  {
    id: 2,
    title: '메뉴 추천이 느립니다',
    description: '메뉴 추천 요청 후 응답이 오기까지 10초 이상 걸립니다.',
    category: 'PERFORMANCE',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    images: [],
    userEmail: 'user2@example.com',
    createdAt: '2024-01-14T15:00:00.000Z',
    updatedAt: '2024-01-15T09:00:00.000Z',
  },
  {
    id: 3,
    title: '새로운 기능 제안: 즐겨찾기',
    description: '자주 가는 식당을 즐겨찾기에 추가하는 기능이 있으면 좋겠습니다.',
    category: 'FEATURE_REQUEST',
    status: 'RESOLVED',
    priority: 'LOW',
    images: [],
    userEmail: 'user3@example.com',
    createdAt: '2024-01-10T12:00:00.000Z',
    updatedAt: '2024-01-12T14:00:00.000Z',
  },
];

export const bugReportHandlers = [
  // Create bug report
  http.post(`${BASE_URL}${ENDPOINTS.BUG_REPORT.CREATE}`, async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get('title');
    const description = formData.get('description');

    if (!title || !description) {
      return HttpResponse.json(
        { message: '제목과 설명은 필수입니다.' },
        { status: 400 }
      );
    }

    const response: CreateBugReportResponse = {
      id: 4,
      message: '버그 리포트가 성공적으로 제출되었습니다.',
    };
    return HttpResponse.json(response, { status: 201 });
  }),

  // Get bug reports (admin)
  http.get(`${BASE_URL}${ENDPOINTS.ADMIN.BUG_REPORTS}`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') ?? '1');
    const limit = parseInt(url.searchParams.get('limit') ?? '10');
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');

    let filteredReports = mockBugReports;

    if (status) {
      filteredReports = filteredReports.filter((r) => r.status === status);
    }

    if (category) {
      filteredReports = filteredReports.filter((r) => r.category === category);
    }

    const response: GetBugReportsResponse = {
      items: filteredReports,
      pageInfo: {
        page,
        limit,
        totalCount: filteredReports.length,
        hasNext: false,
      },
    };
    return HttpResponse.json(response);
  }),

  // Get bug report detail (admin)
  http.get(`${BASE_URL}/admin/bug-reports/:id`, ({ params }) => {
    const { id } = params;
    const report = mockBugReports.find((r) => r.id === Number(id));

    if (!report) {
      return HttpResponse.json(
        { message: '버그 리포트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return HttpResponse.json(report);
  }),

  // Update bug report status (admin)
  http.patch(`${BASE_URL}/admin/bug-reports/:id/status`, async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as { status: string };
    const report = mockBugReports.find((r) => r.id === Number(id));

    if (!report) {
      return HttpResponse.json(
        { message: '버그 리포트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(body.status)) {
      return HttpResponse.json(
        { message: '유효하지 않은 상태입니다.' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      ...report,
      status: body.status,
      updatedAt: new Date().toISOString(),
    });
  }),
];
