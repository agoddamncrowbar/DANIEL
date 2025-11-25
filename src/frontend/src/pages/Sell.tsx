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

  // Still fetching user?
  if (loadingUser)
    return (
    <>
    <Header/>
        <p className="p-6">Loading...</p>
    <Footer/>
    </>
    )

  // Non-seller dialog
  if (!user || user.role !== "seller") {
    return (
        <>
        <Header/>
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Required</DialogTitle>
            <DialogDescription>
              You need a seller account to create listings.
              Would you like to switch your account type to seller?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button onClick={() => navigate("/account")} className="bg-blue-600 text-white">
              Go to Account Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer/></>
    );
  }

  // Seller form
  return (
    <>
        <Header/>
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      <Card className="w-full max-w-xl shadow-lg bg-white">
        <CardHeader>
          <h2 className="text-xl font-bold">Create a New Listing</h2>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cement Blocks"
                required
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description"
              />
            </div>

            <div>
              <Label>Price</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1500"
                required
              />
            </div>

            <div>
              <Label>Location</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Nairobi"
                required
              />
            </div>

            <div>
              <Label>Category</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Building Materials"
                required
              />
            </div>

            <div>
              <Label>Upload Images</Label>
              <Input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Listing"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
    <Footer/></>
  );
}
