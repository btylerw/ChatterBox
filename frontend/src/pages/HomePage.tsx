import { useState, useEffect, useRef } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

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

    const { user, logout } = useUser();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [showChannels, setShowChannels] = useState(false);
    const navigate = useNavigate();
    const webSocketRef = useRef<WebSocket | null>(null);
    const [messageToSend, setMessageToSend] = useState<string>("");

    useEffect(() => {
        if (webSocketRef.current) return;

        webSocketRef.current = new WebSocket("ws://localhost:8000/chat/ws-broadcast");
        webSocketRef.current.onopen = () => {
            console.log("WebSocket connection opened!");
			const data = {
				id: user?.id ?? 0,
				type: "connect",
				username: user?.username ?? "Anonymous",
				content: "connected"
			}
			if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
				webSocketRef.current.send(JSON.stringify(data));
			}
        }

        webSocketRef.current.onmessage = (e) => {
			console.log(e.data);
            const parsed: MessagePayload = JSON.parse(e.data);
            const { username, content } = parsed;
            setMessages((prevMessages) => [
                ...prevMessages,
                { id: Date.now(), user: username, content: content },
            ]);
        };

        webSocketRef.current.onclose = () => {
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
    }, []);

    const sendWebMessage = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(messageToSend);
        const data: MessagePayload = {
            id: user?.id ?? 0,
			type: "message",
            username: user?.username ?? "Anonymous",
            content: messageToSend,
        }
        if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
            webSocketRef.current.send(JSON.stringify(data));
            setMessageToSend('');
        } else {
            console.log("Error");
        }
    }

    const handleLogOut = () => {
		if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
			const data: MessagePayload = {
				id: user?.id ?? 0,
				type: "disconnect",
				username: user?.username ?? "Anonymous",
				content: "logged out",
			}
			webSocketRef.current.send(JSON.stringify(data));
		}
		logout();
		
    }
    useEffect(() => {
        if (!user) {
            navigate("/");
        }
    }, [user]);

    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
            {/* === Server Sidebar (always narrow) === */}
            <div className="hidden md:flex w-[72px] bg-gray-800 flex-col items-center py-4 space-y-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">D</div>
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">+</div>
                <div className="w-12 h-12 bg-red-700 rounded-full flex items-center justify-center cursor-pointer" onClick={handleLogOut}>Log Out</div>
            </div>

            {/* === Channels Sidebar === */}
            <div
                className={`fixed md:static top-0 left-0 h-full w-60 bg-gray-850 flex flex-col transform md:transform-none transition-transform duration-200 z-20 ${
                showChannels ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                }`}
            >
                <div className="p-4 font-bold border-b border-gray-700 flex justify-between items-center">
                Server Name
                    <button
                        className="md:hidden text-gray-400"
                        onClick={() => setShowChannels(false)}
                    >
                        ✕
                    </button>
                </div>
                <div className="flex-1 p-3 space-y-2">
                    <div className="hover:bg-gray-700 rounded px-2 py-1 cursor-pointer"># general</div>
                    <div className="hover:bg-gray-700 rounded px-2 py-1 cursor-pointer"># random</div>
                </div>
            </div>

            {/* === Chat Area === */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-900">
                {/* Header */}
                <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center px-4 justify-between">
                    <span className="font-bold text-lg"># general</span>
                    <button
                        className="md:hidden text-gray-400"
                        onClick={() => setShowChannels(true)}
                    >
                        ☰
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className="flex items-start space-x-3">
                            <div className="w-9 h-9 bg-indigo-500 rounded-full flex items-center justify-center text-sm">
                                {msg.user?.[0]}
                            </div>
                            <div className="max-w-3xl"> {/* Prevents ultra-wide stretching */}
                                <span className="font-bold">{msg.user}</span>
                                <p className="text-gray-200">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <form onSubmit={sendWebMessage} className="p-4 border-t border-gray-700 flex bg-gray-900">
                    <input
                        value={messageToSend}
                        onChange={(e) => setMessageToSend(e.target.value)}
                        placeholder="Message #general"
                        className="flex-1 bg-gray-800 text-white px-4 py-2 rounded focus:outline-none"
                    />
                    <button type="submit" className="ml-2 px-4 py-2 bg-indigo-600 rounded">
                        Send
                    </button>
                </form>
            </div>

            {/* === Members List (right side, only on xl screens) === */}
            <div className="hidden xl:flex w-60 bg-gray-850 border-l border-gray-700 flex-col p-4">
                <h2 className="text-sm font-bold text-gray-400 mb-2">Online</h2>
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-green-500"></div>
                        <span>Bot</span>
                    </div>
                </div>
            </div>

            {/* === Mobile bottom nav for servers === */}
            <div className="fixed bottom-0 left-0 w-full h-14 bg-gray-800 flex md:hidden items-center justify-around">
                <button className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">D</button>
                <button className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">+</button>
            </div>
        </div>
    );
}
