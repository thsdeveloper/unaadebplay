import api from "./api";

export async function getConfig() {
    try {
        const response = await api.get('/settings');
        return response.data.data;
    } catch (error) {
        console.error('Erro ao buscar configurações:', error);
        throw error;
    }
}