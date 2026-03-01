'use client'

import { DataTable, KeywordRow } from '@/components/datasets/data-table'

const dataset1: KeywordRow[] = [
    { id: '1', dataset_id: 'ds_1', keyword: 'soundboard', volume: 62, difficulty: 9, kei: 87, my_rank: 74, competitor_best_rank: null, competitor_ranked_count: 3, competitor_topN_count: 2, relevancy_score: 0, total_score: 0 },
    { id: '2', dataset_id: 'ds_1', keyword: 'prank', volume: 57, difficulty: 6, kei: 83, my_rank: 40, competitor_best_rank: null, competitor_ranked_count: 2, competitor_topN_count: 1, relevancy_score: 0, total_score: 0 },
    { id: '3', dataset_id: 'ds_1', keyword: 'haircut', volume: 56, difficulty: 14, kei: 82, my_rank: 76, competitor_best_rank: null, competitor_ranked_count: 1, competitor_topN_count: 0, relevancy_score: 0, total_score: 0 },
    { id: '4', dataset_id: 'ds_1', keyword: 'hair cut', volume: 53, difficulty: 9, kei: 79, my_rank: null, competitor_best_rank: null, competitor_ranked_count: 0, competitor_topN_count: 0, relevancy_score: 0, total_score: 0 },
    { id: '5', dataset_id: 'ds_1', keyword: 'sound board', volume: 51, difficulty: 9, kei: 78, my_rank: 33, competitor_best_rank: null, competitor_ranked_count: 4, competitor_topN_count: 3, relevancy_score: 0, total_score: 0 },
]

export default function DataTablePreview() {
    return (
        <div className="space-y-6">
            <div className="pb-4 border-b">
                <h1 className="text-2xl font-semibold">Data Table Component</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Preview of the DataTable component showing Keyword rows with sorting, selection, and virtualization capabilities using the Prank Sounds dataset.
                </p>
            </div>

            <div className="bg-background rounded-md">
                <DataTable data={dataset1} />
            </div>
        </div>
    )
}
