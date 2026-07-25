import { NextResponse } from 'next/server'

export const config = { matcher: ['/contentlocker', '/internal/:path*'] }

export function middleware(req) {
  const EXPIRES = '2026-07-07T00:00:00Z'
  if (new Date() >= new Date(EXPIRES)) {
    return new NextResponse(
      '<html><body style="font-family:monospace;padding:60px;text-align:center;color:#666"><h1>410</h1><p>This document has expired and self-destructed.</p></body></html>',
      { status: 410, headers: { 'Content-Type': 'text/html' } }
    )
  }

  const header = req.headers.get('authorization')
  const USER = process.env.DOC_USER
  const PASS = process.env.DOC_PASS

  if (header?.startsWith('Basic ')) {
    const decoded = atob(header.slice(6))
    const sep = decoded.indexOf(':')
    const user = decoded.slice(0, sep)
    const pass = decoded.slice(sep + 1)
    if (user === USER && pass === PASS && USER && PASS) {
      const res = NextResponse.next()
      res.headers.set('X-Robots-Tag', 'noindex, nofollow')
      res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
      return res
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Internal", charset="UTF-8"',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}
