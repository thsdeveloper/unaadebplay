import React, { createContext, ReactNode, useContext, useEffect, useState, useCallback } from 'react';
import { getTranslation, getTranslationVersion } from '@/services/translations';
import AlertContext from "./AlertContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';
import * as Ably from 'ably';

// Constantes para armazenamento
const TRANSLATIONS_STORAGE_KEY = '@UNAADEB:Translations';
const TRANSLATIONS_VERSION_KEY = '@UNAADEB:TranslationsVersion';
const TRANSLATIONS_TIMESTAMP_KEY = '@UNAADEB:TranslationsTimestamp';

// Chave API do Ably (use a chave Subscribe only para o cliente)
const ABLY_API_KEY = 'WXWHKQ.vz-8Cw:OGdi-jTgFS6BXzMTPrQCkv6ofIyw7jh1b3PhR-CMwpc';

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

    // Referência para o cliente Ably e o canal
    const ablyClientRef = React.useRef<Ably.Realtime | null>(null);
    const ablyChannelRef = React.useRef<Ably.Types.RealtimeChannelPromise | null>(null);
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

    // Função para conectar ao Ably
    const connectToAbly = useCallback(() => {
        if (ablyClientRef.current) return;

        try {
            console.log('Conectando ao Ably...');

            // Inicializar cliente Ably
            ablyClientRef.current = new Ably.Realtime({
                key: ABLY_API_KEY,
                echoMessages: false
            });

            // Eventos de conexão
            ablyClientRef.current.connection.on('connected', () => {
                console.log('Ably conectado');
                setRealtimeConnected(true);
            });

            ablyClientRef.current.connection.on('disconnected', () => {
                console.log('Ably desconectado');
                setRealtimeConnected(false);
            });

            ablyClientRef.current.connection.on('failed', (err) => {
                console.error('Falha na conexão Ably:', err);
                setRealtimeConnected(false);
            });

            // Inscrever-se no canal de traduções
            ablyChannelRef.current = ablyClientRef.current.channels.get('translations');

            // Inscrever-se no evento de atualização
            ablyChannelRef.current.subscribe('updated', (message) => {
                console.log('Evento Ably recebido - atualização de traduções:', message.data);

                // Atualizar traduções silenciosamente
                fetchTranslationsFromServer(true, true);
            });

        } catch (error) {
            console.error('Erro ao conectar ao Ably:', error);
        }
    }, []);

    // Função para desconectar do Ably
    const disconnectFromAbly = useCallback(() => {
        if (!ablyClientRef.current) return;

        try {
            console.log('Desconectando do Ably...');

            // Cancelar inscrição e fechar o canal
            if (ablyChannelRef.current) {
                ablyChannelRef.current.unsubscribe();
            }

            // Fechar conexão
            ablyClientRef.current.close();
            ablyClientRef.current = null;
            ablyChannelRef.current = null;

            setRealtimeConnected(false);
        } catch (error) {
            console.error('Erro ao desconectar do Ably:', error);
        }
    }, []);

    // Monitorar estado do app para gerenciar conexão do Ably
    useEffect(() => {
        const handleAppStateChange = async (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                console.log('App voltou para o primeiro plano');
                isAppActive.current = true;

                // Reconectar ao Ably se estiver desconectado
                if (!realtimeConnected) {
                    connectToAbly();
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

                // Opcional: desconectar do Ably em segundo plano para economizar bateria
                // disconnectFromAbly();
            }
        };

        // Configurar listener
        const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            appStateSubscription.remove();
        };
    }, [connectToAbly, disconnectFromAbly, lastUpdated, refreshInterval, realtimeConnected]);

    // Inicialização - carregar cache, conectar ao Ably e buscar atualizações
    useEffect(() => {
        const initTranslations = async () => {
            setIsLoading(true);

            // Primeiro tentar carregar do cache
            const cacheLoaded = await loadFromCache();

            // Conectar ao Ably
            connectToAbly();

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
            disconnectFromAbly();
        };
    }, [connectToAbly, disconnectFromAbly]);

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
