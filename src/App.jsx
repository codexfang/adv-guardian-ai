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
    // Brief delay for analysis UX
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

  const handleSampleAudit = () => {
    setInputs(sampleInputs)
    setError(null)
    setReport(null)
  }

  const handleDownloadPdf = () => {
    if (report) downloadAnalysisPdf(report)
  }

  return (
    <div className="bg-slate-900">
      <Header />

      <main className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_300px]">
          <div className="rounded-xl border border-slate-700/80 bg-slate-850/40 p-4">
            <InputPanel values={inputs} onChange={handleChange} />
          </div>

          <ActionPanel
            onRunAnalysis={handleRunAnalysis}
            onSampleAudit={handleSampleAudit}
            isAnalyzing={isAnalyzing}
            hasReport={!!report?.success}
            onDownloadPdf={handleDownloadPdf}
          />
        </div>

        <div className="mt-4">
          <ResultsDashboard report={report} error={error} />
        </div>
      </main>
    </div>
  )
}
