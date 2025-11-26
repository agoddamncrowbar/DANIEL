import { useEffect, useState } from "react";
import api from "@/libz/api";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function SidebarCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Pull all categories directly from backend route
        const res = await api.get("/search/categories");
        setCategories(res.data?.categories || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading)
    return (
      <div className="p-6 border-r-2 border-gray-200 w-64 bg-white">
        <p className="text-gray-500">Loading categories...</p>
      </div>
    );

  return (
    <div className="p-6 border-r-2 border-gray-200 w-64 bg-white h-screen sticky top-0 overflow-y-auto">
      <h2 className="font-bold text-lg mb-4 pb-3 border-b-2 border-[#B8860B] text-gray-800">
        Categories
      </h2>
      <div className="space-y-1">
        <Link
          to="/listings"
          className={`block p-3 transition-all duration-200 flex items-center justify-between group ${
            activeCategory === ""
              ? "bg-[#B8860B] text-white"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          <span className="font-medium">All Categories</span>
          {activeCategory === "" && <ChevronRight size={18} />}
        </Link>
        
        {categories.map((cat) => (
          <Link
            key={cat}
            to={`/listings?category=${encodeURIComponent(cat)}`}
            className={`block p-3 transition-all duration-200 flex items-center justify-between group ${
              activeCategory === cat
                ? "bg-[#B8860B] text-white"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <span className="font-medium">{cat}</span>
            {activeCategory === cat && <ChevronRight size={18} />}
          </Link>
        ))}
      </div>
    </div>
  );
}