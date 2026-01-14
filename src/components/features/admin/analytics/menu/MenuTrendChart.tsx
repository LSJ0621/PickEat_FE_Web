/**
 * 메뉴 추천 추이 차트 컴포넌트
 * 기간별 메뉴 추천 수 추이를 LineChart로 시각화
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MenuTrendsResponse, TrendPeriod } from '@/types/admin-analytics';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
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

interface MenuTrendChartProps {
  data: MenuTrendsResponse;
  period: TrendPeriod;
  onPeriodChange: (period: TrendPeriod) => void;
}

export function MenuTrendChart({ data, period, onPeriodChange }: MenuTrendChartProps) {
  const periodOptions = useMemo<Array<{ value: TrendPeriod; label: string }>>(
    () => [
      { value: '7d', label: '7일' },
      { value: '30d', label: '30일' },
      { value: '90d', label: '90일' },
      { value: '1y', label: '1년' },
    ],
    []
  );

  const getChangeIcon = () => {
    if (data.summary.change > 0) return <ArrowUp className="h-4 w-4 text-green-400" />;
    if (data.summary.change < 0) return <ArrowDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-slate-400" />;
  };

  const getChangeColor = () => {
    if (data.summary.change > 0) return 'text-green-400';
    if (data.summary.change < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white">메뉴 추천 추이</CardTitle>
          <div className="flex gap-2">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onPeriodChange(option.value)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  period === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 통계 요약 */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-xs text-slate-400">총 추천 수</p>
            <p className="text-xl font-bold text-white mt-1">{data.summary.total.toLocaleString()}</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-xs text-slate-400">일평균</p>
            <p className="text-xl font-bold text-white mt-1">{data.summary.average.toFixed(1)}</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-xs text-slate-400">증감률</p>
            <div className="flex items-center gap-1 mt-1">
              {getChangeIcon()}
              <p className={`text-xl font-bold ${getChangeColor()}`}>
                {Math.abs(data.summary.change).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.data}>
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
              formatter={() => '추천 수'}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
