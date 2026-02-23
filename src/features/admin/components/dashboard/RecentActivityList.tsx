/**
 * 최근 활동 타임라인 컴포넌트
 * 최근 가입자, 버그 리포트, 탈퇴자 정보를 탭 형태로 표시
 */

import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/ui/tabs';
import type { RecentActivities } from '@features/admin/types';
import { formatDateRelative } from '@shared/utils/format';
import { FileText, UserCheck, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecentActivityListProps {
  activities: RecentActivities;
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  const navigate = useNavigate();

  const handleBugReportClick = (id: number) => {
    navigate(`/admin/bug-reports/${id}`);
  };

  return (
    <Card className="bg-bg-surface border-border-default">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-text-primary">최근 활동</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-bg-secondary">
            <TabsTrigger value="users" className="data-[state=active]:bg-bg-surface">
              <UserCheck className="h-4 w-4 mr-2" />
              최근 가입자
            </TabsTrigger>
            <TabsTrigger value="bugReports" className="data-[state=active]:bg-bg-surface">
              <FileText className="h-4 w-4 mr-2" />
              버그 리포트
            </TabsTrigger>
            <TabsTrigger value="deletedUsers" className="data-[state=active]:bg-bg-surface">
              <UserX className="h-4 w-4 mr-2" />
              최근 탈퇴자
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4">
            <div className="space-y-3">
              {activities.recentUsers.length === 0 ? (
                <p className="text-center text-text-tertiary py-8">최근 가입한 사용자가 없습니다.</p>
              ) : (
                activities.recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg hover:bg-bg-hover transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-text-primary font-medium">{user.email}</p>
                      {user.socialType && (
                        <p className="text-xs text-text-tertiary">
                          {user.socialType === 'kakao' ? '카카오' : '구글'} 계정
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-text-tertiary">{formatDateRelative(user.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="bugReports" className="mt-4">
            <div className="space-y-3">
              {activities.recentBugReports.length === 0 ? (
                <p className="text-center text-text-tertiary py-8">최근 버그 리포트가 없습니다.</p>
              ) : (
                activities.recentBugReports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => handleBugReportClick(report.id)}
                    className="w-full flex items-center justify-between p-3 bg-bg-secondary rounded-lg hover:bg-bg-hover transition-colors text-left"
                  >
                    <div className="flex-1">
                      <p className="text-text-primary font-medium">{report.title}</p>
                      <p className="text-xs text-text-tertiary">
                        {report.category === 'BUG'
                          ? '버그 제보'
                          : report.category === 'INQUIRY'
                            ? '문의 사항'
                            : '기타'}
                      </p>
                    </div>
                    <span className="text-sm text-text-tertiary">{formatDateRelative(report.createdAt)}</span>
                  </button>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="deletedUsers" className="mt-4">
            <div className="space-y-3">
              {activities.recentDeletedUsers.length === 0 ? (
                <p className="text-center text-text-tertiary py-8">최근 탈퇴한 사용자가 없습니다.</p>
              ) : (
                activities.recentDeletedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-text-primary font-medium">{user.email}</p>
                    </div>
                    <span className="text-sm text-text-tertiary">{formatDateRelative(user.deletedAt)}</span>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
