export default function Header() {
  return (
    <header className="border-b border-slate-700/80 bg-slate-850/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              ADV Guardian AI
            </h1>
            <p className="text-sm text-slate-400">
              SEC Form ADV Compliance Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold text-brand-100 ring-1 ring-brand-500/30 sm:inline">
            AI Compliance Audit
          </span>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400 ring-1 ring-slate-600">
            v1.0 MVP
          </span>
        </div>
      </div>
    </header>
  )
}
