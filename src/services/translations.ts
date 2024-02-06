import api from "./api";

export async function getTranslation() {
    try {
        const response = await api.get('/translations');
        return response.data.data;
    } catch (error) {
        console.error('Error to fetch translations:', error);
        throw error;
    }
}