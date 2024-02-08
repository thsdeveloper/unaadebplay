import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {getTranslation} from '../services/translations';
import AlertContext from "./AlertContext";

interface Translation {
    id: string;
    language: string;
    key: string;
    value: string;
}

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
    const [translations, setTranslations] = useState<{ [key: string]: string }>({});
    const alert = useContext(AlertContext)

    useEffect(() => {
        const fetchTranslations = async () => {
            try {
                const translates  = await getTranslation();
                const fetchedTranslations: Translation[] = translates;
                const translationsMap = fetchedTranslations.reduce((acc, { key, value }) => {
                    acc[key] = value;
                    return acc;
                }, {} as { [key: string]: string });
                setTranslations(translationsMap);
            } catch (error) {
                alert.error('Erro ao buscar traduções: '+error)
            }
        };
        fetchTranslations()
    }, []);

    const t = (key: string) => {
        return translations[key] || key;
    };

    return (
        <TranslationContext.Provider value={{ t }}>
            {children}
        </TranslationContext.Provider>
    );
};

export default TranslationContext;
