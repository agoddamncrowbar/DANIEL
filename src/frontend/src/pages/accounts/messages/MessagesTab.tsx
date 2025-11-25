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
    setChatData(res.data); // <-- store grouped structure
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSelect = (listingId: number, partnerId: number | null) => {
    setActiveListing(listingId);
    setActivePartner(partnerId);
  };

  const selectedListing = chatData.find((l) => l.listing_id === activeListing);
  const selectedChat =
    selectedListing?.chats.find((c: any) => c.user_id === activePartner) || null;

  return (
    <div className="flex border rounded-lg overflow-hidden h-[70vh]">
      <ChatList
        chatData={chatData}
        activeListing={activeListing}
        activePartner={activePartner}
        onSelect={handleSelect}
      />

      {activeListing && activePartner ? (
        <ChatWindow
          listingId={activeListing}
          chatPartnerId={activePartner}
          currentUser={user}
          initialMessages={selectedChat?.messages || []}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Select a conversation.
        </div>
      )}
    </div>
  );
}
