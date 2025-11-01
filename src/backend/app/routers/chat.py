from fastapi import (
    APIRouter,
    WebSocket,
    WebSocketDisconnect,
    status,
    Depends,
)
from sqlalchemy.orm import Session
from typing import Dict, List
import json

from app.models.chat import ChatMessage
from app.core.security import decode_access_token
from app.core.database import SessionLocal
from app.schemas.chat import ChatMessageResponse
from app.utils.dependencies import get_db, get_current_user
router = APIRouter()

# Mapping of listing_id → list of connected WebSockets
active_connections: Dict[int, List[WebSocket]] = {}
@router.get("/messages")
def get_user_messages(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """
    Get all messages grouped by listing and by other user.
    """
    messages = (
        db.query(ChatMessage)
        .filter(
            (ChatMessage.sender_id == current_user.id)
            | (ChatMessage.receiver_id == current_user.id)
        )
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    # Grouping logic
    listings_dict = {}
    for msg in messages:
        listing_id = msg.listing_id
        other_user_id = msg.receiver_id if msg.sender_id == current_user.id else msg.sender_id
        listing = msg.listing

        if listing_id not in listings_dict:
            listings_dict[listing_id] = {
                "listing_id": listing_id,
                "listing_title": getattr(listing, "title", None),
                "chats": {}
            }

        if other_user_id not in listings_dict[listing_id]["chats"]:
            listings_dict[listing_id]["chats"][other_user_id] = {
                "user_id": other_user_id,
                "user_name": getattr(msg.sender if msg.sender.id == other_user_id else msg.receiver, "name", None),
                "messages": []
            }

        listings_dict[listing_id]["chats"][other_user_id]["messages"].append({
            "id": msg.id,
            "sender_id": msg.sender_id,
            "receiver_id": msg.receiver_id,
            "message": msg.message,
            "created_at": msg.created_at.isoformat()
        })

    # Convert nested dict to list
    result = []
    for listing_data in listings_dict.values():
        listing_data["chats"] = list(listing_data["chats"].values())
        result.append(listing_data)

    return result

@router.get("/{listing_id}", response_model=list[ChatMessageResponse])
def get_chat_messages(listing_id: int, db: Session = Depends(get_db)):
    """Fetch all chat messages for a given listing."""
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.listing_id == listing_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    if not messages:
        # Optional: return empty list instead of 404
        return []
    return messages
@router.websocket("/ws/{listing_id}")
async def chat_websocket(websocket: WebSocket, listing_id: int):
    print(f"\n🟢 Incoming WebSocket connection for listing {listing_id}")

    # --- Token verification ---
    token = websocket.query_params.get("token")
    if not token:
        print("🚫 No token provided, closing connection.")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    try:
        payload = decode_access_token(token)
        user_id = int(payload.get("sub"))
        print(f"✅ Authenticated user_id={user_id} for listing {listing_id}")
    except Exception as e:
        print(f"❌ Token decode error: {e}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # --- Accept and register connection ---
    await websocket.accept()
    active_connections.setdefault(listing_id, []).append(websocket)
    print(f"✅ WebSocket accepted — total connections for listing {listing_id}: {len(active_connections[listing_id])}")

    try:
        # --- Message loop ---
        while True:
            try:
                data = await websocket.receive_text()
                print(f"💬 Received: {data}")
                msg_data = json.loads(data)
            except json.JSONDecodeError:
                print("⚠️ Invalid JSON received — ignoring.")
                continue
            except Exception as e:
                print(f"⚠️ Error receiving data: {e}")
                break

            receiver_id = msg_data.get("receiver_id")
            message_text = msg_data.get("message")
            if receiver_id is None or not message_text:
                print("⚠️ Missing receiver_id or message_text — skipping.")
                continue

            # --- Save to DB ---
            try:
                with SessionLocal() as db:
                    message = ChatMessage(
                        sender_id=user_id,
                        receiver_id=receiver_id,
                        listing_id=listing_id,
                        message=message_text,
                    )
                    db.add(message)
                    db.commit()
                    db.refresh(message)

                response = {
                    "id": message.id,
                    "sender_id": message.sender_id,
                    "receiver_id": message.receiver_id,
                    "listing_id": message.listing_id,
                    "message": message.message,
                    "created_at": str(message.created_at),
                }

                print(f"🗄️ Saved message {message.id} → broadcasting...")
            except Exception as e:
                print(f"❌ DB error while saving message: {e}")
                continue

            # --- Broadcast message to all connected clients of this listing ---
            dead_connections = []
            for conn in active_connections.get(listing_id, []):
                try:
                    await conn.send_text(json.dumps(response))
                except Exception as e:
                    print(f"⚠️ Failed to send to a client: {e}")
                    dead_connections.append(conn)

            # Clean up any dead sockets
            for dead_conn in dead_connections:
                active_connections[listing_id].remove(dead_conn)

    except WebSocketDisconnect:
        print(f"❌ WebSocket disconnected for user {user_id}")
    except Exception as e:
        print(f"💥 Unexpected error: {e}")
    finally:
        # Clean up this connection
        if listing_id in active_connections:
            active_connections[listing_id] = [
                c for c in active_connections[listing_id] if c != websocket
            ]
            if not active_connections[listing_id]:
                del active_connections[listing_id]
        print(f"🧹 Cleaned up connection — {len(active_connections.get(listing_id, []))} left for listing {listing_id}")
