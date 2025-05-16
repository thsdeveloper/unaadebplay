// src/contexts/NetworkContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkContextData {
    isConnected: boolean | null;
    isInternetReachable: boolean | null;
}

const NetworkContext = createContext<NetworkContextData>({
    isConnected: null,
    isInternetReachable: null
});

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [networkState, setNetworkState] = useState<NetInfoState>({
        isConnected: null,
        isInternetReachable: null,
        type: null,
        details: null
    });

    useEffect(() => {
        // Subscribe to network info updates
        const unsubscribe = NetInfo.addEventListener(state => {
            setNetworkState(state);
        });

        // Unsubscribe on unmount
        return () => unsubscribe();
    }, []);

    return (
        <NetworkContext.Provider
            value={{
                isConnected: networkState.isConnected,
                isInternetReachable: networkState.isInternetReachable
            }}
        >
            {children}
        </NetworkContext.Provider>
    );
};

export const useNetwork = () => useContext(NetworkContext);
