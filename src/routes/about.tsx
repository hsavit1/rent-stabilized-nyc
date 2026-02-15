import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">About This Project</h1>

      <div className="space-y-8 text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">What is Rent Stabilization?</h2>
          <p>
            Rent stabilization is a system that limits rent increases for tenants in certain
            buildings in New York City. It applies to buildings with six or more units built
            between February 1, 1947 and December 31, 1973, as well as buildings that received
            certain tax benefits (like 421-a or J-51).
          </p>
          <p className="mt-3">
            Rent-stabilized tenants have the right to renew their leases, and their rent
            increases are limited to rates set annually by the NYC Rent Guidelines Board.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Data Sources</h2>
          <p>This website compiles data from multiple public sources:</p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-gray-400">
            <li>
              <span className="text-gray-300">NYC Rent Guidelines Board</span> — Annual tax
              commission data on rent-stabilized unit counts per building (2007–2017)
            </li>
            <li>
              <span className="text-gray-300">NYC Department of Finance RPIE filings</span> — Updated
              unit counts from property owner filings (2018–2023)
            </li>
            <li>
              <span className="text-gray-300">DHCR Building Lists</span> — Division of Housing and
              Community Renewal's official registered building lists by borough
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Important Disclaimers</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-gray-400">
            <ul className="space-y-3">
              <li>
                This is <strong className="text-gray-300">not an official government website</strong>.
                Data is compiled from public sources and may not reflect current conditions.
              </li>
              <li>
                Building counts represent <strong className="text-gray-300">tax lot registrations</strong>,
                not individual apartment units available for rent.
              </li>
              <li>
                Some buildings may have been <strong className="text-gray-300">deregulated</strong> since
                the data was collected. Always verify with the building management or DHCR.
              </li>
              <li>
                Unit counts are <strong className="text-gray-300">estimates</strong> based on
                tax filings and may not reflect actual stabilized unit counts.
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Know Your Rights</h2>
          <p>
            If you live in a rent-stabilized apartment, you have important protections under
            NYC and NYS law. For more information:
          </p>
          <ul className="mt-3 space-y-2">
            <li>
              <a
                href="https://hcr.ny.gov/rent-stabilization-and-rent-control"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 hover:underline"
              >
                NYS Homes & Community Renewal (HCR)
              </a>
            </li>
            <li>
              <a
                href="https://rentguidelinesboard.cityofnewyork.us/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 hover:underline"
              >
                NYC Rent Guidelines Board
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
