import { useEffect, useState } from "react";
import api from "@/libz/api";
import { Link, useSearchParams } from "react-router-dom";
import { resolveImageUrl } from "@/libz/url";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBarWithSuggestions from "@/components/listings/SearchBarWithSuggestions";
import SidebarCategories from "@/components/listings/SidebarCategories";

export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  category: string;
  images: { id: number; image_url: string; is_primary: boolean }[];
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || "";
  const q = searchParams.get("q") || "";

  // ---- Fetch listings using NEW /search/listings ----
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await api.get("/search/listings", {
          params: { q, category },
        });
        setListings(res.data.results);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [q, category]);

  if (loading)
    return (
      <>
        <Header />
        <SearchBarWithSuggestions />
        <div className="p-8 text-center text-gray-600">Loading...</div>
        <Footer />
      </>
    );

  // ---- Group listings by category ----
  const grouped = listings.reduce((acc: any, item) => {
    const cat = item.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-gray-50">
        <SidebarCategories />
        <div className="flex-1 p-6 sm:p-8">
          <SearchBarWithSuggestions />
          
          {Object.keys(grouped).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No listings found</p>
            </div>
          ) : (
            Object.keys(grouped).map((cat) => (
              <div key={cat} className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-[#B8860B] pb-2 inline-block">
                  {cat}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {grouped[cat].map((listing: Listing) => {
                    const primaryImage =
                      listing.images?.find((img) => img.is_primary)?.image_url ||
                      listing.images?.[0]?.image_url ||
                      null;
                    return (
                      <Link
                        to={`/listings/${listing.id}`}
                        key={listing.id}
                        className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white overflow-hidden group"
                      >
                        <div className="relative overflow-hidden h-48">
                          <img
                            src={resolveImageUrl(primaryImage ?? undefined)}
                            alt={listing.title}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 mb-2">
                            {listing.title}
                          </h3>
                          <p className="text-gray-500 text-sm mb-3">{listing.location}</p>
                          <p className="text-[#B8860B] font-bold text-xl">
                            ${listing.price.toLocaleString()}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}