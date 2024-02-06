import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { getConfig } from "../services/config";

interface ConfigContextData {
    [key: string]: any;
}

const ConfigContext = createContext<ConfigContextData>({});

interface ConfigProviderProps {
    children: ReactNode;
    value?: ConfigContextData; // Nova prop para um valor inicial de configuração
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children, value }) => {
    const [config, setConfig] = useState<ConfigContextData>(value || {});

    useEffect(() => {
        if (!value) { // Se nenhum valor inicial foi fornecido, carregue as configurações
            async function fetchConfig() {
                const configData = await getConfig();
                setConfig(configData);
            }

            fetchConfig();
        }
    }, [value]);

    return (
        <ConfigContext.Provider value={config}>
            {children}
        </ConfigContext.Provider>
    );
};

export default ConfigContext;
