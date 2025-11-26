import { useEffect, useState } from "react";
import api from "@/libz/api";
import { Link, useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";

interface SearchInsights {
  popular_searches: { term: string; count: number }[];
  suggested_searches: string[];
  popular_categories?: string[];
}

interface QuickResult {
  id: number;
  title: string;
  price: number;
}

export default function SearchBarWithSuggestions() {
  const [query, setQuery] = useState("");
  const [insights, setInsights] = useState<SearchInsights | null>(null);
  const [quickResults, setQuickResults] = useState<QuickResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();

  // ---- Load insights once ----
  useEffect(() => {
    api.get("/search/insights")
      .then((res) => setInsights(res.data))
      .catch(() => {});
  }, []);

  // ---- Real-time results ----
  useEffect(() => {
    if (query.trim().length === 0) {
      setQuickResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      const res = await api.get(`/search/quick?q=${encodeURIComponent(query)}`);
      setQuickResults(res.data);
    }, 200);

    return () => clearTimeout(delay);
  }, [query]);

  // ---- Log search ----
  const logSearch = async (term: string) => {
    try {
      const deviceType = /Mobi|Android/i.test(navigator.userAgent)
        ? "mobile"
        : "desktop";

      await api.post("/search/log", {
        query_text: term,
        device_type: deviceType,
      });
    } catch {}
  };

  const goToSearchResults = async (term: string) => {
    await logSearch(term);
    navigate(`/search-results?q=${encodeURIComponent(term)}`);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setQuery("");
    setQuickResults([]);
  };

  return (
    <div className="relative max-w-3xl mx-auto my-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search listings..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) {
              goToSearchResults(query);
            }
          }}
          className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 bg-white text-gray-800 focus:outline-none focus:border-[#B8860B] transition-all duration-200"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute w-full bg-white border-2 border-gray-200 shadow-lg mt-1 p-4 z-40 max-h-96 overflow-y-auto">
            
            {/* ---- 1. REAL RESULTS ---- */}
            {quickResults.length > 0 && (
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                  Search Results
                </h4>
                {quickResults.map((item) => (
                  <Link
                    key={item.id}
                    to={`/listings/${item.id}`}
                    className="block py-2 px-3 hover:bg-[#B8860B] hover:text-white transition-all duration-200 mb-1"
                    onClick={() => setShowDropdown(false)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.title}</span>
                      <span className="font-bold">${item.price.toLocaleString()}</span>
                    </div>
                  </Link>
                ))}

                <button
                  className="block w-full text-left py-2 px-3 mt-2 text-[#B8860B] hover:bg-[#B8860B] hover:text-white font-semibold transition-all duration-200"
                  onClick={() => goToSearchResults(query)}
                >
                  View all results →
                </button>
              </div>
            )}

            {/* ---- 2. Suggested Searches ---- */}
            {insights?.suggested_searches?.length > 0 && (
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                  Suggested Searches
                </h4>
                {insights.suggested_searches.map((term) => (
                  <button
                    key={term}
                    className="block w-full text-left py-2 px-3 hover:bg-[#B8860B] hover:text-white transition-all duration-200 mb-1"
                    onClick={() => goToSearchResults(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            )}

            {/* ---- 3. Popular Searches ---- */}
            {insights?.popular_searches?.length > 0 && (
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                  Popular Searches
                </h4>
                {insights.popular_searches.map((s) => (
                  <button
                    key={s.term}
                    className="block w-full text-left py-2 px-3 hover:bg-[#B8860B] hover:text-white transition-all duration-200 mb-1"
                    onClick={() => goToSearchResults(s.term)}
                  >
                    <div className="flex justify-between items-center">
                      <span>{s.term}</span>
                      <span className="text-sm opacity-75">({s.count})</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* ---- 4. Popular Categories ---- */}
            {insights?.popular_categories?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                  Popular Categories
                </h4>
                <div className="flex flex-wrap gap-2">
                  {insights.popular_categories.map((cat) => (
                    <Link
                      key={cat}
                      to={`/search-results?category=${encodeURIComponent(cat)}`}
                      className="px-3 py-1.5 bg-gray-100 text-gray-800 text-sm font-medium hover:bg-[#B8860B] hover:text-white transition-all duration-200"
                      onClick={() => setShowDropdown(false)}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {query && quickResults.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <p>No results found for "{query}"</p>
                <p className="text-sm mt-2">Try different keywords or browse categories below</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}