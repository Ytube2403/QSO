import Link from "next/link"

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar navigation */}
            <aside className="w-64 border-r bg-muted/30 p-4 shrink-0 flex flex-col gap-2">
                <div className="font-semibold text-lg mb-4">UI Previews</div>
                <nav className="flex flex-col gap-2">
                    <Link href="/preview/workspaces" className="text-sm rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground">
                        Workspaces
                    </Link>
                    <Link href="/preview/datasets" className="text-sm rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground">
                        Datasets
                    </Link>
                    <Link href="/preview/data-table" className="text-sm rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground">
                        Data Tables
                    </Link>
                    <Link href="/preview/presets" className="text-sm rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground">
                        Presets
                    </Link>
                    <div className="my-2 border-t"></div>
                    <Link href="/" className="text-sm rounded-md px-3 py-2 hover:bg-primary/10 text-primary mt-auto">
                        &larr; Back to App
                    </Link>
                </nav>
            </aside>

            {/* Main content area */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto border rounded-xl p-8 bg-card shadow-sm min-h-[500px]">
                    {children}
                </div>
            </main>
        </div>
    )
}
