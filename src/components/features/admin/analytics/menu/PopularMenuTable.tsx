/**
 * 인기 메뉴 테이블 컴포넌트
 * 추천/선택 메뉴 순위 표시
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PopularMenuResponse, PopularMenuType } from '@/types/admin-analytics';
import { Award, TrendingUp } from 'lucide-react';

interface PopularMenuTableProps {
  data: PopularMenuResponse;
  menuType: PopularMenuType;
  slot: string;
  onMenuTypeChange: (type: PopularMenuType) => void;
  onSlotChange: (slot: string) => void;
}

const SLOT_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'breakfast', label: '아침' },
  { value: 'lunch', label: '점심' },
  { value: 'dinner', label: '저녁' },
  { value: 'etc', label: '기타' },
];

export function PopularMenuTable({ data, menuType, slot, onMenuTypeChange, onSlotChange }: PopularMenuTableProps) {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">인기 메뉴 순위</CardTitle>

          <div className="flex gap-3">
            {/* 메뉴 타입 토글 */}
            <div className="flex gap-2">
              <button
                onClick={() => onMenuTypeChange('recommended')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  menuType === 'recommended'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                추천
              </button>
              <button
                onClick={() => onMenuTypeChange('selected')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  menuType === 'selected'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                선택
              </button>
            </div>

            {/* 슬롯 필터 */}
            <select
              value={slot}
              onChange={(e) => onSlotChange(e.target.value)}
              className="px-3 py-1 bg-slate-700 text-slate-300 rounded-md text-sm border border-slate-600 focus:outline-none focus:border-blue-500"
            >
              {SLOT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.data.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>데이터가 없습니다</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">순위</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">메뉴명</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">건수</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">비율</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((item, index) => (
                  <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {index < 3 && <Award className="h-4 w-4 text-yellow-400" />}
                        <span className={`text-sm font-semibold ${index < 3 ? 'text-yellow-400' : 'text-slate-300'}`}>
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-white">{item.menu}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-medium text-white">{item.count.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm text-slate-300">
                        {item.rate !== undefined ? `${item.rate.toFixed(1)}%` : '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
