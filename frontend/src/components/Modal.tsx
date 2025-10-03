import { useState } from "react";
import SearchBar from "./SearchBar";
import type { User } from "../types";

export default function Modal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [chatName, setChatName] = useState<string>("");

    // Update later to save chat to DB
    const handleSubmit = () => {
        if (chatName.trim()) {
            console.log("Selected user: ", selectedUser);
            setChatName('');
            onClose();
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Create New Chat</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>
                    
                <div className="flex flex-1 flex-col gap-4">
                    <input
                        type="text"
                        value={chatName}
                        onChange={(e) => setChatName(e.target.value)}
                        placeholder="Enter chat name..."
                        className="w-full bg-gray-700 text-white px-4 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                    />
                    <SearchBar onUserSelect={setSelectedUser}/>
                    
                    <div className="flex flex-1 gap-2 justify-center items-center">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                            >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                            >
                            Create
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}