import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { hpdRegistrationsOptions } from '../../data/nyc-open-data'
import type { HpdContact } from '../../data/nyc-open-data'

function formatDate(iso: string | undefined) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatAddress(c: HpdContact) {
  const parts = [
    c.businesshousenumber,
    c.businessstreetname,
    c.businessapartment ? `Apt ${c.businessapartment}` : '',
  ].filter(Boolean).join(' ')
  const city = [c.businesscity, c.businessstate, c.businesszip].filter(Boolean).join(', ')
  if (!parts && !city) return '—'
  return city ? `${parts}, ${city}` : parts
}

export function HpdRegistrationsSection({ bbl }: { bbl: string }) {
  const [open, setOpen] = useState(false)
  const { data, isPending, isError, error } = useQuery({
    ...hpdRegistrationsOptions(bbl),
    enabled: !!bbl && open,
  })

  const latestDate = data?.registrations?.[0]?.registrationenddate

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-800/50 transition-colors cursor-pointer"
      >
        <div>
          <h3 className="font-semibold text-white">Registration & Contacts</h3>
          {open && latestDate && (
            <p className="text-xs text-gray-500 mt-1">
              Latest registration: {formatDate(latestDate)}
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
              <span className="ml-2 text-sm text-gray-400">Loading registrations...</span>
            </div>
          )}

          {isError && (
            <div className="px-6 py-4 text-sm text-red-400">
              Failed to load registrations: {(error as Error).message}
            </div>
          )}

          {data && data.contacts.length === 0 && (
            <div className="px-6 py-6 text-sm text-gray-500 text-center">
              No HPD registration contacts found for this building.
            </div>
          )}

          {data && data.contacts.length > 0 && (
            <div className="divide-y divide-gray-800/50">
              {data.contacts.map((c: HpdContact) => {
                const name = c.corporationname || [c.firstname, c.lastname].filter(Boolean).join(' ') || '—'
                return (
                  <div key={c.registrationcontactid} className="px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <span className="text-xs font-medium text-amber-400 uppercase w-24 shrink-0">
                      {c.contactdescription || c.type || 'Contact'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-200">{name}</div>
                      <div className="text-xs text-gray-500 truncate">{formatAddress(c)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
