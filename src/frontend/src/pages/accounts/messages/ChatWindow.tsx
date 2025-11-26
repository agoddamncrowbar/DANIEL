import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "./MessagesTab";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/libz/constants";
import api from "@/libz/api";

interface Props {
  listingId: number;
  currentUser: any;
  chatPartnerId: number;
  initialMessages: ChatMessage[];
}

export default function ChatWindow({
  listingId,
  currentUser,
  chatPartnerId,
  initialMessages,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [text, setText] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await api.get(`/chat/${listingId}`);
        const filtered = res.data.filter(
          (m: ChatMessage) =>
            m.sender_id === chatPartnerId || m.receiver_id === chatPartnerId
        );
        setMessages(filtered);
      } catch {
        setMessages([]);
      }
    };

    fetchChat();

    if (socketRef.current) socketRef.current.close();

    const token = localStorage.getItem("token");
    const wsUrl = `${API_BASE_URL.replace(/^http/, "ws")}/chat/ws/${listingId}?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => console.log(`✅ Connected to chat ${listingId}`);
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (
        msg.sender_id === chatPartnerId ||
        msg.receiver_id === chatPartnerId
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    ws.onclose = () => console.log(`❌ Socket closed for chat ${listingId}`);

    socketRef.current = ws;
    return () => ws.close();
  }, [listingId, chatPartnerId]);

  const handleSend = () => {
    if (!text.trim() || !socketRef.current) return;

    const payload = {
      receiver_id: chatPartnerId,
      message: text,
    };

    socketRef.current.send(JSON.stringify(payload));
    setText("");
  };

 return (
    <div className="h-full flex flex-col bg-white rounded-none">
      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[#fdfaf4]">
        {messages.map((m) => {
          const isMe = m.sender_id === currentUser.id;

          return (
            <div
              key={m.id}
              className={`px-4 py-2 max-w-[85%] sm:max-w-sm border shadow-sm rounded-none ${
                isMe
                  ? "bg-[#B8860B] text-white border-[#9A7209] ml-auto"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
            >
              {m.message}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BAR */}
      <div className="p-3 border-t border-[#9A7209] bg-white flex space-x-2">
        <Input
          className="flex-1 rounded-none border-[#9A7209]"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button
          onClick={handleSend}
          className="bg-[#B8860B] text-white hover:bg-[#9A7209] rounded-none font-semibold px-5"
        >
          Send
        </Button>
      </div>
    </div>
  );
}
