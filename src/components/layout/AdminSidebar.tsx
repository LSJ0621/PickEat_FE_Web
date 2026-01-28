/**
 * 관리자 사이드바 네비게이션
 * 관리자 페이지 좌측에 표시되는 메뉴
 */

import { LayoutDashboard, Users, Bug, Settings, Store } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { canAccessSettings } from '@/utils/role';

interface MenuItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const menuItems: MenuItem[] = [
  {
    label: '대시보드',
    path: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: '사용자 관리',
    path: '/admin/users',
    icon: Users,
  },
  {
    label: '유저 가게',
    path: '/admin/user-places',
    icon: Store,
  },
  {
    label: '버그 리포트',
    path: '/admin/bug-reports',
    icon: Bug,
  },
  {
    label: '설정',
    path: '/admin/settings',
    icon: Settings,
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const userRole = useAppSelector((state) => state.auth.user?.role);

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.path === '/admin/settings') {
      return canAccessSettings(userRole);
    }
    return true;
  });

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700 flex-shrink-0">
      {/* 로고/타이틀 */}
      <div className="h-16 flex items-center px-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white">PickEat Admin</h1>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="p-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/admin/dashboard' &&
                location.pathname.startsWith(item.path));

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
