'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

interface Preset {
    id: string
    name: string
    config: any
    created_at: string
}

const DEFAULT_PRESETS = [
    {
        name: 'Balanced',
        config: { filters: {}, relevancy: { minTopCount: 2, n: 20 }, weights: { rel: 0.5, vol: 0.5, kei: 0.3, diff: 1, rank: 0.2 }, transforms: { logVolume: false }, rankPenalty: { mode: 'penalize' } }
    },
    {
        name: 'Relevancy-first',
        config: { filters: {}, relevancy: { minTopCount: 2, n: 20 }, weights: { rel: 1.5, vol: 0.3, kei: 0.2, diff: 0.5, rank: 0.1 }, transforms: { logVolume: false }, rankPenalty: { mode: 'penalize' } }
    },
    {
        name: 'Low-competition Focus',
        config: { filters: {}, relevancy: { minTopCount: 1, n: 30 }, weights: { rel: 0.3, vol: 0.3, kei: 1.0, diff: 2.0, rank: 0 }, transforms: { logVolume: false }, rankPenalty: { mode: 'ignore_unranked' } }
    },
    {
        name: 'Growth / Volume Lean',
        config: { filters: {}, relevancy: { minTopCount: 2, n: 20 }, weights: { rel: 0.3, vol: 1.5, kei: 0.2, diff: 0.8, rank: 0.3 }, transforms: { logVolume: true }, rankPenalty: { mode: 'penalize' } }
    }
]

export function PresetManager({ workspaceId }: { workspaceId: string }) {
    const [presets, setPresets] = useState<Preset[]>([])
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState<string | null>(null)

    // Form state
    const [name, setName] = useState('')
    const [wRel, setWRel] = useState(50)
    const [wVol, setWVol] = useState(50)
    const [wKEI, setWKEI] = useState(0)
    const [wDiff, setWDiff] = useState(100)
    const [wRank, setWRank] = useState(0)
    const [logVolume, setLogVolume] = useState(false)
    const [rankPenaltyMode, setRankPenaltyMode] = useState<'penalize' | 'ignore_unranked'>('penalize')

    const fetchPresets = async () => {
        const res = await fetch(`/api/presets?workspaceId=${workspaceId}`)
        if (res.ok) {
            setPresets(await res.json())
        }
    }

    useEffect(() => {
        fetchPresets()
    }, [workspaceId])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name) return

        setLoading(true)
        const config = {
            filters: {},
            relevancy: { minTopCount: 2, n: 20 },
            weights: { rel: wRel / 100, vol: wVol / 100, kei: wKEI / 100, diff: wDiff / 100, rank: wRank / 100 },
            transforms: { logVolume },
            rankPenalty: { mode: rankPenaltyMode }
        }

        const res = await fetch('/api/presets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, workspace_id: workspaceId, config })
        })

        if (res.ok) {
            setOpen(false)
            resetForm()
            fetchPresets()
        }
        setLoading(false)
    }

    const handleDelete = async (presetId: string) => {
        if (!confirm('Delete this preset?')) return
        setDeleting(presetId)
        const res = await fetch(`/api/presets?id=${presetId}`, { method: 'DELETE' })
        if (res.ok) fetchPresets()
        setDeleting(null)
    }

    const handleSeedDefaults = async () => {
        setLoading(true)
        for (const preset of DEFAULT_PRESETS) {
            await fetch('/api/presets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: preset.name, workspace_id: workspaceId, config: preset.config })
            })
        }
        fetchPresets()
        setLoading(false)
    }

    const resetForm = () => {
        setName('')
        setWRel(50)
        setWVol(50)
        setWKEI(0)
        setWDiff(100)
        setWRank(0)
        setLogVolume(false)
        setRankPenaltyMode('penalize')
    }

    return (
        <div className="space-y-4 pt-8 border-t mt-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Scoring Presets</h2>
                <div className="flex gap-2">
                    {presets.length === 0 && (
                        <Button variant="outline" onClick={handleSeedDefaults} disabled={loading}>
                            {loading ? 'Creating...' : 'Add Default Presets'}
                        </Button>
                    )}
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" onClick={() => resetForm()}>Create Preset</Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create New Preset</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-6 pt-4">
                                <div className="space-y-2">
                                    <Label>Preset Name</Label>
                                    <Input value={name} onChange={e => setName(e.target.value)} required />
                                </div>

                                <div className="space-y-4">
                                    <WeightSlider label="Relevancy Weight" value={wRel} onChange={setWRel} max={200} />
                                    <WeightSlider label="Volume Weight" value={wVol} onChange={setWVol} max={200} />
                                    <WeightSlider label="KEI Weight" value={wKEI} onChange={setWKEI} max={200} />
                                    <WeightSlider label="Difficulty Penalty" value={wDiff} onChange={setWDiff} max={300} />
                                    <WeightSlider label="Rank Penalty" value={wRank} onChange={setWRank} max={200} />
                                </div>

                                <div className="space-y-3 pt-2 border-t">
                                    <div className="flex items-center space-x-2 pt-3">
                                        <Checkbox id="log-vol" checked={logVolume} onCheckedChange={(v) => setLogVolume(v === true)} />
                                        <Label htmlFor="log-vol" className="text-sm">Use log(Volume+1) normalization</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="ignore-unranked" checked={rankPenaltyMode === 'ignore_unranked'} onCheckedChange={(v) => setRankPenaltyMode(v ? 'ignore_unranked' : 'penalize')} />
                                        <Label htmlFor="ignore-unranked" className="text-sm">Don&apos;t penalize unranked keywords</Label>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={loading || !name}>Save Preset</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {presets.map(p => (
                    <Card key={p.id}>
                        <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-base">{p.name}</CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-destructive hover:text-destructive"
                                onClick={() => handleDelete(p.id)}
                                disabled={deleting === p.id}
                            >
                                {deleting === p.id ? '...' : 'Delete'}
                            </Button>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground pb-4 space-y-1">
                            <div>Rel: {p.config.weights?.rel} | Vol: {p.config.weights?.vol} | KEI: {p.config.weights?.kei}</div>
                            <div>Diff: -{p.config.weights?.diff} | Rank: -{p.config.weights?.rank || 0}</div>
                            {p.config.transforms?.logVolume && <div className="text-primary text-[11px]">log(Volume) enabled</div>}
                        </CardContent>
                    </Card>
                ))}
                {presets.length === 0 && <p className="text-sm text-muted-foreground">No presets yet. Click &quot;Add Default Presets&quot; to start.</p>}
            </div>
        </div>
    )
}

function WeightSlider({ label, value, onChange, max }: { label: string, value: number, onChange: (v: number) => void, max: number }) {
    return (
        <div className="space-y-2">
            <Label className="flex justify-between">
                <span>{label}</span>
                <span className="text-muted-foreground">{(value / 100).toFixed(2)}</span>
            </Label>
            <Slider value={[value]} onValueChange={v => onChange(v[0])} max={max} step={10} />
        </div>
    )
}
