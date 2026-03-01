import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ImportModal } from '@/components/datasets/import-modal'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { PresetManager } from '@/components/presets/preset-manager'

export default async function WorkspacePage({ params }: { params: Promise<{ workspaceId: string }> }) {
    const { workspaceId } = await params
    const supabase = await createClient()

    const { data: workspace, error: wsError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single()

    if (wsError || !workspace) {
        notFound()
    }

    const { data: datasets, error: dsError } = await supabase
        .from('datasets')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })

    return (
        <div className="container mx-auto py-10 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{workspace.name}</h1>
                    <p className="text-muted-foreground">Manage your keyword datasets</p>
                </div>
                <ImportModal workspaceId={workspaceId} />
            </div>

            {dsError ? (
                <p className="text-destructive">Failed to load datasets.</p>
            ) : !datasets || datasets.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>No datasets found</CardTitle>
                        <CardDescription>Upload a CSV from AppTweak to get started.</CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {datasets.map(ds => (
                        <Link key={ds.id} href={`/app/w/${workspaceId}/datasets/${ds.id}`}>
                            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                                <CardHeader>
                                    <CardTitle className="text-lg">{ds.name}</CardTitle>
                                    <CardDescription>
                                        {ds.competitor_count} Competitors • {new Date(ds.created_at).toLocaleDateString()}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {/* Preset Manager Section */}
            <PresetManager workspaceId={workspaceId} />
        </div>
    )
}
