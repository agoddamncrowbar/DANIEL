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
export default function Account() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "store" | "messages" | "listings">("profile");

  if (!user) {
    return (
    <>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <p>Please log in to access your account.</p>
        <Button
            className="mt-4"
            onClick={() => (window.location.href = "/login")}
        >
            Go to Login
        </Button>
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

      <main className="flex-1 p-8">
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "store" && <StoreTab />}
        {activeTab === "messages" && <MessagesTab />}
        {activeTab === "listings" && <ListingsTab />}
      </main>
    </div>
    <Footer />
    </>
  );
}
