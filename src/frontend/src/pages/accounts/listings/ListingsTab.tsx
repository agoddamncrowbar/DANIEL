import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/constants";
import EditListingModal from "./EditingModal";

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  category: string;
  images: { image_url: string; is_primary: boolean }[];
}

export default function ListingsTab() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/listings/my-listings");
      setListings(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch listings");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchListings();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await api.delete(`/listings/${id}`);
      setListings(listings.filter(l => l.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete listing");
    }
  };

  const handleSave = (updatedListing: Listing) => {
    setListings(prev =>
      prev.map(l => (l.id === updatedListing.id ? updatedListing : l))
    );
  };

  if (loading) return <div>Loading your listings...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!listings.length) return <div>No listings yet. Create one!</div>;

  return (
    <div className="space-y-4">
      {listings.map(listing => (
        <div key={listing.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {listing.images.length > 0 && (
              <img
                src={`${API_BASE_URL}${listing.images[0].image_url}`}
                alt={listing.title}
                className="w-20 h-20 object-cover rounded"
              />
            )}
            <div>
              <h3 className="font-semibold text-lg">{listing.title}</h3>
              <p className="text-gray-500 text-sm">{listing.category} | {listing.location}</p>
              <p className="text-brand-green font-bold">${listing.price}</p>
            </div>
          </div>
          <div className="space-x-2">
            <Button
              onClick={() => setEditingListing(listing)}
              variant="outline"
            >
              Edit
            </Button>
            <Button
              onClick={() => handleDelete(listing.id)}
              variant="destructive"
            >
              Delete
            </Button>
          </div>
        </div>
      ))}

      <EditListingModal
        open={!!editingListing}
        onClose={() => setEditingListing(null)}
        listing={editingListing}
        onSave={handleSave}
      />
    </div>
  );
}
