import { NextResponse } from 'next/server'

export const config = { matcher: ['/internal/:path*'] }

export function middleware(req) {
  const EXPIRES = '2026-08-15T06:00:00Z'
  if (new Date() >= new Date(EXPIRES)) {
    return new NextResponse(
      '<html><body style="font-family:monospace;padding:60px;text-align:center;color:#666"><h1>410</h1><p>This document has expired and self-destructed.</p></body></html>',
      { status: 410, headers: { 'Content-Type': 'text/html' } }
    )
  }

  const res = NextResponse.next()
  res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  return res
}
