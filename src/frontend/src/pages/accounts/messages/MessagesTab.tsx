import { useEffect, useState } from "react";
import api from "@/libz/api";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import { useAuth } from "@/context/useAuth";

export default function MessagesTab() {
  const { user } = useAuth();

  const [chatData, setChatData] = useState<any[]>([]);
  const [activeListing, setActiveListing] = useState<number | null>(null);
  const [activePartner, setActivePartner] = useState<number | null>(null);

  const fetchMessages = async () => {
    const res = await api.get("/chat/messages");
    setChatData(res.data);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const selectedListing = chatData.find((l) => l.listing_id === activeListing);
  const selectedChat =
    selectedListing?.chats.find((c: any) => c.user_id === activePartner) ||
    null;

  return (
    <div className="border border-[#9A7209] bg-[#B8860B]/10 h-[75vh] rounded-none flex flex-col lg:flex-row">
      {/* MOBILE DROPDOWN */}
      <div className="lg:hidden border-b border-[#9A7209] bg-white p-3">
        <select
          className="w-full p-2 border border-[#9A7209] rounded-none"
          value={`${activeListing || ""}-${activePartner || ""}`}
          onChange={(e) => {
            const [listingId, partnerId] = e.target.value.split("-");
            setActiveListing(Number(listingId) || null);
            setActivePartner(Number(partnerId) || null);
          }}
        >
          <option value="">Select Conversation</option>
          {chatData.map((listing) =>
            listing.chats.map((c: any) => (
              <option
                key={`${listing.listing_id}-${c.user_id}`}
                value={`${listing.listing_id}-${c.user_id}`}
              >
                {listing.listing_title} → {c.user_name}
              </option>
            ))
          )}
        </select>
      </div>

      {/* LEFT PANEL */}
      <div className="hidden lg:block w-72">
        <ChatList
          chatData={chatData}
          activeListing={activeListing}
          activePartner={activePartner}
          onSelect={(l, p) => {
            setActiveListing(l);
            setActivePartner(p);
          }}
        />
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1">
        {activeListing && activePartner ? (
          <ChatWindow
            listingId={activeListing}
            chatPartnerId={activePartner}
            currentUser={user}
            initialMessages={selectedChat?.messages || []}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500 text-lg">
            Select a conversation.
          </div>
        )}
      </div>
    </div>
  );
}
