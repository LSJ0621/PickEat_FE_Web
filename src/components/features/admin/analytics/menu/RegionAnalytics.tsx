/**
 * 지역별 분석 컴포넌트
 * 지역별 메뉴 추천 통계를 막대 차트와 테이블로 표시
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RegionAnalyticsResponse } from '@/types/admin-analytics';
import { MapPin } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface RegionAnalyticsProps {
  data: RegionAnalyticsResponse;
}

export function RegionAnalytics({ data }: RegionAnalyticsProps) {
  // 차트용 데이터 (상위 10개)
  const chartData = data.byRegion.slice(0, 10);

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">지역별 분석</CardTitle>
      </CardHeader>
      <CardContent>
        {data.byRegion.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>데이터가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 막대 차트 */}
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">상위 10개 지역</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                  <YAxis
                    type="category"
                    dataKey="region"
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af' }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '0.375rem',
                      color: '#e2e8f0',
                    }}
                    formatter={(value: number | undefined) => [value?.toLocaleString() || '0', '추천 수']}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 지역 순위 테이블 */}
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">전체 지역 순위</h4>
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-slate-800 z-10">
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">순위</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">지역</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">건수</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">비율</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byRegion.map((item, index) => (
                      <tr
                        key={item.region}
                        className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="text-sm font-semibold text-slate-300">{index + 1}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-400" />
                            <span className="text-sm text-white">{item.region}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-medium text-white">{item.count.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-slate-300">{item.percentage.toFixed(1)}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
