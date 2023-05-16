import api from "./api";

export interface GenericItem {
    id: string;
}

export async function getItems<T extends GenericItem>(collectionName: string,  params?: Record<string, unknown>): Promise<T[]> {
    try {
        const response = await api.get(`/items/${collectionName}`, {
            params: params,
        });
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching ${collectionName}:`, error);
    }
}

export async function getItem<T extends GenericItem>(collectionName: string, id: number, params?: Record<string, unknown>): Promise<T> {
    try {
        const response = await api.get(`/items/${collectionName}/${id}`, {
            params: params,
        });
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching item with id ${id}:`, error);
        throw error;
    }
}

export async function createItem<T extends GenericItem>(collectionName: string, item: Partial<T>): Promise<T> {
    try {
        const response = await api.post(`/items/${collectionName}`, item);
        return response.data.data;
    } catch (error) {
        console.error('Error creating item:', error);
        throw error;
    }
}

export async function updateItem<T extends GenericItem>(collectionName: string, id: number, item: Partial<T>): Promise<T> {
    try {
        const response = await api.patch(`/items/${collectionName}/${id}`, item);
        return response.data.data;
    } catch (error) {
        console.error(`Error updating item with id ${id}:`, error);
        throw error;
    }
}

export async function deleteItem(collectionName: string, id: number): Promise<void> {
    try {
        await api.delete(`/items/${collectionName}/${id}`);
    } catch (error) {
        console.error(`Error deleting item with id ${id}:`, error);
        throw error;
    }
}
