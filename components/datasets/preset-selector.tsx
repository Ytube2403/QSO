'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export function PresetSelector({ datasetId, workspaceId }: { datasetId: string, workspaceId: string }) {
    const router = useRouter()
    const [presets, setPresets] = useState<any[]>([])
    const [selectedPreset, setSelectedPreset] = useState<string>('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function fetchPresets() {
            const res = await fetch(`/api/presets?workspaceId=${workspaceId}`)
            if (res.ok) {
                setPresets(await res.json())
            }
        }
        fetchPresets()
    }, [workspaceId])

    const handleRecompute = async () => {
        if (!selectedPreset) return
        setLoading(true)

        const res = await fetch(`/api/datasets/${datasetId}/recompute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ presetId: selectedPreset })
        })

        if (res.ok) {
            router.refresh()
        } else {
            console.error(await res.text())
        }
        setLoading(false)
    }

    return (
        <div className="flex items-center space-x-2">
            <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select a preset" />
                </SelectTrigger>
                <SelectContent>
                    {presets.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                            {p.name}
                        </SelectItem>
                    ))}
                    {presets.length === 0 && <SelectItem value="none" disabled>No presets found</SelectItem>}
                </SelectContent>
            </Select>
            <Button
                onClick={handleRecompute}
                disabled={loading || !selectedPreset}
            >
                {loading ? 'Recomputing...' : 'Apply & Recompute'}
            </Button>
        </div>
    )
}
