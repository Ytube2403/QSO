import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Papa from 'papaparse'

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

        // Map rows to keywords
        const keywordsToInsert = rows.map((row) => {
            const keywordRaw = row['Keyword'] || row['keyword'] || ''
            const keyword = String(keywordRaw).trim().toLowerCase()

            const volumeStr = row['Volume'] || row['volume']
            const volume = volumeStr ? parseFloat(volumeStr) : null

            const diffStr = row['Difficulty'] || row['difficulty']
            const difficulty = diffStr ? parseFloat(diffStr) : null

            const keiStr = row['KEI'] || row['kei']
            const kei = keiStr ? parseFloat(keiStr) : null

            const myRankRaw = parseInt(row[myRankColumn], 10)
            const myRank = isNaN(myRankRaw) || myRankRaw <= 0 ? null : myRankRaw

            const competitorRanks: Record<string, number | null> = {}
            let competitorRankedCount = 0
            let competitorTopNCount = 0
            let competitorBestRank: number | null = null

            competitorColumns.forEach((col) => {
                const valRaw = parseInt(row[col], 10)
                if (!isNaN(valRaw) && valRaw > 0) {
                    competitorRanks[col] = valRaw
                    competitorRankedCount++
                    if (valRaw <= 20) {
                        competitorTopNCount++
                    }
                    if (competitorBestRank === null || valRaw < competitorBestRank) {
                        competitorBestRank = valRaw
                    }
                } else {
                    competitorRanks[col] = null
                }
            })

            // Simple relevancy score calculation for MVP
            const maxCompetitors = Math.max(1, competitorColumns.length)
            const topFactor = competitorTopNCount / maxCompetitors
            const relevancyScore = topFactor * 100 // 0-100 scale simple mapping

            // Simple total_score (just an aggregate for testing)
            const totalScore = (volume || 0) * 0.5 + relevancyScore * 0.5 - (difficulty || 0) * 2

            return {
                dataset_id: datasetId,
                keyword,
                volume,
                difficulty,
                kei,
                my_rank: myRank,
                competitor_ranks: competitorRanks,
                competitor_ranked_count: competitorRankedCount,
                competitor_topN_count: competitorTopNCount,
                competitor_best_rank: competitorBestRank,
                relevancy_score: relevancyScore,
                total_score: totalScore
            }
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

        return NextResponse.json({ success: true, datasetId, rowsInserted: keywordsToInsert.length })

    } catch (err: any) {
        console.error('Import exception:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
