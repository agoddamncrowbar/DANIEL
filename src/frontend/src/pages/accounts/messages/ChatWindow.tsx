import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "./MessagesTab";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/constants";
import api from "@/lib/api";

interface Props {
  listingId: number;
  currentUser: any;
  chatPartnerId: number; // the user you are chatting with
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

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset messages and socket when listingId or chatPartnerId changes
  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await api.get(`/chat/${listingId}`);
        // filter messages only with chatPartner
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

    // Close existing socket
    if (socketRef.current) socketRef.current.close();

    const token = localStorage.getItem("token");
    const wsUrl = `${API_BASE_URL.replace(/^http/, "ws")}/chat/ws/${listingId}?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => console.log(`✅ Connected to chat ${listingId}`);
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      // Only append messages relevant to this chat partner
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
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-2 rounded-md max-w-xs ${
              m.sender_id === currentUser.id
                ? "bg-blue-500 text-white self-end ml-auto"
                : "bg-gray-200 text-gray-900 self-start"
            }`}
          >
            {m.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t flex space-x-2">
        <Input
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button onClick={handleSend}>Send</Button>
      </div>
    </div>
  );
}
