import { useEffect, useState } from "react";
import api from "@/libz/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/libz/constants";
import { useAuth } from "@/context/useAuth";

interface SellerProfile {
  id: number;
  business_name: string;
  address: string;
  logo?: string;
  status: string;
}

export default function StoreTab() {
  const { user } = useAuth();
  const [store, setStore] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    business_name: "",
    address: "",
    file: null as File | null,
  });

  const fetchStore = async () => {
    setLoading(true);
    try {
      const res = await api.get("/sellers/me");
      setStore(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) setStore(null);
      else alert("Failed to load store");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "seller") fetchStore();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm({ ...form, file });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    const formData = new FormData();
    if (form.business_name) formData.append("business_name", form.business_name);
    if (form.address) formData.append("address", form.address);
    if (form.file) formData.append("file", form.file);

    try {
      const res = store
        ? await api.put("/sellers/me", formData)
        : await api.post("/sellers", {
            business_name: form.business_name,
            address: form.address,
          });

      setStore(res.data);
      setEditing(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save store");
    }
  };

  if (loading) return <p>Loading store info...</p>;

  if (!store && user?.role === "seller") {
    return (
      <div className="max-w-md bg-white  shadow p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Create Your Store</h2>

        <Input
          name="business_name"
          placeholder="Business Name"
          className="w-full"
          onChange={handleChange}
        />
        <Input
          name="address"
          placeholder="Business Address"
          className="w-full"
          onChange={handleChange}
        />

        <Button
          onClick={handleSave}
          className="bg-[#B8860B] hover:bg-[#9A7209] text-white w-full"
        >
          Create Store
        </Button>
      </div>
    );
  }

  if (user?.role !== "seller") {
    return <div>You need to be a seller to manage a store.</div>;
  }

  return (
    <div className="max-w-xl w-full bg-white  shadow p-6 space-y-6">
      {/* LOGO + UPLOAD */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {store?.logo ? (
          <img
            src={`${API_BASE_URL}/uploads/${store.logo}`}
            alt="Store Logo"
            className="w-24 h-24 rounded-full object-cover border"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border">
            <span className="text-gray-500 text-sm">No Logo</span>
          </div>
        )}

        {editing && (
          <div className="flex-1">
            <Label htmlFor="file" className="font-medium">
              Change Logo
            </Label>
            <Input
              type="file"
              accept="image/*"
              id="file"
              onChange={handleFileChange}
              className="mt-1"
            />
          </div>
        )}
      </div>

      {/* EDIT MODE */}
      {editing ? (
        <div className="space-y-4">
          <Input
            name="business_name"
            value={form.business_name}
            placeholder="Business Name"
            onChange={handleChange}
            className="w-full"
          />

          <Input
            name="address"
            value={form.address}
            placeholder="Address"
            onChange={handleChange}
            className="w-full"
          />

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleSave}
              className="bg-[#B8860B] hover:bg-[#9A7209] text-white w-full sm:w-auto"
            >
              Save
            </Button>

            <Button
              variant="outline"
              onClick={() => setEditing(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        /* VIEW MODE */
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-gray-800">
            {store?.business_name}
          </h2>

          <p className="text-gray-600">{store?.address}</p>

          <p className="text-sm text-gray-400 capitalize">
            Status: {store?.status}
          </p>

          <Button
            onClick={() => {
              setEditing(true);
              setForm({
                business_name: store?.business_name || "",
                address: store?.address || "",
                file: null,
              });
            }}
            className="mt-4 bg-[#B8860B] hover:bg-[#9A7209] text-white w-full sm:w-auto"
          >
            Edit Store
          </Button>
        </div>
      )}
    </div>
  );
}
