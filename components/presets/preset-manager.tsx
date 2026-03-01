'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function PresetManager({ workspaceId }: { workspaceId: string }) {
    const [presets, setPresets] = useState<any[]>([])
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form state
    const [name, setName] = useState('')
    const [wRel, setWRel] = useState(50)
    const [wVol, setWVol] = useState(50)
    const [wKEI, setWKEI] = useState(0)
    const [wDiff, setWDiff] = useState(200)

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
            weights: { rel: wRel / 100, vol: wVol / 100, kei: wKEI / 100, diff: wDiff / 100, rank: 0 }
        }

        const res = await fetch('/api/presets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, workspace_id: workspaceId, config })
        })

        if (res.ok) {
            setOpen(false)
            setName('')
            fetchPresets()
        }
        setLoading(false)
    }

    return (
        <div className="space-y-4 pt-8 border-t mt-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Scoring Presets</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">Create Preset</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Preset</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-6 pt-4">
                            <div className="space-y-2">
                                <Label>Preset Name</Label>
                                <Input value={name} onChange={e => setName(e.target.value)} required />
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="flex justify-between">
                                        <span>Relevancy Weight</span>
                                        <span className="text-muted-foreground">{(wRel / 100).toFixed(2)}</span>
                                    </Label>
                                    <Slider value={[wRel]} onValueChange={v => setWRel(v[0])} max={200} step={10} />
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex justify-between">
                                        <span>Volume Weight</span>
                                        <span className="text-muted-foreground">{(wVol / 100).toFixed(2)}</span>
                                    </Label>
                                    <Slider value={[wVol]} onValueChange={v => setWVol(v[0])} max={200} step={10} />
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex justify-between">
                                        <span>KEI Weight</span>
                                        <span className="text-muted-foreground">{(wKEI / 100).toFixed(2)}</span>
                                    </Label>
                                    <Slider value={[wKEI]} onValueChange={v => setWKEI(v[0])} max={200} step={10} />
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex justify-between">
                                        <span>Difficulty Penalty</span>
                                        <span className="text-muted-foreground">{(wDiff / 100).toFixed(2)}</span>
                                    </Label>
                                    <Slider value={[wDiff]} onValueChange={v => setWDiff(v[0])} max={300} step={10} />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={loading || !name}>Save Preset</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {presets.map(p => (
                    <Card key={p.id}>
                        <CardHeader className="py-4">
                            <CardTitle className="text-base">{p.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground pb-4">
                            Rel: {p.config.weights.rel} | Vol: {p.config.weights.vol} | Diff: -{p.config.weights.diff}
                        </CardContent>
                    </Card>
                ))}
                {presets.length === 0 && <p className="text-sm text-muted-foreground">No presets yet. Default weights will be used.</p>}
            </div>
        </div>
    )
}
