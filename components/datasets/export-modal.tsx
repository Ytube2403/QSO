'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface ExportModalProps {
    datasetId: string
    activePresetId: string | null
    selectedKeywordIds: string[]
    filteredKeywordIds: string[]
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ExportModal({ datasetId, activePresetId, selectedKeywordIds, filteredKeywordIds, open, onOpenChange }: ExportModalProps) {
    const [loadingScope, setLoadingScope] = useState<'selected' | 'filtered' | null>(null)
    const [error, setError] = useState('')

    const handleExport = async (scope: 'selected' | 'filtered', format: 'csv' | 'xlsx') => {
        setLoadingScope(scope)
        setError('')

        try {
            const body = {
                format,
                scope,
                presetId: activePresetId,
                keywordIds: scope === 'filtered' ? filteredKeywordIds : selectedKeywordIds
            }

            const res = await fetch(`/api/datasets/${datasetId}/export`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to export data')
            }

            if (data.success && data.data) {
                // Convert base64 back to Blob/File to trigger download
                const byteCharacters = atob(data.data)
                const byteNumbers = new Array(byteCharacters.length)
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i)
                }
                const byteArray = new Uint8Array(byteNumbers)
                const blob = new Blob([byteArray], { type: data.contentType })

                // Create download link
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = data.filename
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                a.remove()
                onOpenChange(false)
            }
        } catch (err: any) {
            setError(err.message || 'Unknown error during export')
        } finally {
            setLoadingScope(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Export Dataset</DialogTitle>
                    <DialogDescription>
                        Choose what data you want to export and in which format.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    {error && (
                        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-semibold text-sm">Export Selected</h4>
                                <p className="text-xs text-muted-foreground">Only the {selectedKeywordIds.length} keywords you manually checked.</p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleExport('selected', 'csv')} disabled={loadingScope !== null || selectedKeywordIds.length === 0}>
                                    {loadingScope === 'selected' ? '...' : 'CSV'}
                                </Button>
                                <Button size="sm" variant="default" onClick={() => handleExport('selected', 'xlsx')} disabled={loadingScope !== null || selectedKeywordIds.length === 0}>
                                    {loadingScope === 'selected' ? '...' : 'XLSX'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t"></div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-semibold text-sm">Export All Filtered</h4>
                                <p className="text-xs text-muted-foreground">All {filteredKeywordIds.length} keywords matching your current filters.</p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleExport('filtered', 'csv')} disabled={loadingScope !== null || filteredKeywordIds.length === 0}>
                                    {loadingScope === 'filtered' ? '...' : 'CSV'}
                                </Button>
                                <Button size="sm" variant="default" onClick={() => handleExport('filtered', 'xlsx')} disabled={loadingScope !== null || filteredKeywordIds.length === 0}>
                                    {loadingScope === 'filtered' ? '...' : 'XLSX'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <p className="text-[10px] text-muted-foreground mt-4 text-center">
                        Note: XLSX exports include an automatic Metadata sheet containing the rules used to calculate scores.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
