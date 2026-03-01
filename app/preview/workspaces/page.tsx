import { WorkspaceList } from "@/components/workspaces/workspace-list"

export default function WorkspacesPreview() {
    return (
        <div className="space-y-6">
            <div className="pb-4 mb-4 border-b">
                <h1 className="text-2xl font-semibold">Workspace Components</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Preview of the WorkspaceList component. This list fetches workspaces from /api/workspaces.
                </p>
            </div>

            <div className="p-6 border rounded-md">
                <WorkspaceList />
            </div>
        </div>
    )
}
