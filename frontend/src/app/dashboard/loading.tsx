export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-surface-0 grid place-items-center">
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-2 border-accent-amber/20 rounded-full" />
          <div className="absolute inset-0 border-2 border-transparent border-t-accent-amber rounded-full animate-spin" />
          <div className="absolute inset-2 border border-accent-violet/20 rounded-full" />
          <div className="absolute inset-2 border border-transparent border-b-accent-violet rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <p className="text-xs text-text-muted font-mono tracking-[0.2em]">LOADING</p>
      </div>
    </div>
  );
}
