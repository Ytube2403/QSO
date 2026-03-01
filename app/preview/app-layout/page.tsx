'use client'

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { DataTable } from '@/components/datasets/data-table'
import { ArrowLeft, Download } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const dataset1 = [
    { id: '1', dataset_id: 'ds_1', keyword: 'soundboard', volume: 62, difficulty: 9, kei: 87, my_rank: 74, competitor_best_rank: null, competitor_ranked_count: 3, competitor_topN_count: 2, relevancy_score: 0, total_score: 0 },
    { id: '2', dataset_id: 'ds_1', keyword: 'prank', volume: 57, difficulty: 6, kei: 83, my_rank: 40, competitor_best_rank: null, competitor_ranked_count: 2, competitor_topN_count: 1, relevancy_score: 0, total_score: 0 },
    { id: '3', dataset_id: 'ds_1', keyword: 'haircut', volume: 56, difficulty: 14, kei: 82, my_rank: 76, competitor_best_rank: null, competitor_ranked_count: 1, competitor_topN_count: 0, relevancy_score: 0, total_score: 0 },
    { id: '4', dataset_id: 'ds_1', keyword: 'hair cut', volume: 53, difficulty: 9, kei: 79, my_rank: null, competitor_best_rank: null, competitor_ranked_count: 0, competitor_topN_count: 0, relevancy_score: 0, total_score: 0 },
    { id: '5', dataset_id: 'ds_1', keyword: 'sound board', volume: 51, difficulty: 9, kei: 78, my_rank: 33, competitor_best_rank: null, competitor_ranked_count: 4, competitor_topN_count: 3, relevancy_score: 0, total_score: 0 },
]

export default function AppLayoutPreview() {
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-background m-0 p-0 absolute inset-0 z-50">
            <Sidebar />
            <div className="flex flex-col flex-1 h-full min-w-0">
                <Header />
                <main className="flex-1 overflow-auto bg-muted/20">
                    <div className="p-6 space-y-6 max-w-full overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                                    <Link href={`#`} className="hover:text-foreground inline-flex items-center transition-colors">
                                        <ArrowLeft className="mr-1 h-3 w-3" /> Back
                                    </Link>
                                    <span>/</span>
                                    <span>Prank Sounds Dataset</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Prank Sounds Dataset</h1>
                                    <span className="text-xs text-muted-foreground px-2.5 py-1 bg-muted rounded-full font-medium">
                                        5 keywords
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center gap-2 border-l border-border pl-4">
                                    <Button variant="outline" size="sm" className="h-8 text-xs bg-white shadow-sm">
                                        <Download className="mr-2 h-3.5 w-3.5" /> CSV
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-8 text-xs bg-white shadow-sm">
                                        <Download className="mr-2 h-3.5 w-3.5" /> XLSX
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-border/60 p-4">
                            <DataTable data={dataset1} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
