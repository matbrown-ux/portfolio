export interface ParsedMetric {
  prefix: string
  value: number
  decimals: number
  suffix: string
  grouped: boolean
}

const METRIC = /^(\D*?)(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?(.*)$/

/** Split a metric string into prefix, number, and suffix. Null when there is no real number. */
export function parseMetric(raw: string): ParsedMetric | null {
  const match = raw.trim().match(METRIC)
  if (!match) return null
  const [, prefix, int, frac = '', suffix] = match
  if (/^0+$/.test(int) && !frac) return null
  return {
    prefix,
    value: Number(int.replace(/,/g, '') + (frac ? `.${frac}` : '')),
    decimals: frac.length,
    suffix,
    grouped: int.includes(','),
  }
}

export function formatMetric(p: ParsedMetric, current: number): string {
  const n = current.toLocaleString('en-US', {
    minimumFractionDigits: p.decimals,
    maximumFractionDigits: p.decimals,
    useGrouping: p.grouped,
  })
  return `${p.prefix}${n}${p.suffix}`
}

/** Counting 0 to 1 reads as noise ("#0"), so ranks and tiny values stay static. */
export function shouldAnimate(p: ParsedMetric | null): p is ParsedMetric {
  return p !== null && p.value > 1
}
