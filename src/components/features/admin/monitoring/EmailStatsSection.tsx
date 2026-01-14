/**
 * 이메일 통계 섹션 컴포넌트
 * 이메일 발송 성공/실패 통계 및 목적별 분석 표시
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EmailStats } from '@/types/admin-monitoring';
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

interface EmailStatsSectionProps {
  data: EmailStats;
}

export function EmailStatsSection({ data }: EmailStatsSectionProps) {
  const chartData = data.dailyBreakdown.map((item) => ({
    date: item.date,
    totalSent: item.totalSent,
    failureCount: item.failureCount,
  }));

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">총 발송</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{data.summary.totalSent.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">성공</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-400">{data.summary.successCount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">실패</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-400">{data.summary.failureCount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">실패율</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{(100 - data.summary.successRate).toFixed(2)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend Chart */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">이메일 발송 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
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
                  if (value === 'totalSent') return '발송';
                  if (value === 'failureCount') return '실패';
                  return value;
                }}
              />
              <Line
                type="monotone"
                dataKey="totalSent"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981' }}
              />
              <Line
                type="monotone"
                dataKey="failureCount"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Purpose Breakdown Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">목적별 발송 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-300 font-medium">목적</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">전체</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">성공</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">실패</th>
                  <th className="text-right py-3 px-4 text-slate-300 font-medium">실패율</th>
                </tr>
              </thead>
              <tbody>
                {data.byPurpose.map((item) => (
                  <tr key={item.purpose} className="border-b border-slate-700/50">
                    <td className="py-3 px-4 text-white">{item.purpose}</td>
                    <td className="py-3 px-4 text-right text-slate-300">{item.totalSent.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-green-400">{item.successCount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-red-400">{item.failureCount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-slate-300">
                      {(100 - item.successRate).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
