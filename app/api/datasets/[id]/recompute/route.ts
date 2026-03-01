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

        // Get dataset for competitor_count
        const { data: dataset } = await supabase
            .from('datasets')
            .select('competitor_count')
            .eq('id', datasetId)
            .single()

        const competitorCount = dataset?.competitor_count || 1

        // Fetch all keywords
        const { data: keywords, error: kwError } = await supabase
            .from('keywords')
            .select('*')
            .eq('dataset_id', datasetId)

        if (kwError || !keywords) {
            return NextResponse.json({ error: 'Failed to fetch keywords' }, { status: 500 })
        }

        const n = relevancy?.n || 20
        const wRel = weights?.rel || 0.5
        const wVol = weights?.vol || 0.5
        const wKEI = weights?.kei || 0
        const wDiff = weights?.diff || 1
        const wRank = weights?.rank || 0
        const useLogVolume = config?.transforms?.logVolume || false
        const rankPenaltyMode = config?.rankPenalty?.mode || 'penalize' // 'penalize' | 'ignore_unranked'

        // Compute min/max for normalization
        const volumes = keywords.map(k => k.volume).filter((v): v is number => v !== null && v !== undefined)
        const difficulties = keywords.map(k => k.difficulty).filter((v): v is number => v !== null && v !== undefined)
        const keis = keywords.map(k => k.kei).filter((v): v is number => v !== null && v !== undefined)

        const minVol = volumes.length > 0 ? Math.min(...volumes) : 0
        const maxVol = volumes.length > 0 ? Math.max(...volumes) : 1
        const minDiff = difficulties.length > 0 ? Math.min(...difficulties) : 0
        const maxDiff = difficulties.length > 0 ? Math.max(...difficulties) : 1
        const minKEI = keis.length > 0 ? Math.min(...keis) : 0
        const maxKEI = keis.length > 0 ? Math.max(...keis) : 1

        function normalize(val: number, min: number, max: number): number {
            if (max === min) return 50
            return ((val - min) / (max - min)) * 100
        }

        // Build batch updates
        const updates = keywords.map(kw => {
            const compRanks = kw.competitor_ranks || {}
            const rankValues = Object.values(compRanks).filter((r): r is number => typeof r === 'number' && r > 0)

            let rankedCount = rankValues.length
            let topNCount = rankValues.filter(r => r <= n).length
            const bestRank = rankValues.length > 0 ? Math.min(...rankValues) : null
            const maxComps = Math.max(1, competitorCount)

            const topFactor = topNCount / maxComps
            const relevancyScore = topFactor * 100

            // Normalize values
            let volNorm = kw.volume !== null ? normalize(useLogVolume ? Math.log(kw.volume + 1) : kw.volume, useLogVolume ? Math.log(minVol + 1) : minVol, useLogVolume ? Math.log(maxVol + 1) : maxVol) : 0
            const diffNorm = kw.difficulty !== null ? normalize(kw.difficulty, minDiff, maxDiff) : 0
            const keiNorm = kw.kei !== null ? normalize(kw.kei, minKEI, maxKEI) : 0

            // Rank penalty
            let rankPenalty = 0
            if (kw.my_rank && kw.my_rank > 0) {
                rankPenalty = kw.my_rank
            } else if (rankPenaltyMode === 'ignore_unranked') {
                rankPenalty = 0
            }

            const totalScore = (volNorm * wVol) + (relevancyScore * wRel) + (keiNorm * wKEI) - (diffNorm * wDiff) - (rankPenalty * wRank)

            return {
                id: kw.id,
                competitor_ranked_count: rankedCount,
                competitor_topN_count: topNCount,
                competitor_best_rank: bestRank,
                relevancy_score: Math.round(relevancyScore * 100) / 100,
                total_score: Math.round(totalScore * 100) / 100
            }
        })

        // Batch update in chunks of 500
        const chunkSize = 500
        let updatedCount = 0
        for (let i = 0; i < updates.length; i += chunkSize) {
            const chunk = updates.slice(i, i + chunkSize)
            // Use Promise.all for parallel updates within each chunk
            const results = await Promise.all(
                chunk.map(u =>
                    supabase
                        .from('keywords')
                        .update({
                            competitor_ranked_count: u.competitor_ranked_count,
                            competitor_topN_count: u.competitor_topN_count,
                            competitor_best_rank: u.competitor_best_rank,
                            relevancy_score: u.relevancy_score,
                            total_score: u.total_score
                        })
                        .eq('id', u.id)
                )
            )
            updatedCount += chunk.length
        }

        return NextResponse.json({ success: true, updatedCount })
    } catch (error) {
        console.error('Recompute error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
