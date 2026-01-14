/**
 * 검색 키워드 테이블 컴포넌트
 * 인기 검색 키워드를 순위, 키워드, 검색 수, 트렌드와 함께 표시
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SearchKeywordsResponse } from '@/types/admin-analytics';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface SearchKeywordsTableProps {
  data: SearchKeywordsResponse;
}

export function SearchKeywordsTable({ data }: SearchKeywordsTableProps) {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-400" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      case 'stable':
        return 'text-slate-400';
    }
  };

  const formatChangeRate = (rate: number): string => {
    const sign = rate > 0 ? '+' : '';
    return `${sign}${rate.toFixed(1)}%`;
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">인기 검색 키워드</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">순위</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">키워드</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">검색 수</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-300">
                  트렌드
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">
                  증감률
                </th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((item, index) => (
                <tr
                  key={item.keyword}
                  className="border-b border-slate-700/50 hover:bg-slate-700/30 transition"
                >
                  <td className="py-3 px-4">
                    <span className="text-white font-semibold">{index + 1}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-white">{item.keyword}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-white">{item.count.toLocaleString()}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center">{getTrendIcon(item.trend)}</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={getTrendColor(item.trend)}>
                      {formatChangeRate(item.changeRate)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.data.length === 0 && (
          <div className="text-center py-8 text-slate-400">검색 키워드 데이터가 없습니다.</div>
        )}
      </CardContent>
    </Card>
  );
}
