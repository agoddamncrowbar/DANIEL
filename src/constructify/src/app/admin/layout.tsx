"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Users,
    Store,
    List,
    Tags,
    FileWarning,
    Settings,
} from "lucide-react";

const sidebarLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Sellers", href: "/admin/sellers", icon: Store },
    { name: "Listings", href: "/admin/listings", icon: List },
    { name: "Categories", href: "/admin/categories", icon: Tags },
    { name: "Reports", href: "/admin/reports", icon: FileWarning },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md">
            <div className="px-6 py-4 border-b">
            <h1 className="text-xl font-bold text-blue-600">Admin Panel</h1>
            </div>
            <nav className="mt-4 space-y-1">
            {sidebarLinks.map((link) => {
                const Icon = link.icon;
                return (
                <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                    "flex items-center px-6 py-2 text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600",
                    pathname === link.href && "bg-blue-100 text-blue-700"
                )}
                >
                    <Icon className="mr-3 h-4 w-4" />
                    {link.name}
                </Link>
                );
            })}
            </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
            {/* Top Navbar */}
            <header className="flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm">
            <div className="text-lg font-semibold text-gray-800">
                {sidebarLinks.find((l) => l.href === pathname)?.name || "Admin"}
            </div>
            <div className="flex items-center gap-4">
                {/* Placeholder for search or notifications */}
                <input
                    type="text"
                    placeholder="Search..."
                    className="border rounded-md px-3 py-1 text-sm"
                />
                <Button variant="outline">Profile</Button>
            </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 p-6">{children}</main>
        </div>
        </div>
    );
}
