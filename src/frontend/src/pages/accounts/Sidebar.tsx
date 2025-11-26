import { useState } from "react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/libz/constants";
import { useAuth } from "@/context/useAuth";
import { User, Store, MessageSquare, List } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onChange: (tab: "profile" | "store" | "messages" | "listings") => void;
}

export default function Sidebar({ activeTab, onChange }: SidebarProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const navItems = [
    { id: "profile", label: "Edit Profile", icon: User },
    { id: "store", label: "My Store", icon: Store },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "listings", label: "My Listings", icon: List },
  ];

  const handleNavClick = (id: string) => {
    onChange(id as any);
    setOpen(false);
  };

  const SidebarContent = () => (
    <>
      {/* User info */}
      <div className="p-6 border-b-2 border-gray-200">
        <div className="flex flex-col items-center">
          <img
            className="w-24 h-24 object-cover border-2 border-[#B8860B] mb-3"
            src={
              user.profile_picture
                ? `${API_BASE_URL}/uploads/${user.profile_picture}`
                : `https://ui-avatars.com/api/?background=B8860B&color=fff&name=${encodeURIComponent(user.name)}`
            }
            alt={user.name}
            style={{ borderRadius: 0 }}
          />
          <h2 className="text-lg font-bold text-gray-800">{user.name}</h2>
          <p className="text-sm text-gray-500 mt-1">{user.email}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 space-y-1 px-4 pb-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <Button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full justify-start ${
                isActive
                  ? "bg-[#B8860B] text-white hover:bg-[#9A7209]"
                  : "bg-transparent text-gray-700 hover:bg-gray-100"
              }`}
              style={{ borderRadius: 0 }}
            >
              <Icon size={18} className="mr-3" />
              <span className="font-medium">{item.label}</span>
            </Button>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-r-2 border-gray-200">
        <SidebarContent />
      </aside>

      {/* MOBILE SIDEBAR (off-canvas) */}
      <aside
        className={`lg:hidden fixed top-0 left-0 w-64 h-full bg-white border-r-2 border-gray-200 z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* MOBILE PULLTAB */}
      <button
        className="lg:hidden fixed top-1/2 -translate-y-1/2 left-0 z-50 
                   bg-[#B8860B] text-white px-3 py-2 rounded-r-lg shadow-md 
                   active:scale-95 transition-transform"
        style={{
          transform: open
            ? "translateX(256px) translateY(-50%)"
            : "translateX(0) translateY(-50%)",
        }}
        onClick={() => setOpen(!open)}
      >
        {/* Simple “tab” marker */}
        <div className="font-bold text-md">≡</div>
      </button>

      {/* Dim background when open */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
