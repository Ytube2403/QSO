import { PresetManager } from "@/components/presets/preset-manager"

export default function PresetsPreview() {
    return (
        <div className="space-y-6">
            <div className="pb-4 mb-4 border-b">
                <h1 className="text-2xl font-semibold">Preset Components</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Preview of the PresetManager component. This manager fetches presets from /api/presets for a given workspace.
                </p>
            </div>

            <div className="p-6 border rounded-md">
                <PresetManager workspaceId="preview-workspace-123" />
            </div>
        </div>
    )
}
