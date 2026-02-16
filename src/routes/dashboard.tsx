import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSession } from '../lib/auth-client'
import { DashboardView } from '../components/dashboard/DashboardView'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const navigate = useNavigate()
  const { data: session, isPending: sessionLoading } = useSession()

  if (!sessionLoading && !session?.user) {
    navigate({ to: '/login' })
    return null
  }

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500" />
        <span className="ml-3 text-gray-400">Loading dashboard...</span>
      </div>
    )
  }

  return <DashboardView />
}
