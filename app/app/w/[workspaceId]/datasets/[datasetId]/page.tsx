import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { DataTable } from '@/components/datasets/data-table'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download } from 'lucide-react'
import { PresetSelector } from '@/components/datasets/preset-selector'

export default async function DatasetPage({ params }: { params: Promise<{ workspaceId: string, datasetId: string }> }) {
    const { workspaceId, datasetId } = await params
    const supabase = await createClient()

    // Fetch Dataset
    const { data: dataset, error: dsError } = await supabase
        .from('datasets')
        .select('*')
        .eq('id', datasetId)
        .single()

    if (dsError || !dataset || dataset.workspace_id !== workspaceId) {
        notFound()
    }

    // Fetch Keywords
    // In a real production environment with 50,000+ keywords, we might want to paginate
    // or stream this data. Since this is an MVP, we fetch a large batch for client virtualization.
    const { data: keywords, error: kwError } = await supabase
        .from('keywords')
        .select('*')
        .eq('dataset_id', datasetId)
        .order('total_score', { ascending: false })
        .limit(5000)

    return (
        <div className="p-6 space-y-6 max-w-full overflow-hidden">
            <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                        <Link href={`/app/w/${workspaceId}`} className="hover:text-foreground inline-flex items-center transition-colors">
                            <ArrowLeft className="mr-1 h-3 w-3" /> Back
                        </Link>
                        <span>/</span>
                        <span>{dataset.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">{dataset.name}</h1>
                        <span className="text-xs text-muted-foreground px-2.5 py-1 bg-muted rounded-full font-medium">
                            {keywords ? keywords.length : 0} keywords
                        </span>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <PresetSelector datasetId={datasetId} workspaceId={workspaceId} />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-border/60 p-4">
                {kwError ? (
                    <p className="text-destructive">Failed to fetch keywords: {kwError.message}</p>
                ) : (
                    <DataTable data={keywords || []} />
                )}
            </div>
        </div>
    )
}
