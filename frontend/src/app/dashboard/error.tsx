"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030712] text-slate-100">
      <div className="max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
        <p className="text-3xl">⚠️</p>
        <h2 className="mt-3 text-xl font-bold text-red-300">Something went wrong</h2>
        <p className="mt-2 text-sm text-slate-400">{error.message || "An unexpected error occurred."}</p>
        <button
          onClick={reset}
          className="mt-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:from-cyan-400 hover:to-blue-500"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
