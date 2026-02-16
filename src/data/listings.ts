import { createServerFn } from '@tanstack/react-start'
import { getDb } from '../lib/db'
import { getAuthSession } from '../lib/auth-session'
import type { ListingType, KanbanStatus } from '../types/kanban'

export interface SavedListing {
  id: string
  user_id: string
  url: string
  title: string
  listing_type: ListingType
  price: number | null
  bedrooms: number | null
  neighborhood: string | null
  borough: string | null
  notes: string
  status: KanbanStatus
  is_favorite: boolean
  priority: number | null
  created_at: string
  updated_at: string
}

export const getSavedListings = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await getAuthSession()
    if (!session?.user) return []
    const sql = getDb()
    const rows = await sql`
      SELECT * FROM saved_listing
      WHERE user_id = ${session.user.id}
      ORDER BY updated_at DESC
    `
    return rows as SavedListing[]
  },
)

export const createSavedListing = createServerFn({ method: 'POST' })
  .inputValidator(
    (d: {
      url: string
      title: string
      listingType: ListingType
      price?: number | null
      bedrooms?: number | null
      neighborhood?: string
      borough?: string
      notes?: string
    }) => d,
  )
  .handler(async ({ data }) => {
    const session = await getAuthSession()
    if (!session?.user) throw new Error('Unauthorized')
    const sql = getDb()
    const rows = await sql`
      INSERT INTO saved_listing (user_id, url, title, listing_type, price, bedrooms, neighborhood, borough, notes)
      VALUES (
        ${session.user.id},
        ${data.url},
        ${data.title},
        ${data.listingType},
        ${data.price ?? null},
        ${data.bedrooms ?? null},
        ${data.neighborhood ?? ''},
        ${data.borough ?? ''},
        ${data.notes ?? ''}
      )
      ON CONFLICT (user_id, url) DO UPDATE SET
        title = ${data.title},
        listing_type = ${data.listingType},
        price = COALESCE(${data.price ?? null}, saved_listing.price),
        bedrooms = COALESCE(${data.bedrooms ?? null}, saved_listing.bedrooms),
        neighborhood = CASE WHEN ${data.neighborhood !== undefined} THEN ${data.neighborhood ?? ''} ELSE saved_listing.neighborhood END,
        borough = CASE WHEN ${data.borough !== undefined} THEN ${data.borough ?? ''} ELSE saved_listing.borough END,
        notes = CASE WHEN ${data.notes !== undefined} THEN ${data.notes ?? ''} ELSE saved_listing.notes END,
        updated_at = now()
      RETURNING *
    `
    return rows[0] as SavedListing
  })

export const updateSavedListing = createServerFn({ method: 'POST' })
  .inputValidator(
    (d: {
      id: string
      status?: KanbanStatus
      title?: string
      price?: number | null
      bedrooms?: number | null
      neighborhood?: string
      borough?: string
      notes?: string
      isFavorite?: boolean
      priority?: number | null
    }) => d,
  )
  .handler(async ({ data }) => {
    const session = await getAuthSession()
    if (!session?.user) throw new Error('Unauthorized')
    const sql = getDb()
    const rows = await sql`
      UPDATE saved_listing SET
        status = COALESCE(${data.status ?? null}, status),
        title = COALESCE(${data.title ?? null}, title),
        price = CASE WHEN ${data.price !== undefined} THEN ${data.price ?? null} ELSE price END,
        bedrooms = CASE WHEN ${data.bedrooms !== undefined} THEN ${data.bedrooms ?? null} ELSE bedrooms END,
        neighborhood = CASE WHEN ${data.neighborhood !== undefined} THEN ${data.neighborhood ?? ''} ELSE neighborhood END,
        borough = CASE WHEN ${data.borough !== undefined} THEN ${data.borough ?? ''} ELSE borough END,
        notes = CASE WHEN ${data.notes !== undefined} THEN ${data.notes ?? ''} ELSE notes END,
        is_favorite = COALESCE(${data.isFavorite ?? null}, is_favorite),
        priority = CASE WHEN ${data.priority !== undefined} THEN ${data.priority ?? null} ELSE priority END,
        updated_at = now()
      WHERE id = ${data.id} AND user_id = ${session.user.id}
      RETURNING *
    `
    return rows[0] as SavedListing
  })

export const deleteSavedListing = createServerFn({ method: 'POST' })
  .inputValidator((d: string) => d)
  .handler(async ({ data: listingId }) => {
    const session = await getAuthSession()
    if (!session?.user) throw new Error('Unauthorized')
    const sql = getDb()
    await sql`
      DELETE FROM saved_listing
      WHERE id = ${listingId} AND user_id = ${session.user.id}
    `
    return { success: true }
  })

export const toggleListingFavorite = createServerFn({ method: 'POST' })
  .inputValidator((d: string) => d)
  .handler(async ({ data: listingId }) => {
    const session = await getAuthSession()
    if (!session?.user) throw new Error('Unauthorized')
    const sql = getDb()
    const rows = await sql`
      UPDATE saved_listing SET
        is_favorite = NOT is_favorite,
        updated_at = now()
      WHERE id = ${listingId} AND user_id = ${session.user.id}
      RETURNING *
    `
    return rows[0] as SavedListing
  })
