'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

type Workspace = {
    id: string
    name: string
    owner_id: string
    created_at: string
}

export function WorkspaceList() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [newName, setNewName] = useState('')

    const fetchWorkspaces = async () => {
        setLoading(true)
        const res = await fetch('/api/workspaces')
        if (res.ok) {
            const data = await res.json()
            setWorkspaces(data)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchWorkspaces()
    }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName) return

        const res = await fetch('/api/workspaces', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName })
        })

        if (res.ok) {
            setNewName('')
            setIsOpen(false)
            fetchWorkspaces()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Your Workspaces</h2>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>Create Workspace</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create a new workspace</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 pt-4">
                            <Input
                                placeholder="Workspace name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                required
                            />
                            <div className="flex justify-end">
                                <Button type="submit">Create</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <p>Loading workspaces...</p>
            ) : workspaces.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                        <p className="text-muted-foreground">You don't have any workspaces yet.</p>
                        <Button variant="outline" onClick={() => setIsOpen(true)}>Create one now</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {workspaces.map((workspace) => (
                        <Link key={workspace.id} href={`/app/w/${workspace.id}`}>
                            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                                <CardHeader>
                                    <CardTitle className="text-lg">{workspace.name}</CardTitle>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
