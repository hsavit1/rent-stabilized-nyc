export const BOROUGHS = [
  { name: 'Manhattan', slug: 'manhattan', code: 'MN', color: '#f59e0b' },
  { name: 'Brooklyn', slug: 'brooklyn', code: 'BK', color: '#3b82f6' },
  { name: 'Bronx', slug: 'bronx', code: 'BX', color: '#ef4444' },
  { name: 'Queens', slug: 'queens', code: 'QN', color: '#10b981' },
  { name: 'Staten Island', slug: 'staten-island', code: 'SI', color: '#8b5cf6' },
] as const

export function getBoroughBySlug(slug: string) {
  return BOROUGHS.find(b => b.slug === slug)
}

export function getBoroughSlug(name: string) {
  return BOROUGHS.find(b => b.name === name)?.slug ?? name.toLowerCase().replace(' ', '-')
}
