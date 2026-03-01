import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'
import { sanitizeForExport } from '@/lib/utils'
import { logAuditAction } from '@/lib/audit'

export async function POST(request: Request, context: unknown) {
    try {
        const { params } = context as { params: Promise<{ id: string }> }
        const { id: datasetId } = await params

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { format = 'xlsx', scope = 'selected', keywordIds = [], presetId = null } = body

        // Fetch dataset info for audit logging
        const { data: dataset } = await supabase
            .from('datasets')
            .select('workspace_id, name')
            .eq('id', datasetId)
            .single()

        // Fetch Keywords
        let keywordsData: any[] = []
        if (scope === 'selected') {
            // Only fetch selected (will join with selections table)
            const { data: selections, error: selError } = await supabase
                .from('selections')
                .select('*, keywords(*)')
                .eq('dataset_id', datasetId)

            if (selError) throw selError

            // Map selections to structure we expect
            keywordsData = (selections || []).map((sel: any) => ({
                ...sel.keywords,
                tags: sel.tags,
                note: sel.note
            }))
        } else if (scope === 'filtered') {
            // Fetch the specific keyword IDs passed from the frontend (which represents the filtered table state)
            if (!keywordIds || keywordIds.length === 0) {
                return NextResponse.json({ error: 'No keywords provided for filtered export' }, { status: 400 })
            }

            // Chunk in case of thousands of IDs
            const chunkSize = 1000
            for (let i = 0; i < keywordIds.length; i += chunkSize) {
                const chunk = keywordIds.slice(i, i + chunkSize)
                const { data: kws, error: kwError } = await supabase
                    .from('keywords')
                    .select('*')
                    .in('id', chunk)

                if (kwError) throw kwError
                keywordsData = [...keywordsData, ...(kws || [])]
            }

            // Also join with selections if they exist for these keywords to include tags/notes
            const kwIdsStr = keywordsData.map(k => k.id)
            const { data: sels } = await supabase
                .from('selections')
                .select('*')
                .in('keyword_id', kwIdsStr)

            const selMap = new Map((sels || []).map(s => [s.keyword_id, s]))

            keywordsData = keywordsData.map(kw => {
                const s = selMap.get(kw.id) as any
                return {
                    ...kw,
                    tags: s?.tags || [],
                    note: s?.note || ''
                }
            })
        }

        if (!keywordsData || keywordsData.length === 0) {
            return NextResponse.json({ error: 'No data to export' }, { status: 400 })
        }

        // Flatten data for export and apply sanitization
        const exportDataRows = keywordsData.map((kw: any) => {
            const row: Record<string, any> = {
                Keyword: sanitizeForExport(kw.keyword),
                Volume: sanitizeForExport(kw.volume),
                Difficulty: sanitizeForExport(kw.difficulty),
                KEI: sanitizeForExport(kw.kei),
                'My Rank': sanitizeForExport(kw.my_rank),
                'Relevancy Score': sanitizeForExport(kw.relevancy_score),
                'Total Score': sanitizeForExport(kw.total_score),
                Tags: sanitizeForExport((kw.tags || []).join(', ')),
                Notes: sanitizeForExport(kw.note),
            }

            if (kw.competitor_ranks) {
                Object.keys(kw.competitor_ranks).forEach(comp => {
                    row[`Rank - ${comp}`] = sanitizeForExport(kw.competitor_ranks[comp])
                })
            }
            return row
        })

        // Workbook creation
        const workbook = XLSX.utils.book_new()

        // Sheet 1: Keywords
        const worksheet = XLSX.utils.json_to_sheet(exportDataRows)
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Keywords')

        // Sheet 2: Preset / Metadata (XLSX only)
        if (format === 'xlsx') {
            const metadataRows = [
                ['Report Generated', new Date().toISOString()],
                ['Dataset', dataset?.name || 'Unknown'],
                ['Export Scope', scope],
                ['Total Rows', exportDataRows.length],
                ['', ''], // Empty row
                ['--- PRESET CONFIGURATION ---', '']
            ]

            if (presetId) {
                const { data: preset } = await supabase.from('presets').select('*').eq('id', presetId).single()
                if (preset) {
                    metadataRows.push(['Preset Name', preset.name]);
                    const cfg = preset.config;
                    if (cfg) {
                        if (cfg.weights) {
                            metadataRows.push(['Weight: Relevancy', cfg.weights.rel]);
                            metadataRows.push(['Weight: Volume', cfg.weights.vol]);
                            metadataRows.push(['Weight: KEI', cfg.weights.kei]);
                            metadataRows.push(['Penalty: Difficulty', cfg.weights.diff]);
                            metadataRows.push(['Penalty: Rank', cfg.weights.rank || 0]);
                        }
                        if (cfg.transforms) {
                            metadataRows.push(['Log Volume Normalization', cfg.transforms.logVolume ? 'Yes' : 'No']);
                        }
                        if (cfg.rankPenalty) {
                            metadataRows.push(['Rank Penalty Mode', cfg.rankPenalty.mode === 'ignore_unranked' ? 'Ignore unranked' : 'Penalize Unranked']);
                        }
                    }
                } else {
                    metadataRows.push(['Preset Details', 'Not found or deleted']);
                }
            } else {
                metadataRows.push(['Preset Details', 'No specific preset passed']);
            }

            const metaSheet = XLSX.utils.aoa_to_sheet(metadataRows)
            XLSX.utils.book_append_sheet(workbook, metaSheet, 'Metadata')
        }

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

        const filename = `dataset_${datasetId}_${scope}_export.${extension}`

        await logAuditAction('EXPORT_DATASET', 'dataset', datasetId, dataset?.workspace_id, { format, scope, rows: exportDataRows.length })

        // Convert buffer to base64 to send via JSON (since we are responding to POST fetch)
        const base64Buffer = Buffer.from(fileBuffer).toString('base64');

        return NextResponse.json({
            success: true,
            filename,
            contentType,
            data: base64Buffer
        })

    } catch (error) {
        console.error("Export Error:", error)
        return NextResponse.json({ error: 'Internal server error while exporting' }, { status: 500 })
    }
}
