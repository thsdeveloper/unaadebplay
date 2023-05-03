import React, { createContext, useContext, ReactNode } from 'react';
import ConfigContext from './ConfigContext';

interface TranslationContextData {
    t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextData>({
    t: (key: string) => key,
});

interface TranslationProviderProps {
    children: ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
    const config = useContext(ConfigContext);

    const t = (key: string) => {
        const translationString = config.translation_strings?.find((item: any) => item.key === key);
        return translationString?.translations['pt-BR'] || key;
    };

    return (
        <TranslationContext.Provider value={{ t }}>
            {children}
        </TranslationContext.Provider>
    );
};

export default TranslationContext;
