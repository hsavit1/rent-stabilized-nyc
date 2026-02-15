import type { Building } from '../types'

const cache = new Map<string, Building[]>()

export async function fetchBoroughData(slug: string): Promise<Building[]> {
  if (cache.has(slug)) return cache.get(slug)!
  const res = await fetch(`/data/${slug}.json`)
  if (!res.ok) throw new Error(`Failed to load ${slug} data`)
  const data: Building[] = await res.json()
  cache.set(slug, data)
  return data
}

export async function fetchAllData(): Promise<Building[]> {
  if (cache.has('all')) return cache.get('all')!
  const res = await fetch('/data/all.json')
  if (!res.ok) throw new Error('Failed to load data')
  const data: Building[] = await res.json()
  cache.set('all', data)
  return data
}
