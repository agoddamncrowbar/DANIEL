interface Props {
  chatData: any[];
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
    <div className="h-full overflow-y-auto bg-white border-r border-[#9A7209] rounded-none">
      <h2 className="p-4 font-semibold text-lg uppercase bg-[#B8860B] text-white border-b border-[#9A7209]">
        Conversations
      </h2>

      {chatData.length === 0 && (
        <p className="p-4 text-gray-600 text-sm italic">No conversations yet.</p>
      )}

      {chatData.map((listing) => (
        <div key={listing.listing_id} className="border-b border-[#9A7209]">
          <button
            onClick={() => onSelect(listing.listing_id, null)}
            className={`block w-full px-4 py-3 text-left font-semibold uppercase tracking-wide transition-all duration-200 rounded-none 
              ${
                activeListing === listing.listing_id
                  ? "bg-[#9A7209] text-white"
                  : "bg-[#B8860B] text-white hover:bg-[#9A7209]"
              }
            `}
          >
            {listing.listing_title}
          </button>

          {activeListing === listing.listing_id &&
            listing.chats.map((c: any) => (
              <button
                key={c.user_id}
                onClick={() => onSelect(listing.listing_id, c.user_id)}
                className={`block w-full pl-6 pr-4 py-3 border-b border-[#9A7209] text-left transition-all duration-200 rounded-none
                ${
                  activePartner === c.user_id
                    ? "bg-[#B8860B]/20 text-[#B8860B] font-semibold"
                    : "hover:bg-[#B8860B]/10 text-gray-800"
                }`}
              >
                {c.user_name}
              </button>
            ))}
        </div>
      ))}
    </div>
  );
}

