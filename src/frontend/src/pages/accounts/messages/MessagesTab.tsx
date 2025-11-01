import { useEffect, useState } from "react";
import api from "@/lib/api";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import { useAuth } from "@/context/useAuth";

export interface ChatMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  listing_id: number;
  message: string;
  created_at: string;
}

export default function MessagesTab() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeListing, setActiveListing] = useState<number | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const fetchMessages = async () => {
    const res = await api.get("/chat/messages");
    setMessages(res.data);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSelectListing = (listingId: number) => {
    setActiveListing(listingId);
  };

  const activeMessages = messages.filter(m => m.listing_id === activeListing);

  return (
    <div className="flex border rounded-lg overflow-hidden h-[70vh]">
      <ChatList
        messages={messages}
        activeListing={activeListing}
        onSelect={handleSelectListing}
      />
      {activeListing ? (
        <ChatWindow
          listingId={activeListing}
          currentUser={user}
          initialMessages={activeMessages}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Select a conversation to start chatting.
        </div>
      )}
    </div>
  );
}
