import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'
import { auth } from './lib/auth'

const startHandler = createStartHandler(defaultStreamHandler)

export default {
  async fetch(request: Request, ...args: Array<unknown>) {
    const url = new URL(request.url)

    // Route /api/auth/* to Better Auth
    if (url.pathname.startsWith('/api/auth')) {
      return auth.handler(request)
    }

    return startHandler(request, ...(args as []))
  },
}
