import { NavLink } from "react-router-dom";
import { LayoutDashboard, CheckSquare, BarChart2, User, Menu, X, Flame } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

const NAVIGATION = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Streak", href: "/streak", icon: Flame },
    { name: "Analytics", href: "/analytics", icon: BarChart2 },
    { name: "Profile", href: "/profile", icon: User },
];

export function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Toggle */}
            <div className="lg:hidden p-4 border-b border-white/10 flex items-center justify-between bg-background z-20 sticky top-0">
                <span className="font-bold text-lg tracking-tight">Habit App</span>
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-400 hover:text-white">
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Content */}
            <aside className={clsx(
                "fixed inset-y-0 left-0 z-40 w-64 transform bg-background border-r border-white/10 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:block",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-full flex-col">
                    <div className="p-6 hidden lg:block">
                        <h1 className="text-2xl font-bold tracking-tight">Habit App</h1>
                    </div>

                    <nav className="flex-1 px-4 py-4 space-y-1">
                        {NAVIGATION.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) => clsx(
                                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-white bg-slate-800"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon size={20} />
                                {item.name}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </aside>
        </>
    );
}
