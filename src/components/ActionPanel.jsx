export default function ActionPanel({
  onRunAnalysis,
  onSampleAudit,
  isAnalyzing,
  hasReport,
  onDownloadPdf,
}) {
  return (
    <section className="flex h-full flex-col gap-3 rounded-xl border border-slate-700/80 bg-slate-850/60 p-4">
      <header className="shrink-0">
        <h2 className="text-base font-semibold text-white">Analysis Controls</h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Compare filings, marketing copy, and custodial records in one pass.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
          className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isAnalyzing ? 'Analyzing…' : 'Run Analysis'}
        </button>

        <button
          type="button"
          onClick={onSampleAudit}
          disabled={isAnalyzing}
          className="w-full rounded-lg border border-slate-500 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-brand-500/50 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Try Sample Audit
        </button>

        {hasReport && (
          <button
            type="button"
            onClick={onDownloadPdf}
            className="w-full rounded-lg border border-emerald-600/40 bg-emerald-600/10 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-600/20"
          >
            Download Report (PDF)
          </button>
        )}
      </div>

      <div className="mt-auto shrink-0 rounded-lg border border-slate-700 bg-slate-900/50 p-3 text-xs leading-relaxed text-slate-400">
        <p className="font-medium text-slate-300">How analysis works</p>
        <p className="mt-1">
          ADV Guardian cross-references regulatory filings against public
          marketing language and custodial aggregates to flag AUM, fee, client
          count, and disclosure inconsistencies with suggested amendment language.
        </p>
      </div>
    </section>
  )
}
