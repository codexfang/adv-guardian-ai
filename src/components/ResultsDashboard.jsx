import AnomalyCard from './AnomalyCard'
import RiskBadge from './RiskBadge'

const SUMMARY_COLORS = {
  High: 'border-red-500/40 bg-red-500/10',
  Medium: 'border-amber-500/40 bg-amber-500/10',
  Low: 'border-emerald-500/40 bg-emerald-500/10',
}

export default function ResultsDashboard({ report, error }) {
  if (error) {
    return (
      <section className="rounded-xl border border-red-500/40 bg-red-500/10 px-6 py-8 text-center">
        <p className="text-sm text-red-200">{error}</p>
      </section>
    )
  }

  if (!report) {
    return (
      <section className="rounded-xl border border-dashed border-slate-600 bg-slate-850/40 px-6 py-16 text-center">
        <p className="text-lg font-medium text-slate-300">
          No analysis yet
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Paste your Form ADV inputs and run analysis, or try Free Audit Mode
          for an instant sample report.
        </p>
      </section>
    )
  }

  const { summary, anomalies, message } = report
  const summaryClass = SUMMARY_COLORS[summary?.overallRisk] || SUMMARY_COLORS.Low

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Compliance Results</h2>
          <p className="mt-1 text-sm text-slate-400">{message}</p>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400 ring-1 ring-slate-600">
          Mock Engine · {new Date(report.generatedAt).toLocaleString()}
        </span>
      </div>

      {summary && (
        <div
          className={`grid gap-4 rounded-xl border p-5 sm:grid-cols-4 ${summaryClass}`}
        >
          <div className="sm:col-span-1">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Overall Risk
            </p>
            <div className="mt-2">
              <RiskBadge level={summary.overallRisk} />
            </div>
          </div>
          <Stat label="Total Findings" value={summary.totalAnomalies} />
          <Stat label="High" value={summary.byRisk.High} accent="text-red-300" />
          <Stat
            label="Medium / Low"
            value={`${summary.byRisk.Medium} / ${summary.byRisk.Low}`}
            accent="text-slate-200"
          />
        </div>
      )}

      {anomalies.length === 0 ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-6 py-10 text-center">
          <p className="font-medium text-emerald-200">No anomalies detected</p>
          <p className="mt-2 text-sm text-slate-400">
            Mock heuristics found no material discrepancies with the provided
            inputs.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {anomalies.map((a) => (
            <AnomalyCard key={a.id} anomaly={a} />
          ))}
        </div>
      )}
    </section>
  )
}

function Stat({ label, value, accent = 'text-white' }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  )
}
