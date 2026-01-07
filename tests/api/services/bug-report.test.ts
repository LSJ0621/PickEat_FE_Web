/**
 * Bug Report Service Tests
 * 버그 리포트 관련 API 서비스 함수들을 테스트합니다.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { bugReportService } from '@/api/services/bug-report';
import { server } from '@tests/mocks/server';
import { http, HttpResponse } from 'msw';
import { ENDPOINTS } from '@/api/endpoints';
import type { CreateBugReportRequest } from '@/types/bug-report';
import { mockBugReports } from '@tests/mocks/handlers/bug-report';

const BASE_URL = 'http://localhost:3000';

describe('Bug Report Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('createBugReport', () => {
    it('should create bug report successfully without images', async () => {
      const data: CreateBugReportRequest = {
        category: 'BUG',
        title: '로그인 버튼 오류',
        description: '로그인 버튼을 클릭해도 반응이 없습니다.',
      };

      const result = await bugReportService.createBugReport(data);

      expect(result.id).toBeDefined();
    });

    it('should create bug report successfully with images', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      const data: CreateBugReportRequest = {
        category: 'INQUIRY',
        title: 'UI 깨짐 현상',
        description: 'UI가 깨져 보입니다.',
        images: [mockFile],
      };

      const result = await bugReportService.createBugReport(data);

      expect(result.id).toBeDefined();
    });

    it('should create bug report with multiple images', async () => {
      const mockFile1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' });
      const mockFile2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });

      const data: CreateBugReportRequest = {
        category: 'OTHER',
        title: '성능 이슈',
        description: '로딩이 너무 느립니다.',
        images: [mockFile1, mockFile2],
      };

      const result = await bugReportService.createBugReport(data);

      expect(result.id).toBeDefined();
    });

    it('should fail with missing title', async () => {
      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.BUG_REPORT.CREATE}`, () => {
          return HttpResponse.json(
            { message: '제목과 설명은 필수입니다.' },
            { status: 400 }
          );
        })
      );

      const data: CreateBugReportRequest = {
        category: 'BUG',
        title: '',
        description: '설명입니다.',
      };

      await expect(bugReportService.createBugReport(data)).rejects.toThrow();
    });

    it('should fail with missing description', async () => {
      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.BUG_REPORT.CREATE}`, () => {
          return HttpResponse.json(
            { message: '제목과 설명은 필수입니다.' },
            { status: 400 }
          );
        })
      );

      const data: CreateBugReportRequest = {
        category: 'BUG',
        title: '제목입니다.',
        description: '',
      };

      await expect(bugReportService.createBugReport(data)).rejects.toThrow();
    });

    it('should handle server error', async () => {
      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.BUG_REPORT.CREATE}`, () => {
          return HttpResponse.json(
            { message: '서버 오류가 발생했습니다.' },
            { status: 500 }
          );
        })
      );

      const data: CreateBugReportRequest = {
        category: 'BUG',
        title: '제목',
        description: '설명',
      };

      await expect(bugReportService.createBugReport(data)).rejects.toThrow();
    });
  });

  describe('getBugReportList', () => {
    it('should get bug report list with default parameters', async () => {
      const result = await bugReportService.getBugReportList({});

      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.pageInfo).toBeDefined();
      expect(result.pageInfo.page).toBeDefined();
      expect(result.pageInfo.limit).toBeDefined();
    });

    it('should get bug report list with pagination', async () => {
      const result = await bugReportService.getBugReportList({
        page: 1,
        limit: 10,
      });

      expect(result.items).toBeDefined();
      expect(result.pageInfo.page).toBe(1);
      expect(result.pageInfo.limit).toBe(10);
    });

    it('should filter bug reports by status', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.ADMIN.BUG_REPORTS}`, ({ request }) => {
          const url = new URL(request.url);
          const status = url.searchParams.get('status');

          const filtered = status
            ? mockBugReports.filter((r) => r.status === status)
            : mockBugReports;

          return HttpResponse.json({
            items: filtered,
            pageInfo: {
              page: 1,
              limit: 10,
              totalCount: filtered.length,
              hasNext: false,
            },
          });
        })
      );

      const result = await bugReportService.getBugReportList({
        status: 'PENDING',
      });

      expect(result.items).toBeDefined();
      expect(result.items.every((r) => r.status === 'PENDING')).toBe(true);
    });

    it('should filter bug reports by date', async () => {
      const result = await bugReportService.getBugReportList({
        date: '2024-01-15',
      });

      expect(result.items).toBeDefined();
      expect(result.pageInfo).toBeDefined();
    });

    it('should handle empty result', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.ADMIN.BUG_REPORTS}`, () => {
          return HttpResponse.json({
            items: [],
            pageInfo: {
              page: 1,
              limit: 10,
              totalCount: 0,
              hasNext: false,
            },
          });
        })
      );

      const result = await bugReportService.getBugReportList({
        status: 'PENDING',
      });

      expect(result.items).toEqual([]);
    });

    it('should handle unauthorized access', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.ADMIN.BUG_REPORTS}`, () => {
          return HttpResponse.json(
            { message: '권한이 없습니다.' },
            { status: 403 }
          );
        })
      );

      await expect(bugReportService.getBugReportList({})).rejects.toThrow();
    });
  });

  describe('getBugReportDetail', () => {
    it('should get bug report detail with numeric id', async () => {
      const result = await bugReportService.getBugReportDetail(1);

      expect(result.id).toBe(1);
      expect(result.title).toBeDefined();
      expect(result.description).toBeDefined();
      expect(result.category).toBeDefined();
      expect(result.status).toBeDefined();
    });

    it('should get bug report detail with string id', async () => {
      const result = await bugReportService.getBugReportDetail('1');

      expect(result).toBeDefined();
      expect(result.title).toBeDefined();
    });

    it('should fail with non-existent bug report id', async () => {
      server.use(
        http.get(`${BASE_URL}/admin/bug-reports/:id`, ({ params }) => {
          if (params.id === '999') {
            return HttpResponse.json(
              { message: '버그 리포트를 찾을 수 없습니다.' },
              { status: 404 }
            );
          }
          return HttpResponse.json(mockBugReports[0]);
        })
      );

      await expect(bugReportService.getBugReportDetail(999)).rejects.toThrow();
    });

    it('should handle unauthorized access', async () => {
      server.use(
        http.get(`${BASE_URL}/admin/bug-reports/:id`, () => {
          return HttpResponse.json(
            { message: '권한이 없습니다.' },
            { status: 403 }
          );
        })
      );

      await expect(bugReportService.getBugReportDetail(1)).rejects.toThrow();
    });
  });

  describe('updateBugReportStatus', () => {
    it('should update bug report status to PENDING', async () => {
      server.use(
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

          return HttpResponse.json({
            ...report,
            status: body.status,
            updatedAt: new Date().toISOString(),
          });
        })
      );

      const result = await bugReportService.updateBugReportStatus(1, 'PENDING');

      expect(result.id).toBe(1);
      expect(result.status).toBe('PENDING');
      expect(result.updatedAt).toBeDefined();
    });

    it('should update bug report status to IN_PROGRESS', async () => {
      server.use(
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

          return HttpResponse.json({
            ...report,
            status: body.status,
            updatedAt: new Date().toISOString(),
          });
        })
      );

      const result = await bugReportService.updateBugReportStatus(1, 'IN_PROGRESS');

      expect(result.id).toBe(1);
      expect(result.status).toBe('IN_PROGRESS');
    });

    it('should update status with string id', async () => {
      server.use(
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

          return HttpResponse.json({
            ...report,
            status: body.status,
            updatedAt: new Date().toISOString(),
          });
        })
      );

      const result = await bugReportService.updateBugReportStatus('2', 'IN_PROGRESS');

      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
    });

    it('should fail with non-existent bug report id', async () => {
      server.use(
        http.patch(`${BASE_URL}/admin/bug-reports/:id/status`, ({ params }) => {
          if (params.id === '999') {
            return HttpResponse.json(
              { message: '버그 리포트를 찾을 수 없습니다.' },
              { status: 404 }
            );
          }
          return HttpResponse.json({
            ...mockBugReports[0],
            status: 'RESOLVED',
          });
        })
      );

      await expect(
        bugReportService.updateBugReportStatus(999, 'RESOLVED')
      ).rejects.toThrow();
    });

    it('should fail with invalid status', async () => {
      server.use(
        http.patch(`${BASE_URL}/admin/bug-reports/:id/status`, async ({ request }) => {
          const body = (await request.json()) as { status: string };

          const validStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
          if (!validStatuses.includes(body.status)) {
            return HttpResponse.json(
              { message: '유효하지 않은 상태입니다.' },
              { status: 400 }
            );
          }

          return HttpResponse.json({
            ...mockBugReports[0],
            status: body.status,
          });
        })
      );

      // @ts-expect-error Testing invalid status
      await expect(
        bugReportService.updateBugReportStatus(1, 'INVALID_STATUS')
      ).rejects.toThrow();
    });

    it('should handle unauthorized access', async () => {
      server.use(
        http.patch(`${BASE_URL}/admin/bug-reports/:id/status`, () => {
          return HttpResponse.json(
            { message: '권한이 없습니다.' },
            { status: 403 }
          );
        })
      );

      await expect(
        bugReportService.updateBugReportStatus(1, 'PENDING')
      ).rejects.toThrow();
    });
  });
});
