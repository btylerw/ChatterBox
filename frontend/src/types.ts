export interface MessagePayload {
    id: number,
    type: string,
    username: string,
    content: string,
}

export interface ChatMessage {
    id: number;
    user: string;
    content: string;
}

export interface Chat {
    id: number;
    name: string;
    is_group: boolean;
    members: string[];
}

export interface User {
    id: number;
    username: string;
}

export interface UserCredentials {
    username: string;
    password: string;
}

export interface UserContextType {
    user: User | null;
    login: (user: UserCredentials) => Promise<User | void | string>;
    logout: () => void;
    chats: Chat[] | null;
}