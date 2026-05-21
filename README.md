# ADV Guardian AI

Production-ready MVP for SEC **Form ADV** compliance review. Compare current and prior filings, marketing copy, and custodial aggregates to surface discrepancies — entirely in the browser with a **mock AI engine** (no backend, API keys, or secrets).

![Stack](https://img.shields.io/badge/React-19-61dafb) ![Vite](https://img.shields.io/badge/Vite-8-646cff) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)

## Features

- **Dashboard layout** — inputs (left), controls (right), results (bottom)
- **Mock AI analysis** — heuristic parsing in `src/mock/mockAnalyzer.js`
- **Five+ anomaly types** — AUM mismatch, client count, fees, marketing claims, custodial gaps, YoY drift
- **Free Audit Mode** — loads sample data from `/data` and runs instant report
- **PDF export** — client-side report download via jsPDF
- **GitHub Pages ready** — static build to `/dist`, SPA-safe (no client router)

## Mock Mode

All intelligence runs locally:

1. Text/keyword extraction from pasted ADV and website copy
2. JSON parse for custodial aggregates
3. Rule-based comparisons producing structured anomalies

There are **no network calls** and **no environment variables**. Comments in code mark future integration points for **Gemini API** and a **FastAPI** backend — not implemented in this release.

## Quick Start (Local)

```bash
git clone <your-repo-url>
cd adv-guardian-ai
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Production build

```bash
npm run build
npm run preview
```

Output is written to `dist/`.

## GitHub Pages Deployment

1. Create a GitHub repository named `adv-guardian-ai` (or update `base` in `vite.config.js` to match your repo name).

2. If your repo name differs, set the base path when building:

   ```bash
   VITE_BASE_PATH=/your-repo-name/ npm run build
   ```

   Or edit `repoBase` in `vite.config.js`.

3. For a **user/org site** (`username.github.io` with no project path), set base to `/`:

   ```js
   const repoBase = '/'
   ```

4. Deploy:

   ```bash
   npm run deploy
   ```

   This runs `predeploy` (build) then publishes `dist/` to the `gh-pages` branch via the `gh-pages` package.

5. In GitHub → **Settings → Pages**, set source to **Deploy from branch** → `gh-pages` → `/ (root)`.

6. Live URL (project site): `https://<username>.github.io/adv-guardian-ai/`

## Project Structure

```
adv-guardian-ai/
├── data/                          # Sample ADV + custodial JSON (source files)
│   ├── sample-current-adv.txt
│   ├── sample-previous-adv.txt
│   ├── sample-website-claims.txt
│   └── sample-custodial.json
├── public/
│   └── favicon.svg
├── src/
│   ├── mock/
│   │   └── mockAnalyzer.js        # Mock AI engine (required)
│   ├── components/                # UI modules
│   ├── data/sampleData.js         # Bundled sample imports
│   └── utils/                     # Parsers + PDF export
├── vite.config.js                 # base path for GitHub Pages
└── README.md
```

## Usage

1. Paste **Current Form ADV** (required).
2. Optionally add **Previous ADV**, **Website claims**, and **Custodial JSON**.
3. Click **Run Analysis** or **Free Audit Mode** for a demo dataset.
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

## Future Upgrades (Not in MVP)

Documented in source comments only:

| Upgrade | Location |
|--------|----------|
| Gemini API | `src/mock/mockAnalyzer.js` |
| FastAPI backend | `src/mock/mockAnalyzer.js`, `src/App.jsx` |
| Server PDF templates | `src/utils/exportPdf.js` |

## Disclaimer

This application is for **demonstration and internal workflow prototyping**. Mock heuristics are not a substitute for qualified compliance or legal counsel. Do not rely on outputs for regulatory filings without human review.

## License

MIT — use and modify for your organization’s internal tooling.
