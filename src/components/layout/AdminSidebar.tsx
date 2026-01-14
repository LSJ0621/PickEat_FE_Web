/**
 * 관리자 사이드바 네비게이션
 * 관리자 페이지 좌측에 표시되는 메뉴
 */

import { useState } from 'react';
import { LayoutDashboard, Users, Bug, BarChart2, Settings, ChevronDown, ChevronRight, Bell, Activity } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface MenuItem {
  label: string;
  path?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: Array<{ label: string; path: string }>;
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
    label: '버그 리포트',
    path: '/admin/bug-reports',
    icon: Bug,
  },
  {
    label: '통계',
    icon: BarChart2,
    children: [
      { label: '메뉴 추천', path: '/admin/analytics/menu' },
      { label: '음식점 검색', path: '/admin/analytics/restaurant' },
    ],
  },
  {
    label: '시스템 모니터링',
    path: '/admin/monitoring',
    icon: Activity,
  },
  {
    label: '공지사항 관리',
    path: '/admin/notifications',
    icon: Bell,
  },
  {
    label: '설정',
    path: '/admin/settings',
    icon: Settings,
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(
      menuItems
        .filter((item) =>
          item.children?.some((child) =>
            location.pathname === child.path || location.pathname.startsWith(child.path + '/')
          )
        )
        .map((item) => item.label)
    )
  );

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700 flex-shrink-0">
      {/* 로고/타이틀 */}
      <div className="h-16 flex items-center px-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white">PickEat Admin</h1>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedItems.has(item.label);

            if (item.children) {
              // 자식 메뉴가 있는 경우 (통계)
              const hasActiveChild = item.children.some(
                (child) =>
                  location.pathname === child.path || location.pathname.startsWith(child.path + '/')
              );

              return (
                <li key={item.label}>
                  <button
                    onClick={() => toggleExpanded(item.label)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition ${
                      hasActiveChild
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {isExpanded && (
                    <ul className="mt-2 ml-4 space-y-1">
                      {item.children.map((child) => {
                        const isActive =
                          location.pathname === child.path ||
                          location.pathname.startsWith(child.path + '/');

                        return (
                          <li key={child.path}>
                            <Link
                              to={child.path}
                              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                                isActive
                                  ? 'bg-orange-500 text-white'
                                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                              }`}
                            >
                              <span className="text-sm">{child.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            // 자식 메뉴가 없는 경우
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/admin/dashboard' &&
                item.path &&
                location.pathname.startsWith(item.path));

            return (
              <li key={item.path}>
                <Link
                  to={item.path!}
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
