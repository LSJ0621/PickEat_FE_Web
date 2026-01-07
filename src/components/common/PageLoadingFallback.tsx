export function PageLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="text-center">
        <div
          data-testid="loading-spinner"
          className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"
        />
        <p className="mt-4 text-gray-400">페이지를 불러오는 중...</p>
      </div>
    </div>
  );
}
