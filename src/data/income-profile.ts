import { createServerFn } from '@tanstack/react-start'
import { getDb } from '../lib/db'
import { getAuthSession } from '../lib/auth-session'

export interface IncomeProfile {
  id: string
  user_id: string
  household_size: number
  annual_income: number
  created_at: string
  updated_at: string
}

export const getIncomeProfile = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await getAuthSession()
    if (!session?.user) return null
    const sql = getDb()
    const rows = await sql`
      SELECT * FROM user_income_profile
      WHERE user_id = ${session.user.id}
      LIMIT 1
    `
    return (rows[0] as IncomeProfile) ?? null
  },
)

export const upsertIncomeProfile = createServerFn({ method: 'POST' })
  .inputValidator(
    (d: { householdSize: number; annualIncome: number }) => d,
  )
  .handler(async ({ data }) => {
    const session = await getAuthSession()
    if (!session?.user) throw new Error('Unauthorized')
    const sql = getDb()
    const rows = await sql`
      INSERT INTO user_income_profile (user_id, household_size, annual_income)
      VALUES (${session.user.id}, ${data.householdSize}, ${data.annualIncome})
      ON CONFLICT (user_id) DO UPDATE SET
        household_size = ${data.householdSize},
        annual_income = ${data.annualIncome},
        updated_at = now()
      RETURNING *
    `
    return rows[0] as IncomeProfile
  })
