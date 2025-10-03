import { useState, useEffect, useRef } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import { type MessagePayload, type ChatMessage, type Chat, type User } from "../types";
import { getUsersById } from "../functions/getUsersById";

export default function HomePage() {
    const { user, chats, logout } = useUser();
    // UPDATE STATE ACCORDINGLY. MESSAGES SHOULD BE BOUND TO THEIR SPECIFIC CHATROOM
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    // UPDATE TYPES HERE LATER
    const [chatId, setChatId] = useState<number | null | string>(null);
    const [chatName, setChatName] = useState<string>("No Chat Selected");
    const [chatMembers, setChatMembers] = useState<User[] | null>(null);
    const [showChannels, setShowChannels] = useState<boolean>(false);
    const navigate = useNavigate();
    const webSocketRef = useRef<WebSocket | null>(null);
    const [messageToSend, setMessageToSend] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    
    const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;
    
    useEffect(() => {
        const getMembers = async () => {
            const userIds = chats?.[0].members ?? [];
            const members = await getUsersById(userIds);
            setChatMembers(members);
        }

        if (chats?.[0]) {
            getMembers();
            setChatId(chats?.[0].id);
            setChatName(chats?.[0].name);
        }

    }, [chats]);
    
    useEffect(() => {
        if (!chatId) return;

        console.log(chatMembers)
        let socket: WebSocket | null = null;
        let isMounted = true;

        const connectNewSocket = () => {
            if (!isMounted) return;

            socket = new WebSocket(`${WEBSOCKET_URL}/chat/ws/${chatId}`);
            webSocketRef.current = socket;

            socket.onopen = () => {
                console.log(`WebSocket connection opened for chat ${chatId}`);
                const data = {
                    id: user?.id ?? 0,
                    type: "connect",
                    username: user?.username ?? "Anonymous",
                    content: "connected"
                };
                socket?.send(JSON.stringify(data));
            };

            socket.onmessage = (e) => {
                const parsed: MessagePayload = JSON.parse(e.data);
                const { username, content, type } = parsed;
                console.log("Received message:", parsed);
                
                if (username === user?.username && type === "connect") return;
                
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { id: Date.now(), user: username, content: content },
                ]);
            };

            socket.onclose = (event) => {
                console.log(`WebSocket connection closed for chat ${chatId}`, event.code, event.reason);
                const data = {
                    id: user?.id ?? 0,
                    type: "disconnect",
                    username: user?.username ?? "Anonymous",
                    content: "disconnected"
                }
                socket?.send(JSON.stringify(data));
            };

            socket.onerror = (err) => {
                console.error("WebSocket error:", err);
            };
        };

        if (webSocketRef.current && webSocketRef.current.readyState !== WebSocket.CLOSED) {
            webSocketRef.current.close();
            setTimeout(connectNewSocket, 100);
        } else {
            connectNewSocket();
        }

        return () => {
            isMounted = false;
            if (socket && socket.readyState !== WebSocket.CLOSED) {
                socket.close();
            }
            webSocketRef.current = null;
        };
    }, [chatId, user?.id, user?.username]);

    const sendWebMessage = (data: string) => {
        if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
            webSocketRef.current.send(data);
        } else {
            console.log("Error");
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data: MessagePayload =  {
            id: user?.id ?? 0,
            type: "message",
            username: user?.username ?? "Anonymous",
            content: messageToSend,
        }
        sendWebMessage(JSON.stringify(data));
        setMessageToSend('');
    }

    const handleLogOut = async () => {
        if (webSocketRef.current) {
            const data = {
                id: user?.id ?? 0,
                type: "disconnect",
                username: user?.username ?? "Anonymous",
                content: "disconnected"
            }
            sendWebMessage(JSON.stringify(data));
            webSocketRef.current.close();
        }
		logout();
		
    }

    const handleChatChange = async (chat: Chat) => {
        if (webSocketRef.current) {
            const data = {
                id: user?.id ?? 0,
                type: "disconnect",
                username: user?.username ?? "Anonymous",
                content: "disconnected"
            }
            sendWebMessage(JSON.stringify(data));
            webSocketRef.current.close();
        }
        setChatId(chat.id);
        setChatName(chat.name);
    }
    /*
    const handleCreateChat = async () => {
        const chatName = "TestChat" + Date.now();
        const data = { name: chatName, is_group: false, user_ids: [user?.id, chatUserId] }
        console.log(chatName);
        try {
            const response = await axios.post(`${SERVER_URL}/chat/create-chat`,
                data,
                {
                    headers: {
                        "Content-Type": "application/json",
                    }
                },
            );
            console.log(response.data);
        } catch(err) {
            console.error(err);
        }
    }
    */
    useEffect(() => {
        if (!user) {
            navigate("/");
        }
    }, [user]);


    return (
        <div className="flex h-screen w-screen bg-gray-900 text-white overflow-hidden">

            {/* Left Sidebar */}
            <div className={`fixed md:static top-0 left-0 h-full w-60 bg-gray-850 flex flex-col transform md:transform-none transition-transform duration-200 z-20 ${showChannels ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
                <div className="p-4 font-bold border-b border-gray-700 flex justify-between items-center">
                    Chat Name
                    <button className="md:hidden text-gray-400" onClick={() => setShowChannels(false)}>✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {chats?.map(chat => (
                        <div key={chat?.id} onClick={() => handleChatChange(chat)} className="hover:bg-gray-700 rounded px-2 py-1 cursor-pointer">{chat?.name}</div>
                    ))}
                </div>
                <div className="h-12 bg-blue-700 rounded-md flex items-center justify-center cursor-pointer m-3" onClick={() => setIsModalOpen(true)}>Create Chat</div>
                <div className="h-12 bg-red-700 rounded-md flex items-center justify-center cursor-pointer m-3" onClick={handleLogOut}>Log Out</div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-h-0">
                {/* Header */}
                <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center px-4 justify-between">
                    <span className="font-bold text-lg">{chatName}</span>
                    <button className="md:hidden text-gray-400" onClick={() => setShowChannels(true)}>☰</button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className="flex items-start space-x-3">
                            <div className="w-9 h-9 bg-indigo-500 rounded-full flex items-center justify-center text-sm">{msg.user?.[0]}</div>
                            <div className="flex-1 text-left">
                                <span className="font-bold">{msg.user}</span>
                                <p className="text-gray-200">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700 flex bg-gray-900">
                    <input
                        value={messageToSend}
                        onChange={(e) => setMessageToSend(e.target.value)}
                        placeholder="Message #general"
                        className="flex-1 bg-gray-800 text-white px-4 py-2 rounded focus:outline-none"
                    />
                    <button type="submit" className="ml-2 px-4 py-2 bg-indigo-600 rounded">Send</button>
                </form>
            </div>

            {/* Right Sidebar */}
            <div className="hidden xl:flex w-60 bg-gray-850 border-l border-gray-700 flex-col p-4">
                <h2 className="text-sm font-bold text-gray-400 mb-2">Online</h2>
                <div className="space-y-2">
                    {chatMembers?.map(member => (
                        <div key={member.id} className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-green-500"></div>
                            <span>{member.username}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile bottom nav */}
            <div className="fixed bottom-0 left-0 w-full h-14 bg-gray-800 flex md:hidden items-center justify-around">
                <button className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">D</button>
                <button className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">+</button>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>

    );
}
