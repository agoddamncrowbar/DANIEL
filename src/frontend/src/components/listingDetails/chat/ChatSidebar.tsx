import { useEffect, useRef, useState } from "react";
import api from "@/libz/api";
import { useAuth } from "@/context/useAuth";

interface ChatMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at: string;
}

interface Props {
  listingId: number;
  sellerId: number;
}

export default function ChatSidebar({ listingId, sellerId }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const receiverId = sellerId;

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // Load chat history
  useEffect(() => {
    const loadMessages = async () => {
      const res = await api.get(`/chat/${listingId}`);
      setMessages(res.data);
    };

    loadMessages();
  }, [listingId]);

  // WebSocket connection
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const ws = new WebSocket(
      `${import.meta.env.VITE_API_WS_URL}/chat/ws/${listingId}?token=${token}`
    );

    socketRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type !== "message") {
        // Ignore typing indicators or errors
        return;
      }

      const msg: ChatMessage = {
        id: data.id,
        sender_id: data.sender_id,
        receiver_id: data.receiver_id,
        message: data.message,
        created_at: data.created_at,
      };

      setMessages((prev) => [...prev, msg]);
    };

    ws.onerror = () => console.error("WebSocket error");
    ws.onclose = () => console.log("WebSocket closed");

    return () => ws.close();
  }, [user, listingId]);

  // Send a message
  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return;

    const payload = {
      action: "message",
      receiver_id: receiverId,
      message: input,
    };

    socketRef.current.send(JSON.stringify(payload));
    setInput("");
  };

  return (
    <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 bg-white border-l shadow-lg flex flex-col">
      <div className="p-4 border-b font-semibold text-lg">Chat with Seller</div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded-lg max-w-[80%] ${
              msg.sender_id === user?.id
                ? "bg-blue-500 text-white ml-auto"
                : "bg-gray-200 text-black"
            }`}
          >
            {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-2">
        <input
          className="flex-1 border p-2 rounded"
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="bg-blue-600 text-white px-3 py-2 rounded"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
