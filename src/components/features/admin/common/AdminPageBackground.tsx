/**
 * 관리자 페이지 배경 그라디언트 컴포넌트
 * 모든 관리자 페이지에서 공통으로 사용되는 배경 그라디언트
 */

export function AdminPageBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 left-0 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-orange-400/40 via-pink-500/30 to-purple-600/30 blur-3xl animate-gradient" />
      <div className="absolute -bottom-40 right-0 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-purple-400/40 via-pink-500/30 to-orange-600/30 blur-3xl animate-gradient" />
    </div>
  );
}
