"use client";

import { useState, useEffect, useMemo } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/app/hooks/useChat";

type ChatMessage = {
  id: number;
  sender_id: number;
  receiver_id: number;
  listing_id: number;
  message: string;
  created_at: string;
};

export default function MessagesPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<
    { otherUserId: number; listing_id: number; last_message: string }[]
  >([]);
  const [selected, setSelected] = useState<{
    otherUserId: number;
    listing_id: number;
  } | null>(null);

  const { messages, sendMessage } = useChat(selected?.listing_id ?? 0, user?.id ?? 0);
  const [input, setInput] = useState("");

  // Fetch all user messages (initial threads)
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const res = await api.get<ChatMessage[]>("chat/messages");
        const map: Record<string, any> = {};

        res.data.forEach((msg) => {
          const otherUserId =
            msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id;
          const key = `${otherUserId}-${msg.listing_id}`;
          map[key] = {
            otherUserId,
            listing_id: msg.listing_id,
            last_message: msg.message,
          };
        });

        setThreads(Object.values(map));
      } catch (err) {
        console.error("❌ Failed to load messages", err);
      }
    };
    if (user?.id) fetchThreads();
  }, [user?.id]);

  const filteredMessages = useMemo(() => {
    if (!selected) return [];
    return messages.filter(
      (m) =>
        m.listing_id === selected.listing_id &&
        (m.sender_id === selected.otherUserId ||
          m.receiver_id === selected.otherUserId)
    );
  }, [messages, selected]);

  const handleSend = () => {
    if (!selected || !input.trim()) return;
    sendMessage(selected.otherUserId, input.trim());
    setInput("");
  };

  return (
    <div className="flex h-[85vh] gap-6">
      {/* Left Sidebar */}
      <div className="w-1/3 border-r overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Chats</h2>
        {threads.length === 0 ? (
          <p className="text-gray-500">No chats yet.</p>
        ) : (
          threads.map((t) => (
            <Card
              key={`${t.otherUserId}-${t.listing_id}`}
              className={`mb-2 cursor-pointer ${
                selected?.otherUserId === t.otherUserId &&
                selected?.listing_id === t.listing_id
                  ? "border-blue-600"
                  : ""
              }`}
              onClick={() => setSelected(t)}
            >
              <CardContent>
                <p className="font-semibold">User #{t.otherUserId}</p>
                <p className="text-sm text-gray-600 truncate">
                  {t.last_message}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Right Chat Panel */}
      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            <div className="border-b pb-2 mb-3">
              <h2 className="text-xl font-bold">
                Chat with User #{selected.otherUserId} (Listing #
                {selected.listing_id})
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-neutral-50 rounded-lg">
              {filteredMessages.map((m) => (
                <div
                  key={m.id}
                  className={`px-3 py-2 rounded-xl max-w-[70%] text-sm ${
                    m.sender_id === user?.id
                      ? "ml-auto bg-blue-600 text-white"
                      : "mr-auto bg-gray-200 text-black"
                  }`}
                >
                  {m.message}
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-3">
              <Input
                placeholder="Type a reply..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <Button onClick={handleSend}>Send</Button>
            </div>
          </>
        ) : (
          <p className="text-gray-500 m-auto">Select a chat to view messages.</p>
        )}
      </div>
    </div>
  );
}
