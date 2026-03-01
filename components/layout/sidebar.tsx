import Link from "next/link";
import {
    BarChart2,
    Search,
    Star,
    Compass,
    ChevronDown,
    ChevronRight,
    TrendingUp,
    FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
    return (
        <div className="w-64 border-r border-border bg-sidebar shrink-0 flex flex-col h-full overflow-y-auto">
            <div className="p-4 flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
                <TrendingUp strokeWidth={3} className="w-6 h-6 text-primary" />
                <span className="text-sidebar-foreground">QSO</span>
            </div>

            <nav className="flex-1 py-2 px-3 flex flex-col gap-1 text-sm text-sidebar-foreground">
                <Link href="/app" className="flex items-center justify-between px-2 py-2 cursor-pointer hover:bg-sidebar-accent rounded-md group">
                    <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-muted-foreground group-hover:text-sidebar-foreground" />
                        <span>Workspaces</span>
                    </div>
                </Link>

                <div className="flex flex-col mt-1">
                    <div className="flex items-center justify-between px-2 py-2 cursor-pointer hover:bg-sidebar-accent rounded-md group">
                        <div className="flex items-center gap-3">
                            <Search className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-primary">Keyword Analysis</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-primary" />
                    </div>

                    <div className="ml-6 flex flex-col mt-1 border-l border-border pl-2 space-y-1">
                        <div className="px-2 py-1.5 bg-sidebar-accent text-sidebar-foreground font-medium rounded-md cursor-pointer border-l-2 -ml-[9px] border-primary pl-[7px]">
                            Current Dataset
                        </div>
                    </div>
                </div>

            </nav>
        </div>
    )
}
