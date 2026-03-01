'use client'

import { useRef, useMemo, useState } from 'react'
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    ColumnDef,
    SortingState
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'

export interface KeywordRow {
    id: string
    keyword: string
    volume: number | null
    difficulty: number | null
    kei: number | null
    my_rank: number | null
    competitor_best_rank: number | null
    relevancy_score: number
    total_score: number
}

interface DataTableProps {
    data: KeywordRow[]
}

export function DataTable({ data }: DataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([])

    const columns = useMemo<ColumnDef<KeywordRow>[]>(
        () => [
            {
                accessorKey: 'keyword',
                header: 'Keyword',
                cell: info => <div className="font-medium">{info.getValue() as string}</div>,
            },
            {
                accessorKey: 'volume',
                header: 'Volume',
                cell: info => info.getValue()?.toString() || '-',
            },
            {
                accessorKey: 'difficulty',
                header: 'Difficulty',
                cell: info => info.getValue()?.toString() || '-',
            },
            {
                accessorKey: 'kei',
                header: 'KEI',
                cell: info => info.getValue()?.toString() || '-',
            },
            {
                accessorKey: 'my_rank',
                header: 'My Rank',
                cell: info => info.getValue()?.toString() || '-',
            },
            {
                accessorKey: 'competitor_best_rank',
                header: 'Comp. Best Rank',
                cell: info => info.getValue()?.toString() || '-',
            },
            {
                accessorKey: 'relevancy_score',
                header: 'Relevancy',
                cell: info => (info.getValue() as number).toFixed(2),
            },
            {
                accessorKey: 'total_score',
                header: 'Total Score',
                cell: info => (info.getValue() as number).toFixed(2),
            }
        ],
        []
    )

    const table = useReactTable({
        data,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    const { rows } = table.getRowModel()

    const parentRef = useRef<HTMLDivElement>(null)

    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 40,
        overscan: 10,
    })

    return (
        <div className="border rounded-md">
            <div className="bg-muted p-2 grid grid-cols-8 gap-4 font-semibold text-sm">
                {table.getFlatHeaders().map((header) => {
                    return (
                        <div
                            key={header.id}
                            className={header.column.getCanSort() ? 'cursor-pointer select-none truncate' : 'truncate'}
                            onClick={header.column.getToggleSortingHandler()}
                        >
                            {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                            )}
                            {{
                                asc: ' 🔼',
                                desc: ' 🔽',
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
                                className="grid grid-cols-8 gap-4 items-center p-2 border-b text-sm transition-colors hover:bg-muted/50"
                            >
                                {row.getVisibleCells().map((cell) => {
                                    return (
                                        <div key={cell.id} className="truncate">
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
    )
}
