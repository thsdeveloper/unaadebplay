import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { getTranslation } from '../services/translations';

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

    useEffect(() => {
        const fetchTranslations = async () => {
            try {
                const response = await getTranslation(); // Supondo que getTranslation() faça a chamada para a API e retorne a resposta diretamente
                const fetchedTranslations: Translation[] = response;

                const translationsMap = fetchedTranslations.reduce((acc, { key, value }) => {
                    acc[key] = value;
                    return acc;
                }, {} as { [key: string]: string });

                setTranslations(translationsMap);
            } catch (error) {
                console.error("Erro ao buscar traduções:", error);
                // Tratar erro, talvez configurando um estado de erro ou exibindo uma mensagem ao usuário
            }
        };

        fetchTranslations();
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
