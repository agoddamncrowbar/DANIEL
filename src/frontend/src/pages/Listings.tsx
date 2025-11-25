import { useEffect, useState } from "react";
import api from "@/libz/api";
import { Link } from "react-router-dom";
import { resolveImageUrl } from "@/libz/url";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ---- Types ----
export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  category: string;
  images: { id: number; image_url: string; is_primary: boolean }[];
}

// ---- Utility: Get or create anonymous ID ----
function getAnonymousId() {
  let id = localStorage.getItem("anonymous_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("anonymous_id", id);
  }
  return id;
}

// ---- Utility: Track item interactions ----
async function trackInteraction(
  listingId: number,
  action: string,
  weight: number
) {
  try {
    const deviceType = /Mobi|Android/i.test(navigator.userAgent)
      ? "mobile"
      : "desktop";
    
    const sessionId = getAnonymousId();

    await api.post("/interactions", {
      listing_id: listingId,
      action,
      weight,
      device_type: deviceType,
      session_id: sessionId,
    });
  } catch (err) {
    // Tracking should never break the UI
    console.warn("Interaction track failed:", err);
  }
}

export default function Listings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // ---- Fetch listings ----
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await api.get("/listings");
        setListings(res.data);

        // Track that the listings grid was viewed
        // Not tied to a listing ID, purely analytics
        await trackInteraction(0, "view", 0.2);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <>
      <Header />

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => {
          const primaryImage =
            listing.images?.find((img) => img.is_primary)?.image_url ||
            listing.images?.[0]?.image_url ||
            null;

          return (
            <Link
              to={`/listings/${listing.id}`}
              key={listing.id}
              className="border rounded-lg shadow hover:shadow-lg transition bg-white"
              onClick={() =>
                trackInteraction(listing.id, "click", 2) // Record click
              }
              onMouseEnter={() =>
                trackInteraction(listing.id, "view", 0.5) // Soft view tracking
              }
            >
              <img
                src={resolveImageUrl(primaryImage ?? undefined)}
                alt={listing.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />

              <div className="p-4">
                <h3 className="text-lg font-semibold">{listing.title}</h3>
                <p className="text-gray-500">{listing.location}</p>
                <p className="text-blue-600 font-bold mt-2">
                  ${listing.price}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <Footer />
    </>
  );
}
