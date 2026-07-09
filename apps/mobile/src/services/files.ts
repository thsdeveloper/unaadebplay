import { api } from './apiClient';

const KNOWN_BUCKETS = ['images', 'avatars', 'audio'] as const;
type KnownBucket = typeof KNOWN_BUCKETS[number];

function isKnownBucket(v?: string): v is KnownBucket {
    return !!v && (KNOWN_BUCKETS as readonly string[]).includes(v);
}

/** Lê um arquivo local (uri) como base64 + content-type, sem depender de expo-file-system. */
async function readUriAsBase64(uri: string): Promise<{ base64: string; contentType: string }> {
    const blob = await fetch(uri).then((res) => res.blob());
    const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Falha ao ler o arquivo'));
        reader.readAsDataURL(blob);
    });
    // dataUrl = "data:<mime>;base64,<payload>"
    const base64 = dataUrl.includes(',') ? dataUrl.slice(dataUrl.indexOf(',') + 1) : dataUrl;
    return { base64, contentType: blob.type || '' };
}

/**
 * Faz upload de um arquivo local (uri) VIA API (o gateway grava no Storage sob o prefixo
 * do próprio usuário — o app não fala com o Supabase direto). Retorna o PATH do objeto em
 * `.id`, compatível com os callers que gravam isso em `profiles.avatar`. A resolução para
 * URL pública continua em `getStorageUrl`.
 */
async function uploadToStorage(uri: string, folderOrBucket?: string, base64?: string): Promise<{ id: string; bucket: string }> {
    const fileName = uri.split('/').pop() || 'file';
    const ext = (/\.(\w+)$/.exec(fileName)?.[1] || 'jpg').toLowerCase();
    const guessedType = ext === 'mp3' ? 'audio/mpeg' : `image/${ext === 'jpg' ? 'jpeg' : ext}`;

    // Preserva o comportamento anterior: bucket conhecido ('avatars'/'images'/'audio') é
    // usado como bucket; o restante cai em 'images'. (O prefixo por usuário é do servidor.)
    const bucket: KnownBucket = isKnownBucket(folderOrBucket) ? folderOrBucket : 'images';

    // Preferimos o base64 que o expo-image-picker já entrega (base64: true). O caminho antigo
    // (fetch(uri).blob() + FileReader) quebra no Hermes/RN atual com "Creating blobs from
    // 'ArrayBuffer' ... are not supported"; só caímos nele como fallback (sem base64).
    const payload = base64 ? { base64, contentType: guessedType } : await readUriAsBase64(uri);

    const res = await api.me.upload({
        bucket,
        filename: fileName,
        contentType: payload.contentType || guessedType,
        contentBase64: payload.base64,
    });

    return { id: res.path, bucket: res.bucket };
}

export async function uploadImage(uri: string, folder?: string, base64?: string): Promise<{ id: string; bucket: string }> {
    return uploadToStorage(uri, folder, base64);
}

export async function uploadFile(uri: string, base64?: string): Promise<{ id: string; bucket: string }> {
    return uploadToStorage(uri, undefined, base64);
}

// No Storage não há "metadata de asset" como no Directus; o próprio path identifica o arquivo.
export async function getAssetURI(fileId: string): Promise<{ id: string }> {
    return { id: fileId };
}

export async function setUpdateFile(id: string, _fileObject?: any): Promise<{ id: string }> {
    return { id };
}

export async function setDeleteFile(id: string, bucket: KnownBucket = 'images'): Promise<void> {
    // URLs externas (ex.: seed pravatar) não são objetos nossos; nada a apagar.
    if (!id || /^https?:\/\//i.test(id)) return;
    // Best-effort: paths antigos (sem prefixo do usuário) retornam 403 e são ignorados.
    await api.me.deleteUpload({ bucket, path: id }).catch(() => {});
}

export const filesService = {
    getAssetURI,
    uploadFile,
    uploadImage,
    setUpdateFile,
    setDeleteFile,
};
