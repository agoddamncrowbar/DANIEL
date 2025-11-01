"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Image from "next/image";
import ChatSidebar from "./ChatSidebar";
import { useAuth } from "@/context/AuthContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
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
  location: string;
  category: string;
  images: ListingImage[]; // fixed: images is an array of objects
  created_at: string;
  seller_id?: number;
}

export default function ListingDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await api.get<Listing>(`/listings/${params.id}`);
        setListing(res.data);
      } catch (err) {
        console.error("Failed to fetch listing", err);
      } finally {
        setLoading(false);
      }
    }
    if (params?.id) fetchListing();
  }, [params?.id]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!listing) return <p className="text-center mt-10">Listing not found</p>;

  const images = listing.images || [];

  return (
    <div className="relative max-w-5xl mx-auto p-6 mt-6 flex gap-6">
      {/* Main listing */}
      <div className="flex-1 bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-4">{listing.title}</h1>

        {/* Images */}
        {images.length > 0 && (
          <div className="mb-6">
            <Carousel className="w-full max-w-3xl mx-auto">
              <CarouselContent>
                {images.map((img) => (
                  <CarouselItem key={img.id} className="flex justify-center">
                    <Image
                      width={600}
                      height={400}
                      src={`http://127.0.0.1:8000${img.image_url}`}
                      alt={listing.title}
                      className="w-full h-[400px] object-cover rounded-lg border"
                      priority
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        )}

        <p className="text-gray-700 mb-4">{listing.description}</p>
        <p className="text-blue-600 text-2xl font-bold mb-2">
          ${listing.price.toFixed(2)}
        </p>
        <p className="text-sm text-gray-600">
          📍 {listing.location} | 🏷 {listing.category}
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Posted on {new Date(listing.created_at).toLocaleDateString()}
        </p>

        {/* Chat CTA */}
        {isLoggedIn ? (
          <button
            onClick={() => setChatOpen(true)}
            className="mt-6 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700"
          >
            Chat with Seller
          </button>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="mt-6 px-4 py-2 bg-gray-600 text-white font-medium rounded-lg shadow hover:bg-gray-700"
          >
            Log in to chat with seller
          </button>
        )}
      </div>

      {/* Sidebar chat panel */}
      {chatOpen && listing && user && (
        <ChatSidebar
          listingId={listing.id}
          currentUserId={user.id}
          otherUserId={listing.seller_id!}
          onClose={() => setChatOpen(false)}
        />

      )}
    </div>
  );
}
