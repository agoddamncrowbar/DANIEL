import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import api from "@/libz/api";
import { API_BASE_URL } from "@/libz/constants";
import { useAuth } from "@/context/useAuth";

export default function ProfileTab() {
  const { user, refreshUser } = useAuth(); // assumes you have auth context with current user
  const [form, setForm] = useState({
    name: "",
    phone: "",
    role: "",
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        role: user.role || "",
      });
      if (user.profile_picture) {
        setPreview(`${API_BASE_URL}/uploads/${user.profile_picture}`);
      }
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("phone", form.phone);
      if (profileFile) formData.append("file", profileFile);

      // Optionally allow upgrade to seller
      if (form.role && form.role !== user.role) {
        formData.append("role", form.role);
      }

      const res = await api.put(`/users/${user.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      refreshUser(); // update user context
      alert("Profile updated successfully!");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        Please log in to access your account.
        <Button className="mt-4" onClick={() => (window.location.href = "/login")}>
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-start py-20 bg-gray-50">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle>Edit Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300">
              <img
                src={preview || "/default-avatar.png"}
                alt="Profile"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="mt-3">
              <Label htmlFor="file" className="cursor-pointer text-blue-600">
                Change Picture
              </Label>
              <Input
                id="file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div>
            <Label>Name</Label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full name"
            />
          </div>

          <div>
            <Label>Phone</Label>
            <Input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone number"
            />
          </div>

          <div>
            <Label>Role</Label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border rounded px-2 py-2"
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              You can only upgrade to seller if you're currently a buyer.
            </p>
          </div>

          <Button
            className="w-full mt-4"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
