# ADV Guardian AI

Production-ready MVP for SEC **Form ADV** compliance review. Compare current and prior filings, marketing copy, and custodial aggregates to surface discrepancies with AI-assisted analysis and exportable reports.

## Features

- **Dashboard layout** — inputs (left), controls (right), results (bottom)
- **AI compliance analysis** — discrepancy detection in `src/mock/mockAnalyzer.js`
- **Five+ anomaly types** — AUM mismatch, client count, fees, marketing claims, custodial gaps, YoY drift
- **Try Sample Audit** — loads sample data from `/data` (then click Run Analysis)
- **PDF export** — client-side report download via jsPDF

## Analysis Engine

ADV Guardian processes your inputs to:

1. Extract key metrics from Form ADV and marketing text
2. Parse custodial aggregate JSON
3. Compare sources and surface structured anomalies with risk ratings and suggested amendment language

## Usage

1. Paste **Current Form ADV** (required).
2. Optionally add **Previous ADV**, **Website claims**, and **Custodial JSON**.
3. Click **Run Analysis** or **Try Sample Audit** for a demo dataset.
4. Review anomaly cards; expand technical details; **Download Report (PDF)**.

### Sample custodial JSON shape

```json
{
  "aggregate": {
    "totalAccounts": 287,
    "totalAUM": 790500000
  },
  "feeSchedulesOnFile": [
    { "minRate": 0.0075, "maxRate": 0.0125 }
  ]
}
```

## Disclaimer

This application supports **compliance review workflows**. Outputs are not a substitute for qualified compliance or legal counsel. Do not rely on results for regulatory filings without human review.


