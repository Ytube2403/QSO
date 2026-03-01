'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

export function ImportModal({ workspaceId }: { workspaceId: string }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [datasetName, setDatasetName] = useState('')
    const [headers, setHeaders] = useState<string[]>([])

    const [myRankColumn, setMyRankColumn] = useState<string>('')
    const [competitorColumns, setCompetitorColumns] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0]
        if (selected) {
            setFile(selected)
            Papa.parse(selected, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.meta.fields) {
                        const appsSet = new Set<string>()
                        const data = results.data as Record<string, string>[]
                        data.forEach(row => {
                            const appName = row['App Name'] || row['App Id']
                            if (appName) appsSet.add(appName.trim())
                        })
                        const uniqueApps = Array.from(appsSet)
                        setHeaders(uniqueApps)
                        if (uniqueApps.length > 0) {
                            setMyRankColumn(uniqueApps[0])
                            setCompetitorColumns(uniqueApps.slice(1, 11))
                        }
                    }
                }
            })
        }
    }

    const handleCompetitorToggle = (col: string) => {
        setCompetitorColumns(prev => {
            if (prev.includes(col)) {
                return prev.filter(c => c !== col)
            } else {
                if (prev.length >= 10) return prev
                return [...prev, col]
            }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !myRankColumn) return

        setLoading(true)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('workspaceId', workspaceId)
        formData.append('name', datasetName || file.name)
        formData.append('myRankColumn', myRankColumn)
        formData.append('competitorColumns', JSON.stringify(competitorColumns))

        const res = await fetch('/api/datasets/import', {
            method: 'POST',
            body: formData
        })

        if (res.ok) {
            setOpen(false)
            setFile(null)
            setHeaders([])
            setDatasetName('')
            router.refresh()
        } else {
            console.error(await res.text())
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Import Dataset</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Import ASO CSV</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Dataset Name</Label>
                            <Input placeholder="e.g. US October" value={datasetName} onChange={e => setDatasetName(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <Label>CSV File (AppTweak Export)</Label>
                            <Input type="file" accept=".csv" onChange={handleFileChange} required />
                        </div>

                        {headers.length > 0 && (
                            <div className="space-y-4 border p-4 rounded-md mt-4">
                                <h3 className="font-semibold">App Mapping</h3>

                                <div className="space-y-2">
                                    <Label>My App (Choose 1)</Label>
                                    <RadioGroup value={myRankColumn} onValueChange={setMyRankColumn} className="grid grid-cols-2 gap-2">
                                        {headers.map(h => (
                                            <div className="flex items-center space-x-2" key={h}>
                                                <RadioGroupItem value={h} id={`my-${h}`} />
                                                <Label htmlFor={`my-${h}`} className="text-sm truncate" title={h}>{h}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>

                                <div className="space-y-2 pt-4">
                                    <Label>Competitor Apps (Choose up to 10) - Selected: {competitorColumns.length}</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {headers.filter(h => h !== myRankColumn).map(h => (
                                            <div className="flex items-center space-x-2" key={h}>
                                                <Checkbox
                                                    id={`comp-${h}`}
                                                    checked={competitorColumns.includes(h)}
                                                    onCheckedChange={() => handleCompetitorToggle(h)}
                                                />
                                                <Label htmlFor={`comp-${h}`} className="text-sm truncate" title={h}>{h}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading || !file || !myRankColumn}>
                            {loading ? 'Importing...' : 'Import Data'}
                        </Button>
                    </div>
                </form>

            </DialogContent>
        </Dialog>
    )
}
