import { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
    const { user, logout } = useUser();
    const [messages, setMessages] = useState([
        { id: 1, user: user?.username, text: "Hey there 👋" },
        { id: 2, user: "Bot", text: "Welcome to the chat!" },
    ]);
    const [input, setInput] = useState("");
    const [showChannels, setShowChannels] = useState(false);
    const navigate = useNavigate();

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        setMessages([...messages, { id: Date.now(), user: "You", text: input }]);
        setInput("");
    };

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
                <div className="w-12 h-12 bg-red-700 rounded-full flex items-center justify-center cursor-pointer" onClick={logout}>Log Out</div>
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
                                <p className="text-gray-200">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-gray-700 flex bg-gray-900">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
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
