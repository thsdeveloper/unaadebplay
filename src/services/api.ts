// src/services/api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authentication, createDirectus, rest, staticToken, refresh } from '@directus/sdk';
import * as SecureStore from 'expo-secure-store';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

// Classe de armazenamento personalizada que emite eventos quando os tokens mudam
class EnhancedLocalStorage {
    // Para os ouvintes de eventos
    private listeners = [];
    // Flag para identificar se o storage foi inicializado
    private initialized = false;
    // Cache em memória para evitar acessos frequentes ao AsyncStorage
    private cachedData = null;
    // Tempo da última atualização do cache
    private lastCacheUpdate = 0;
    // Tempo máximo de validade do cache (5 segundos)
    private readonly CACHE_TTL = 5000;

    // Registrar um ouvinte para mudanças de token
    addListener(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(listener => listener !== callback);
        };
    }

    // Notificar todos os ouvintes
    private notifyListeners(data) {
        this.listeners.forEach(listener => listener(data));
    }

    async get() {
        // Verificar se temos dados em cache válidos
        const now = Date.now();
        if (this.cachedData && now - this.lastCacheUpdate < this.CACHE_TTL) {
            return this.cachedData;
        }

        try {
            const item = await SecureStore.getItemAsync("directus-data");
            const parsedData = JSON.parse(item || 'null');

            // Atualizar o cache
            this.cachedData = parsedData;
            this.lastCacheUpdate = now;

            // Marcar como inicializado se for a primeira vez
            if (!this.initialized) {
                this.initialized = true;
            }

            return parsedData;
        } catch (error) {
            console.log("Erro ao acessar SecureStore, usando fallback:", error);

            // Fallback para AsyncStorage em caso de falha
            try {
                const fallback = await AsyncStorage.getItem("directus-data");
                const parsedData = JSON.parse(fallback || 'null');

                // Atualizar o cache
                this.cachedData = parsedData;
                this.lastCacheUpdate = now;

                // Marcar como inicializado se for a primeira vez
                if (!this.initialized) {
                    this.initialized = true;
                }

                return parsedData;
            } catch (fallbackError) {
                console.error("Erro completo ao acessar storage:", fallbackError);
                return null;
            }
        }
    }

    async set(data) {
        // Atualizar o cache primeiro para resposta rápida
        this.cachedData = data;
        this.lastCacheUpdate = Date.now();

        try {
            // Tentar armazenar no SecureStore
            await SecureStore.setItemAsync("directus-data", JSON.stringify(data));

            // Backup no AsyncStorage em caso de problemas futuros com SecureStore
            try {
                await AsyncStorage.setItem("directus-data", JSON.stringify(data));
            } catch (asyncError) {
                console.log("Erro ao fazer backup no AsyncStorage:", asyncError);
            }
        } catch (error) {
            console.log("Erro ao salvar no SecureStore, usando apenas AsyncStorage:", error);

            // Fallback para apenas AsyncStorage
            await AsyncStorage.setItem("directus-data", JSON.stringify(data));
        }

        // Notificar ouvintes sobre a mudança
        this.notifyListeners(data);
    }

    // Método para limpar os dados
    async clear() {
        // Limpar cache em memória
        this.cachedData = null;
        this.lastCacheUpdate = 0;

        try {
            // Tentar limpar ambos os storages
            await Promise.all([
                SecureStore.deleteItemAsync("directus-data"),
                AsyncStorage.removeItem("directus-data")
            ]);
        } catch (error) {
            console.log("Erro ao limpar storage, tentando individualmente:", error);

            // Tentar um por um em caso de erro
            try {
                await SecureStore.deleteItemAsync("directus-data");
            } catch (secureError) {
                console.log("Erro ao limpar SecureStore:", secureError);
            }

            try {
                await AsyncStorage.removeItem("directus-data");
            } catch (asyncError) {
                console.log("Erro ao limpar AsyncStorage:", asyncError);
            }
        }

        // Notificar ouvintes sobre a limpeza
        this.notifyListeners(null);
    }

    // Verificar se o token está próximo da expiração
    async isTokenExpiring(thresholdMinutes = 5) {
        const data = await this.get();
        if (!data || !data.expires) return true;

        const expirationTime = new Date(data.expires).getTime();
        const currentTime = Date.now();
        const timeRemaining = expirationTime - currentTime;

        // Converter minutos em milissegundos
        const thresholdMs = thresholdMinutes * 60 * 1000;

        return timeRemaining <= thresholdMs;
    }

    // Verificar se o token já expirou
    async isTokenExpired() {
        const data = await this.get();
        if (!data || !data.expires) return true;

        const expirationTime = new Date(data.expires).getTime();
        return Date.now() >= expirationTime;
    }

    // Verificar se o storage foi inicializado
    isInitialized() {
        return this.initialized;
    }
}

// Instanciar o storage aprimorado
const storage = new EnhancedLocalStorage();

// Configurar fetch com timeout personalizado
const customFetch = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos de timeout

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timeout - verifique sua conexão de internet');
        }
        throw error;
    }
};

// Criar o cliente Directus com autenticação e fetch customizado
const directusClient = createDirectus(apiUrl, {
    globals: {
        fetch: customFetch,
    },
})
    .with(authentication('json', { storage }))
    .with(rest());

// Exportar o cliente e o storage para uso externo
export { directusClient, storage };
export default directusClient;
