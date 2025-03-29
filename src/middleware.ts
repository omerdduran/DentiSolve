import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value

    if (!token && !request.nextUrl.pathname.startsWith('/')) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Token'ı API isteklerine ekleyin
    if (request.nextUrl.pathname.startsWith('/api/')) {
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('Authorization', `Bearer ${token}`)

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/protected/:path*'],
}
