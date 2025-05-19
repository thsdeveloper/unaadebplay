// Versão aprimorada do TranslationContext.tsx com sistema de atualização

import React, { createContext, ReactNode, useContext, useEffect, useState, useCallback } from 'react';
import { getTranslation, getTranslationVersion } from '@/services/translations';
import AlertContext from "./AlertContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';

// Constantes para armazenamento
const TRANSLATIONS_STORAGE_KEY = '@UNAADEB:Translations';
const TRANSLATIONS_VERSION_KEY = '@UNAADEB:TranslationsVersion';
const TRANSLATIONS_TIMESTAMP_KEY = '@UNAADEB:TranslationsTimestamp';

interface Translation {
    id: string;
    language: string;
    key: string;
    value: string;
}

interface TranslationContextData {
    t: (key: string, params?: Record<string, string>) => string;
    refreshTranslations: () => Promise<void>;
    isLoading: boolean;
    lastUpdated: Date | null;
}

const TranslationContext = createContext<TranslationContextData>({
    t: (key: string) => key,
    refreshTranslations: async () => {},
    isLoading: true,
    lastUpdated: null
});

interface TranslationProviderProps {
    children: ReactNode;
    refreshInterval?: number; // Intervalo em minutos
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({
                                                                            children,
                                                                            refreshInterval = 60 // Padrão: 1 hora
                                                                        }) => {
    const [translations, setTranslations] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [currentVersion, setCurrentVersion] = useState<string>('');
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const alert = useContext(AlertContext);

    // Função para buscar traduções do servidor
    const fetchTranslationsFromServer = async (force = false) => {
        try {
            setIsLoading(true);

            // Verificar se precisamos atualizar comparando a versão
            let needsUpdate = force;

            if (!force) {
                try {
                    // Obter a versão atual do servidor (pode ser um timestamp ou hash)
                    const serverVersion = await getTranslationVersion();

                    if (serverVersion !== currentVersion) {
                        console.log('Nova versão de traduções disponível:', serverVersion);
                        needsUpdate = true;
                        setCurrentVersion(serverVersion);
                    } else {
                        console.log('Traduções já estão atualizadas');
                    }
                } catch (error) {
                    console.error('Erro ao verificar versão das traduções:', error);
                    // Se não conseguir verificar a versão, atualizamos por segurança
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                console.log('Buscando traduções do servidor...');
                const translates = await getTranslation();
                const fetchedTranslations: Translation[] = translates;

                const translationsMap = fetchedTranslations.reduce((acc, { key, value }) => {
                    acc[key] = value;
                    return acc;
                }, {} as { [key: string]: string });

                // Atualizar cache local
                await AsyncStorage.setItem(TRANSLATIONS_STORAGE_KEY, JSON.stringify(translationsMap));

                // Salvar timestamp da atualização
                const now = new Date();
                await AsyncStorage.setItem(TRANSLATIONS_TIMESTAMP_KEY, now.toISOString());
                setLastUpdated(now);

                // Atualizar estado
                setTranslations(translationsMap);

                // Se temos uma versão atual, salvamos ela
                if (currentVersion) {
                    await AsyncStorage.setItem(TRANSLATIONS_VERSION_KEY, currentVersion);
                }

                console.log('Traduções atualizadas com sucesso');
            }
        } catch (error) {
            console.error('Erro ao buscar traduções:', error);
            alert.error('Erro ao buscar traduções do servidor');

            // Tentar usar cache em caso de erro
            await loadFromCache();
        } finally {
            setIsLoading(false);
        }
    };

    // Função para carregar traduções do cache local
    const loadFromCache = async () => {
        try {
            const cachedTranslations = await AsyncStorage.getItem(TRANSLATIONS_STORAGE_KEY);
            const cachedVersion = await AsyncStorage.getItem(TRANSLATIONS_VERSION_KEY);
            const cachedTimestamp = await AsyncStorage.getItem(TRANSLATIONS_TIMESTAMP_KEY);

            if (cachedTranslations) {
                setTranslations(JSON.parse(cachedTranslations));
                console.log('Traduções carregadas do cache');

                if (cachedVersion) {
                    setCurrentVersion(cachedVersion);
                }

                if (cachedTimestamp) {
                    setLastUpdated(new Date(cachedTimestamp));
                }

                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao carregar traduções do cache:', error);
            return false;
        }
    };

    // Função pública para forçar atualização das traduções
    const refreshTranslations = useCallback(async () => {
        const netInfo = await NetInfo.fetch();
        if (netInfo.isConnected) {
            await fetchTranslationsFromServer(true);
        } else {
            alert.error('Sem conexão com a internet');
        }
    }, [alert]);

    // Verificar atualizações quando o app volta para o primeiro plano
    useEffect(() => {
        const handleAppStateChange = async (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                console.log('App voltou para o primeiro plano, verificando traduções...');

                // Verificar se o intervalo de atualização já passou
                if (lastUpdated) {
                    const now = new Date();
                    const diffMinutes = (now.getTime() - lastUpdated.getTime()) / (1000 * 60);

                    if (diffMinutes >= refreshInterval) {
                        console.log(`Traduções não são atualizadas há ${Math.floor(diffMinutes)} minutos. Atualizando...`);
                        const netInfo = await NetInfo.fetch();
                        if (netInfo.isConnected) {
                            fetchTranslationsFromServer();
                        }
                    }
                }
            }
        };

        // Configurar listener
        const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            appStateSubscription.remove();
        };
    }, [lastUpdated, refreshInterval]);

    // Inicialização - primeiro tentar cache, depois servidor
    useEffect(() => {
        const initTranslations = async () => {
            setIsLoading(true);

            // Primeiro tentar carregar do cache
            const cacheLoaded = await loadFromCache();

            // Depois verificar se precisamos atualizar do servidor
            const netInfo = await NetInfo.fetch();
            if (netInfo.isConnected) {
                await fetchTranslationsFromServer();
            } else if (!cacheLoaded) {
                // Se não temos internet E não conseguimos carregar do cache
                alert.error('Sem conexão com a internet e nenhuma tradução em cache');
            }

            setIsLoading(false);
        };

        initTranslations();
    }, []);

    // Função de tradução com suporte a parâmetros
    const t = useCallback((key: string, params?: Record<string, string>) => {
        let text = translations[key] || key;

        if (params) {
            Object.entries(params).forEach(([param, value]) => {
                text = text.replace(new RegExp(`{${param}}`, 'g'), value);
            });
        }

        return text;
    }, [translations]);

    return (
        <TranslationContext.Provider
            value={{
                t,
                refreshTranslations,
                isLoading,
                lastUpdated
            }}
        >
            {children}
        </TranslationContext.Provider>
    );
};

export default TranslationContext;
