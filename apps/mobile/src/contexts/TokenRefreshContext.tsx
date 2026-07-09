// src/contexts/TokenRefreshContext.tsx
import React, { createContext, useState, useContext } from 'react';
import { useToast } from '@/components/ui/toast';

const TokenRefreshContext = createContext({
    isRefreshing: false,
    showRefreshIndicator: () => {},
    hideRefreshIndicator: () => {}
});

export const TokenRefreshProvider = ({ children }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const toast = useToast();

    const showRefreshIndicator = () => {
        setIsRefreshing(true);
        toast.show({
            description: "Atualizando sua sessão...",
            duration: 2000,
            placement: "top"
        });
    };

    const hideRefreshIndicator = () => {
        setIsRefreshing(false);
    };

    return (
        <TokenRefreshContext.Provider value={{ isRefreshing, showRefreshIndicator, hideRefreshIndicator }}>
            {children}
        </TokenRefreshContext.Provider>
    );
};

export const useTokenRefresh = () => useContext(TokenRefreshContext);
