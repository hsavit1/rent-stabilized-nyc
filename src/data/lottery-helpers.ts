import type { HousingConnectLottery } from './nyc-open-data'

export function isActive(lottery: HousingConnectLottery): boolean {
  return lottery.lottery_status?.toLowerCase().includes('active')
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function bedroomBreakdown(lottery: HousingConnectLottery): string | null {
  const beds = [
    { label: 'Studio', count: lottery.unit_distribution_studio },
    { label: '1BR', count: lottery.unit_distribution_1bed },
    { label: '2BR', count: lottery.unit_distribution_2bed },
    { label: '3BR', count: lottery.unit_distribution_3bed },
    { label: '4BR', count: lottery.unit_distribution_4bed },
  ].filter(b => b.count && Number(b.count) > 0)
  if (beds.length === 0) return null
  return beds.map(b => `${b.count} ${b.label}`).join(' · ')
}

export function incomeTiers(lottery: HousingConnectLottery) {
  return [
    { label: 'Extremely Low (≤30% AMI)', key: 'ext_low', count: Number(lottery.applied_income_ami_ext_low) || 0 },
    { label: 'Very Low (31-50% AMI)', key: 'very_low', count: Number(lottery.applied_income_ami_very_low) || 0 },
    { label: 'Low (51-80% AMI)', key: 'low', count: Number(lottery.applied_income_ami_low) || 0 },
    { label: 'Moderate (81-120% AMI)', key: 'moderate', count: Number(lottery.applied_income_ami_moderate) || 0 },
    { label: 'Middle (121-165% AMI)', key: 'middle', count: Number(lottery.applied_income_ami_middle) || 0 },
    { label: 'Above (>165% AMI)', key: 'above', count: Number(lottery.applied_income_ami_above) || 0 },
  ].filter(t => t.count > 0)
}

export function preferences(lottery: HousingConnectLottery) {
  return [
    { label: 'Community Board', pct: Number(lottery.lottery_community_board_percent) || 0 },
    { label: 'NYCHA Residents', pct: Number(lottery.lottery_nycha_percent) || 0 },
    { label: 'Municipal Employees / Veterans', pct: Number(lottery.lottery_municipal_employee_percent) || 0 },
    { label: 'Mobility Disability', pct: Number(lottery.lottery_mobility_percent) || 0 },
    { label: 'Vision / Hearing Disability', pct: Number(lottery.lottery_vision_hearing_percent) || 0 },
    { label: 'Seniors (62+)', pct: Number(lottery.lottery_62_percent) || 0 },
  ].filter(p => p.pct > 0)
}

// NEW helpers

export function daysRemaining(endDate: string | undefined): number | null {
  if (!endDate) return null
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function isEligible(lottery: HousingConnectLottery, amiTierKey: string | null): boolean {
  if (!amiTierKey) return false
  const TIER_TO_FIELD: Record<string, keyof HousingConnectLottery> = {
    ext_low: 'applied_income_ami_ext_low',
    very_low: 'applied_income_ami_very_low',
    low: 'applied_income_ami_low',
    moderate: 'applied_income_ami_moderate',
    middle: 'applied_income_ami_middle',
    above: 'applied_income_ami_above',
  }
  const field = TIER_TO_FIELD[amiTierKey]
  if (!field) return false
  const val = Number(lottery[field]) || 0
  return val > 0
}
