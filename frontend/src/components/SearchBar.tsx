import { useState, useEffect } from "react";
import { useDebouncedValue } from "../functions/debounced";
import type { User } from "../types";
import axios from "axios";

interface SearchBarProps {
    onUserSelect: (user: User) => void;
}

export default function SearchBar({ onUserSelect }: SearchBarProps) {
    const [query, setQuery] = useState<string>("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(false);
    const debouncedQuery = useDebouncedValue(query, 400);
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;

    const handleSelect = (user: User) => {
        onUserSelect(user);
        setQuery("");
        setOpen(false);
    }

    useEffect(() => {
        if (debouncedQuery.length < 2) {
            setResults([]);
            setOpen(false);
            return;
        }

        setLoading(true);
        const searchUsers = async () => {
            try {
                const response = await axios.get(`${SERVER_URL}/users/search_users?q=${debouncedQuery}`);
                setResults(response.data);
                setOpen(true);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        searchUsers();
    }, [debouncedQuery]);

    return (
        <div className="relative w-full">
            {/* SEARCH BAR */}
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Users"
                className="w-full rounded-lg border border-gray-300 px-3 text-center py=2 focus:outline-none focus:ring focus:ring-blue-400"
            />

            {/* DROPDOWN LIST */}
            {open && results.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
                    {results.map((user) => (
                        <li
                            key={user.id}
                            className="cursor-pointer px-3 py-2 text-black hover:bg-gray-100"
                            onClick={() => handleSelect(user)}
                        >
                            <span className="font-medium">{user.username}</span>
                        </li>
                    ))}
                </ul>
            )}

            {open && !loading && results.length === 0 && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg text-black border border-gray-300 bg-white shadow-lg">
                    No Users Found
                </div>
            )}
            {loading && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg text-black border border-gray-300 bg-white shadow-lg">
                    Searching...
                </div>
            )}
        </div>
    )
} 