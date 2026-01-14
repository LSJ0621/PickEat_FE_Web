/**
 * 관리자 설정 페이지
 * 탭 기반 UI로 관리자 계정, 웹훅, 시스템 설정 관리
 */

import { AdminPageBackground } from '@/components/features/admin/common/AdminPageBackground';
import { AdminTab, SystemTab, WebhookTab } from '@/components/features/admin/settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppSelector } from '@/store/hooks';
import { Settings, Bell, Users } from 'lucide-react';

export function AdminSettingsPage() {
  const user = useAppSelector((state) => state.auth?.user);
  const userRole = user?.role;
  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  // 현재 사용자 ID 추출 (User 타입에는 id가 없으므로 undefined)
  // TODO: Backend에서 /auth/me API가 user id를 반환하도록 수정하거나, JWT에 userId를 포함하도록 수정 필요
  const currentUserId = undefined;

  return (
    <div className="relative flex min-h-screen items-start justify-center bg-slate-950 px-4 pt-20 pb-10 text-white">
      <AdminPageBackground />

      <div className="relative z-10 w-full max-w-6xl">
        {/* 페이지 헤더 */}
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-white">시스템 설정</h1>
          <p className="text-slate-400">시스템 전반의 설정을 관리합니다.</p>
        </div>

        {/* 탭 기반 UI */}
        <Tabs defaultValue={isSuperAdmin ? 'admins' : 'webhook'} className="w-full">
          <TabsList className="w-full bg-slate-800 border border-slate-700 p-1">
            {isSuperAdmin && (
              <TabsTrigger
                value="admins"
                className="flex-1 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                관리자 계정
              </TabsTrigger>
            )}
            <TabsTrigger
              value="webhook"
              className="flex-1 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              <Bell className="h-4 w-4 mr-2" />
              Discord 웹훅
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="flex-1 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              시스템 설정
            </TabsTrigger>
          </TabsList>

          {isSuperAdmin && (
            <TabsContent value="admins" className="mt-6">
              <AdminTab currentUserId={currentUserId} />
            </TabsContent>
          )}

          <TabsContent value="webhook" className="mt-6">
            <WebhookTab />
          </TabsContent>

          <TabsContent value="system" className="mt-6">
            <SystemTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
