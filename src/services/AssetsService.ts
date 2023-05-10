import api from "./api";

export async function getImageData(url: string): Promise<unknown> {
    const response = await api.get(url, { responseType: 'blob' });
    const reader = new FileReader();
    reader.readAsDataURL(response.data);
    return new Promise((resolve, reject) => {
        reader.onloadend = () => {
            const base64data = reader.result;
            resolve(base64data as string);
        };
        reader.onerror = reject;
    });
}

export async function getAssetURI(fileId: string): Promise<string | null> {
    try {
        console.log('getAssetURI Inicio')
        const response = await api.get(`/assets/${fileId}`);
        console.log('getAssetURI >', response)
        return response.request.responseURL;
    } catch (error) {
        console.error('Error fetching asset URI:', error.data.erros);
        return null;
    }
}