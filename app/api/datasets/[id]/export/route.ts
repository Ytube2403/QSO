import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'
import { sanitizeForExport } from '@/lib/utils'

export async function GET(request: Request, context: unknown) {
    try {
        const { params } = context as { params: Promise<{ id: string }> }
        const { id: datasetId } = await params

        const { searchParams } = new URL(request.url)
        const format = searchParams.get('format') || 'csv'

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Auth validated implicitly by RLS. Fetch selected keywords.
        const { data: selections, error: selError } = await supabase
            .from('selections')
            .select('*, keywords(*)')
            .eq('dataset_id', datasetId)

        if (selError) {
            return NextResponse.json({ error: 'Failed to fetch selections' }, { status: 500 })
        }

        if (!selections || selections.length === 0) {
            return NextResponse.json({ error: 'No keywords selected to export' }, { status: 400 })
        }

        // Flatten data for export and apply sanitization
        const exportData = selections.map((sel: any) => {
            const kw = sel.keywords
            const row: Record<string, any> = {
                Keyword: sanitizeForExport(kw.keyword),
                Volume: sanitizeForExport(kw.volume),
                Difficulty: sanitizeForExport(kw.difficulty),
                KEI: sanitizeForExport(kw.kei),
                'My Rank': sanitizeForExport(kw.my_rank),
                'Relevancy Score': sanitizeForExport(kw.relevancy_score),
                'Total Score': sanitizeForExport(kw.total_score),
                Tags: sanitizeForExport((sel.tags || []).join(', ')),
                Notes: sanitizeForExport(sel.notes),
            }

            // Handle competitor ranks dynamically
            if (kw.competitor_ranks) {
                Object.keys(kw.competitor_ranks).forEach(comp => {
                    row[`Rank - ${comp}`] = sanitizeForExport(kw.competitor_ranks[comp])
                })
            }

            return row
        })

        // Create workbook using SheetJS
        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Keywords')

        let fileBuffer: any
        let contentType = ''
        let extension = ''

        if (format === 'xlsx') {
            fileBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            extension = 'xlsx'
        } else {
            fileBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'csv' })
            contentType = 'text/csv'
            extension = 'csv'
        }

        const filename = `dataset_${datasetId}_export.${extension}`

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        })

    } catch (error) {
        console.error("Export Error:", error)
        return NextResponse.json({ error: 'Internal server error while exporting' }, { status: 500 })
    }
}
