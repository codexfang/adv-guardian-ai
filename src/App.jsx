import { useCallback, useState } from 'react'
import Header from './components/Header'
import InputPanel from './components/InputPanel'
import ActionPanel from './components/ActionPanel'
import ResultsDashboard from './components/ResultsDashboard'
import { runMockAnalysis } from './mock/mockAnalyzer'
import { sampleInputs } from './data/sampleData'
import { downloadAnalysisPdf } from './utils/exportPdf'

const EMPTY = {
  currentAdv: '',
  previousAdv: '',
  websiteClaims: '',
  custodialData: '',
}

export default function App() {
  const [inputs, setInputs] = useState(EMPTY)
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleChange = useCallback((key, value) => {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }, [])

  const executeAnalysis = useCallback((data) => {
    setError(null)
    setIsAnalyzing(true)
    // Brief delay simulates async AI — keeps UX realistic in mock mode
    window.setTimeout(() => {
      const result = runMockAnalysis(data)
      if (!result.success) {
        setError(result.message)
        setReport(null)
      } else {
        setReport(result)
        setError(null)
      }
      setIsAnalyzing(false)
    }, 650)
  }, [])

  const handleRunAnalysis = () => {
    if (!inputs.currentAdv.trim()) {
      setError('Current Form ADV is required.')
      setReport(null)
      return
    }
    executeAnalysis(inputs)
  }

  const handleFreeAudit = () => {
    setInputs(sampleInputs)
    executeAnalysis(sampleInputs)
  }

  const handleDownloadPdf = () => {
    if (report) downloadAnalysisPdf(report)
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-xl border border-slate-700/80 bg-slate-850/40 p-5 lg:max-h-[calc(100vh-12rem)] lg:overflow-hidden">
            <InputPanel values={inputs} onChange={handleChange} />
          </div>

          <ActionPanel
            onRunAnalysis={handleRunAnalysis}
            onFreeAudit={handleFreeAudit}
            isAnalyzing={isAnalyzing}
            hasReport={!!report?.success}
            onDownloadPdf={handleDownloadPdf}
          />
        </div>

        <div className="mt-8">
          <ResultsDashboard report={report} error={error} />
        </div>
      </main>

      <footer className="mt-12 border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        ADV Guardian AI · Demonstration build · Not legal advice ·{' '}
        {/* FUTURE: Gemini API + FastAPI backend integration */}
        Mock analysis only
      </footer>
    </div>
  )
}
