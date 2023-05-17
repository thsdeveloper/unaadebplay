import api from "./api";

export async function getAssetURI(fileId: string): Promise<string | null> {
    try {
        const response = await api.get(`/assets/${fileId}`);
        return response.request.responseURL;
    } catch (error) {
        console.error('Error fetching asset URI:');
        return null;
    }
}