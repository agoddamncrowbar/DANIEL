"use client";

import Link from "next/link";
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SiteLayout({ children }: { children: ReactNode }) {
  const { user, isLoggedIn, logout } = useAuth();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
  // Debug image URL
  useEffect(() => {
    if (user?.profile_picture) {
      const imgPath = `${API_BASE}/uploads/${user.profile_picture}`;
      console.log("(Navbar) User profile picture URL:", imgPath);}
  }, [API_BASE, user?.profile_picture ]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white">
        <nav className="container mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Constructify
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <Link href="/listings" className="hover:text-blue-600">
              Listings
            </Link>

            {/* Show Sell only for sellers */}
            {user?.role === "seller" && (
              <Link href="/create-listing" className="hover:text-blue-600">
                Sell
              </Link>
            )}

            {isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`${API_BASE}/uploads/${user.profile_picture}`}
                        alt={user.name}
                      />
                      <AvatarFallback>
                        {user.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.name || "Account"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/account">Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>

        </nav>
      </header>

      {/* Content */}
      <main className="">{children}</main>
    </div>
  );
}
