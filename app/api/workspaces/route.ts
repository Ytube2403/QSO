import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { name } = await request.json()

        if (!name || typeof name !== 'string') {
            return NextResponse.json({ error: 'Invalid workspace name' }, { status: 400 })
        }

        // Insert workspace
        const { data: workspace, error: workspaceError } = await supabase
            .from('workspaces')
            .insert({
                name,
                owner_id: user.id
            })
            .select()
            .single()

        if (workspaceError) {
            return NextResponse.json({ error: workspaceError.message }, { status: 500 })
        }

        // Insert owner into workspace_members
        const { error: memberError } = await supabase
            .from('workspace_members')
            .insert({
                workspace_id: workspace.id,
                user_id: user.id,
                role: 'owner'
            })

        if (memberError) {
            // In production, might want to rollback workspace creation here
            return NextResponse.json({ error: memberError.message }, { status: 500 })
        }

        return NextResponse.json(workspace, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Since RLS is active, we can just select all workspaces
        // The policy "Workspaces are viewable by owner" and "Workspaces are viewable by members" will filter properly
        const { data: workspaces, error } = await supabase
            .from('workspaces')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(workspaces)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
