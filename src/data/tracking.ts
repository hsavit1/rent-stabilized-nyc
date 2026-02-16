import { createServerFn } from '@tanstack/react-start'
import { getDb } from '../lib/db'
import { getAuthSession } from '../lib/auth-session'

export interface BuildingTracking {
  id: string
  user_id: string
  building_id: string
  status: string
  is_favorite: boolean
  visited_date: string | null
  notes: string
  rating: number | null
  priority: number | null
  created_at: string
  updated_at: string
}

export const getTrackedBuildings = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await getAuthSession()
    if (!session?.user) return []
    const sql = getDb()
    const rows = await sql`
      SELECT * FROM building_tracking
      WHERE user_id = ${session.user.id}
      ORDER BY updated_at DESC
    `
    return rows as BuildingTracking[]
  },
)

export const getBuildingTracking = createServerFn({ method: 'GET' })
  .inputValidator((d: string) => d)
  .handler(async ({ data: buildingId }) => {
    const session = await getAuthSession()
    if (!session?.user) return null
    const sql = getDb()
    const rows = await sql`
      SELECT * FROM building_tracking
      WHERE user_id = ${session.user.id} AND building_id = ${buildingId}
      LIMIT 1
    `
    return (rows[0] as BuildingTracking) ?? null
  })

export const upsertBuildingTracking = createServerFn({ method: 'POST' })
  .inputValidator(
    (d: {
      buildingId: string
      status?: string
      isFavorite?: boolean
      visitedDate?: string | null
      notes?: string
      rating?: number | null
      priority?: number | null
    }) => d,
  )
  .handler(async ({ data }) => {
    const session = await getAuthSession()
    if (!session?.user) throw new Error('Unauthorized')
    const sql = getDb()
    const rows = await sql`
      INSERT INTO building_tracking (user_id, building_id, status, is_favorite, visited_date, notes, rating, priority)
      VALUES (
        ${session.user.id},
        ${data.buildingId},
        ${data.status ?? 'interested'},
        ${data.isFavorite ?? false},
        ${data.visitedDate ?? null},
        ${data.notes ?? ''},
        ${data.rating ?? null},
        ${data.priority ?? null}
      )
      ON CONFLICT (user_id, building_id) DO UPDATE SET
        status = COALESCE(${data.status ?? null}, building_tracking.status),
        is_favorite = COALESCE(${data.isFavorite ?? null}, building_tracking.is_favorite),
        visited_date = CASE WHEN ${data.visitedDate !== undefined} THEN ${data.visitedDate ?? null} ELSE building_tracking.visited_date END,
        notes = CASE WHEN ${data.notes !== undefined} THEN ${data.notes ?? ''} ELSE building_tracking.notes END,
        rating = CASE WHEN ${data.rating !== undefined} THEN ${data.rating ?? null} ELSE building_tracking.rating END,
        priority = CASE WHEN ${data.priority !== undefined} THEN ${data.priority ?? null} ELSE building_tracking.priority END,
        updated_at = now()
      RETURNING *
    `
    return rows[0] as BuildingTracking
  })

export const deleteBuildingTracking = createServerFn({ method: 'POST' })
  .inputValidator((d: string) => d)
  .handler(async ({ data: buildingId }) => {
    const session = await getAuthSession()
    if (!session?.user) throw new Error('Unauthorized')
    const sql = getDb()
    await sql`
      DELETE FROM building_tracking
      WHERE user_id = ${session.user.id} AND building_id = ${buildingId}
    `
    return { success: true }
  })

export const toggleFavorite = createServerFn({ method: 'POST' })
  .inputValidator((d: string) => d)
  .handler(async ({ data: buildingId }) => {
    const session = await getAuthSession()
    if (!session?.user) throw new Error('Unauthorized')
    const sql = getDb()
    const rows = await sql`
      INSERT INTO building_tracking (user_id, building_id, is_favorite)
      VALUES (${session.user.id}, ${buildingId}, true)
      ON CONFLICT (user_id, building_id) DO UPDATE SET
        is_favorite = NOT building_tracking.is_favorite,
        updated_at = now()
      RETURNING *
    `
    return rows[0] as BuildingTracking
  })
