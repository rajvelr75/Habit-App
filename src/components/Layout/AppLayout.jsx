import { Sidebar } from "./Sidebar";

export function AppLayout({ children }) {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
            <Sidebar />
            <main className="flex-1 min-w-0 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
