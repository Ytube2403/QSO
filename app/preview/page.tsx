export default function PreviewIndex() {
    return (
        <div className="flex flex-col items-center justify-center h-full space-y-4 text-center py-20">
            <h1 className="text-3xl font-bold tracking-tight">Component Sandbox Preview</h1>
            <p className="text-muted-foreground max-w-md">
                Select a category from the sidebar to preview and interact with the UI components built for the ASO Keyword Optimization app.
            </p>
            <p className="text-sm text-yellow-600 bg-yellow-100 p-3 rounded-md mt-6">
                Note: Some components rely on API routes and database connections. Actions like fetching or creating data may fail in the preview if you are not authenticated or the database is not seeded.
            </p>
        </div>
    )
}
