import api from "./api";
import {ReponseUser} from "./auth";

export async function getUserId(id: string): Promise<ReponseUser>{
    try {
        const response = await api.get(`/users/${id}`);
        return response.data.data;
    } catch (error) {
        throw error;
    }
}