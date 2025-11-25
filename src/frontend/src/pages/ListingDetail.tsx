// src/pages/ListingDetail.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/libz/api";
import { resolveImageUrl } from "@/libz/url";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/useAuth";
import ChatSidebar from "@/components/listingDetails/chat/ChatSidebar";
import ListingRecommendations from "@/components/listingDetails/ListingRecommendations";

interface ListingDetail {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  category: string;
  seller_id: number;
  images: { id: number; image_url: string; is_primary: boolean }[];
}

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  // Load listing
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await api.get(`/listings/${id}`);
        setListing(res.data);
      } catch {
        setListing(null);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading)
    return (
      <>
        <Header />
        <div className="p-8 text-center">Loading...</div>
        <Footer />
      </>
    );

  if (!listing)
    return (
      <>
        <Header />
        <div className="p-8 text-center text-red-500">Listing not found.</div>
        <Footer />
      </>
    );

  const mainImage =
    listing.images?.find((img) => img.is_primary)?.image_url ||
    listing.images?.[0]?.image_url;

  // Chat permission logic
  const isLoggedIn = !!user;
  const isOwner = user?.seller_profile?.id === listing.seller_id;

  const handleChatClick = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (!isOwner) {
      setShowChat(true);
    }
  };

  return (
    <>
      <Header />

      <div className="p-8 max-w-4xl mx-auto relative">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main Image */}
          <img
            src={resolveImageUrl(mainImage ?? undefined)}
            alt={listing.title}
            className="w-full md:w-1/2 h-80 object-cover rounded-lg shadow"
          />

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{listing.title}</h1>
            <p className="text-xl text-blue-600 font-semibold mt-2">
              ${listing.price}
            </p>
            <p className="text-gray-600 mt-3">{listing.location}</p>
            <p className="text-sm uppercase mt-1 text-gray-400">
              Category: {listing.category}
            </p>

            <p className="mt-6 text-gray-700">{listing.description}</p>

            {/* ⭐ CHAT BUTTON */}
            <div className="mt-6">
              {!isLoggedIn ? (
                <button
                  onClick={() => navigate("/login")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Login to Chat
                </button>
              ) : isOwner ? (
                <button
                  disabled
                  className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed"
                >
                  You cannot chat with yourself
                </button>
              ) : (
                <button
                  onClick={handleChatClick}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Chat with Seller
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Additional Images */}
        {listing.images?.length > 1 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {listing.images.map((img) => (
              <img
                key={img.id}
                src={resolveImageUrl(img.image_url)}
                className="rounded-lg object-cover h-32 w-full shadow"
              />
            ))}
          </div>
        )}
        <ListingRecommendations source="listing_detail_recommendations" />
        {/* ⭐ CHAT SIDEBAR */}
        {showChat && isLoggedIn && !isOwner && (
          <ChatSidebar
            listingId={listing.id}
            sellerId={listing.seller_id}
          />
        )}
      </div>

      <Footer />
    </>
  );
}
