/**
 * 버그 제보 E2E
 *
 * 시나리오 문서: docs/testing/scenarios/bug-report.md (Frontend E2E)
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect } from './fixtures/auth.fixture';
import { ROUTES } from './fixtures/test-data';
import { generateUniqueId } from './fixtures/test-helpers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SAMPLE_IMAGE = path.resolve(__dirname, '../tests/fixtures/sample.png');

test.describe('버그 제보', () => {
  test('Happy Path: 마이페이지 → 버그 제보 작성 및 제출', async ({ authedPage }) => {
    // 마이페이지 진입
    await authedPage.goto(ROUTES.MYPAGE);
    await expect(authedPage).toHaveURL(new RegExp(`${ROUTES.MYPAGE}$`));

    // 서포트 섹션의 "버그 제보" 클릭
    await authedPage.getByRole('button', { name: '버그 제보' }).click();
    await expect(authedPage).toHaveURL(new RegExp(`${ROUTES.BUG_REPORT}$`));

    // 페이지 제목 확인
    await expect(
      authedPage.getByRole('heading', { name: '버그 제보', exact: true })
    ).toBeVisible();

    // 카테고리 BUG 라디오 선택(기본 선택되어 있음) - 명시적으로 체크
    const bugRadio = authedPage.locator('input[type="radio"][value="BUG"]');
    await bugRadio.check();
    await expect(bugRadio).toBeChecked();

    // 제목 입력
    const uniqueTitle = `지도 마커 클릭 시 상세 미표시 ${generateUniqueId()}`.slice(0, 30);
    await authedPage.getByLabel('제목').fill(uniqueTitle);
    await expect(
      authedPage.getByText(`${uniqueTitle.length}/30`, { exact: true })
    ).toBeVisible();

    // 상세 내용 입력
    const description = '마커를 탭해도 팝업이 뜨지 않습니다.';
    await authedPage.getByLabel('상세 내용').fill(description);
    await expect(
      authedPage.getByText(`${description.length}/500`, { exact: true })
    ).toBeVisible();

    // 제출하기
    await authedPage.getByRole('button', { name: '제출하기' }).click();

    // 성공 토스트 (role=status)
    await expect(
      authedPage.getByRole('status').filter({ hasText: '버그 제보가 성공적으로 등록되었습니다.' }).first()
    ).toBeVisible({ timeout: 5000 });

    // 홈으로 리다이렉트
    await expect(authedPage).toHaveURL(new RegExp(`${ROUTES.HOME}$`), { timeout: 5000 });
  });

  test('Error Case 1: 필수 필드 유효성 검사', async ({ authedPage }) => {
    await authedPage.goto(ROUTES.BUG_REPORT);
    await expect(authedPage).toHaveURL(new RegExp(`${ROUTES.BUG_REPORT}$`));

    // 빈 폼 상태에서 제출
    await authedPage.getByRole('button', { name: '제출하기' }).click();

    // 제목/상세 에러 메시지 노출
    await expect(authedPage.getByText('제목을 입력해주세요.')).toBeVisible();
    await expect(authedPage.getByText('상세 내용을 입력해주세요.')).toBeVisible();

    // 페이지 이동 없음
    await expect(authedPage).toHaveURL(new RegExp(`${ROUTES.BUG_REPORT}$`));
  });

  test('Error Case 2: 이미지 첨부 + 서버 500', async ({ authedPage }) => {
    await authedPage.goto(ROUTES.BUG_REPORT);

    // 제목/상세 입력
    const uniqueTitle = `이미지 업로드 에러 ${generateUniqueId()}`.slice(0, 30);
    const description = '이미지를 첨부했을 때 서버 오류가 발생하는지 확인합니다.';
    await authedPage.getByLabel('제목').fill(uniqueTitle);
    await authedPage.getByLabel('상세 내용').fill(description);

    // BUG 카테고리 확인
    const bugRadio = authedPage.locator('input[type="radio"][value="BUG"]');
    await bugRadio.check();

    // 이미지 첨부 (숨겨진 파일 input)
    await authedPage.locator('input[type="file"]').setInputFiles(SAMPLE_IMAGE);

    // 업로드 미리보기(img alt="업로드 1") 표시 확인
    await expect(authedPage.getByAltText('업로드 1')).toBeVisible();

    // POST /bug-reports 500 응답 목킹
    await authedPage.route('**/bug-reports', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' }),
      })
    );

    // 제출
    await authedPage.getByRole('button', { name: '제출하기' }).click();

    // 에러 토스트 표시
    await expect(authedPage.getByRole('status').first()).toBeVisible({ timeout: 5000 });

    // 페이지 유지 + 폼 상태 보존
    await expect(authedPage).toHaveURL(new RegExp(`${ROUTES.BUG_REPORT}$`));
    await expect(bugRadio).toBeChecked();
    await expect(authedPage.getByLabel('제목')).toHaveValue(uniqueTitle);
    await expect(authedPage.getByLabel('상세 내용')).toHaveValue(description);
    await expect(authedPage.getByAltText('업로드 1')).toBeVisible();
  });
});
