/**
 * 시간대 비율 파이차트 컴포넌트
 * 아침/점심/저녁/기타 메뉴 추천 비율 시각화
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SlotAnalyticsResponse } from '@/types/admin-analytics';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface SlotPieChartProps {
  data: SlotAnalyticsResponse;
}

const SLOT_LABELS: Record<string, string> = {
  breakfast: '아침',
  lunch: '점심',
  dinner: '저녁',
  etc: '기타',
};

const SLOT_COLORS: Record<string, string> = {
  breakfast: '#60a5fa', // blue-400
  lunch: '#34d399', // green-400
  dinner: '#f59e0b', // amber-500
  etc: '#a78bfa', // purple-400
};

export function SlotPieChart({ data }: SlotPieChartProps) {
  // 데이터를 차트용으로 변환
  const chartData = Object.entries(data.data).map(([key, value]) => ({
    name: SLOT_LABELS[key] || key,
    value,
    percentage: (value / Object.values(data.data).reduce((a, b) => a + b, 0)) * 100,
  }));

  // 총합 계산
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">시간대별 메뉴 비율</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* 파이차트 */}
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${((entry.percent || 0) * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={SLOT_COLORS[Object.keys(SLOT_LABELS).find(k => SLOT_LABELS[k] === entry.name) || '']} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.375rem',
                    color: '#e2e8f0',
                  }}
                  formatter={(value: number | undefined) => [value?.toLocaleString() || '0', '건수']}
                />
                <Legend
                  wrapperStyle={{ color: '#9ca3af' }}
                  formatter={(value) => value}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 통계 정보 */}
          <div className="flex-1 space-y-3">
            <div className="bg-slate-700/50 rounded-lg p-3">
              <p className="text-xs text-slate-400">총 추천 수</p>
              <p className="text-2xl font-bold text-white mt-1">{total.toLocaleString()}</p>
            </div>

            {chartData
              .sort((a, b) => b.value - a.value)
              .map((item) => {
                const slotKey = Object.keys(SLOT_LABELS).find((k) => SLOT_LABELS[k] === item.name);
                return (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: SLOT_COLORS[slotKey || ''] }}
                      />
                      <span className="text-sm text-slate-300">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{item.value.toLocaleString()}</p>
                      <p className="text-xs text-slate-400">{item.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
