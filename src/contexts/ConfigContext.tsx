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
    const [config, setConfig] = useState<ConfigContextData>(value || initialState);
    const alert = useContext(AlertContext);

    useEffect(() => {
        let isMounted = true;

        async function fetchConfig() {
            try {
                setConfig(prev => ({ ...prev, isLoading: true, hasError: false }));
                const configData = await getSettings();

                if (isMounted) {
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

                    alert.error(message);
                    setConfig(prev => ({
                        ...prev,
                        isLoading: false,
                        hasError: true
                    }));
                }
            }
        }

        fetchConfig();

        // Cleanup function para evitar atualizações de estado após desmontagem
        return () => {
            isMounted = false;
        };
    }, [alert]); // Inclui alert como dependência

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
