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

        const { presetId } = await request.json()

        if (!presetId) {
            return NextResponse.json({ error: 'presetId is required' }, { status: 400 })
        }

        // Auth validation handled by RLS on datasets/presets/keywords

        // Get preset config
        const { data: preset, error: presetError } = await supabase
            .from('presets')
            .select('config')
            .eq('id', presetId)
            .single()

        if (presetError || !preset) {
            return NextResponse.json({ error: 'Preset not found' }, { status: 404 })
        }

        const config = preset.config
        const { weights, relevancy } = config

        // Fetch all keywords
        const { data: keywords, error: kwError } = await supabase
            .from('keywords')
            .select('*')
            .eq('dataset_id', datasetId)

        if (kwError || !keywords) {
            return NextResponse.json({ error: 'Failed to fetch keywords' }, { status: 500 })
        }

        const minTopCount = relevancy?.minTopCount || 2
        const n = relevancy?.n || 20
        const wRel = weights?.rel || 0.5
        const wVol = weights?.vol || 0.5
        const wKEI = weights?.kei || 0
        const wDiff = weights?.diff || 1
        const wRank = weights?.rank || 0

        // Recompute
        for (let kw of keywords) {
            const vol = kw.volume || 0
            const diff = kw.difficulty || 0
            const kei = kw.kei || 0
            const myRank = kw.my_rank

            const compRanks = kw.competitor_ranks || {}

            let rankedCount = 0
            let topNCount = 0

            const rankValues = Object.values(compRanks).filter((r): r is number => typeof r === 'number' && r > 0)
            const maxComps = Math.max(1, rankValues.length > 0 ? Object.keys(compRanks).length : 1) // Approximation if we don't fetch competitor_count from dataset

            for (const r of rankValues) {
                rankedCount++
                if (r <= n) topNCount++
            }

            const topFactor = topNCount / maxComps
            const relevancyScore = topFactor * 100 // mapped to 0-100 logic for MVP

            let rankPenalty = 0
            if (myRank && myRank > 0) {
                rankPenalty = myRank // penalize bad rank
            }

            const totalScore = (vol * wVol) + (relevancyScore * wRel) + (kei * wKEI) - (diff * wDiff) - (rankPenalty * wRank)

            // Apply updates logic
            // Note: updating individual records sequentially here might be slow for huge lists, 
            // but it serves the MVP unless we do an upsert batch
            const { error: updError } = await supabase
                .from('keywords')
                .update({
                    relevancy_score: relevancyScore,
                    total_score: totalScore
                })
                .eq('id', kw.id)

            if (updError) {
                console.error("Failed to update keyword", kw.id, updError)
            }
        }

        return NextResponse.json({ success: true, updatedCount: keywords.length })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
