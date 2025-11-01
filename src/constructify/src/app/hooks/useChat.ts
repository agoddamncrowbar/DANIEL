"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import api from "@/lib/api";

interface ChatMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  listing_id: number;
  message: string;
  created_at: string;
}

export function useChat(listingId: number, currentUserId: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const retryAttempt = useRef(0);
  const messageQueue = useRef<any[]>([]); // store unsent messages

  // 🧠 Helper: build WebSocket URL dynamically
  const getWsUrl = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host =
      window.location.hostname === "localhost"
        ? "localhost:8000"
        : window.location.host; // production-safe
    return `${protocol}://${host}/chat/ws/${listingId}?token=${token}`;
  }, [listingId]);

  // 🧩 Fetch chat history once
  useEffect(() => {
    if (!listingId) return;
    (async () => {
      try {
        const res = await api.get<ChatMessage[]>(`/chat/${listingId}`);
        setMessages(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch chat history:", err);
      }
    })();
  }, [listingId]);

  // 🔌 Function to open WebSocket connection
  const connect = useCallback(() => {
    const url = getWsUrl();
    if (!url) return;

    console.log(`🔗 Connecting WebSocket → ${url}`);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      setConnected(true);
      retryAttempt.current = 0;

      // Flush any queued messages
      while (messageQueue.current.length > 0) {
        ws.send(JSON.stringify(messageQueue.current.shift()));
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg: ChatMessage = JSON.parse(event.data);
        if (msg.listing_id !== listingId) return;

        // ✅ Prevent duplicates (same id or same text+sender within 1s)
        setMessages((prev) => {
          const isDuplicate = prev.some(
            (m) =>
              m.id === msg.id ||
              (m.sender_id === msg.sender_id &&
                m.message === msg.message &&
                Math.abs(new Date(m.created_at).getTime() - new Date(msg.created_at).getTime()) < 1000)
          );
          return isDuplicate ? prev : [...prev, msg];
        });
      } catch (err) {
        console.error("⚠️ Invalid message data:", event.data);
      }
    };

    ws.onerror = (err) => {
      console.error("⚠️ WebSocket error:", err);
    };

    ws.onclose = (e) => {
      console.warn("❌ WebSocket closed:", e.code, e.reason);
      setConnected(false);
      wsRef.current = null;

      // Exponential backoff for reconnection
      const delay = Math.min(10000, 1000 * 2 ** retryAttempt.current);
      console.log(`⏳ Reconnecting in ${delay / 1000}s...`);
      reconnectTimer.current = setTimeout(connect, delay);
      retryAttempt.current += 1;
    };
  }, [getWsUrl, listingId]);

  // 🧠 Initialize connection once
  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) wsRef.current.close();
      wsRef.current = null;
    };
  }, [connect]);

  // ✉️ Send a message (queues if socket isn’t ready)
  const sendMessage = useCallback((receiverId: number, message: string) => {
    const payload = { receiver_id: receiverId, message: message };
    const ws = wsRef.current;

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    } else {
      console.warn("🕓 WebSocket not open, queuing message");
      messageQueue.current.push(payload);
    }

    // Optimistically update UI
    const temp: ChatMessage = {
      id: Date.now(),
      sender_id: currentUserId,
      receiver_id: receiverId,
      listing_id: listingId,
      message,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, temp]);
  }, [listingId, currentUserId]);

  return {
    messages,
    sendMessage,
    connected,
  };
}
