import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { API_BASE_URL } from "@/libz/constants";
import api from "@/libz/api";

interface EditListingModalProps {
  open: boolean;
  onClose: () => void;
  listing: {
    id: number;
    title: string;
    description: string;
    price: number;
    location: string;
    category: string;
    images?: { image_url: string; is_primary: boolean }[];
  } | null;
  onSave: (updatedListing: any) => void;
}

export default function EditListingModal({
  open,
  onClose,
  listing,
  onSave,
}: EditListingModalProps) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: 0,
    location: "",
    category: "",
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  // Sync modal state with selected listing
  useEffect(() => {
    if (listing) {
      setForm({
        title: listing.title,
        description: listing.description,
        price: listing.price,
        location: listing.location,
        category: listing.category,
      });
      setExistingImages(listing.images?.map((img) => img.image_url) || []);
      setNewImages([]);
    }
  }, [listing]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages(Array.from(e.target.files));
    }
  };

  const removeExistingImage = (index: number) => {
    const updated = existingImages.filter((_, i) => i !== index);
    setExistingImages(updated);
  };

  const handleSave = async () => {
    if (!listing) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("price", form.price.toString());
      formData.append("location", form.location);
      formData.append("category", form.category);

      // Append new image files
      newImages.forEach((file) => formData.append("images", file));

      // Note: removing images requires backend support (optional enhancement)
      const res = await api.put(`/listings/${listing.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onSave(res.data);
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to update listing");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Listing</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
          />
          <Textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
          />
          <Input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="Price"
          />
          <Input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location"
          />
          <Input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Category"
          />

          {/* Existing images */}
          {existingImages.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Current Images</p>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((img, i) => (
                  <div
                    key={i}
                    className="relative w-24 h-24 rounded overflow-hidden border"
                  >
                    <img
                      src={`${API_BASE_URL}${img}`}
                      alt="Listing"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeExistingImage(i)}
                      className="absolute top-1 right-1 bg-black/50 text-white text-xs rounded px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload new images */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Upload New Images</p>
            <Input type="file" multiple onChange={handleImageChange} />
            {newImages.length > 0 && (
              <div className="flex gap-3 mt-2 flex-wrap">
                {newImages.map((file, i) => (
                  <div
                    key={i}
                    className="w-24 h-24 border rounded overflow-hidden"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
