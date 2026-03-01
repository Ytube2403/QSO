import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            <Sidebar />
            <div className="flex flex-col flex-1 h-full min-w-0">
                <Header />
                <main className="flex-1 overflow-auto bg-muted/20">
                    {children}
                </main>
            </div>
        </div>
    )
}
