import { queryOptions } from '@tanstack/react-query'
import { getScrapedListings, getScrapedListingCount } from './scraped-listings'

export function scrapedListingsOptions(filters: {
  source?: string
  borough?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  onlyAffordable?: boolean
  limit?: number
  offset?: number
} = {}) {
  return queryOptions({
    queryKey: ['scraped-listings', filters],
    queryFn: () => getScrapedListings({ data: filters }),
  })
}

export function scrapedListingCountOptions() {
  return queryOptions({
    queryKey: ['scraped-listing-count'],
    queryFn: () => getScrapedListingCount(),
  })
}
