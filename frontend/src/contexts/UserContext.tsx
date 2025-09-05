import { createContext, useContext, useState, type ReactNode } from "react";
import axios from "axios";

interface UserCredentials {
    username: string;
    password: string;
}

interface User {
    id: number;
    username: string;
}

interface UserContextType {
    user: User | null;
    login: (user: UserCredentials) => Promise<User | void | string>;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const login = async (newUser: UserCredentials) => {
        try {
            const response = await axios.post(`${SERVER_URL}/auth/login`,
                newUser,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log(response.data);
            setUser(response.data);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const error: string = err.response?.data?.detail
                return error ?? "Unknown Axios Error";
            } else {
                return "Unknown Axios Error";
            }
        }
    };
    const logout = () => setUser(null);

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used with a UserProvider");
    }
    return context;
}