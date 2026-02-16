import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { betterAuth } from 'better-auth'
import { Pool } from '@neondatabase/serverless'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const clientDir = join(__dirname, 'dist', 'client')

// Initialize Better Auth directly so it handles /api/auth/* before TanStack Start
const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  emailAndPassword: { enabled: true },
  trustedOrigins: process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : [],
  socialProviders: process.env.GOOGLE_CLIENT_ID
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {},
})

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.zip': 'application/zip',
}

async function tryServeStatic(pathname) {
  try {
    const filePath = join(clientDir, pathname)
    // Prevent directory traversal
    if (!filePath.startsWith(clientDir)) return null
    const data = await readFile(filePath)
    const ext = extname(filePath)
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'
    const cacheControl = pathname.startsWith('/assets/')
      ? 'public, max-age=31536000, immutable'
      : pathname.startsWith('/data/')
        ? 'public, max-age=86400'
        : 'public, max-age=0'
    return { data, contentType, cacheControl }
  } catch {
    return null
  }
}

async function main() {
  const serverModule = await import('./dist/server/server.js')
  const app = serverModule.default

  const server = createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

    // Try serving static files first
    const staticFile = await tryServeStatic(url.pathname)
    if (staticFile) {
      res.writeHead(200, {
        'Content-Type': staticFile.contentType,
        'Content-Length': staticFile.data.length,
        'Cache-Control': staticFile.cacheControl,
      })
      res.end(staticFile.data)
      return
    }

    // Convert Node.js request to Web Request
    const headers = new Headers()
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value)
    }

    const body = req.method !== 'GET' && req.method !== 'HEAD'
      ? await new Promise((resolve) => {
          const chunks = []
          req.on('data', (chunk) => chunks.push(chunk))
          req.on('end', () => resolve(Buffer.concat(chunks)))
        })
      : undefined

    const webRequest = new Request(url.toString(), {
      method: req.method,
      headers,
      body,
      duplex: 'half',
    })

    try {
      // Route /api/auth/* to Better Auth before TanStack Start
      const webResponse = url.pathname.startsWith('/api/auth')
        ? await auth.handler(webRequest)
        : await app.fetch(webRequest)

      res.writeHead(webResponse.status, Object.fromEntries(webResponse.headers.entries()))

      if (webResponse.body) {
        const reader = webResponse.body.getReader()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          res.write(value)
        }
      }
      res.end()
    } catch (err) {
      console.error('Server error:', err)
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('Internal Server Error')
    }
  })

  const port = parseInt(process.env.PORT || '3000', 10)
  server.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`)
  })
}

main().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
