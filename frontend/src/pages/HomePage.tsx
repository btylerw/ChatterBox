import { useState, useEffect, useRef } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function HomePage() {

    interface MessagePayload {
        id: number,
		type: string,
        username: string,
        content: string,
    }

    interface ChatMessage {
        id: number;
        user: string;
        content: string;
    }

    const { user, chats, logout } = useUser();
    // UPDATE STATE ACCORDINGLY. MESSAGES SHOULD BE BOUND TO THEIR SPECIFIC CHATROOM
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    // UPDATE TYPES HERE LATER
    const [chatId, setChatId] = useState<number | null | string>(null);
    const [showChannels, setShowChannels] = useState<boolean>(false);
    const navigate = useNavigate();
    const webSocketRef = useRef<WebSocket | null>(null);
    const [messageToSend, setMessageToSend] = useState<string>("");
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    
    // THESE STATES ARE FOR TESTING PURPOSES. BE SURE TO DELETE WHEN IMPLEMENTING A PERMANENT
    // SOLUTION FOR CREATING NEW CHATS
    const [buttonText, setButtonText] = useState<string>("Create Chat with Payn");
    const [chatUserId, setChatUserId] = useState<number>(1);

    useEffect(() => {
        // FINE FOR NOW
        // WILL DEFAULT TO FIRST CHAT IN LIST LATER
        console.log(chats);
        if (user?.username === "Payn") {
            setButtonText("Create Chat with Tyler");
            setChatUserId(5);
        }
        if (user?.username === "Payn" || user?.username === "Tyler") {
            setChatId("hello");
        } else {
            setChatId("no");
        }
    }, [user]);

    useEffect(() => {
        if (!chatId) return;
        if (webSocketRef.current) return;
        console.log(chatId);

        webSocketRef.current = new WebSocket(`ws://localhost:8000/chat/ws/${chatId}`);
        webSocketRef.current.onopen = () => {
            console.log("WebSocket connection opened!");
			const data = {
				id: user?.id ?? 0,
				type: "connect",
				username: user?.username ?? "Anonymous",
				content: "connected"
			}
            sendWebMessage(JSON.stringify(data));
        }

        webSocketRef.current.onmessage = (e) => {
            const parsed: MessagePayload = JSON.parse(e.data);
            const { username, content, type } = parsed;
            if (username === user?.username && type === "connect") return;
            setMessages((prevMessages) => [
                ...prevMessages,
                { id: Date.now(), user: username, content: content },
            ]);
        };

        webSocketRef.current.onclose = () => {
            const data: MessagePayload = {
                id: user?.id ?? 0,
                type: "disconnect",
                username: user?.username ?? "Anonymous",
                content: "logged out",
            }
            sendWebMessage(JSON.stringify(data));
            console.log("WebSocket connection closed");
        }

        webSocketRef.current.onerror = (err) => {
            console.error("Websocket error:", err);
        }

        return () => {
            if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
                webSocketRef.current.close();
            }
        };
    }, [chatId]);

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

    const handleLogOut = () => {
        if (webSocketRef.current) {
            webSocketRef.current.close();
        }
		logout();
		
    }

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
    useEffect(() => {
        if (!user) {
            navigate("/");
        }
    }, [user]);

    const handleChatChange = (key: number) => {
        if (webSocketRef.current) {
            webSocketRef.current.close();
            webSocketRef.current = null;
        }
        setChatId(key);
    }

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
                        <div key={chat?.id} onClick={() => handleChatChange(chat?.id)} className="hover:bg-gray-700 rounded px-2 py-1 cursor-pointer">{chat?.name}</div>
                    ))}
                    <div className="hover:bg-gray-700 rounded px-2 py-1 cursor-pointer"># general</div>
                    <div className="hover:bg-gray-700 rounded px-2 py-1 cursor-pointer"># random</div>
                    <button onClick={handleCreateChat}>{buttonText}</button>
                </div>
                <div className="h-12 bg-red-700 rounded-md flex items-center justify-center cursor-pointer m-3" onClick={handleLogOut}>Log Out</div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-h-0">
                {/* Header */}
                <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center px-4 justify-between">
                    <span className="font-bold text-lg"># general</span>
                    <button className="md:hidden text-gray-400" onClick={() => setShowChannels(true)}>☰</button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className="flex items-start space-x-3">
                            <div className="w-9 h-9 bg-indigo-500 rounded-full flex items-center justify-center text-sm">{msg.user?.[0]}</div>
                            <div className="flex-1">
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
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-green-500"></div>
                        <span>Bot</span>
                    </div>
                </div>
            </div>

            {/* Mobile bottom nav */}
            <div className="fixed bottom-0 left-0 w-full h-14 bg-gray-800 flex md:hidden items-center justify-around">
                <button className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">D</button>
                <button className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">+</button>
            </div>

        </div>
    );
}
