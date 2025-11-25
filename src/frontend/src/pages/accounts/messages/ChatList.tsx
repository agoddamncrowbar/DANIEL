interface Props {
  chatData: any[]; // full grouped response
  activeListing: number | null;
  activePartner: number | null;
  onSelect: (listingId: number, partnerId: number | null) => void;
}

export default function ChatList({
  chatData,
  activeListing,
  activePartner,
  onSelect,
}: Props) {
  return (
    <div className="w-72 border-r bg-gray-50 overflow-y-auto">
      <h2 className="font-semibold text-lg p-4 border-b">Conversations</h2>

      {chatData.length === 0 && (
        <p className="p-4 text-gray-500 text-sm">No conversations yet.</p>
      )}

      {chatData.map((listing) => (
        <div key={listing.listing_id}>
          <button
            className={`w-full text-left p-3 border-b bg-gray-200 font-semibold`}
            onClick={() => onSelect(listing.listing_id, null)}
          >
            Listing #{listing.listing_id}: {listing.listing_title || ""}
          </button>

          {/* Buyers under listing */}
          {activeListing === listing.listing_id &&
            listing.chats.map((c: any) => (
              <button
                key={c.user_id}
                className={`w-full pl-6 pr-3 py-2 text-left border-b hover:bg-gray-100 ${
                  activePartner === c.user_id ? "bg-gray-300" : ""
                }`}
                onClick={() => onSelect(listing.listing_id, c.user_id)}
              >
                {c.user_name || `User #${c.user_id}`}
              </button>
            ))}
        </div>
      ))}
    </div>
  );
}
