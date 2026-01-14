/**
 * OpenAI 상세 차트 컴포넌트
 * 일별 호출 수, 토큰 사용량, 비용 추이 시각화
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OpenAiStats } from '@/types/admin-monitoring';
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

interface OpenAiDetailChartProps {
  data: OpenAiStats;
}

export function OpenAiDetailChart({ data }: OpenAiDetailChartProps) {
  // Note: dailyBreakdown doesn't have cost field, only calls and tokens
  const chartData = useMemo(
    () =>
      data.dailyBreakdown.map((item) => ({
        date: item.date,
        calls: item.calls,
        tokens: item.tokens / 1000,
      })),
    [data.dailyBreakdown]
  );

  const modelBreakdown = useMemo(
    () =>
      data.byModel.map((model) => ({
        model: model.model,
        calls: model.calls,
        tokens: model.tokens,
        cost: model.estimatedCostUsd,
      })),
    [data.byModel]
  );

  return (
    <div className="space-y-4">
      {/* Daily Trend Chart */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">OpenAI 일별 사용량</CardTitle>
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
              <YAxis yAxisId="left" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
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
                formatter={(value: number | undefined, name: string | undefined) => {
                  if (value === undefined || name === undefined) return ['', ''];
                  if (name === 'tokens') return [`${value.toFixed(1)}K`, '토큰 (K)'];
                  if (name === 'calls') return [value, '호출 수'];
                  return value;
                }}
              />
              <Legend
                wrapperStyle={{ color: '#9ca3af' }}
                formatter={(value) => {
                  if (value === 'calls') return '호출 수';
                  if (value === 'tokens') return '토큰 (K)';
                  return value;
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="calls"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="tokens"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Model Breakdown Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">모델별 사용량</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-300 font-medium">모델</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">호출 수</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">토큰</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">비용</th>
                </tr>
              </thead>
              <tbody>
                {modelBreakdown.map((model) => (
                  <tr key={model.model} className="border-b border-slate-700/50">
                    <td className="py-3 px-4 text-white">{model.model}</td>
                    <td className="py-3 px-4 text-right text-slate-300">{model.calls.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-slate-300">{model.tokens.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-green-400">${model.cost.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-700/30">
                  <td className="py-3 px-4 text-white font-semibold">합계</td>
                  <td className="py-3 px-4 text-right text-white font-semibold">
                    {data.totalCalls.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-white font-semibold">
                    {data.totalTokens.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-green-400 font-semibold">
                    ${data.estimatedCostUsd.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
