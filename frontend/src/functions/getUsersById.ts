import axios from "axios";
import type { User } from "../types";

export async function getUsersById(user_ids: string[]): Promise<User[]> {
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
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