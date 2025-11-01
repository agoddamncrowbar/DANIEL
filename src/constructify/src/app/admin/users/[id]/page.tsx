"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: string;
    is_active: boolean;
    is_seller_approved: boolean;
    created_at: string;
}

export default function AdminUserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    async function fetchUser() {
        try {
            const token = localStorage.getItem("token");
            const res = await api.get<User>(`/admin/users/${params.id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
            setUser(res.data);
        } catch (err) {
            console.error("Failed to fetch user", err);
        }
    }

    useEffect(() => {
        fetchUser();
    }, [params.id]);

    async function handleAction(action: string) {
        try {
            const token = localStorage.getItem("token");
            await api.post(`/admin/users/${params.id}/${action}`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
        fetchUser();
        } catch (err) {
            console.error(`Failed to ${action}`, err);
        }
    }

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            const token = localStorage.getItem("token");
        await api.delete(`/admin/users/${params.id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        router.push("/admin/users");
        } catch (err) {
            console.error("Failed to delete user", err);
        }
    }

    if (!user) return <p>Loading user...</p>;

    return (
        <Card>
        <CardHeader>
            <CardTitle>User: {user.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <p>Email: {user.email}</p>
            <p>Phone: {user.phone ?? "—"}</p>
            <p>Role: <Badge>{user.role}</Badge></p>
            <p>Status: {user.is_active ? "Active" : "Suspended"}</p>
            <p>Seller Approved: {user.is_seller_approved ? "Yes" : "No"}</p>
            <p>Created: {new Date(user.created_at).toLocaleDateString()}</p>

            <div className="flex flex-wrap gap-2 mt-4">
            {user.is_active ? (
                <Button
                variant="destructive"
                onClick={() => handleAction("suspend")}
                >
                Suspend
                </Button>
            ) : (
                <Button onClick={() => handleAction("activate")}>Activate</Button>
            )}
            {!user.is_seller_approved && (
                <Button onClick={() => handleAction("approve-seller")}>
                Approve as Seller
                </Button>
            )}
            <Button variant="outline" onClick={handleDelete}>
                Delete
            </Button>
            </div>
        </CardContent>
        </Card>
    );
}
