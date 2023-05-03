import React, { createContext, useState, useEffect, ReactNode } from 'react';
import {getConfig} from "../services/config";

interface ConfigContextData {
    [key: string]: any;
}

const ConfigContext = createContext<ConfigContextData>({});

interface ConfigProviderProps {
    children: ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
    const [config, setConfig] = useState<ConfigContextData>({});

    useEffect(() => {
        async function fetchConfig() {
            const configData = await getConfig();
            setConfig(configData);
        }

        fetchConfig();
    }, []);

    return (
        <ConfigContext.Provider value={config}>
            {children}
        </ConfigContext.Provider>
    );
};

export default ConfigContext;
