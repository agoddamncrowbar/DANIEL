import { useState } from "react";
import { useAuth } from "@/context/useAuth";
import Sidebar from "./Sidebar";
import ProfileTab from "./ProfileTab";
import StoreTab from "./StoreTab";
import MessagesTab from "./messages/MessagesTab";
import ListingsTab from "./listings/ListingsTab";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LogIn } from "lucide-react";

export default function Account() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "store" | "messages" | "listings">("profile");

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <div className="w-20 h-20 bg-[#B8860B] mx-auto flex items-center justify-center mb-4">
                <LogIn size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Access Required</h2>
              <p className="text-gray-600">Please log in to access your account and manage your listings.</p>
            </div>
            <Button
              className="bg-[#B8860B] text-white hover:bg-[#9A7209] font-bold px-8 py-3 transition-all duration-200"
              onClick={() => (window.location.href = "/login")}
              style={{ borderRadius: 0 }}
            >
              Go to Login
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar activeTab={activeTab} onChange={setActiveTab} />
        <main className="flex-1 p-6 sm:p-8 lg:p-10">
          <div className="max-w-5xl">
            {activeTab === "profile" && <ProfileTab />}
            {activeTab === "store" && <StoreTab />}
            {activeTab === "messages" && <MessagesTab />}
            {activeTab === "listings" && <ListingsTab />}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}