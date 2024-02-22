import React, {createContext, useState, useEffect, ReactNode, useContext} from 'react';
import { getSettings } from "@/services/settings";
import {handleErrors} from "@/utils/directus";
import AlertContext from "./AlertContext";

interface ConfigContextData {
    [key: string]: any;
}

const ConfigContext = createContext<ConfigContextData>({});

interface ConfigProviderProps {
    children: ReactNode;
    value?: ConfigContextData;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children, value }) => {
    const [config, setConfig] = useState<ConfigContextData>(value || {});
    const alert = useContext(AlertContext)

    useEffect(() => {
        async function fetchConfig() {
            const configData = await getSettings();
            setConfig(configData);
        }

        fetchConfig().catch(error => {
            const message = handleErrors(error.errors);
            alert.error(message)
        })
    }, []);

    return (
        <ConfigContext.Provider value={config}>
            {children}
        </ConfigContext.Provider>
    );
};

export default ConfigContext;
