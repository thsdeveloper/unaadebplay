import React, { createContext, ReactNode, useContext, useEffect, useState, useCallback } from 'react';
import { getTranslation, getTranslationVersion } from '@/services/translations';
import AlertContext from "./AlertContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';
import { mergeWithDefaultTranslations } from '@/constants/defaultTranslations';

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
    realtimeConnected: boolean;
}

const TranslationContext = createContext<TranslationContextData>({
    t: (key: string) => key,
    refreshTranslations: async () => {},
    isLoading: true,
    lastUpdated: null,
    realtimeConnected: false
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
    const [realtimeConnected, setRealtimeConnected] = useState(false);
    const alert = useContext(AlertContext);

    // Canal Supabase Realtime (postgres_changes na tabela translations)
    const channelRef = React.useRef<RealtimeChannel | null>(null);
    const isAppActive = React.useRef<boolean>(true);

    // Função para buscar traduções do servidor
    const fetchTranslationsFromServer = async (force = false, silent = false) => {
        try {
            if (!silent) setIsLoading(true);

            // Verificar se precisamos atualizar comparando a versão
            let needsUpdate = force;

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
                needsUpdate = force;
            }

            if (needsUpdate) {
                console.log('Buscando traduções do servidor...');
                const translates = await getTranslation();
                const fetchedTranslations: Translation[] = translates;

                const apiTranslationsMap = fetchedTranslations.reduce((acc, { key, value }) => {
                    acc[key] = value;
                    return acc;
                }, {} as { [key: string]: string });

                // Mesclar com traduções padrão
                const translationsMap = mergeWithDefaultTranslations(apiTranslationsMap);

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

                // Mostrar notificação se for atualização silenciosa e app estiver ativo
                if (silent && isAppActive.current && AppState.currentState === 'active') {
                    alert.success('Traduções atualizadas');
                }
            }
        } catch (error) {
            console.error('Erro ao buscar traduções:', error);

            if (force && !silent) {
                alert.error('Erro ao buscar traduções do servidor');
            }

            // Tentar usar cache em caso de erro
            await loadFromCache();
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    // Função para carregar traduções do cache local
    const loadFromCache = async () => {
        try {
            const cachedTranslations = await AsyncStorage.getItem(TRANSLATIONS_STORAGE_KEY);
            const cachedVersion = await AsyncStorage.getItem(TRANSLATIONS_VERSION_KEY);
            const cachedTimestamp = await AsyncStorage.getItem(TRANSLATIONS_TIMESTAMP_KEY);

            if (cachedTranslations) {
                const cachedData = JSON.parse(cachedTranslations);
                // Mesclar com traduções padrão ao carregar do cache
                const mergedTranslations = mergeWithDefaultTranslations(cachedData);
                setTranslations(mergedTranslations);
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

    // Conecta ao Supabase Realtime: qualquer mudança na tabela `translations`
    // (INSERT/UPDATE/DELETE feita no admin) dispara um refresh silencioso.
    const connectRealtime = useCallback(() => {
        if (channelRef.current) return;

        try {
            const channel = supabase
                .channel('translations-changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'translations' }, () => {
                    fetchTranslationsFromServer(true, true);
                })
                .subscribe((status) => setRealtimeConnected(status === 'SUBSCRIBED'));

            channelRef.current = channel;
        } catch (error) {
            console.error('Erro ao conectar ao Realtime (traduções):', error);
        }
    }, []);

    // Desconecta do canal Realtime.
    const disconnectRealtime = useCallback(() => {
        if (!channelRef.current) return;

        try {
            supabase.removeChannel(channelRef.current);
            channelRef.current = null;
            setRealtimeConnected(false);
        } catch (error) {
            console.error('Erro ao desconectar do Realtime (traduções):', error);
        }
    }, []);

    // Monitorar estado do app para gerenciar a conexão Realtime
    useEffect(() => {
        const handleAppStateChange = async (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                console.log('App voltou para o primeiro plano');
                isAppActive.current = true;

                // Reconectar ao Realtime se estiver desconectado
                if (!realtimeConnected) {
                    connectRealtime();
                }

                // Verificar por atualizações se passou muito tempo
                if (lastUpdated) {
                    const now = new Date();
                    const diffMinutes = (now.getTime() - lastUpdated.getTime()) / (1000 * 60);

                    if (diffMinutes >= refreshInterval) {
                        console.log(`Traduções não são atualizadas há ${Math.floor(diffMinutes)} minutos. Atualizando...`);
                        const netInfo = await NetInfo.fetch();
                        if (netInfo.isConnected) {
                            fetchTranslationsFromServer(true, false);
                        }
                    }
                }
            } else if (nextAppState === 'background') {
                console.log('App foi para segundo plano');
                isAppActive.current = false;

                // Opcional: desconectar do Realtime em segundo plano para economizar bateria
                // disconnectRealtime();
            }
        };

        // Configurar listener
        const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            appStateSubscription.remove();
        };
    }, [connectRealtime, disconnectRealtime, lastUpdated, refreshInterval, realtimeConnected]);

    // Inicialização - carregar cache, conectar ao Realtime e buscar atualizações
    useEffect(() => {
        const initTranslations = async () => {
            setIsLoading(true);

            // Primeiro tentar carregar do cache
            const cacheLoaded = await loadFromCache();

            // Conectar ao Realtime
            connectRealtime();

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

        // Limpar recursos ao desmontar o componente
        return () => {
            disconnectRealtime();
        };
    }, [connectRealtime, disconnectRealtime]);

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
                lastUpdated,
                realtimeConnected
            }}
        >
            {children}
        </TranslationContext.Provider>
    );
};

export default TranslationContext;
