import { useState } from "react";
import SearchBar from "./SearchBar";
import type { User, CreateChat } from "../types";
import { createChat } from "../functions/fetchFunctions";

export default function Modal({ isOpen, onClose, thisUser }: { isOpen: boolean; onClose: () => void, thisUser: User | null }) {
    // Defaults to the current user. Should investigate making it so that user cannot remove themselves from list
    const [selectedUsers, setSelectedUsers] = useState<User[] | []>(thisUser ? [thisUser] : []);
    const [chatName, setChatName] = useState<string>("");

    const handleSubmit = () => {
        // We need a chat name and at least 2 members to proceed
        if (!chatName) return;
        if (selectedUsers.length < 2) return;

        let is_group = false;
        if (selectedUsers.length > 2) {
            is_group = true;
        }

        const userIds = selectedUsers.map(user => user.id);
        const chatInfo: CreateChat = {
            name: chatName,
            is_group: is_group,
            user_ids: userIds,
        }

        createChat(chatInfo);

        // Reset everything and close modal
        if (chatName.trim()) {
            setChatName('');
            setSelectedUsers([]);
            onClose();
        }
    }

    // Add user to list
    const handleUserSelection = (user: User) => {
        console.log("Selected user: ", user);
        setSelectedUsers(prev => [...prev, user]);
    }

    // Remove user from list
    const handleRemoveUser = (user: User) => {
        setSelectedUsers(prev => (
            prev.filter(validUser => validUser.id !== user.id)
        ));
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
                    {selectedUsers.map(user => (
                        <div key={user.id} onClick={() => handleRemoveUser(user)}>{user.username}</div>
                    ))}
                    <SearchBar onUserSelect={handleUserSelection}/>
                    
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