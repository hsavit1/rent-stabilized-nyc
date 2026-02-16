import { auth } from './auth'
import { getRequestHeader } from '@tanstack/react-start/server'

export async function getAuthSession() {
  const headers = new Headers()
  const cookie = getRequestHeader('cookie')
  if (cookie) headers.set('cookie', cookie)
  const session = await auth.api.getSession({ headers })
  return session
}
