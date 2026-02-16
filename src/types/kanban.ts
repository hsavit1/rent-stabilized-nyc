export const KANBAN_STATUSES = ['interested', 'contacted', 'visited', 'applied', 'dismissed'] as const
export type KanbanStatus = (typeof KANBAN_STATUSES)[number]

export const KANBAN_COLUMNS = [
  { status: 'interested' as const, label: 'Interested', color: 'blue' },
  { status: 'contacted' as const, label: 'Contacted', color: 'cyan' },
  { status: 'visited' as const, label: 'Visited', color: 'green' },
  { status: 'applied' as const, label: 'Applied', color: 'purple' },
] as const

export const LISTING_TYPES = ['craigslist', 'leasebreak', 'other'] as const
export type ListingType = (typeof LISTING_TYPES)[number]

export interface KanbanItem {
  id: string
  kind: 'building' | 'listing'
  status: KanbanStatus
  title: string
  subtitle?: string
  is_favorite: boolean
  priority: number | null
  rating: number | null
  notes: string
  updated_at: string
  // Building-specific
  building_id?: string
  borough?: string
  zipcode?: string
  stabilized_units?: number | null
  // Listing-specific
  url?: string
  listing_type?: ListingType
  price?: number | null
  bedrooms?: number | null
  neighborhood?: string
}
