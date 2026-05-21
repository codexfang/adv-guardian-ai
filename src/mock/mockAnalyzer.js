/**
 * Mock AI Engine — local heuristic compliance analysis.
 *
 * FUTURE UPGRADE (not implemented):
 * - Replace runMockAnalysis with Gemini API call via secure backend proxy
 * - FastAPI service: POST /api/analyze { currentAdv, previousAdv, ... }
 * - See: https://ai.google.dev/gemini-api/docs
 */

import {
  extractAUM,
  extractClientCount,
  extractDiscretionaryPct,
  extractFeeRange,
  hasMisleadingSuperlative,
  hasPerformanceClaim,
  parseCustodialInput,
} from '../utils/parseAdv.js'

const RISK = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
}

let anomalyId = 0
function nextId() {
  anomalyId += 1
  return `anomaly-${anomalyId}`
}

function formatUSD(n) {
  if (n == null) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

function pct(n) {
  if (n == null) return 'N/A'
  return `${(n * 100).toFixed(2)}%`
}

function buildAnomaly({
  title,
  riskLevel,
  explanation,
  suggestedFix,
  details = {},
}) {
  return {
    id: nextId(),
    title,
    riskLevel,
    explanation,
    suggestedFix,
    details,
    detectedAt: new Date().toISOString(),
  }
}

function compareAUM(advAum, websiteAum, custodialAum) {
  const anomalies = []
  if (advAum && websiteAum) {
    const diff = Math.abs(websiteAum - advAum) / advAum
    if (diff > 0.15) {
      anomalies.push(
        buildAnomaly({
          title: 'AUM Discrepancy Detected',
          riskLevel: diff > 0.35 ? RISK.HIGH : RISK.MEDIUM,
          explanation: `Regulatory AUM reported on Form ADV (${formatUSD(advAum)}) materially differs from website marketing claims (${formatUSD(websiteAum)}). A variance of ${(diff * 100).toFixed(1)}% may constitute a misleading statement under the Marketing Rule (Rule 206(4)-1).`,
          suggestedFix:
            'Amend Item 5.F.(2)(c) and/or revise public-facing materials so that any AUM figure is calculated on a consistent basis (regulatory AUM per Form ADV instructions) and accompanied by appropriate context and disclosure of the valuation date.',
          details: {
            advValue: advAum,
            websiteValue: websiteAum,
            variancePct: (diff * 100).toFixed(2),
            source: 'ADV vs Website',
          },
        })
      )
    }
  }

  if (advAum && custodialAum) {
    const diff = Math.abs(custodialAum - advAum) / advAum
    if (diff > 0.05) {
      anomalies.push(
        buildAnomaly({
          title: 'Custodial AUM Reconciliation Gap',
          riskLevel: diff > 0.12 ? RISK.HIGH : RISK.MEDIUM,
          explanation: `Aggregate custodial reported AUM (${formatUSD(custodialAum)}) does not reconcile to ADV regulatory AUM (${formatUSD(advAum)}). Custody rule examinations often trace discrepancies to stale billing data or omitted sleeves.`,
          suggestedFix:
            'Reconcile custodian statements to the regulatory AUM calculation workbook used for the ADV filing. Document immaterial differences or file an Other-than-Annual amendment if the ADV figure requires correction.',
          details: {
            advValue: advAum,
            custodialValue: custodialAum,
            variancePct: (diff * 100).toFixed(2),
            source: 'ADV vs Custodial',
          },
        })
      )
    }
  }
  return anomalies
}

function compareClientCounts(advClients, websiteClients, custodialAccounts) {
  const anomalies = []
  if (advClients && websiteClients && websiteClients > advClients * 1.1) {
    anomalies.push(
      buildAnomaly({
        title: 'Client Count Mismatch',
        riskLevel: RISK.MEDIUM,
        explanation: `Website references approximately ${websiteClients} clients/families while Form ADV reports ${advClients} advisory clients. Overstating client counts in marketing may be misleading if the website figure includes non-advisory relationships.`,
        suggestedFix:
          'Clarify in marketing materials whether counts include only SEC-registered advisory clients per Item 5.D.(1), or revise the ADV if the firm\'s client population has changed. Align all public metrics to the same definition used in the filing.',
        details: { advClients, websiteClients },
      })
    )
  }

  if (advClients && custodialAccounts && Math.abs(custodialAccounts - advClients) > 15) {
    anomalies.push(
      buildAnomaly({
        title: 'Custodial Account Count Variance',
        riskLevel: RISK.LOW,
        explanation: `Custodial aggregate accounts (${custodialAccounts}) differ from ADV client count (${advClients}). Some variance is expected for householding, but large gaps warrant reconciliation.`,
        suggestedFix:
          'Document account-level mapping between custodial feeds and ADV client definitions. Update Item 5.D.(1) if the advisory client count methodology has changed.',
        details: { advClients, custodialAccounts },
      })
    )
  }
  return anomalies
}

function compareFees(advFees, websiteFees, custodialFees) {
  const anomalies = []
  if (advFees && websiteFees) {
    const websiteMax = websiteFees.max ?? websiteFees.min
    const advMin = advFees.min
    if (websiteMax < advMin * 0.85) {
      anomalies.push(
        buildAnomaly({
          title: 'Fee Structure Inconsistency',
          riskLevel: RISK.HIGH,
          explanation: `Website advertises fees as low as ${pct(websiteFees.min)} while ADV discloses AUM-based fees from ${pct(advFees.min)} to ${pct(advFees.max)}. Advertising a lower fee than actually charged may violate antifraud provisions and the Marketing Rule.`,
          suggestedFix:
            'Revise website fee disclosures to reflect the full tiered schedule in Item 5.E, including minimum effective rates and any additional fixed-fee services. Consider adding a prominent link to the Form ADV Part 2A brochure.',
          details: {
            advFeeRange: advFees,
            websiteFeeRange: websiteFees,
          },
        })
      )
    }
  }

  if (advFees && custodialFees) {
    const cMin = custodialFees.minRate ?? custodialFees.min
    const cMax = custodialFees.maxRate ?? custodialFees.max
    if (cMin != null && advFees.min && Math.abs(cMin - advFees.min) > 0.002) {
      anomalies.push(
        buildAnomaly({
          title: 'Custodial Fee Schedule Drift',
          riskLevel: RISK.MEDIUM,
          explanation: `Fee schedules on file with custodians (${pct(cMin)} – ${pct(cMax)}) do not match the ADV disclosed range (${pct(advFees.min)} – ${pct(advFees.max)}).`,
          suggestedFix:
            'Synchronize custodian fee billing codes with the ADV compensation disclosure. Update Item 5.E in the next amendment if billing defaults were changed without a corresponding ADV update.',
          details: { advFees, custodialFees: { min: cMin, max: cMax } },
        })
      )
    }
  }
  return anomalies
}

function checkMarketingClaims(websiteText) {
  const anomalies = []
  if (hasPerformanceClaim(websiteText)) {
    anomalies.push(
      buildAnomaly({
        title: 'Potentially Misleading Performance Claim',
        riskLevel: RISK.HIGH,
        explanation:
          'Website copy includes comparative or superlative performance language (e.g., "top 1%") without required context, net-of-fees presentation, or SEC-prescribed disclosures.',
        suggestedFix:
          'Remove or qualify performance claims per Rule 206(4)-1. Include one-, five-, and ten-year performance with equal prominence, disclose benchmarks, and add the required "past performance" legend and GIPS/composite identification where applicable.',
        details: { flaggedPhrases: ['top 1%', 'performance'] },
      })
    )
  }
  if (hasMisleadingSuperlative(websiteText)) {
    anomalies.push(
      buildAnomaly({
        title: 'Marketing Claim Requiring Disclosure',
        riskLevel: RISK.MEDIUM,
        explanation:
          'Public materials suggest terms such as "no minimum investment" or complimentary services that may conflict with actual account minimums or compensation arrangements disclosed in the ADV Part 2A.',
        suggestedFix:
          'Align call-to-action language with Item 4 minimum account sizes and fee disclosures. Add clarifying footnotes where promotional offers differ from standard advisory terms.',
        details: { category: 'promotional-cta' },
      })
    )
  }
  return anomalies
}

function compareYearOverYear(current, previous) {
  const anomalies = []
  if (!current.aum || !previous.aum) return anomalies

  const growth = (current.aum - previous.aum) / previous.aum
  if (growth > 0.25 && current.clients && previous.clients) {
    const clientGrowth = (current.clients - previous.clients) / previous.clients
    if (clientGrowth < 0.05) {
      anomalies.push(
        buildAnomaly({
          title: 'AUM Growth Without Corresponding Client Growth',
          riskLevel: RISK.MEDIUM,
          explanation: `Regulatory AUM increased ${(growth * 100).toFixed(1)}% year-over-year while client count grew only ${(clientGrowth * 100).toFixed(1)}%. This pattern may indicate market appreciation, concentration, or a data entry error requiring validation.`,
          suggestedFix:
            'Validate the regulatory AUM calculation methodology and confirm all client accounts are counted in Item 5.D.(1). Document market-driven AUM increases in internal compliance files for examiner inquiry.',
          details: {
            priorAum: previous.aum,
            currentAum: current.aum,
            priorClients: previous.clients,
            currentClients: current.clients,
          },
        })
      )
    }
  }

  if (current.fees && previous.fees) {
    if (current.fees.min > previous.fees.min + 0.001) {
      anomalies.push(
        buildAnomaly({
          title: 'Fee Schedule Change Not Highlighted',
          riskLevel: RISK.LOW,
          explanation: `Minimum disclosed AUM fee increased from ${pct(previous.fees.min)} to ${pct(current.fees.min)} versus the prior filing. Clients must receive updated brochures and conflicts disclosures.`,
          suggestedFix:
            'Deliver updated Form ADV Part 2A supplements to affected clients within 30 days. Confirm CRM2/fee billing reflects the new schedule effective date.',
          details: {
            priorMinFee: previous.fees.min,
            currentMinFee: current.fees.min,
          },
        })
      )
    }
  }

  if (
    current.discretionaryPct != null &&
    previous.discretionaryPct != null &&
    current.discretionaryPct - previous.discretionaryPct > 8
  ) {
    anomalies.push(
      buildAnomaly({
        title: 'Discretionary Authority Increase',
        riskLevel: RISK.LOW,
        explanation: `Discretionary authority rose from ${previous.discretionaryPct}% to ${current.discretionaryPct}% of accounts. Expanded discretion increases fiduciary duty and custody oversight obligations.`,
        suggestedFix:
          'Verify investment management agreements grant the expanded discretion. Update custody and voting disclosures if applicable.',
        details: {
          prior: previous.discretionaryPct,
          current: current.discretionaryPct,
        },
      })
    )
  }
  return anomalies
}

function overallRisk(anomalies) {
  if (!anomalies.length) return RISK.LOW
  if (anomalies.some((a) => a.riskLevel === RISK.HIGH)) return RISK.HIGH
  if (anomalies.some((a) => a.riskLevel === RISK.MEDIUM)) return RISK.MEDIUM
  return RISK.LOW
}

/**
 * Main entry — simulates AI compliance analysis locally.
 * @param {{ currentAdv: string, previousAdv: string, websiteClaims: string, custodialData: string }} inputs
 * @returns {import('./types').AnalysisReport}
 */
export function runMockAnalysis(inputs) {
  anomalyId = 0
  const { currentAdv, previousAdv, websiteClaims, custodialData } = inputs

  const current = {
    aum: extractAUM(currentAdv),
    clients: extractClientCount(currentAdv),
    fees: extractFeeRange(currentAdv),
    discretionaryPct: extractDiscretionaryPct(currentAdv),
  }

  const previous = {
    aum: extractAUM(previousAdv),
    clients: extractClientCount(previousAdv),
    fees: extractFeeRange(previousAdv),
    discretionaryPct: extractDiscretionaryPct(previousAdv),
  }

  const website = {
    aum: extractAUM(websiteClaims),
    clients: extractClientCount(websiteClaims),
    fees: extractFeeRange(websiteClaims),
  }

  const { data: custodial, error: custodialError } =
    parseCustodialInput(custodialData)

  const custodialAum = custodial?.aggregate?.totalAUM ?? null
  const custodialAccounts = custodial?.aggregate?.totalAccounts ?? null
  const custodialFees = custodial?.feeSchedulesOnFile?.[0] ?? null

  const anomalies = [
    ...compareAUM(current.aum, website.aum, custodialAum),
    ...compareClientCounts(current.clients, website.clients, custodialAccounts),
    ...compareFees(current.fees, website.fees, custodialFees),
    ...checkMarketingClaims(websiteClaims),
    ...compareYearOverYear(current, previous),
  ]

  if (custodialError) {
    anomalies.unshift(
      buildAnomaly({
        title: 'Custodial Data Parse Error',
        riskLevel: RISK.MEDIUM,
        explanation: `Client/custodial JSON could not be parsed: ${custodialError}. Analysis continued without custodial reconciliation.`,
        suggestedFix:
          'Provide valid JSON matching the firm\'s custodian aggregate export schema.',
        details: { error: custodialError },
      })
    )
  }

  if (!currentAdv?.trim()) {
    return {
      success: false,
      message: 'Current Form ADV text is required to run analysis.',
      anomalies: [],
      summary: null,
    }
  }

  const unique = anomalies.filter(
    (a, i, arr) => arr.findIndex((b) => b.title === a.title) === i
  )

  return {
    success: true,
    message:
      unique.length === 0
        ? 'No material discrepancies detected in mock analysis.'
        : `Mock analysis identified ${unique.length} potential compliance item(s).`,
    generatedAt: new Date().toISOString(),
    mode: 'mock',
    extracted: { current, previous, website, custodial: custodial ?? null },
    anomalies: unique,
    summary: {
      totalAnomalies: unique.length,
      overallRisk: overallRisk(unique),
      byRisk: {
        High: unique.filter((a) => a.riskLevel === RISK.HIGH).length,
        Medium: unique.filter((a) => a.riskLevel === RISK.MEDIUM).length,
        Low: unique.filter((a) => a.riskLevel === RISK.LOW).length,
      },
    },
  }
}

export default runMockAnalysis
