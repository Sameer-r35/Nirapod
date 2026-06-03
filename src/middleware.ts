import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // block direct API abuse on search
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    // admin is protected server-side by phone check
    // middleware just ensures no caching
    const res = NextResponse.next()
    res.headers.set('Cache-Control', 'no-store')
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/report/:path*'],
}