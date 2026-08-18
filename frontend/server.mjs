import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), 'dist')
const parsed = Number.parseInt(String(process.env.PORT ?? '4173').replace(/[^\d]/g, ''), 10)
const port = Number.isFinite(parsed) && parsed > 0 ? parsed : 4173

const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function send(res, file, status = 200) {
  res.statusCode = status
  res.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream')
  createReadStream(file).pipe(res)
}

const server = createServer((req, res) => {
  const path = decodeURIComponent((req.url ?? '/').split('?')[0] || '/')
  const target = normalize(join(root, path === '/' ? 'index.html' : path))
  if (!target.startsWith(root)) {
    res.statusCode = 403
    res.end()
    return
  }
  if (existsSync(target) && statSync(target).isFile()) {
    send(res, target)
    return
  }
  send(res, join(root, 'index.html'))
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Kaka Motors public site listening on ${port}`)
})
