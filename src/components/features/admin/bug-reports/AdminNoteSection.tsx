/**
 * 관리자 메모 섹션 컴포넌트
 */

import type { BugReportAdminNote } from '@/types/bug-report';

interface AdminNoteSectionProps {
  notes: BugReportAdminNote[];
  onAddNote: () => void;
}

export const AdminNoteSection = ({ notes, onAddNote }: AdminNoteSectionProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 최신순으로 정렬
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">
          관리자 메모 ({notes.length})
        </h3>
        <button
          onClick={onAddNote}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:from-pink-600 hover:to-rose-600"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          메모 추가
        </button>
      </div>

      {sortedNotes.length === 0 ? (
        <div className="text-center text-sm text-slate-400 py-8 rounded-lg border border-slate-700 bg-slate-900/50">
          등록된 관리자 메모가 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {sortedNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-lg border border-slate-700 bg-slate-900/50 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">
                  {note.createdBy.email}
                </span>
                <span className="text-xs text-slate-500">{formatDate(note.createdAt)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-400">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
