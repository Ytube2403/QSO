'use client'

import { ImportModal } from "@/components/datasets/import-modal"
import { PresetSelector } from "@/components/datasets/preset-selector"

export default function DatasetsPreview() {
    return (
        <div className="space-y-8">
            <div className="pb-4 border-b">
                <h1 className="text-2xl font-semibold">Dataset Components</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Preview of the Dataset components including the Import CSV Modal and Preset Selector.
                </p>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-medium">Import Modal</h2>
                <div className="p-6 border rounded-md bg-muted/10">
                    <ImportModal workspaceId="preview-workspace-123" />
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-medium">Preset Selector</h2>
                <div className="p-6 border rounded-md bg-muted/10">
                    <PresetSelector
                        datasetId="preview-dataset-123"
                        workspaceId="preview-workspace-123"
                    />
                </div>
            </div>
        </div>
    )
}
