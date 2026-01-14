/**
 * 스토리지 통계 섹션 컴포넌트
 * S3 스토리지 사용량 및 파일 목록 표시
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { StorageStats } from '@/types/admin-monitoring';
import { HardDrive, File } from 'lucide-react';

interface StorageStatsSectionProps {
  data: StorageStats;
}

export function StorageStatsSection({ data }: StorageStatsSectionProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">총 용량</CardTitle>
            <HardDrive className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{data.totalSizeMb.toFixed(2)} MB</p>
            <p className="text-xs text-slate-400 mt-1">{formatFileSize(data.totalSizeBytes)}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">파일 수</CardTitle>
            <File className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{data.fileCount.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">저장된 파일</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">평균 파일 크기</CardTitle>
            <File className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">
              {data.fileCount > 0 ? formatFileSize(data.totalSizeBytes / data.fileCount) : '0 B'}
            </p>
            <p className="text-xs text-slate-400 mt-1">파일당 평균</p>
          </CardContent>
        </Card>
      </div>

      {/* File List Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">저장된 파일 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {data.files.length === 0 ? (
            <div className="text-center py-8 text-slate-400">저장된 파일이 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">파일명</th>
                    <th className="text-right py-3 px-4 text-slate-300 font-medium">크기</th>
                    <th className="text-right py-3 px-4 text-slate-300 font-medium">마지막 수정</th>
                  </tr>
                </thead>
                <tbody>
                  {data.files.map((file) => (
                    <tr key={file.key} className="border-b border-slate-700/50">
                      <td className="py-3 px-4 text-white truncate max-w-md" title={file.key}>
                        {file.key}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">{formatFileSize(file.size)}</td>
                      <td className="py-3 px-4 text-right text-slate-400">{formatDate(file.lastModified)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
