import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DEFAULT_PRESET_CONFIG = {
    filters: {},
    relevancy: { minTopCount: 2, n: 20 },
    weights: { rel: 0.5, vol: 0.5, kei: 0, diff: 2, rank: 0 }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { name, workspace_id, config } = await request.json()

        if (!name || typeof name !== 'string' || !workspace_id) {
            return NextResponse.json({ error: 'Invalid preset data' }, { status: 400 })
        }

        // Insert preset
        const { data: preset, error } = await supabase
            .from('presets')
            .insert({
                name,
                workspace_id,
                config: config || DEFAULT_PRESET_CONFIG,
                created_by: user.id
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(preset, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Extract workspace ID from query params
        const { searchParams } = new URL(request.url)
        const workspaceId = searchParams.get('workspaceId')

        if (!workspaceId) {
            return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 })
        }

        const { data: presets, error } = await supabase
            .from('presets')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(presets)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
