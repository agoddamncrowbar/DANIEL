"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { useChat } from "@/app/hooks/useChat";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatSidebarProps {
  listingId: number;
  currentUserId: number;
  otherUserId: number;
  onClose: () => void;
}

export default function ChatSidebar({
  listingId,
  currentUserId,
  otherUserId,
  onClose,
}: ChatSidebarProps) {
  const { messages, sendMessage } = useChat(listingId, currentUserId);
  const [input, setInput] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  // ✅ Auto-scroll when messages change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    // ✅ Send message to server via WebSocket
    sendMessage(Number(otherUserId), trimmed);

    // ✅ Optimistically add to UI (so it shows immediately)
    setInput("");
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-black text-white z-50 flex flex-col shadow-xl border-l border-neutral-900">
      {/* Header */}
      <Card className="rounded-none border-b border-neutral-800 bg-black">
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
          <CardTitle className="text-lg font-semibold text-white">
            Chat
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-neutral-400 hover:text-white hover:bg-neutral-900"
            onClick={onClose}
          >
            ✕
          </Button>
        </CardHeader>
      </Card>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`px-3 py-2 rounded-2xl max-w-[75%] text-sm break-words ${
              msg.sender_id === currentUserId
                ? "ml-auto bg-white text-black"
                : "mr-auto bg-blue-900 text-white"
            }`}
          >
            {msg.message}
          </div>
        ))}
      </div>

      {/* Input */}
      <Card className="rounded-none border-t border-neutral-800 bg-black">
        <CardContent className="p-3">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 focus-visible:ring-0"
            />
            <Button
              type="submit"
              className="bg-white text-black hover:bg-neutral-200"
            >
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
