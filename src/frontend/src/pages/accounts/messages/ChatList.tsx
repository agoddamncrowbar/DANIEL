import type { ChatMessage } from "./MessagesTab";

interface Props {
  messages: ChatMessage[];
  activeListing: number | null;
  onSelect: (id: number) => void;
}

export default function ChatList({ messages, activeListing, onSelect }: Props) {
  const listings = Array.from(new Set(messages.map(m => m.listing_id)));

  return (
    <div className="w-64 border-r bg-gray-50 overflow-y-auto">
      <h2 className="font-semibold text-lg p-4 border-b">Conversations</h2>
      {listings.length === 0 && (
        <p className="p-4 text-gray-500 text-sm">No messages yet.</p>
      )}
      {listings.map(id => (
        <button
          key={id}
          className={`w-full text-left p-3 border-b hover:bg-gray-100 ${
            activeListing === id ? "bg-gray-200 font-semibold" : ""
          }`}
          onClick={() => onSelect(id)}
        >
          Listing #{id}
        </button>
      ))}
    </div>
  );
}
