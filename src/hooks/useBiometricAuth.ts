import { useState, useEffect, useRef } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Chaves para armazenamento seguro
const BIOMETRIC_ENABLED_KEY = '@UNAADEB:BiometricEnabled';
const BIOMETRIC_CREDENTIALS_KEY = '@UNAADEB:BiometricCredentials';

// Função para criptografar credenciais (básica para exemplo)
const encryptCredentials = (email: string, password: string): string => {
    // Implementação simples - na prática, use uma criptografia forte
    return btoa(JSON.stringify({ email, password }));
};

// Função para descriptografar credenciais
const decryptCredentials = (encryptedData: string): { email: string, password: string } => {
    // Implementação simples - na prática, use uma descriptografia correspondente
    const decodedString = atob(encryptedData);
    return JSON.parse(decodedString);
};

interface BiometricCredentials {
    email: string;
    password: string;
}

export function useBiometricAuth() {
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
    const [biometricType, setBiometricType] = useState<string>('Biometria');
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);
    const initializationAttempted = useRef(false);

    // Verificar disponibilidade de biometria
    const checkBiometricAvailability = async () => {
        try {
            // Evitar inicialização duplicada
            if (initializationAttempted.current) return;
            initializationAttempted.current = true;

            setLoading(true);

            // Verificar se o hardware suporta biometria
            const compatible = await LocalAuthentication.hasHardwareAsync();

            // Verificar se há biometria registrada no dispositivo
            const enrolled = compatible ? await LocalAuthentication.isEnrolledAsync() : false;

            // Verificar se o usuário habilitou biometria no app
            let enabled = false;
            try {
                // Tentar ler do SecureStore primeiro
                let storedValue = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);

                // Se não encontrou, tentar ler do AsyncStorage
                if (!storedValue) {
                    storedValue = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
                }

                enabled = storedValue === 'true';
            } catch (e) {
                console.warn('Erro ao verificar status da biometria:', e);
            }

            // Determinar o tipo de biometria
            let biometricTypeLabel = 'Biometria';
            if (compatible) {
                try {
                    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

                    // Mapear tipos de autenticação para nomes legíveis
                    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                        biometricTypeLabel = Platform.OS === 'ios' ? 'Face ID' : 'Reconhecimento Facial';
                    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
                        biometricTypeLabel = Platform.OS === 'ios' ? 'Touch ID' : 'Impressão Digital';
                    } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
                        biometricTypeLabel = 'Reconhecimento de Íris';
                    }
                } catch (e) {
                    console.warn('Erro ao verificar tipos de biometria:', e);
                }
            }

            // Atualizar estados
            setIsBiometricAvailable(compatible && enrolled);
            setIsBiometricEnabled(compatible && enrolled && enabled);
            setBiometricType(biometricTypeLabel);
            setInitialized(true);

        } catch (error) {
            console.error('Erro ao verificar biometria:', error);
            setIsBiometricAvailable(false);
            setIsBiometricEnabled(false);
            setBiometricType('Biometria');
            setInitialized(true);
        } finally {
            setLoading(false);
        }
    };

    // Salvar credenciais para autenticação biométrica
    const saveBiometricCredentials = async (email: string, password: string): Promise<boolean> => {
        try {
            // Verificar se biometria está disponível
            if (!isBiometricAvailable) {
                console.warn('Biometria não disponível para salvar credenciais');
                return false;
            }

            // Solicitar autenticação biométrica antes de salvar
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Autentique para configurar login biométrico',
                fallbackLabel: 'Use senha',
                disableDeviceFallback: false,
            });

            if (!result.success) {
                console.log('Autenticação biométrica cancelada ou falhou');
                return false;
            }

            // Criptografar credenciais
            const encryptedData = encryptCredentials(email, password);

            // Salvar credenciais criptografadas
            try {
                // Tentar salvar no SecureStore primeiro (mais seguro)
                await SecureStore.setItemAsync(BIOMETRIC_CREDENTIALS_KEY, encryptedData);
            } catch (secureError) {
                console.warn('Erro ao salvar no SecureStore, usando AsyncStorage:', secureError);
                // Fallback para AsyncStorage
                await AsyncStorage.setItem(BIOMETRIC_CREDENTIALS_KEY, encryptedData);
            }

            // Marcar biometria como habilitada
            try {
                await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
            } catch (secureError) {
                console.warn('Erro ao salvar status no SecureStore, usando AsyncStorage:', secureError);
                await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
            }

            setIsBiometricEnabled(true);
            console.log('Credenciais biométricas salvas com sucesso');
            return true;

        } catch (error) {
            console.error('Erro ao salvar credenciais biométricas:', error);
            return false;
        }
    };

    // Autenticar usando biometria
    const authenticateWithBiometrics = async (): Promise<BiometricCredentials | null> => {
        try {
            // Verificar se biometria está habilitada
            if (!isBiometricEnabled) {
                console.warn('Biometria não está habilitada');
                return null;
            }

            // Solicitar autenticação biométrica
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Faça login com ' + biometricType,
                fallbackLabel: 'Use sua senha',
                disableDeviceFallback: false,
            });

            // Se autenticação falhou, retornar null
            if (!result.success) {
                console.log('Autenticação biométrica falhou ou foi cancelada');
                return null;
            }

            // Recuperar credenciais criptografadas
            let encryptedData;

            try {
                // Tentar recuperar do SecureStore primeiro
                encryptedData = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
            } catch (secureError) {
                console.warn('Erro ao ler do SecureStore, tentando AsyncStorage:', secureError);
            }

            // Se não encontrou no SecureStore, tentar AsyncStorage
            if (!encryptedData) {
                encryptedData = await AsyncStorage.getItem(BIOMETRIC_CREDENTIALS_KEY);
            }

            // Se não encontrou credenciais
            if (!encryptedData) {
                console.warn('Credenciais biométricas não encontradas');
                return null;
            }

            // Descriptografar e retornar credenciais
            return decryptCredentials(encryptedData);

        } catch (error) {
            console.error('Erro ao autenticar com biometria:', error);
            return null;
        }
    };

    // Desabilitar autenticação biométrica
    const disableBiometricAuth = async (): Promise<boolean> => {
        try {
            // Remover credenciais e marcar como desabilitado
            await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
            await AsyncStorage.removeItem(BIOMETRIC_CREDENTIALS_KEY);

            await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'false');
            await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false');

            setIsBiometricEnabled(false);
            console.log('Autenticação biométrica desabilitada com sucesso');
            return true;
        } catch (error) {
            console.error('Erro ao desabilitar autenticação biométrica:', error);
            return false;
        }
    };

    // Verificar biometria na inicialização
    useEffect(() => {
        checkBiometricAvailability();
    }, []);

    return {
        isBiometricAvailable,
        isBiometricEnabled,
        biometricType,
        loading,
        initialized,
        saveBiometricCredentials,
        authenticateWithBiometrics,
        disableBiometricAuth,
        checkBiometricAvailability
    };
}
