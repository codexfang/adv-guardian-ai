/**
 * Heuristic parsers for Form ADV text and related inputs.
 * Future: replace with structured SEC EDGAR XML / API ingestion.
 */

const MONEY_PATTERN =
  /\$?\s*([\d,]+(?:\.\d+)?)\s*(million|billion|m|b)?/gi

function normalizeMoney(value, unit) {
  if (value == null || Number.isNaN(value)) return null
  const u = (unit || '').toLowerCase()
  if (u.startsWith('b')) return value * 1_000_000_000
  if (u.startsWith('m')) return value * 1_000_000
  if (value < 10_000 && !u) return value * 1_000_000
  return value
}

export function parseMoneyFromText(text) {
  if (!text) return []
  const amounts = []
  let match
  MONEY_PATTERN.lastIndex = 0
  while ((match = MONEY_PATTERN.exec(text)) !== null) {
    const raw = parseFloat(match[1].replace(/,/g, ''))
    if (!Number.isNaN(raw)) {
      amounts.push(normalizeMoney(raw, match[2]))
    }
  }
  return amounts.filter((n) => n > 1_000_000)
}

export function extractAUM(text) {
  if (!text) return null
  const labeled =
    text.match(
      /(?:regulatory\s+)?(?:assets under management|aum|total regulatory aum)[:\s]*\$?\s*([\d,.]+)\s*(million|billion|m|b)?/i
    ) ||
    text.match(
      /assets under management[:\s]*\$?\s*([\d,.]+)\s*(million|billion|m|b)?/i
    )
  if (labeled) {
    const val = parseFloat(labeled[1].replace(/,/g, ''))
    return normalizeMoney(val, labeled[2])
  }
  const amounts = parseMoneyFromText(text)
  return amounts.length ? Math.max(...amounts) : null
}

export function extractClientCount(text) {
  if (!text) return null
  const patterns = [
    /(?:number of|approximate number of)\s+advisory clients[:\s]*(\d[\d,]*)/i,
    /(\d[\d,]*)\s+(?:advisory\s+)?clients/i,
    /clients[:\s]*(\d[\d,]*)/i,
    /(\d[\d,]*)\s+families/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) return parseInt(m[1].replace(/,/g, ''), 10)
  }
  return null
}

export function extractFeeRange(text) {
  if (!text) return null
  const tiered = text.match(
    /(\d+\.?\d*)\s*%\s*(?:to|–|-)\s*(\d+\.?\d*)\s*%/i
  )
  if (tiered) {
    return {
      min: parseFloat(tiered[1]) / 100,
      max: parseFloat(tiered[2]) / 100,
    }
  }
  const single = text.match(
    /(?:fee|rate|pricing)[^\d]*(\d+\.?\d*)\s*%/i
  )
  if (single) {
    const rate = parseFloat(single[1]) / 100
    return { min: rate, max: rate }
  }
  const decimal = text.match(/(\d+\.\d{3,4})\s*(?:to|–|-)\s*(\d+\.\d{3,4})/)
  if (decimal) {
    return {
      min: parseFloat(decimal[1]),
      max: parseFloat(decimal[2]),
    }
  }
  return null
}

export function extractDiscretionaryPct(text) {
  if (!text) return null
  const m = text.match(/discretionary[^.\d]*(\d+\.?\d*)\s*%/i)
  return m ? parseFloat(m[1]) : null
}

export function parseCustodialInput(raw) {
  if (!raw?.trim()) return { data: null, error: null }
  try {
    return { data: JSON.parse(raw), error: null }
  } catch (e) {
    return { data: null, error: e.message }
  }
}

export function hasPerformanceClaim(text) {
  if (!text) return false
  return /top\s*\d+\s*%|outperform|guaranteed|beat the market|#1\s+perform/i.test(
    text
  )
}

export function hasMisleadingSuperlative(text) {
  if (!text) return false
  return /no minimum|complimentary|risk[- ]free|always profit/i.test(text)
}
