/**
 * 지역별 검색 분포 차트 컴포넌트
 * 지역별 검색 수를 BarChart로 표시
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SearchRegionsResponse } from '@/types/admin-analytics';
import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface SearchRegionChartProps {
  data: SearchRegionsResponse;
}

export function SearchRegionChart({ data }: SearchRegionChartProps) {
  const chartData = useMemo(
    () =>
      data.data.map((item) => ({
        region: item.region,
        count: item.count,
        percentage: item.percentage,
      })),
    [data.data]
  );

  // 상위 5개 지역 강조를 위한 색상
  const COLORS = useMemo(
    () => ['#3b82f6', '#f97316', '#10b981', '#f59e0b', '#8b5cf6'],
    []
  );

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">지역별 검색 분포</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="region"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                color: '#e2e8f0',
              }}
              formatter={(value, _name, props) => {
                if (typeof value !== 'number') return [String(value), '검색 수'];
                const percentage = props.payload.percentage;
                return [
                  `${value.toLocaleString()} (${percentage.toFixed(1)}%)`,
                  '검색 수',
                ];
              }}
            />
            <Legend
              wrapperStyle={{ color: '#9ca3af' }}
              formatter={() => '검색 수'}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          {data.data.slice(0, 6).map((item, index) => (
            <div
              key={item.region}
              className="flex items-center justify-between p-2 bg-slate-700/30 rounded"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-slate-300">{item.region}</span>
              </div>
              <span className="text-sm text-white font-semibold">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
