import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/constants";
import { useAuth } from "@/context/useAuth";

interface SidebarProps {
  activeTab: string;
  onChange: (tab: "profile" | "store" | "messages" | "listings") => void;
}

export default function Sidebar({ activeTab, onChange }: SidebarProps) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <aside className="w-64 bg-white border-r shadow-sm">
      {/* User info */}
      <div className="p-6 border-b">
        <div className="flex flex-col items-center">
          <img
            className="w-24 h-24 rounded-full object-cover border mb-3"
            src={
              user.profile_picture
                ? `${API_BASE_URL}/uploads/${user.profile_picture}`
                : `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(user.name)}`
            }
            alt={user.name}
          />
          <h2 className="text-lg font-semibold">{user.name}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 space-y-2 px-4">
        <Button
          variant={activeTab === "profile" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onChange("profile")}
        >
          Edit Profile
        </Button>

        <Button
          variant={activeTab === "store" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onChange("store")}
        >
          My Store
        </Button>

        <Button
          variant={activeTab === "messages" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onChange("messages")}
        >
          Messages
        </Button>

        <Button
          variant={activeTab === "listings" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onChange("listings")}
        >
          My Listings
        </Button>
      </nav>
    </aside>
  );
}
