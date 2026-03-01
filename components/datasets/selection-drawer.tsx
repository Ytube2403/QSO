'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface SelectionDrawerProps {
    datasetId: string
    selectedRows: any[]
    onClearSelection: () => void
}

export function SelectionDrawer({ datasetId, selectedRows, onClearSelection }: SelectionDrawerProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [note, setNote] = useState('')

    if (selectedRows.length === 0) return null

    const handleSaveSelections = async () => {
        setLoading(true)

        // Prepare selections payload
        const selections = selectedRows.map(row => ({
            keyword_id: row.id,
            note: note,
            tags: ['manual-pick'] // example basic tag functionality
        }))

        const res = await fetch(`/api/datasets/${datasetId}/selections`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selections })
        })

        if (res.ok) {
            setNote('')
            setOpen(false)
            onClearSelection()
        } else {
            console.error("Failed to save selections")
        }

        setLoading(false)
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-white border shadow-lg rounded-full px-6 py-3 flex items-center space-x-4">
                <div>
                    <span className="font-bold text-lg">{selectedRows.length}</span> keywords selected
                </div>
                <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={onClearSelection}>Clear</Button>
                    <Button size="sm" onClick={() => setOpen(true)}>Review & Save</Button>
                </div>
            </div>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                    <SheetHeader>
                        <SheetTitle>Save {selectedRows.length} Selections</SheetTitle>
                    </SheetHeader>
                    <div className="py-6 space-y-6">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Add a Note</h4>
                            <Textarea
                                placeholder="Why are you picking these keywords?"
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                className="resize-none h-24"
                            />
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Keywords</h4>
                            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                                {selectedRows.map(r => (
                                    <Badge key={r.id} variant="secondary">{r.keyword}</Badge>
                                ))}
                            </div>
                        </div>

                        <Button className="w-full" onClick={handleSaveSelections} disabled={loading}>
                            {loading ? 'Saving...' : 'Confirm Save'}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
