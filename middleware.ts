import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// In-memory rudimentary rate limiter (resets upon Vercel edge container spin-down)
const rateLimitMap = new Map<string, { count: number, timestamp: number }>()

function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
    const now = Date.now()
    const record = rateLimitMap.get(ip)

    if (!record) {
        rateLimitMap.set(ip, { count: 1, timestamp: now })
        return true
    }

    if (now - record.timestamp > windowMs) {
        rateLimitMap.set(ip, { count: 1, timestamp: now })
        return true
    }

    if (record.count >= limit) {
        return false
    }

    rateLimitMap.set(ip, { count: record.count + 1, timestamp: record.timestamp })
    return true
}

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (
        !user &&
        request.nextUrl.pathname.startsWith('/app')
    ) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Rate limiting execution for heavy API endpoints
    const isImportApi = request.nextUrl.pathname === '/api/datasets/import'
    const isExportApi = request.nextUrl.pathname.match(/^\/api\/datasets\/[^/]+\/export$/)

    if (isImportApi || isExportApi) {
        const ip = request.headers.get('x-forwarded-for') || 'unknown-ip'
        // Max 5 requests per 1 minute window for these heavy endpoints
        const allowed = checkRateLimit(ip, 5, 60000)

        if (!allowed) {
            return NextResponse.json(
                { error: 'Too Many Requests' },
                { status: 429, headers: { 'Retry-After': '60' } }
            )
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
