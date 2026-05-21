const FIELDS = [
  {
    key: 'currentAdv',
    label: 'Current Form ADV',
    hint: 'Paste Part 1A text from your latest filing',
    rows: 10,
    required: true,
  },
  {
    key: 'previousAdv',
    label: 'Previous Form ADV',
    hint: 'Prior year filing for year-over-year comparison',
    rows: 8,
  },
  {
    key: 'websiteClaims',
    label: 'Website & Marketing Claims',
    hint: 'Paste public copy — no scraping; text only',
    rows: 8,
  },
  {
    key: 'custodialData',
    label: 'Client / Custodial Data (JSON)',
    hint: 'Aggregate custodian export or internal reconciliation JSON',
    rows: 8,
    mono: true,
  },
]

export default function InputPanel({ values, onChange }) {
  return (
    <section className="flex h-full flex-col gap-4">
      <header>
        <h2 className="text-lg font-semibold text-white">Filing Inputs</h2>
        <p className="mt-1 text-sm text-slate-400">
          All analysis runs locally in your browser — mock mode only.
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
        {FIELDS.map((field) => (
          <label key={field.key} className="block">
            <span className="text-sm font-medium text-slate-200">
              {field.label}
              {field.required && (
                <span className="ml-1 text-red-400">*</span>
              )}
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">
              {field.hint}
            </span>
            <textarea
              value={values[field.key]}
              onChange={(e) => onChange(field.key, e.target.value)}
              rows={field.rows}
              className={`mt-2 w-full resize-y rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 ${
                field.mono ? 'font-mono text-xs' : ''
              }`}
              placeholder={
                field.key === 'custodialData'
                  ? '{\n  "aggregate": { "totalAUM": 0 }\n}'
                  : `Paste ${field.label.toLowerCase()}...`
              }
            />
          </label>
        ))}
      </div>
    </section>
  )
}
