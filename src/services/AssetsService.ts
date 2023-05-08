import api from "./api";

export async function getImageData(url: string): Promise<string> {
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