import { supabase } from "./supabase";

const KNOWN_BUCKETS = ['images', 'avatars', 'audio'] as const;
type KnownBucket = typeof KNOWN_BUCKETS[number];

function isKnownBucket(v?: string): v is KnownBucket {
    return !!v && (KNOWN_BUCKETS as readonly string[]).includes(v);
}

/**
 * Faz upload de um arquivo local (uri) para o Supabase Storage e retorna o PATH do objeto
 * em `.id` (compatível com os callers que liam `response.id` do Directus e o gravavam, p.ex.,
 * em profiles.avatar). A resolução para URL pública é feita por `getStorageUrl`.
 */
async function uploadToStorage(uri: string, folderOrBucket?: string): Promise<{ id: string; bucket: string }> {
    const fileName = uri.split('/').pop() || 'file';
    const ext = (/\.(\w+)$/.exec(fileName)?.[1] || 'jpg').toLowerCase();
    const contentType = ext === 'mp3' ? 'audio/mpeg' : `image/${ext}`;

    // Se `folder` for um bucket conhecido ('avatars'/'images'/'audio') usa-o; senão usa 'images'
    // e trata `folder` como prefixo de caminho.
    const bucket: KnownBucket = isKnownBucket(folderOrBucket) ? folderOrBucket : 'images';
    const prefix = folderOrBucket && !isKnownBucket(folderOrBucket) ? `${folderOrBucket}/` : '';
    const path = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const arraybuffer = await fetch(uri).then((res) => res.arrayBuffer());

    const { error } = await supabase.storage.from(bucket).upload(path, arraybuffer, {
        contentType,
        upsert: true,
    });
    if (error) throw error;

    return { id: path, bucket };
}

export async function uploadImage(uri: string, folder?: string): Promise<{ id: string; bucket: string }> {
    return uploadToStorage(uri, folder);
}

export async function uploadFile(uri: string): Promise<{ id: string; bucket: string }> {
    return uploadToStorage(uri);
}

// No Storage não há "metadata de asset" como no Directus; o próprio path identifica o arquivo.
export async function getAssetURI(fileId: string): Promise<{ id: string }> {
    return { id: fileId };
}

export async function setUpdateFile(id: string, _fileObject?: any): Promise<{ id: string }> {
    return { id };
}

export async function setDeleteFile(id: string, bucket: KnownBucket = 'images'): Promise<void> {
    await supabase.storage.from(bucket).remove([id]).catch(() => {});
}

export const filesService = {
    getAssetURI,
    uploadFile,
    uploadImage,
    setUpdateFile,
    setDeleteFile,
};
