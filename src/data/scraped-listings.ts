import { createServerFn } from '@tanstack/react-start'
import { getDb } from '../lib/db'

export interface ScrapedListing {
  id: string
  source: 'craigslist' | 'leasebreak'
  external_id: string | null
  url: string
  title: string
  price: number | null
  bedrooms: number | null
  bathrooms: number | null
  sqft: number | null
  neighborhood: string | null
  borough: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  description: string | null
  image_urls: string[] | null
  lease_type: string | null
  lease_end_date: string | null
  available_date: string | null
  pet_friendly: boolean | null
  posted_at: string | null
  expires_at: string | null
  is_active: boolean
  last_seen_at: string
  affordability_score: number | null
  affordable_flag: boolean | null
  affordable_reason: string | null
  monthly_income_required: number | null
  curation_status: 'pending_review' | 'auto_approved' | 'approved' | 'rejected' | null
  curated_at: string | null
  created_at: string
  updated_at: string
}

export const getScrapedListings = createServerFn({ method: 'GET' })
  .inputValidator(
    (d: {
      source?: string
      borough?: string
      minPrice?: number
      maxPrice?: number
      bedrooms?: number
      onlyAffordable?: boolean
      limit?: number
      offset?: number
    }) => d,
  )
  .handler(async ({ data }) => {
    const sql = getDb()
    const limit = data.limit ?? 50
    const offset = data.offset ?? 0

    // Build dynamic query with filters
    const conditions: string[] = ['is_active = true']
    const params: unknown[] = []
    let paramIdx = 1

    const onlyAffordable = data.onlyAffordable ?? true
    if (onlyAffordable) {
      conditions.push('affordable_flag = true')
      conditions.push(`curation_status IN ('auto_approved', 'approved')`)
    }

    if (data.source) {
      conditions.push(`source = $${paramIdx++}`)
      params.push(data.source)
    }
    if (data.borough) {
      conditions.push(`borough = $${paramIdx++}`)
      params.push(data.borough)
    }
    if (data.minPrice != null) {
      conditions.push(`price >= $${paramIdx++}`)
      params.push(data.minPrice)
    }
    if (data.maxPrice != null) {
      conditions.push(`price <= $${paramIdx++}`)
      params.push(data.maxPrice)
    }
    if (data.bedrooms != null) {
      conditions.push(`bedrooms = $${paramIdx++}`)
      params.push(data.bedrooms)
    }

    const where = conditions.join(' AND ')
    params.push(limit, offset)

    const rows = await sql(
      `SELECT * FROM scraped_listing WHERE ${where} ORDER BY posted_at DESC NULLS LAST, created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx}`,
      params,
    )
    return rows as ScrapedListing[]
  })

export const getScrapedListingCount = createServerFn({ method: 'GET' }).handler(
  async () => {
    const sql = getDb()
    const rows = await sql`
      SELECT
        COUNT(*) FILTER (
          WHERE is_active
            AND affordable_flag = true
            AND curation_status IN ('auto_approved', 'approved')
        ) as active_count,
        COUNT(*) FILTER (
          WHERE source = 'craigslist'
            AND is_active
            AND affordable_flag = true
            AND curation_status IN ('auto_approved', 'approved')
        ) as craigslist_count,
        COUNT(*) FILTER (
          WHERE source = 'leasebreak'
            AND is_active
            AND affordable_flag = true
            AND curation_status IN ('auto_approved', 'approved')
        ) as leasebreak_count,
        COUNT(*) as total_count
      FROM scraped_listing
    `
    return rows[0] as {
      active_count: string
      craigslist_count: string
      leasebreak_count: string
      total_count: string
    }
  },
)
