import { useState } from 'react'
import RiskBadge from './RiskBadge'

export default function AnomalyCard({ anomaly }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article className="rounded-xl border border-slate-700/80 bg-slate-850/80 shadow-lg shadow-black/20 backdrop-blur-sm transition hover:border-slate-600">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-700/60 px-5 py-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-white">{anomaly.title}</h3>
          <p className="mt-1 text-sm text-slate-400">
            Detected {new Date(anomaly.detectedAt).toLocaleString()}
          </p>
        </div>
        <RiskBadge level={anomaly.riskLevel} />
      </div>

      <div className="space-y-4 px-5 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Explanation
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-200">
            {anomaly.explanation}
          </p>
        </div>

        <div className="rounded-lg border border-brand-500/20 bg-brand-500/5 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-100">
            Suggested Fix
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-200">
            {anomaly.suggestedFix}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="text-sm font-medium text-brand-100 hover:text-white"
        >
          {expanded ? 'Hide technical details' : 'Show technical details'}
        </button>

        {expanded && (
          <pre className="max-h-48 overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-400">
            {JSON.stringify(anomaly.details, null, 2)}
          </pre>
        )}
      </div>
    </article>
  )
}
