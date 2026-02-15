import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import type { Building } from '../types'
import { getStreetEasySearchUrl } from '../data/links'

type SortKey = 'a' | 'su' | 'yb' | 'fl' | 'z'
type SortDir = 'asc' | 'desc'

const PAGE_SIZE = 50

export function BuildingTable({ buildings }: { buildings: Building[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('su')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(0)

  const sorted = useMemo(() => {
    const arr = [...buildings]
    arr.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'a': cmp = a.a.localeCompare(b.a); break
        case 'su': cmp = (a.su || 0) - (b.su || 0); break
        case 'yb': cmp = (a.yb || 0) - (b.yb || 0); break
        case 'fl': cmp = (a.fl || 0) - (b.fl || 0); break
        case 'z': cmp = a.z.localeCompare(b.z); break
      }
      return sortDir === 'desc' ? -cmp : cmp
    })
    return arr
  }, [buildings, sortKey, sortDir])

  const pageCount = Math.ceil(sorted.length / PAGE_SIZE)
  const pageData = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(key === 'a' || key === 'z' ? 'asc' : 'desc')
    }
    setPage(0)
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-gray-700 ml-1">&#8645;</span>
    return <span className="text-amber-400 ml-1">{sortDir === 'asc' ? '&#8593;' : '&#8595;'}</span>
  }

  return (
    <div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th
                  className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300 select-none"
                  onClick={() => toggleSort('a')}
                >
                  Address <SortIcon col="a" />
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300 select-none"
                  onClick={() => toggleSort('z')}
                >
                  Zip <SortIcon col="z" />
                </th>
                <th
                  className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300 select-none"
                  onClick={() => toggleSort('su')}
                >
                  Stabilized Units <SortIcon col="su" />
                </th>
                <th
                  className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300 select-none hidden sm:table-cell"
                  onClick={() => toggleSort('fl')}
                >
                  Floors <SortIcon col="fl" />
                </th>
                <th
                  className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300 select-none hidden md:table-cell"
                  onClick={() => toggleSort('yb')}
                >
                  Year Built <SortIcon col="yb" />
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Owner
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {pageData.map(b => (
                <tr key={b.i} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to="/building/$buildingId"
                        params={{ buildingId: b.i }}
                        className="text-amber-400 hover:text-amber-300 hover:underline font-medium"
                      >
                        {b.a}
                      </Link>
                      <a
                        href={getStreetEasySearchUrl(b.a, b.z)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Search on StreetEasy"
                        className="text-gray-600 hover:text-amber-400 transition-colors shrink-0"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{b.z}</td>
                  <td className="px-4 py-3 text-right font-medium text-white">
                    {b.su?.toLocaleString() ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 hidden sm:table-cell">
                    {b.fl ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 hidden md:table-cell">
                    {b.yb ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[200px] hidden lg:table-cell">
                    {b.o || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-sm bg-gray-900 border border-gray-800 rounded-md text-gray-400 hover:text-white hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page + 1} of {pageCount}
            </span>
            <button
              disabled={page >= pageCount - 1}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-sm bg-gray-900 border border-gray-800 rounded-md text-gray-400 hover:text-white hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
