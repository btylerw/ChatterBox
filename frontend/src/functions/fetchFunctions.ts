import axios from "axios";
import type { User, CreateChat, UpdateChat, Chat } from "../types";
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export async function getUsersById(user_ids: number[]): Promise<User[]> {
    try {
        const response = await axios.post(
            `${SERVER_URL}/users/get_users_by_id`, 
            user_ids
        );
        return response.data;
    } catch (err) {
        console.error('Error fetching users: ', err);
        throw err;
    }
}

export async function createChat(chatInfo: CreateChat): Promise<string> {
    console.log(chatInfo);
    try {
        await axios.post(
            `${SERVER_URL}/chat/create-chat`,
            chatInfo
        );
        return "Chat Created Successfully!";
    } catch (err) {
        console.error('Error creating chat: ', err);
        throw err;
    }
}

export async function addUsersToChat(chatInfo: UpdateChat): Promise<string> {
    try {
        await axios.post(
            `${SERVER_URL}/chat/update-chat`,
            chatInfo
        );
        return "Chat updated successfully!";
    } catch (err) {
        console.error('Error updating chat: ', err);
        throw err;
    }
}

export async function getChats(userId: number | undefined): Promise<Chat[]>  {
    try {
        const response = await axios.get(
            `${SERVER_URL}/users/chats/${userId}`
        );
        return response.data;
    } catch (err) {
        console.error('Error retrieving chats: ', err);
        throw err;
    }
}