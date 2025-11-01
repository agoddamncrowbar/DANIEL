"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";

// Define the TypeScript type for listings
interface ListingImage {
  id: number;
  image_url: string;
  is_primary: boolean;
}

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  images: ListingImage[]; // include images
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all listings from backend
  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await api.get<Listing[]>("/listings/");
        setListings(res.data);
      } catch (err) {
        console.error("Failed to fetch listings", err);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Available Listings</h1>

      {/* Grid of listings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {listings.map((listing) => {
          // Choose primary image if available, else first image
          const primaryImage =
            listing.images?.find((img) => img.is_primary)?.image_url ||
            listing.images?.[0]?.image_url ||
            null;

          return (
            <Link
              href={`/listings/${listing.id}`}
              key={listing.id}
              className="block border rounded-lg shadow hover:shadow-lg transition overflow-hidden"
            >
              {primaryImage && (
                <Image
                  src={`http://127.0.0.1:8000${primaryImage}`}
                  alt={listing.title}
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="text-xl font-semibold">{listing.title}</h2>
                <p className="text-gray-600 line-clamp-2">
                  {listing.description}
                </p>
                <p className="text-blue-600 font-bold mt-2">
                  ${listing.price}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
