import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dobPermitsOptions } from '../../data/nyc-open-data'
import type { DobPermit } from '../../data/nyc-open-data'

function formatDate(iso: string | undefined) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function DobPermitsSection({ bbl }: { bbl: string }) {
  const [open, setOpen] = useState(false)
  const { data: permits, isPending, isError, error } = useQuery({
    ...dobPermitsOptions(bbl),
    enabled: !!bbl && open,
  })

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-800/50 transition-colors cursor-pointer"
      >
        <div>
          <h3 className="font-semibold text-white">DOB Permits</h3>
          {open && permits && (
            <p className="text-xs text-gray-500 mt-1">
              {permits.length} permit{permits.length !== 1 ? 's' : ''} found
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
              <span className="ml-2 text-sm text-gray-400">Loading permits...</span>
            </div>
          )}

          {isError && (
            <div className="px-6 py-4 text-sm text-red-400">
              Failed to load permits: {(error as Error).message}
            </div>
          )}

          {permits && permits.length === 0 && (
            <div className="px-6 py-6 text-sm text-gray-500 text-center">
              No DOB permits found for this building.
            </div>
          )}

          {permits && permits.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Filing Date</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Job Type</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Applicant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {permits.map((p: DobPermit, idx: number) => (
                    <tr key={`${p.filing_date}-${p.job_type}-${idx}`} className="hover:bg-gray-800/30">
                      <td className="px-4 py-2 text-gray-400 whitespace-nowrap">{formatDate(p.filing_date)}</td>
                      <td className="px-4 py-2 text-gray-300 whitespace-nowrap">
                        {p.job_type ?? '—'}
                      </td>
                      <td className="px-4 py-2 text-gray-400 whitespace-nowrap">{p.filing_status || '—'}</td>
                      <td className="px-4 py-2 text-gray-400 hidden md:table-cell truncate max-w-[200px]">
                        {[p.applicant_first_name, p.applicant_last_name].filter(Boolean).join(' ') || '—'}
                      </td>
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
