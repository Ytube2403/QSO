import { Search, ChevronDown, Bell, UserCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Header() {
    return (
        <header className="h-14 border-b border-border bg-white flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-64 lg:w-80">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search for an app" className="pl-9 h-8 bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary border-transparent focus:border-border rounded-full" />
                </div>

                <div className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer">
                    My Apps <ChevronDown className="w-3 h-3" />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 border border-border px-3 py-1.5 rounded-full text-sm font-medium hover:bg-muted/50 cursor-pointer">
                    <UserCircle className="w-4 h-4 text-primary" />
                    Ask Ad Agent
                </div>

                <div className="relative cursor-pointer text-muted-foreground hover:text-foreground">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-destructive-foreground">
                        10+
                    </span>
                </div>

                <div className="flex items-center gap-2 text-sm font-medium cursor-pointer pl-4 border-l border-border">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                        L
                    </div>
                    <span className="hidden sm:inline-block">Linh's Workspace</span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
                </div>
            </div>
        </header>
    )
}
