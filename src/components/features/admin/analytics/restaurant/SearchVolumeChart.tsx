/**
 * 검색량 추이 차트 컴포넌트
 * 음식점 검색(places)과 블로그 검색(blogs)의 일별 추이를 LineChart로 표시
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SearchVolumeResponse, TrendPeriod } from '@/types/admin-analytics';
import { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface SearchVolumeChartProps {
  data: SearchVolumeResponse;
  period: TrendPeriod;
  onPeriodChange: (period: TrendPeriod) => void;
}

export function SearchVolumeChart({ data, period, onPeriodChange }: SearchVolumeChartProps) {
  // 두 데이터를 병합하여 차트 데이터 생성
  const chartData = useMemo(
    () =>
      data.places.map((placeData) => {
        const blogData = data.blogs.find((blog) => blog.date === placeData.date);
        return {
          date: placeData.date,
          places: placeData.count,
          blogs: blogData?.count || 0,
        };
      }),
    [data.places, data.blogs]
  );

  const periodOptions = useMemo<Array<{ value: TrendPeriod; label: string }>>(
    () => [
      { value: '7d', label: '7일' },
      { value: '30d', label: '30일' },
      { value: '90d', label: '90일' },
    ],
    []
  );

  // 증감률 계산 및 포맷팅
  const formatChangeRate = (rate: number): string => {
    const sign = rate > 0 ? '+' : '';
    return `${sign}${rate.toFixed(1)}%`;
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="text-lg font-semibold text-white mb-2">검색량 추이</CardTitle>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-slate-400">음식점 검색: </span>
                <span className="text-white font-semibold">
                  {data.summary.totalPlaceSearches.toLocaleString()}
                </span>
                <span
                  className={`ml-2 ${
                    data.summary.placeChangeRate > 0
                      ? 'text-green-400'
                      : data.summary.placeChangeRate < 0
                        ? 'text-red-400'
                        : 'text-slate-400'
                  }`}
                >
                  {formatChangeRate(data.summary.placeChangeRate)}
                </span>
              </div>
              <div>
                <span className="text-slate-400">블로그 검색: </span>
                <span className="text-white font-semibold">
                  {data.summary.totalBlogSearches.toLocaleString()}
                </span>
                <span
                  className={`ml-2 ${
                    data.summary.blogChangeRate > 0
                      ? 'text-green-400'
                      : data.summary.blogChangeRate < 0
                        ? 'text-red-400'
                        : 'text-slate-400'
                  }`}
                >
                  {formatChangeRate(data.summary.blogChangeRate)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onPeriodChange(option.value)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  period === option.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                color: '#e2e8f0',
              }}
              labelFormatter={(value) => {
                const date = new Date(value);
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              }}
            />
            <Legend
              wrapperStyle={{ color: '#9ca3af' }}
              formatter={(value) => {
                if (value === 'places') return '음식점 검색';
                if (value === 'blogs') return '블로그 검색';
                return value;
              }}
            />
            <Line
              type="monotone"
              dataKey="places"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6' }}
            />
            <Line
              type="monotone"
              dataKey="blogs"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ fill: '#f97316' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
