/**
 * 최근 활동 타임라인 컴포넌트
 * 최근 가입자, 버그 리포트, 탈퇴자 정보를 탭 형태로 표시
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { RecentActivities } from '@/types/admin';
import { FileText, UserCheck, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecentActivityListProps {
  activities: RecentActivities;
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    }
    if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    }
    if (diffInDays < 7) {
      return `${diffInDays}일 전`;
    }
    return date.toLocaleDateString('ko-KR');
  };

  const handleBugReportClick = (id: number) => {
    navigate(`/admin/bug-reports/${id}`);
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">최근 활동</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-700">
            <TabsTrigger value="users" className="data-[state=active]:bg-slate-600">
              <UserCheck className="h-4 w-4 mr-2" />
              최근 가입자
            </TabsTrigger>
            <TabsTrigger value="bugReports" className="data-[state=active]:bg-slate-600">
              <FileText className="h-4 w-4 mr-2" />
              버그 리포트
            </TabsTrigger>
            <TabsTrigger value="deletedUsers" className="data-[state=active]:bg-slate-600">
              <UserX className="h-4 w-4 mr-2" />
              최근 탈퇴자
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4">
            <div className="space-y-3">
              {activities.recentUsers.length === 0 ? (
                <p className="text-center text-slate-400 py-8">최근 가입한 사용자가 없습니다.</p>
              ) : (
                activities.recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium">{user.email}</p>
                      {user.socialType && (
                        <p className="text-xs text-slate-400">
                          {user.socialType === 'kakao' ? '카카오' : '구글'} 계정
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-slate-400">{formatDate(user.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="bugReports" className="mt-4">
            <div className="space-y-3">
              {activities.recentBugReports.length === 0 ? (
                <p className="text-center text-slate-400 py-8">최근 버그 리포트가 없습니다.</p>
              ) : (
                activities.recentBugReports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => handleBugReportClick(report.id)}
                    className="w-full flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-left"
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium">{report.title}</p>
                      <p className="text-xs text-slate-400">
                        {report.category === 'BUG'
                          ? '버그 제보'
                          : report.category === 'INQUIRY'
                            ? '문의 사항'
                            : '기타'}
                      </p>
                    </div>
                    <span className="text-sm text-slate-400">{formatDate(report.createdAt)}</span>
                  </button>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="deletedUsers" className="mt-4">
            <div className="space-y-3">
              {activities.recentDeletedUsers.length === 0 ? (
                <p className="text-center text-slate-400 py-8">최근 탈퇴한 사용자가 없습니다.</p>
              ) : (
                activities.recentDeletedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium">{user.email}</p>
                    </div>
                    <span className="text-sm text-slate-400">{formatDate(user.deletedAt)}</span>
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
