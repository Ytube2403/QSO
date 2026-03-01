'use client'

import { useRef, useMemo, useState, useCallback } from 'react'
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    ColumnDef,
    SortingState,
    ColumnFiltersState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Checkbox } from '@/components/ui/checkbox'
import { SelectionDrawer } from './selection-drawer'
import { ExportModal } from './export-modal'
import { Download } from 'lucide-react'

export interface KeywordRow {
    id: string
    dataset_id: string
    keyword: string
    volume: number | null
    difficulty: number | null
    kei: number | null
    my_rank: number | null
    competitor_best_rank: number | null
    competitor_ranked_count: number
    competitor_topN_count: number
    relevancy_score: number
    total_score: number
}

interface DataTableProps {
    data: KeywordRow[]
}

interface RangeFilter {
    min: string
    max: string
}

function numericRangeFilter(row: any, columnId: string, filterValue: RangeFilter) {
    const val = row.getValue(columnId) as number | null
    if (val === null || val === undefined) return false
    const min = filterValue.min !== '' ? parseFloat(filterValue.min) : -Infinity
    const max = filterValue.max !== '' ? parseFloat(filterValue.max) : Infinity
    return val >= min && val <= max
}

export function DataTable({ data }: DataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [rowSelection, setRowSelection] = useState({})
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [keywordSearch, setKeywordSearch] = useState('')

    // Filter state
    const [volumeFilter, setVolumeFilter] = useState<RangeFilter>({ min: '', max: '' })
    const [difficultyFilter, setDifficultyFilter] = useState<RangeFilter>({ min: '', max: '' })
    const [keiFilter, setKeiFilter] = useState<RangeFilter>({ min: '', max: '' })
    const [rankFilter, setRankFilter] = useState<RangeFilter>({ min: '', max: '' })
    const [relevancyFilter, setRelevancyFilter] = useState<RangeFilter>({ min: '', max: '' })
    const [showFilters, setShowFilters] = useState(false)
    const [showExportModal, setShowExportModal] = useState(false)

    // Shift+click support
    const lastSelectedIndex = useRef<number | null>(null)

    const filteredData = useMemo(() => {
        let result = data

        if (keywordSearch) {
            const lower = keywordSearch.toLowerCase()
            result = result.filter(r => r.keyword.toLowerCase().includes(lower))
        }

        if (volumeFilter.min || volumeFilter.max) {
            const min = volumeFilter.min ? parseFloat(volumeFilter.min) : -Infinity
            const max = volumeFilter.max ? parseFloat(volumeFilter.max) : Infinity
            result = result.filter(r => r.volume !== null && r.volume >= min && r.volume <= max)
        }

        if (difficultyFilter.min || difficultyFilter.max) {
            const min = difficultyFilter.min ? parseFloat(difficultyFilter.min) : -Infinity
            const max = difficultyFilter.max ? parseFloat(difficultyFilter.max) : Infinity
            result = result.filter(r => r.difficulty !== null && r.difficulty >= min && r.difficulty <= max)
        }

        if (keiFilter.min || keiFilter.max) {
            const min = keiFilter.min ? parseFloat(keiFilter.min) : -Infinity
            const max = keiFilter.max ? parseFloat(keiFilter.max) : Infinity
            result = result.filter(r => r.kei !== null && r.kei >= min && r.kei <= max)
        }

        if (rankFilter.min || rankFilter.max) {
            const min = rankFilter.min ? parseFloat(rankFilter.min) : -Infinity
            const max = rankFilter.max ? parseFloat(rankFilter.max) : Infinity
            result = result.filter(r => r.my_rank !== null && r.my_rank >= min && r.my_rank <= max)
        }

        if (relevancyFilter.min || relevancyFilter.max) {
            const min = relevancyFilter.min ? parseFloat(relevancyFilter.min) : -Infinity
            const max = relevancyFilter.max ? parseFloat(relevancyFilter.max) : Infinity
            result = result.filter(r => r.relevancy_score >= min && r.relevancy_score <= max)
        }

        return result
    }, [data, keywordSearch, volumeFilter, difficultyFilter, keiFilter, rankFilter, relevancyFilter])

    const activeFilterCount = useMemo(() => {
        let count = 0
        if (keywordSearch) count++
        if (volumeFilter.min || volumeFilter.max) count++
        if (difficultyFilter.min || difficultyFilter.max) count++
        if (keiFilter.min || keiFilter.max) count++
        if (rankFilter.min || rankFilter.max) count++
        if (relevancyFilter.min || relevancyFilter.max) count++
        return count
    }, [keywordSearch, volumeFilter, difficultyFilter, keiFilter, rankFilter, relevancyFilter])

    const clearAllFilters = useCallback(() => {
        setKeywordSearch('')
        setVolumeFilter({ min: '', max: '' })
        setDifficultyFilter({ min: '', max: '' })
        setKeiFilter({ min: '', max: '' })
        setRankFilter({ min: '', max: '' })
        setRelevancyFilter({ min: '', max: '' })
    }, [])

    const columns = useMemo<ColumnDef<KeywordRow>[]>(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                ),
                size: 50,
            },
            {
                accessorKey: 'keyword',
                header: 'Keyword',
                cell: info => <div className="font-medium">{info.getValue() as string}</div>,
            },
            {
                accessorKey: 'volume',
                header: 'Volume',
                cell: info => {
                    const val = info.getValue() as number | null
                    return val !== null ? val.toLocaleString() : '-'
                },
            },
            {
                accessorKey: 'difficulty',
                header: 'Difficulty',
                cell: info => info.getValue()?.toString() || '-',
            },
            {
                accessorKey: 'kei',
                header: 'KEI',
                cell: info => {
                    const val = info.getValue() as number | null
                    return val !== null ? val.toFixed(1) : '-'
                },
            },
            {
                accessorKey: 'my_rank',
                header: 'My Rank',
                cell: info => info.getValue()?.toString() || '-',
            },
            {
                accessorKey: 'competitor_best_rank',
                header: 'Best Comp.',
                cell: info => info.getValue()?.toString() || '-',
            },
            {
                accessorKey: 'relevancy_score',
                header: 'Relevancy',
                cell: info => (info.getValue() as number).toFixed(1),
            },
            {
                accessorKey: 'total_score',
                header: 'Total Score',
                cell: info => {
                    const val = info.getValue() as number
                    return <span className="font-semibold">{val.toFixed(1)}</span>
                },
            }
        ],
        []
    )

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { sorting, rowSelection },
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        enableRowSelection: true,
    })

    const { rows } = table.getRowModel()

    const parentRef = useRef<HTMLDivElement>(null)

    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 40,
        overscan: 10,
    })

    const handleRowClick = (index: number, e: React.MouseEvent) => {
        const row = rows[index]
        if (e.shiftKey && lastSelectedIndex.current !== null) {
            // Shift+click: select range
            const start = Math.min(lastSelectedIndex.current, index)
            const end = Math.max(lastSelectedIndex.current, index)
            const newSelection: Record<string, boolean> = { ...rowSelection }
            for (let i = start; i <= end; i++) {
                newSelection[i.toString()] = true
            }
            setRowSelection(newSelection)
        } else if (e.ctrlKey || e.metaKey) {
            // Ctrl/Cmd+click: toggle individual
            row.toggleSelected()
        } else {
            // Normal click: toggle individual
            row.toggleSelected()
        }
        lastSelectedIndex.current = index
    }

    const selectedRows = table.getSelectedRowModel().rows.map(r => r.original)
    const datasetId = data.length > 0 ? data[0].dataset_id : ''

    return (
        <>
            {/* Filter Bar */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/40 overflow-x-auto scrollbar-none">
                <div className="relative flex-shrink-0">
                    <input
                        type="text"
                        placeholder="Search keywords..."
                        value={keywordSearch}
                        onChange={e => setKeywordSearch(e.target.value)}
                        className="pl-3 pr-3 py-1.5 text-xs font-medium border border-border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary w-40 shadow-sm"
                    />
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-xs font-medium shadow-sm transition-colors flex-shrink-0 ${showFilters || activeFilterCount > 0 ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-white hover:bg-muted/50'
                        }`}
                >
                    Filters {activeFilterCount > 0 && <span className="bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{activeFilterCount}</span>}
                </button>

                {activeFilterCount > 0 && (
                    <button
                        onClick={clearAllFilters}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium whitespace-nowrap px-2 flex-shrink-0"
                    >
                        ✕ Clear all
                    </button>
                )}

                <div className="flex-1" />

                <button
                    onClick={() => setShowExportModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-md text-xs font-medium hover:bg-muted/50 bg-white shadow-sm transition-colors flex-shrink-0"
                >
                    <Download className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Export</span>
                </button>

                <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0 border-l border-border pl-3 ml-1">
                    {filteredData.length} / {data.length} keywords
                </span>
            </div>

            {/* Expandable Filter Panel */}
            {showFilters && (
                <div className="grid grid-cols-5 gap-4 mb-4 p-4 bg-muted/20 rounded-lg border border-border/40">
                    <FilterRange label="Volume" value={volumeFilter} onChange={setVolumeFilter} />
                    <FilterRange label="Difficulty" value={difficultyFilter} onChange={setDifficultyFilter} />
                    <FilterRange label="KEI" value={keiFilter} onChange={setKeiFilter} />
                    <FilterRange label="My Rank" value={rankFilter} onChange={setRankFilter} />
                    <FilterRange label="Relevancy" value={relevancyFilter} onChange={setRelevancyFilter} />
                </div>
            )}

            {/* Table */}
            <div className="border border-border/60 rounded-lg bg-white overflow-hidden shadow-sm">
                <div className="bg-white border-b border-border/60 px-4 py-3 grid grid-cols-[50px_3fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
                    {table.getFlatHeaders().map((header) => {
                        return (
                            <div
                                key={header.id}
                                className={header.column.getCanSort() ? 'cursor-pointer select-none truncate hover:text-foreground transition-colors' : 'truncate'}
                                onClick={header.column.getToggleSortingHandler()}
                            >
                                {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                )}
                                {{
                                    asc: ' ↑',
                                    desc: ' ↓',
                                }[header.column.getIsSorted() as string] ?? null}
                            </div>
                        )
                    })}
                </div>

                <div ref={parentRef} className="h-[600px] overflow-auto">
                    <div
                        style={{
                            height: `${virtualizer.getTotalSize()}px`,
                            width: '100%',
                            position: 'relative',
                        }}
                    >
                        {virtualizer.getVirtualItems().map((virtualRow) => {
                            const row = rows[virtualRow.index]
                            return (
                                <div
                                    key={row.id}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: `${virtualRow.size}px`,
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                    className={`grid grid-cols-[50px_3fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 items-center px-4 border-b border-border/40 text-[13px] transition-colors cursor-pointer ${row.getIsSelected() ? 'bg-primary/5' : 'hover:bg-muted/30 bg-white'}`}
                                    onClick={(e) => handleRowClick(virtualRow.index, e)}
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        return (
                                            <div key={cell.id} className="truncate" onClick={e => e.stopPropagation()}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {selectedRows.length > 0 && (
                <SelectionDrawer
                    datasetId={datasetId}
                    selectedRows={selectedRows}
                    onClearSelection={() => setRowSelection({})}
                />
            )}

            <ExportModal
                datasetId={datasetId}
                activePresetId={null} // TODO: pass if needed, requires lifting state up.
                selectedKeywordIds={selectedRows.map(r => r.id)}
                filteredKeywordIds={filteredData.map(r => r.id)}
                open={showExportModal}
                onOpenChange={setShowExportModal}
            />
        </>
    )
}

function FilterRange({ label, value, onChange }: { label: string, value: RangeFilter, onChange: (v: RangeFilter) => void }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">{label}</label>
            <div className="flex gap-1.5">
                <input
                    type="number"
                    placeholder="Min"
                    value={value.min}
                    onChange={e => onChange({ ...value, min: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border border-border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                    type="number"
                    placeholder="Max"
                    value={value.max}
                    onChange={e => onChange({ ...value, max: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border border-border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
            </div>
        </div>
    )
}
