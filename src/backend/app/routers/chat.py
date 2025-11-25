from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import Dict, List, Any
import json
import logging
from datetime import datetime

from app.models.chat import ChatMessage
from app.models.listing import Listing
from app.models.user import User
from app.core.security import decode_access_token
from app.utils.dependencies import get_db
from app.core.database import SessionLocal
from app.schemas.chat import ChatMessageResponse
from app.utils.dependencies import get_current_user
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
logger = logging.getLogger("chat")

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# Structure:
# active_connections[listing_id][user_id] = [WebSocket, WebSocket, ...]
active_connections: Dict[int, Dict[int, List[WebSocket]]] = {}


def _ensure_listing_user_entry(listing_id: int, user_id: int) -> None:
    """Ensure nested dict/list exists for listing and user."""
    if listing_id not in active_connections:
        active_connections[listing_id] = {}
    if user_id not in active_connections[listing_id]:
        active_connections[listing_id][user_id] = []


def _remove_connection(listing_id: int, user_id: int, websocket: WebSocket) -> None:
    """Remove a websocket connection and clean up empty containers."""
    if listing_id not in active_connections:
        return
    user_conns = active_connections[listing_id].get(user_id)
    if not user_conns:
        return
    if websocket in user_conns:
        user_conns.remove(websocket)
    if len(user_conns) == 0:
        del active_connections[listing_id][user_id]
    if len(active_connections[listing_id]) == 0:
        del active_connections[listing_id]


async def _send_to_user(listing_id: int, user_id: int, payload: Any) -> None:
    """Send payload (dict) to all sockets for a particular user."""
    if listing_id not in active_connections:
        return
    user_conns = active_connections[listing_id].get(user_id, [])
    if not user_conns:
        return

    text = json.dumps(payload)
    dead_connections = []

    for ws in list(user_conns):
        try:
            await ws.send_text(text)
        except Exception as e:
            logger.warning("Failed to send to user %s on listing %s: %s", user_id, listing_id, e)
            dead_connections.append(ws)

    for dead_ws in dead_connections:
        _remove_connection(listing_id, user_id, dead_ws)


def _validate_listing_access(db: Session, listing_id: int, user_id: int) -> bool:
    """
    Allow:
    - Seller of the listing
    - Any buyer (non-seller user)

    Deny:
    - Any user if listing doesn't exist
    """
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        return False

    # Seller is allowed
    # Buyers are allowed
    return True


@router.get("/messages")
@limiter.limit("100/hour")
def get_user_messages(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    messages = (
        db.query(ChatMessage)
        .filter(
            (ChatMessage.sender_id == current_user.id)
            | (ChatMessage.receiver_id == current_user.id)
        )
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    listings: Dict[int, Dict] = {}

    for msg in messages:
        listing_id = msg.listing_id
        listing = msg.listing

        if msg.sender_id == current_user.id:
            other_user = msg.receiver
        else:
            other_user = msg.sender

        if other_user is None:
            other_user_id = msg.receiver_id if msg.sender_id == current_user.id else msg.sender_id
            other_user_name = None
            other_user_image = None
        else:
            other_user_id = other_user.id
            other_user_name = getattr(other_user, "name", None)
            other_user_image = getattr(other_user, "profile_picture", None)

        if listing_id not in listings:
            listings[listing_id] = {
                "listing_id": listing_id,
                "listing_title": getattr(listing, "title", None),
                "chats": {}
            }

        chats = listings[listing_id]["chats"]

        if other_user_id not in chats:
            chats[other_user_id] = {
                "user_id": other_user_id,
                "user_name": other_user_name,
                "user_image": other_user_image,
                "messages": []
            }

        chats[other_user_id]["messages"].append({
            "id": msg.id,
            "sender_id": msg.sender_id,
            "receiver_id": msg.receiver_id,
            "message": msg.message,
            "created_at": msg.created_at.isoformat()
        })

    result = []
    for listing_data in listings.values():
        listing_data["chats"] = list(listing_data["chats"].values())
        result.append(listing_data)

    return result


@router.get("/{listing_id}", response_model=list[ChatMessageResponse])
def get_chat_messages(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    messages = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.listing_id == listing_id,
            (ChatMessage.sender_id == current_user.id)
            | (ChatMessage.receiver_id == current_user.id)
        )
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    return messages


@router.websocket("/ws/{listing_id}")
async def chat_websocket(websocket: WebSocket, listing_id: int):
    logger.debug("Incoming WS connection for listing %s", listing_id)

    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    try:
        payload = decode_access_token(token)
        if not payload or "sub" not in payload:
            raise ValueError("Invalid token payload")
        user_id = int(payload.get("sub"))
    except Exception:
        await websocket.close(code=status.W_1008_POLICY_VIOLATION)
        return

    try:
        with SessionLocal() as db:
            if not _validate_listing_access(db, listing_id, user_id):
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()
    _ensure_listing_user_entry(listing_id, user_id)
    active_connections[listing_id][user_id].append(websocket)

    try:
        while True:
            try:
                raw = await websocket.receive_text()
            except WebSocketDisconnect:
                break
            except Exception:
                break

            if not raw:
                continue

            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                continue

            action = data.get("action", "message")

            if action == "typing":
                try:
                    receiver_id = int(data.get("receiver_id"))
                    typing_state = bool(data.get("typing", False))
                except:
                    continue

                if receiver_id == user_id:
                    continue

                payload = {
                    "type": "typing",
                    "listing_id": listing_id,
                    "sender_id": user_id,
                    "receiver_id": receiver_id,
                    "typing": typing_state,
                    "timestamp": datetime.utcnow().isoformat(),
                }

                await _send_to_user(listing_id, receiver_id, payload)
                await _send_to_user(listing_id, user_id, payload)
                continue

            # Default: sending a message
            try:
                receiver_id = int(data.get("receiver_id"))
                message_text = str(data.get("message", "")).strip()
                if not message_text:
                    continue
                if receiver_id == user_id:
                    continue
            except:
                continue

            with SessionLocal() as db:
                listing = db.query(Listing).filter(Listing.id == listing_id).first()
                seller_id = listing.seller_id

                # ---- Role-based messaging rules ----
                if user_id != seller_id:
                    # Buyer → must message seller
                    if receiver_id != seller_id:
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "message": "Buyers can only message the seller."
                        }))
                        continue
                else:
                    # Seller → must message a buyer
                    if receiver_id == seller_id:
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "message": "Seller cannot message themselves."
                        }))
                        continue

                # Save message
                try:
                    message = ChatMessage(
                        sender_id=user_id,
                        receiver_id=receiver_id,
                        listing_id=listing_id,
                        message=message_text,
                    )
                    db.add(message)
                    db.commit()
                    db.refresh(message)
                except Exception as e:
                    try:
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "message": "Failed to save message"
                        }))
                    except:
                        pass
                    continue

            response = {
                "type": "message",
                "id": message.id,
                "sender_id": message.sender_id,
                "receiver_id": message.receiver_id,
                "listing_id": message.listing_id,
                "message": message.message,
                "created_at": message.created_at.isoformat(),
            }

            await _send_to_user(listing_id, message.sender_id, response)
            await _send_to_user(listing_id, message.receiver_id, response)

    finally:
        _remove_connection(listing_id, user_id, websocket)
