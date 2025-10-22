import React, {createContext, useState, useEffect, ReactNode, useContext} from 'react';
import { getSettings } from "@/services/settings";
import {handleErrors} from "@/utils/directus";
import AlertContext from "./AlertContext";

interface ConfigContextData {
    [key: string]: any;
    isLoading: boolean;
    hasError: boolean;
}

// Valor inicial - agora inclui estados de carregamento e erro
const initialState: ConfigContextData = {
    isLoading: true,
    hasError: false
};

const ConfigContext = createContext<ConfigContextData>(initialState);

interface ConfigProviderProps {
    children: ReactNode;
    value?: ConfigContextData;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children, value }) => {
    const [config, setConfig] = useState<ConfigContextData>(
        value
            ? { ...value, isLoading: false, hasError: false }
            : initialState
    );
    const alert = useContext(AlertContext);

    useEffect(() => {
        // Se já recebeu valor como prop, não precisa buscar
        if (value) {
            console.log('⚙️  [ConfigProvider] Usando configurações passadas como prop');
            setConfig({ ...value, isLoading: false, hasError: false });
            return;
        }

        let isMounted = true;

        async function fetchConfig() {
            try {
                console.log('⚙️  [ConfigProvider] Buscando configurações do Directus...');
                setConfig(prev => ({ ...prev, isLoading: true, hasError: false }));
                const configData = await getSettings();

                if (isMounted) {
                    console.log('✅ [ConfigProvider] Configurações obtidas:', configData);
                    setConfig({
                        ...configData,
                        isLoading: false,
                        hasError: false
                    });
                }
            } catch (error) {
                if (isMounted) {
                    let message = "Erro ao carregar configurações";

                    // Tratamento mais robusto de erros
                    if (error && typeof error === 'object' && 'errors' in error) {
                        message = handleErrors(error.errors);
                    } else if (error instanceof Error) {
                        message = error.message;
                    }

                    // Log silencioso apenas em modo debug
                    if (__DEV__) {
                        console.warn('⚠️  [ConfigProvider]', message);
                        console.warn('⚠️  Usando configurações padrão devido ao erro');
                    }

                    // Usar configurações padrão sem interromper o app
                    setConfig({
                        project_name: 'Unaadeb Play',
                        primary_color: '#E51C44',
                        secondary_color: '#1E293B',
                        isLoading: false,
                        hasError: true
                    });
                }
            }
        }

        fetchConfig();

        // Cleanup function para evitar atualizações de estado após desmontagem
        return () => {
            isMounted = false;
        };
    }, [value, alert]); // Inclui value e alert como dependências

    return (
        <ConfigContext.Provider value={config}>
            {children}
        </ConfigContext.Provider>
    );
};

// Hook personalizado para facilitar o uso do contexto
export function useConfig() {
    const context = useContext(ConfigContext);

    if (!context) {
        throw new Error('useConfig deve ser usado dentro de um ConfigProvider');
    }

    return context;
}

export default ConfigContext;
