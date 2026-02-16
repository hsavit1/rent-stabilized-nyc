import { queryOptions } from '@tanstack/react-query'
import { getSavedListings } from './listings'

export function savedListingsOptions() {
  return queryOptions({
    queryKey: ['saved-listings'],
    queryFn: () => getSavedListings(),
  })
}
