const FIELDS = [
  {
    key: 'currentAdv',
    label: 'Current Form ADV',
    hint: 'Paste Part 1A text from your latest filing',
    rows: 3,
    required: true,
  },
  {
    key: 'previousAdv',
    label: 'Previous Form ADV',
    hint: 'Prior year filing for year-over-year comparison',
    rows: 2,
  },
  {
    key: 'websiteClaims',
    label: 'Website & Marketing Claims',
    hint: 'Paste public copy — no scraping; text only',
    rows: 2,
  },
  {
    key: 'custodialData',
    label: 'Client / Custodial Data (JSON)',
    hint: 'Aggregate custodian export or internal reconciliation JSON',
    rows: 2,
    mono: true,
  },
]

export default function InputPanel({ values, onChange }) {
  return (
    <section className="flex flex-col gap-2">
      <header>
        <h2 className="text-base font-semibold text-white">Filing Inputs</h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Provide filing text and supporting materials for automated discrepancy review.
        </p>
      </header>

      <div className="flex flex-col gap-2.5">
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
              className={`mt-1 block h-16 w-full resize-none overflow-y-auto rounded-lg border border-slate-600 bg-slate-900/80 px-2.5 py-1.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 ${
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
