import { useEffect, useState } from "react";
import api from "@/libz/api";
import { resolveImageUrl } from "@/libz/url";
import { useAuth } from "@/context/useAuth";

interface RecommendedListing {
  id: number;
  title: string;
  price: number;
  image_url: string | null;
}

export default function ListingRecommendations({ source }: { source: string }) {
  const { user } = useAuth();

  const [items, setItems] = useState<RecommendedListing[]>([]);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // 1. Fetch Recommendations
  // -----------------------------
  useEffect(() => {
    const loadRecs = async () => {
        try {
            const endpoint = user
            ? "/interactions/recommendations/user"
            : "/interactions/recommendations/global";

            const recRes = await api.get(endpoint);
            const recs = recRes.data.recommendations || [];

            if (!recs.length) {
            setItems([]);
            return;
            }

            // ---- SAFELY MAP ----
            const formatted: RecommendedListing[] = recs
            .map((r: any) => {
                const l = r.listing;

                // Skip entries that have no listing object
                if (!l || !l.id) return null;

                return {
                id: l.id,
                title: l.title ?? "Untitled",
                price: l.price ?? 0,
                image_url: l.images?.[0]?.image_url || null,
                };
            })
            .filter(Boolean);

            setItems(formatted);
        } catch (error) {
            console.log("Error loading recommendations:", error);
            setItems([]);
        } finally {
            setLoading(false);
        }
        };


    loadRecs();
  }, [user]);

  // -----------------------------
  // 2. Log interactions
  // -----------------------------
  const recordInteraction = async (listingId: number, action: string) => {
    try {
      await api.post("/interactions", {
        listing_id: listingId,
        action,
        weight: action === "view" ? 0.2 : 0.8,
        source,
      });
    } catch (err) {
      console.log("Error posting interaction");
    }
  };

  // Log impressions
  useEffect(() => {
    items.forEach((i) => recordInteraction(i.id, "view"));
  }, [items]);

  // -----------------------------
  // 3. Render
  // -----------------------------
  if (loading)
    return <div className="mt-10 text-gray-500">Loading recommendations...</div>;

  if (!items.length)
    return <div className="mt-10 text-gray-500">No recommendations available.</div>;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Recommended for you</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((rec) => (
          <a
            key={rec.id}
            href={`/listings/${rec.id}`}
            className="border rounded-lg shadow hover:shadow-md transition group"
            onClick={() => recordInteraction(rec.id, "click")}
          >
            <img
              src={resolveImageUrl(rec.image_url ?? undefined)}
              className="w-full h-32 object-cover rounded-t-lg"
              alt={rec.title}
            />

            <div className="p-3">
              <p className="font-semibold group-hover:text-blue-600 transition">
                {rec.title}
              </p>
              <p className="text-blue-600 font-bold">${rec.price}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
