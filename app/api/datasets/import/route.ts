import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Papa from 'papaparse'
import { logAuditAction } from '@/lib/audit'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File
        const workspaceId = formData.get('workspaceId') as string
        const myRankColumn = formData.get('myRankColumn') as string
        const competitorColumnsStr = formData.get('competitorColumns') as string
        const name = formData.get('name') as string || 'Untitled Dataset'

        if (!file || !workspaceId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Import safety: file size limit (10MB)
        const MAX_FILE_SIZE = 10 * 1024 * 1024
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 })
        }

        const competitorColumns: string[] = competitorColumnsStr ? JSON.parse(competitorColumnsStr) : []

        // Read file
        const text = await file.text()

        // Parse CSV
        const parsed = Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
        })

        if (parsed.errors.length > 0) {
            console.error("CSV Parse Errors:", parsed.errors)
        }

        const rows = parsed.data as Record<string, any>[]

        // Import safety: row count limit (10,000)
        const MAX_ROWS = 10000
        if (rows.length > MAX_ROWS) {
            return NextResponse.json({ error: `Too many rows (${rows.length}). Maximum is ${MAX_ROWS}.` }, { status: 400 })
        }

        // Create dataset
        const { data: dataset, error: datasetError } = await supabase
            .from('datasets')
            .insert({
                workspace_id: workspaceId,
                name: name,
                source_filename: file.name,
                competitor_count: competitorColumns.length,
                my_rank_column_name: myRankColumn,
                competitor_column_names: competitorColumns,
                created_by: user.id
            })
            .select()
            .single()

        if (datasetError) {
            return NextResponse.json({ error: datasetError.message }, { status: 500 })
        }

        const datasetId = dataset.id

        let keywordsToInsert: any[] = []

        // Long format mapping
        const keywordMap = new Map<string, any>()

        rows.forEach(row => {
            const keywordRaw = row['Keyword'] || row['keyword'] || ''
            const keyword = String(keywordRaw).trim().toLowerCase()

            if (!keyword) return

            if (!keywordMap.has(keyword)) {
                const volumeStr = row['Volume'] || row['volume']
                const volume = volumeStr !== undefined && volumeStr !== null && volumeStr !== '' ? parseFloat(volumeStr) : null

                const diffStr = row['Difficulty'] || row['difficulty']
                const difficulty = diffStr !== undefined && diffStr !== null && diffStr !== '' ? parseFloat(diffStr) : null

                const keiStr = row['KEI'] || row['kei']
                const kei = keiStr !== undefined && keiStr !== null && keiStr !== '' ? parseFloat(keiStr) : null

                keywordMap.set(keyword, {
                    dataset_id: datasetId,
                    keyword,
                    volume,
                    difficulty,
                    kei,
                    my_rank: null,
                    competitor_ranks: {},
                    competitor_ranked_count: 0,
                    competitor_topN_count: 0,
                    competitor_best_rank: null,
                    relevancy_score: 0,
                    total_score: 0
                })
            }

            const kwData = keywordMap.get(keyword)
            const appName = String(row['App Name'] || row['App Id'] || '')
            const rankRaw = parseInt(row['Rank'] || row['rank'], 10)
            const rank = isNaN(rankRaw) || rankRaw <= 0 ? null : rankRaw

            if (appName === myRankColumn) {
                kwData.my_rank = rank
            } else if (competitorColumns.includes(appName)) {
                kwData.competitor_ranks[appName] = rank
                if (rank !== null) {
                    kwData.competitor_ranked_count++
                    if (rank <= 20) {
                        kwData.competitor_topN_count++
                    }
                    if (kwData.competitor_best_rank === null || rank < kwData.competitor_best_rank) {
                        kwData.competitor_best_rank = rank
                    }
                }
            }
        })

        keywordsToInsert = Array.from(keywordMap.values()).map(kwData => {
            competitorColumns.forEach(col => {
                if (kwData.competitor_ranks[col] === undefined) {
                    kwData.competitor_ranks[col] = null
                }
            })

            const maxCompetitors = Math.max(1, competitorColumns.length)
            const topFactor = kwData.competitor_topN_count / maxCompetitors
            kwData.relevancy_score = topFactor * 100

            kwData.total_score = (kwData.volume || 0) * 0.5 + kwData.relevancy_score * 0.5 - (kwData.difficulty || 0) * 2

            return kwData
        })

        // Batch insert chunking to 500
        const chunkSize = 500
        for (let i = 0; i < keywordsToInsert.length; i += chunkSize) {
            const chunk = keywordsToInsert.slice(i, i + chunkSize)
            const { error: insertError } = await supabase.from('keywords').insert(chunk)
            if (insertError) {
                console.error('Insert Error:', insertError)
                return NextResponse.json({ error: 'Failed to insert keywords' }, { status: 500 })
            }
        }

        await logAuditAction('IMPORT_DATASET', 'dataset', datasetId, workspaceId, { rows: keywordsToInsert.length })

        return NextResponse.json({ success: true, datasetId, rowsInserted: keywordsToInsert.length })

    } catch (err: any) {
        console.error('Import exception:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
