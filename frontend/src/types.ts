export interface ChatPayload {
    id: number,
    type: 'chat_message',
    username: string,
    content: string,
}

export interface UserStatusMessage {
    type: 'connected_users' | 'user_joined' | 'user_left',
    user_ids: number[]
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

export interface CreateChat {
    name: string;
    is_group: boolean;
    user_ids: number[];
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