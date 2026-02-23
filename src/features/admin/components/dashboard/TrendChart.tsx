/**
 * 추이 차트 컴포넌트
 * 사용자 가입 및 메뉴 추천 추이를 시각화
 */

import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card';
import type { TrendData, TrendPeriod } from '@features/admin/types';
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

interface TrendChartProps {
  data: TrendData;
  period: TrendPeriod;
  onPeriodChange: (period: TrendPeriod) => void;
}

export function TrendChart({ data, period, onPeriodChange }: TrendChartProps) {
  // 두 데이터를 병합하여 차트 데이터 생성
  const chartData = useMemo(
    () =>
      data.users.map((userData) => {
        const recommendationData = data.recommendations.find((rec) => rec.date === userData.date);
        return {
          date: userData.date,
          users: userData.count,
          recommendations: recommendationData?.count || 0,
        };
      }),
    [data.users, data.recommendations]
  );

  const periodOptions = useMemo<Array<{ value: TrendPeriod; label: string }>>(
    () => [
      { value: '7d', label: '7일' },
      { value: '30d', label: '30일' },
      { value: '90d', label: '90일' },
    ],
    []
  );

  return (
    <Card className="bg-bg-surface border-border-default">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-text-primary">활동 추이</CardTitle>
          <div className="flex gap-2">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onPeriodChange(option.value)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  period === option.value
                    ? 'bg-brand-primary text-text-inverse'
                    : 'bg-bg-secondary text-text-secondary hover:bg-bg-hover'
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
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
            <XAxis
              dataKey="date"
              stroke="#8A8A8A"
              tick={{ fill: '#8A8A8A' }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis stroke="#8A8A8A" tick={{ fill: '#8A8A8A' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E5E5',
                borderRadius: '0.375rem',
                color: '#1A1A1A',
              }}
              labelFormatter={(value) => {
                const date = new Date(value);
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              }}
            />
            <Legend
              wrapperStyle={{ color: '#4A4A4A' }}
              formatter={(value) => {
                if (value === 'users') return '신규 가입자';
                if (value === 'recommendations') return '메뉴 추천';
                return value;
              }}
            />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6' }}
            />
            <Line
              type="monotone"
              dataKey="recommendations"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
