export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030712]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    </div>
  );
}
