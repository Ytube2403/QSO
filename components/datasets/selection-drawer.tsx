'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface SelectionDrawerProps {
    datasetId: string
    selectedRows: any[]
    onClearSelection: () => void
}

export function SelectionDrawer({ datasetId, selectedRows, onClearSelection }: SelectionDrawerProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [note, setNote] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState('')
    const [error, setError] = useState('')

    if (selectedRows.length === 0) return null

    const handleAddTag = () => {
        const trimmed = tagInput.trim().toLowerCase()
        if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
            setTags([...tags, trimmed])
            setTagInput('')
        }
    }

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddTag()
        }
    }

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag))
    }

    const handleSaveSelections = async () => {
        setLoading(true)
        setError('')

        const selections = selectedRows.map(row => ({
            keyword_id: row.id,
            note: note,
            tags: tags.length > 0 ? tags : ['manual-pick']
        }))

        const res = await fetch(`/api/datasets/${datasetId}/selections`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selections })
        })

        if (res.ok) {
            setNote('')
            setTags([])
            setOpen(false)
            onClearSelection()
        } else {
            const data = await res.json().catch(() => ({ error: 'Unknown error' }))
            setError(data.error || 'Failed to save selections')
        }

        setLoading(false)
    }

    const handleExportSelected = (format: 'csv' | 'xlsx') => {
        window.open(`/api/datasets/${datasetId}/export?format=${format}`, '_blank')
    }

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out">
            <div className="bg-[#202124] border border-zinc-700 shadow-2xl rounded-full px-5 py-2.5 flex items-center space-x-5 text-white text-sm">
                <div className="flex items-center gap-2">
                    <button onClick={onClearSelection} className="hover:bg-zinc-700 transition-colors p-1 rounded-full">
                        <X className="w-4 h-4 text-zinc-400" />
                    </button>
                    <span className="font-medium whitespace-nowrap">{selectedRows.length} selected</span>
                </div>
                <div className="w-px h-4 bg-zinc-700"></div>
                <div className="flex items-center space-x-3">
                    <button onClick={onClearSelection} className="px-3 py-1.5 hover:bg-zinc-800 rounded-full text-zinc-300 hover:text-white transition-colors">
                        Clear
                    </button>
                    <button onClick={() => setOpen(true)} className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-black font-semibold rounded-full transition-colors whitespace-nowrap shadow-sm">
                        Review & Save
                    </button>
                </div>
            </div>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                    <SheetHeader>
                        <SheetTitle>Save {selectedRows.length} Selections</SheetTitle>
                    </SheetHeader>
                    <div className="py-6 space-y-6">
                        {error && (
                            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Tags</h4>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add a tag + Enter"
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    className="flex-1"
                                />
                                <Button variant="outline" size="sm" onClick={handleAddTag} disabled={!tagInput.trim()}>Add</Button>
                            </div>
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                                            {tag}
                                            <button onClick={() => handleRemoveTag(tag)} className="hover:bg-muted rounded-full p-0.5">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Note</h4>
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
                                    <Badge key={r.id} variant="outline">{r.keyword}</Badge>
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
