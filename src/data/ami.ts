/**
 * HUD FY2025 Area Median Income data for NYC metro area.
 * Used to determine Housing Connect lottery eligibility tiers.
 *
 * Source: HUD FY2025 Income Limits (NYC metro HMFA)
 * Base AMI (4-person): ~$156,000 — limits below are rounded from HUD tables.
 */

export interface AmiTier {
  key: string
  label: string
  shortLabel: string
  maxPercent: number
  color: string
}

export const AMI_TIERS: AmiTier[] = [
  { key: 'ext_low', label: 'Extremely Low Income', shortLabel: '≤30% AMI', maxPercent: 30, color: '#ef4444' },
  { key: 'very_low', label: 'Very Low Income', shortLabel: '31-50% AMI', maxPercent: 50, color: '#f97316' },
  { key: 'low', label: 'Low Income', shortLabel: '51-80% AMI', maxPercent: 80, color: '#eab308' },
  { key: 'moderate', label: 'Moderate Income', shortLabel: '81-120% AMI', maxPercent: 120, color: '#22c55e' },
  { key: 'middle', label: 'Middle Income', shortLabel: '121-165% AMI', maxPercent: 165, color: '#3b82f6' },
  { key: 'above', label: 'Above Moderate Income', shortLabel: '>165% AMI', maxPercent: Infinity, color: '#8b5cf6' },
]

/**
 * Income limits by household size (1-8+) and AMI percentage.
 * These are the MAXIMUM annual incomes for each tier.
 * Derived from HUD FY2025 tables for NYC metro area.
 *
 * Row = household size (index 0 = 1 person, index 7 = 8+ persons)
 * Columns = [30%, 50%, 80%, 120%, 165%]
 */
const INCOME_LIMITS: number[][] = [
  // 1 person
  [32850, 54750, 87600, 131400, 180675],
  // 2 persons
  [37550, 62550, 100050, 150100, 206375],
  // 3 persons
  [42250, 70350, 112550, 168850, 232150],
  // 4 persons
  [46900, 78150, 125050, 187550, 257900],
  // 5 persons
  [50700, 84450, 135100, 202650, 278650],
  // 6 persons
  [54450, 90700, 145100, 217650, 299250],
  // 7 persons
  [58200, 96950, 155100, 232650, 319900],
  // 8+ persons
  [61950, 103250, 165100, 247650, 340475],
]

/**
 * Get the AMI tier key for a given household size and annual income.
 * Returns the highest tier the household qualifies for (most restrictive match).
 */
export function getAmiTier(householdSize: number, annualIncome: number): string | null {
  const sizeIndex = Math.min(Math.max(householdSize - 1, 0), 7)
  const limits = INCOME_LIMITS[sizeIndex]

  if (annualIncome <= limits[0]) return 'ext_low'
  if (annualIncome <= limits[1]) return 'very_low'
  if (annualIncome <= limits[2]) return 'low'
  if (annualIncome <= limits[3]) return 'moderate'
  if (annualIncome <= limits[4]) return 'middle'
  return 'above'
}

/**
 * Get the AMI tier object by key.
 */
export function getAmiTierByKey(key: string): AmiTier | undefined {
  return AMI_TIERS.find(t => t.key === key)
}

/**
 * Get the income limit for a specific household size and AMI percentage.
 */
export function getIncomeLimit(householdSize: number, amiPercent: number): number | null {
  const sizeIndex = Math.min(Math.max(householdSize - 1, 0), 7)
  const limits = INCOME_LIMITS[sizeIndex]
  const pctIndex = [30, 50, 80, 120, 165].indexOf(amiPercent)
  if (pctIndex === -1) return null
  return limits[pctIndex]
}

/**
 * Maps tier keys to the corresponding Socrata field names in the Housing Connect dataset.
 */
export const TIER_TO_LOTTERY_FIELD: Record<string, string> = {
  ext_low: 'applied_income_ami_ext_low',
  very_low: 'applied_income_ami_very_low',
  low: 'applied_income_ami_low',
  moderate: 'applied_income_ami_moderate',
  middle: 'applied_income_ami_middle',
  above: 'applied_income_ami_above',
}
