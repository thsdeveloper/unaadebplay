import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

// Chave de criptografia única por dispositivo
const DEVICE_KEY = 'UNAADEB_DeviceKey';
const CRYPTO_KEY = 'UNAADEB_CryptoKey';

// Gerar chave única do dispositivo
export async function getDeviceKey(): Promise<string> {
    try {
        let deviceKey = await SecureStore.getItemAsync(DEVICE_KEY);
        
        if (!deviceKey) {
            // Gerar nova chave única para o dispositivo
            deviceKey = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                `${Date.now()}-${Math.random()}-UNAADEB`
            );
            await SecureStore.setItemAsync(DEVICE_KEY, deviceKey);
        }
        
        return deviceKey;
    } catch (error) {
        console.error('Erro ao obter chave do dispositivo:', error);
        // Fallback para uma chave estática (menos seguro)
        return 'UNAADEB-STATIC-KEY-2024';
    }
}

// Função auxiliar para criar uma chave de criptografia
async function getCryptoKey(): Promise<string> {
    try {
        let cryptoKey = await SecureStore.getItemAsync(CRYPTO_KEY);
        
        if (!cryptoKey) {
            const randomBytes = await Crypto.getRandomBytesAsync(32);
            cryptoKey = btoa(String.fromCharCode(...new Uint8Array(randomBytes)));
            await SecureStore.setItemAsync(CRYPTO_KEY, cryptoKey);
        }
        
        return cryptoKey;
    } catch (error) {
        console.error('Erro ao obter chave de criptografia:', error);
        // Fallback para uma chave baseada no dispositivo
        return await getDeviceKey();
    }
}

// Função simples de XOR para criptografia (substitui AES)
function xorEncrypt(text: string, key: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result); // Base64 encode
}

// Função simples de XOR para descriptografia
function xorDecrypt(encoded: string, key: string): string {
    try {
        const text = atob(encoded); // Base64 decode
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return result;
    } catch (error) {
        throw new Error('Falha na descriptografia');
    }
}

// Criptografar dados sensíveis
export async function encrypt(data: string): Promise<string> {
    try {
        const cryptoKey = await getCryptoKey();
        // Adicionar salt aleatório para aumentar segurança
        const salt = Math.random().toString(36).substring(7);
        const dataWithSalt = `${salt}:${data}`;
        const encrypted = xorEncrypt(dataWithSalt, cryptoKey);
        return encrypted;
    } catch (error) {
        console.error('Erro ao criptografar:', error);
        throw new Error('Falha na criptografia');
    }
}

// Descriptografar dados
export async function decrypt(encryptedData: string): Promise<string> {
    try {
        const cryptoKey = await getCryptoKey();
        const decryptedWithSalt = xorDecrypt(encryptedData, cryptoKey);
        // Remover o salt
        const parts = decryptedWithSalt.split(':');
        if (parts.length < 2) {
            throw new Error('Dados corrompidos');
        }
        return parts.slice(1).join(':');
    } catch (error) {
        console.error('Erro ao descriptografar:', error);
        throw new Error('Falha na descriptografia');
    }
}

// Hash seguro para senhas
export async function hashPassword(password: string): Promise<string> {
    try {
        const hash = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            password + 'UNAADEB-SALT-2024'
        );
        return hash;
    } catch (error) {
        console.error('Erro ao gerar hash:', error);
        // Fallback para hash simples
        return btoa(password + 'UNAADEB-SALT-2024');
    }
}

// Verificar integridade de dados
export async function generateChecksum(data: any): Promise<string> {
    try {
        const stringData = JSON.stringify(data);
        const checksum = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            stringData
        );
        return checksum;
    } catch (error) {
        console.error('Erro ao gerar checksum:', error);
        // Fallback para checksum simples
        const stringData = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < stringData.length; i++) {
            const char = stringData.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }
}

// Gerar código de sessão único
export function generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `session_${timestamp}_${random}`;
}

// Função auxiliar para gerar strings aleatórias seguras
export async function generateSecureRandom(length: number = 16): Promise<string> {
    try {
        const randomBytes = await Crypto.getRandomBytesAsync(length);
        return Array.from(randomBytes)
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');
    } catch (error) {
        // Fallback para Math.random
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
}