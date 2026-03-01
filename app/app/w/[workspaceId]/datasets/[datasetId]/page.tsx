import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { DataTable } from '@/components/datasets/data-table'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

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
        <div className="container mx-auto py-10 space-y-6">
            <div>
                <Button variant="ghost" size="sm" asChild className="mb-4 -ml-4">
                    <Link href={`/app/w/${workspaceId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Workspace
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">{dataset.name}</h1>
                <p className="text-muted-foreground">
                    {keywords ? keywords.length : 0} keywords analyzed
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
                {kwError ? (
                    <p className="text-destructive">Failed to fetch keywords: {kwError.message}</p>
                ) : (
                    <DataTable data={keywords || []} />
                )}
            </div>
        </div>
    )
}
