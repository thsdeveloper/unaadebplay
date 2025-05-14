// src/services/api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authentication, createDirectus, rest, staticToken, refresh } from '@directus/sdk';

const url = 'https://directus-production-8bae.up.railway.app';

// Classe de armazenamento personalizada que emite eventos quando os tokens mudam
class EnhancedLocalStorage {
    // Para os ouvintes de eventos
    private listeners = [];

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
        const item = await AsyncStorage.getItem("directus-data");
        return JSON.parse(item || 'null');
    }

    async set(data) {
        await AsyncStorage.setItem("directus-data", JSON.stringify(data));
        this.notifyListeners(data);
    }

    // Método para limpar os dados
    async clear() {
        await AsyncStorage.removeItem("directus-data");
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
}

// Instanciar o storage aprimorado
const storage = new EnhancedLocalStorage();

// Criar o cliente Directus com autenticação
const directusClient = createDirectus(url)
    .with(authentication('json', { storage }))
    .with(rest());

// Exportar o cliente e o storage para uso externo
export { directusClient, storage };
export default directusClient;
