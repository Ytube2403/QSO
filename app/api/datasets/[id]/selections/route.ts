import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request, context: unknown) {
    try {
        const { params } = context as { params: Promise<{ id: string }> }
        const { id: datasetId } = await params

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { selections } = await request.json()

        if (!selections || !Array.isArray(selections)) {
            return NextResponse.json({ error: 'Invalid selections array' }, { status: 400 })
        }

        const insertPayload = selections.map((sel: any) => ({
            dataset_id: datasetId,
            keyword_id: sel.keyword_id,
            notes: sel.note || '',
            tags: sel.tags || []
        }))

        // Upsert to handle unique dataset_id + keyword_id constraint implicitly
        // Supabase JS takes an 'onConflict' parameter for upsert.
        const { data, error } = await supabase
            .from('selections')
            .upsert(insertPayload, { onConflict: 'dataset_id,keyword_id' })

        if (error) {
            console.error(error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, count: selections.length })

    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function GET(request: Request, context: unknown) {
    try {
        const { params } = context as { params: Promise<{ id: string }> }
        const { id: datasetId } = await params
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data: selections, error } = await supabase
            .from('selections')
            .select('*, keywords!inner(keyword)')
            .eq('dataset_id', datasetId)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(selections)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
