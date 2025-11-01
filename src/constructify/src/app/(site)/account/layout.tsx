"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import api from "@/lib/api"; // axios instance with token

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function AccountsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get<User>("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const links = [
    { href: "/account", label: "General" },
    { href: "/account/messages", label: "Messages" },
  ];

  // Only show Seller link if user.role === "seller"
  if (user?.role === "seller") {
    links.push({ href: "/account/seller", label: "Seller" });
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 border-r p-6">
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <nav className="space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block px-3 py-2 rounded hover:bg-gray-200",
                  pathname === link.href ? "bg-gray-300 font-medium" : ""
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
