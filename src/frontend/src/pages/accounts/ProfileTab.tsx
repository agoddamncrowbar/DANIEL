import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import api from "@/libz/api";
import { API_BASE_URL } from "@/libz/constants";
import { useAuth } from "@/context/useAuth";
import { Camera, User, Phone, Briefcase } from "lucide-react";

export default function ProfileTab() {
  const { user, refreshUser } = useAuth();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

      await api.put(`/users/${user.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      refreshUser();
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
        <p className="mb-4">Please log in to access your account.</p>
        <Button 
          className="bg-[#B8860B] text-white hover:bg-[#9A7209] transition-all duration-200" 
          onClick={() => (window.location.href = "/login")}
          style={{ borderRadius: 0 }}
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 border-b-2 border-[#B8860B] pb-2 inline-block">
          Edit Profile
        </h1>
        <p className="text-gray-600 mt-2">Update your account information and preferences</p>
      </div>

      <Card className="shadow-md bg-white border-2 border-gray-200" style={{ borderRadius: 0 }}>
        <CardContent className="p-6 space-y-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center pb-6 border-b-2 border-gray-200">
            <div className="relative w-32 h-32 border-2 border-[#B8860B] overflow-hidden group">
              <img
                src={
                  preview || 
                  `https://ui-avatars.com/api/?background=B8860B&color=fff&name=${encodeURIComponent(user.name)}`
                }
                alt="Profile"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer">
                <Camera size={32} className="text-white" />
              </div>
              <input
                id="file"
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
            </div>
            <p className="text-sm text-gray-600 mt-3">Click image to change profile picture</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-2 flex items-center">
                <User size={16} className="mr-2" />
                Full Name
              </Label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="border-2 border-gray-300 focus:border-[#B8860B] transition-all duration-200"
                style={{ borderRadius: 0 }}
              />
            </div>

            <div>
              <Label className="text-sm font-bold text-gray-700 mb-2 flex items-center">
                <Phone size={16} className="mr-2" />
                Phone Number
              </Label>
              <Input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="border-2 border-gray-300 focus:border-[#B8860B] transition-all duration-200"
                style={{ borderRadius: 0 }}
              />
            </div>

            <div>
              <Label className="text-sm font-bold text-gray-700 mb-2 flex items-center">
                <Briefcase size={16} className="mr-2" />
                Account Type
              </Label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full border-2 border-gray-300 px-3 py-2 focus:border-[#B8860B] focus:outline-none transition-all duration-200 bg-white text-gray-800"
                style={{ borderRadius: 0 }}
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
              <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2">
                💡 Upgrade to seller to create and manage your own listings
              </p>
            </div>
          </div>

          <Button
            className="w-full bg-[#B8860B] text-white hover:bg-[#9A7209] font-bold py-3 transition-all duration-200 mt-6"
            onClick={handleSave}
            disabled={saving}
            style={{ borderRadius: 0 }}
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}