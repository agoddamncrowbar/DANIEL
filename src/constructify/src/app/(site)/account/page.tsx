"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  profile_picture?: string | null;
  created_at: string;
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const router = useRouter();

  // 🔑 Consistent API base
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await api.get<User>("/auth/me");
        setUser(res.data);
        setName(res.data.name);
        setPhone(res.data.phone || "");

        const path = res.data.profile_picture
          ? `${API_URL}/uploads/${res.data.profile_picture}`
          : null;

        console.log("Fetched profile picture path:", path);

        setPreview(path);
      } catch (err) {
        console.error("Failed to fetch user", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router, API_URL]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) {
      const localPreview = URL.createObjectURL(f);
      console.log("Local preview path:", localPreview);
      setPreview(localPreview);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const formData = new FormData();
      if (name) formData.append("name", name);
      if (phone) formData.append("phone", phone);
      if (file) formData.append("file", file);

      const res = await api.put<User>(`/users/${user.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const path = res.data.profile_picture
        ? `${API_URL}/uploads/${res.data.profile_picture}`
        : null;

      console.log("Updated profile picture path:", path);

      setUser(res.data);
      setFile(null);
      setPreview(path);
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = async () => {
    if (!user) return;
    setUpgrading(true);
    try {
      const formData = new FormData();
      formData.append("role", "seller");

      const res = await api.put<User>(`/users/${user.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(res.data);
      console.log("User upgraded to seller:", res.data);
    } catch (err) {
      console.error("Upgrade failed", err);
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Account</h1>

      {/* Profile Picture */}
      <div className="flex items-center space-x-4">
        <Avatar className="w-20 h-20">
          {preview ? (
            <AvatarImage
              src={preview}
              alt={user.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <AvatarFallback className="text-lg">
              {user.name ? user.name.charAt(0).toUpperCase() : "?"}
            </AvatarFallback>
          )}
        </Avatar>
        <Input type="file" accept="image/*" onChange={handleFileChange} />
</div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <Label>Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div>
          <Label>Email</Label>
          <Input value={user.email} disabled className="bg-gray-100 text-gray-600" />
        </div>

        <div>
          <Label>Role</Label>
          <Input value={user.role} disabled className="bg-gray-100 text-gray-600" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={saving} className="bg-black text-white hover:bg-gray-800">
          {saving ? "Saving..." : "Save Changes"}
        </Button>

        {user.role !== "seller" && (
          <Button onClick={handleUpgrade} disabled={upgrading} className="bg-black text-white hover:bg-gray-800">
            {upgrading ? "Upgrading..." : "Become a Seller"}
          </Button>
        )}
      </div>
    </div>
  );
}
