import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/libz/api";
import axios from "axios";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Upload, X } from "lucide-react";

interface User {
  id: number;
  role: string;
}

export default function CreateListing() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user", err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("location", location);
      formData.append("category", category);

      if (files) {
        Array.from(files).forEach((file) => {
          formData.append("images", file);
        });
      }

      await api.post("/listings/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/listings");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        if (Array.isArray(detail)) {
          setError(detail.map((d: any) => d.msg).join(", "));
        } else {
          setError(detail || "Failed to create listing");
        }
      } else {
        setError("Failed to create listing");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFiles = () => {
    setFiles(null);
  };

  // Still fetching user?
  if (loadingUser)
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-600">Loading...</p>
        </div>
        <Footer />
      </>
    );

  // Non-seller dialog
  if (!user || user.role !== "seller") {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Dialog defaultOpen>
            <DialogContent style={{ borderRadius: 0 }}>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Upgrade Required</DialogTitle>
                <DialogDescription className="text-gray-600">
                  You need a seller account to create listings. Would you like to switch your
                  account type to seller?
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <Button
                  onClick={() => navigate("/account")}
                  className="bg-[#B8860B] text-white hover:bg-[#9A7209] transition-all duration-200"
                  style={{ borderRadius: 0 }}
                >
                  Go to Account Settings
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Footer />
      </>
    );
  }

  // Seller form
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 border-b-2 border-[#B8860B] pb-2 inline-block">
              Create a New Listing
            </h1>
            <p className="text-gray-600 mt-2">Fill in the details below to post your ad</p>
          </div>

          <Card className="shadow-md bg-white border-2 border-gray-200" style={{ borderRadius: 0 }}>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">
                    Title <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Cement Blocks"
                    required
                    className="border-2 border-gray-300 focus:border-[#B8860B] transition-all duration-200"
                    style={{ borderRadius: 0 }}
                  />
                </div>

                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a detailed description of your item..."
                    rows={5}
                    className="border-2 border-gray-300 focus:border-[#B8860B] transition-all duration-200"
                    style={{ borderRadius: 0 }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-2 block">
                      Price (KES) <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="1500"
                      required
                      className="border-2 border-gray-300 focus:border-[#B8860B] transition-all duration-200"
                      style={{ borderRadius: 0 }}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-2 block">
                      Location <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Nairobi"
                      required
                      className="border-2 border-gray-300 focus:border-[#B8860B] transition-all duration-200"
                      style={{ borderRadius: 0 }}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">
                    Category <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Building Materials"
                    required
                    className="border-2 border-gray-300 focus:border-[#B8860B] transition-all duration-200"
                    style={{ borderRadius: 0 }}
                  />
                </div>

                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">Upload Images</Label>
                  <div className="border-2 border-dashed border-gray-300 p-6 text-center hover:border-[#B8860B] transition-all duration-200">
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setFiles(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload size={40} className="text-gray-400 mb-2" />
                      <span className="text-gray-600 font-medium">
                        Click to upload images
                      </span>
                      <span className="text-gray-400 text-sm mt-1">
                        PNG, JPG, JPEG (max 5MB each)
                      </span>
                    </label>
                  </div>
                  
                  {files && files.length > 0 && (
                    <div className="mt-3 flex items-center justify-between bg-gray-100 p-3">
                      <span className="text-sm text-gray-700">
                        {files.length} file{files.length > 1 ? "s" : ""} selected
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveFiles}
                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-600 p-4">
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#B8860B] text-white hover:bg-[#9A7209] font-bold py-3 transition-all duration-200"
                  disabled={loading}
                  style={{ borderRadius: 0 }}
                >
                  {loading ? "Creating..." : "Create Listing"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}