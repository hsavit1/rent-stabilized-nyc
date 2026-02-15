import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { hpdViolationsOptions } from '../../data/nyc-open-data'
import type { HpdViolation } from '../../data/nyc-open-data'

function classBadge(cls: string) {
  switch (cls?.toUpperCase()) {
    case 'C':
      return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">C</span>
    case 'B':
      return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">B</span>
    case 'A':
      return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">A</span>
    default:
      return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-500/20 text-gray-500 border border-gray-500/30">{cls || '?'}</span>
  }
}

function formatDate(iso: string | undefined) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function HpdViolationsSection({ bbl }: { bbl: string }) {
  const [open, setOpen] = useState(false)
  const { data: violations, isPending, isError, error } = useQuery({
    ...hpdViolationsOptions(bbl),
    enabled: !!bbl && open,
  })

  const total = violations?.length ?? 0
  const openCount = violations?.filter((v: HpdViolation) => !v.currentstatus?.toUpperCase().includes('CLOSE')).length ?? 0
  const classC = violations?.filter((v: HpdViolation) => v.class?.toUpperCase() === 'C').length ?? 0
  const classB = violations?.filter((v: HpdViolation) => v.class?.toUpperCase() === 'B').length ?? 0
  const classA = violations?.filter((v: HpdViolation) => v.class?.toUpperCase() === 'A').length ?? 0

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-800/50 transition-colors cursor-pointer"
      >
        <div>
          <h3 className="font-semibold text-white">HPD Violations</h3>
          {open && violations && (
            <p className="text-xs text-gray-500 mt-1">
              {total} total &middot; {openCount} open &middot;{' '}
              <span className="text-red-400">{classC} Class C</span> &middot;{' '}
              <span className="text-amber-400">{classB} Class B</span> &middot;{' '}
              <span className="text-gray-400">{classA} Class A</span>
            </p>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-800">
          {isPending && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-amber-500" />
              <span className="ml-2 text-sm text-gray-400">Loading violations...</span>
            </div>
          )}

          {isError && (
            <div className="px-6 py-4 text-sm text-red-400">
              Failed to load violations: {(error as Error).message}
            </div>
          )}

          {violations && violations.length === 0 && (
            <div className="px-6 py-6 text-sm text-gray-500 text-center">
              No HPD violations found for this building.
            </div>
          )}

          {violations && violations.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {violations.map((v: HpdViolation) => (
                    <tr key={v.violationid} className="hover:bg-gray-800/30">
                      <td className="px-4 py-2 text-gray-400 whitespace-nowrap">{formatDate(v.inspectiondate)}</td>
                      <td className="px-4 py-2">{classBadge(v.class)}</td>
                      <td className="px-4 py-2 text-gray-300 max-w-md truncate">{v.novdescription || '—'}</td>
                      <td className="px-4 py-2 text-gray-400 whitespace-nowrap">{v.currentstatus || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
