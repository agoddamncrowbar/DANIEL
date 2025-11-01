"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Seller = {
  id: number;
  business_name: string;
  address: string;
  logo?: string | null;
};

export default function SellerPage() {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const res = await api.get<Seller>("/sellers/me");
        setSeller(res.data);
        setBusinessName(res.data.business_name);
        setAddress(res.data.address);
      } catch (err) {
        console.error("Failed to fetch seller", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSeller();
  }, []);

  const handleSave = async () => {
    if (!seller) return;
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("business_name", businessName);
      formData.append("address", address);
      if (file) formData.append("file", file);

      await api.put<Seller>("/sellers/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  if (loading) return <p>Loading...</p>;
  if (!seller) return <p className="text-red-600">Seller profile not found.</p>;

  const logoUrl = seller.logo ? `${API_BASE}/uploads/${seller.logo}` : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Seller Profile</h1>

      {/* Logo */}
      <div className="flex items-center space-x-4">
        <Avatar className="w-20 h-20">
          {logoUrl ? (
            <AvatarImage
              src={logoUrl}
              alt={seller.business_name}
              className="object-cover w-full h-full"
            />
          ) : (
            <AvatarFallback className="text-lg">
              {seller.business_name
                ? seller.business_name.charAt(0).toUpperCase()
                : "?"}
            </AvatarFallback>
          )}
        </Avatar>

        <div>
          <Button type="button" variant="outline" onClick={handleFileButtonClick}>
            Upload Logo
          </Button>
          <Input
            ref={fileInputRef}
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Business Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Address</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
