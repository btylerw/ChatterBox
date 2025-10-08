import asyncio
import os
import json
from typing import List, Dict
from fastapi import WebSocket
import redis.asyncio as redis

# Manages all of the WebSocket connections
# Utilizes Redis to transmit messages between all workers
class ConnectionManager:
    def __init__(self):
        # Stores all connected chats and users
        # Keeps user ids and WebSockets in a tuple to update chat on user activity
        # { ChatId: [(user1id, user1WebSocket), (user2id, user2WebSocket)] }
        self.active_connections: dict[str, list[tuple[int, WebSocket]]] = {}
        self.redis_client = None
        self.pubsub = None
        self.subscribed_chats = set()
        self.listener_task = None
    
    # Starts redis client
    async def initialize_redis(self):
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis_client = await redis.from_url(
            redis_url,
            encoding="utf-8",
            decode_responses=True
        )
        self.pubsub = self.redis_client.pubsub()
        print("Redis connection initialized")
    
    # Handles when users connect
    async def connect(self, websocket: WebSocket, chat_id: str, user_id: int):
        # Ensures redis is initialized
        if self.redis_client is None:
            await self.initialize_redis()

        await websocket.accept()

        connected_user_ids = []

        # Grabbing all currently connected user ids to send to user
        if chat_id in self.active_connections:
            connected_user_ids = [uid for uid, _ in self.active_connections[chat_id]]
        else:
            self.active_connections[chat_id] = []
        
        # Adding this user to connection list
        self.active_connections[chat_id].append((user_id, websocket))

        # Sends list of all active connections back to the user
        await websocket.send_json({
            "type": "connected_users",
            "user_ids": connected_user_ids
        })

        # If first user in chat room, subscribe to redis server
        if chat_id not in self.subscribed_chats:
            await self.pubsub.subscribe(f"chat:{chat_id}")
            self.subscribed_chats.add(chat_id)
        
        # Start up redis listener
        if self.listener_task is None or self.listener_task.done():
            self.listener_task = asyncio.create_task(self._redis_listener())
        
        # Tells entire chat room that this user has joined
        await self.broadcast_user_event(chat_id, user_id, "user_joined")
                
        print(f"Client connected to chat {chat_id}. Total connections: {len(self.active_connections[chat_id])}")
    
    # Handles when user disconnects
    def disconnect(self, websocket: WebSocket, chat_id: str, user_id: int):
        print("Client disconnecting: ", websocket)
        if chat_id in self.active_connections:
            try:
                self.active_connections[chat_id].remove((user_id, websocket))
                print(f"Client disconnected from chat {chat_id}. Remaining: {len(self.active_connections[chat_id])}")
            except ValueError:
                print(f"WebSocket not found in chat {chat_id} connections")
            if not self.active_connections[chat_id]:
                del self.active_connections[chat_id]
                print(f"Chat {chat_id} has no more connections, removed from manager.")
    
    async def broadcast_user_event(self, chat_id: str, user_id: int, event_type: str):
        message = json.dumps({
            "type": event_type,
            "user_ids": [user_id]
        })
        await self.broadcast(message, chat_id)

    # Sends messages to redis server
    async def broadcast(self, message: str, chat_id: str):
        # Ensures redis is initialized
        if self.initialize_redis is None:
            await self.initialize_redis()
            
        try:
            await self.redis_client.publish(f"chat:{chat_id}", message)
            print(f"Published message to Redis channel chat:{chat_id}")
        except Exception as e:
            print(f"Error publishing to Redis: {e}")

    # Listens for messages and sends them to all subscribed entities
    async def _redis_listener(self):
        print("Starting Redis listener")
        try:
            while True:
                message = await self.pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message:
                    print(f"Raw message from Redis: {message}")
                    if message["type"] == "message":
                        channel = message["channel"]
                        chat_id = channel.split(":",1)[1]
                        data = message["data"]
                        print(f"Received from Redis - chat: {chat_id}: {data}")
                        await self._send_to_local_connections(data, chat_id)
                await asyncio.sleep(0.01)
        except asyncio.CancelledError:
            print("Redis listener cancelled")
        except Exception as e:
            print(f"Error in Redis listener: {e}")
    
    async def _send_to_local_connections(self, message: str, chat_id: str):
        if chat_id not in self.active_connections:
            return
    
        dead_connections = []
        for user_id, connection in self.active_connections[chat_id]:
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"Error sending to connection: {e}")
                dead_connections.append((user_id, connection))
        
        for dead_conn in dead_connections:
            self.disconnect(dead_conn, chat_id)
    
    async def close(self):
        if self.listener_task:
            self.listener_task.cancel()
        
        if self.pubsub:
            await self.pubsub.unsubscribe()
            await self.pubsub.close()
        
        if self.redis_client:
            await self.redis_client.close()

        print("Redis connections closed")

manager = ConnectionManager()