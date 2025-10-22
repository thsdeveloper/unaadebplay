import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { encrypt, decrypt } from '@/utils/crypto';
import Constants from 'expo-constants';

// Chaves para armazenamento seguro
const BIOMETRIC_CONFIG_KEY = 'UNAADEB_BiometricConfig';
const BIOMETRIC_VAULT_KEY = 'UNAADEB_BiometricVault';
const BIOMETRIC_ATTEMPTS_KEY = 'UNAADEB_BiometricAttempts';

// Configurações de segurança
const MAX_BIOMETRIC_ATTEMPTS = 3;
const BIOMETRIC_LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutos
const VAULT_EXPIRATION = 30 * 24 * 60 * 60 * 1000; // 30 dias

// Tipos de biometria suportados
export enum BiometricType {
    FINGERPRINT = 'fingerprint',
    FACE_ID = 'face-id',
    IRIS = 'iris',
    UNKNOWN = 'unknown'
}

// Interface de configuração biométrica
interface BiometricConfig {
    enabled: boolean;
    type: BiometricType;
    lastUsed: number;
    failedAttempts: number;
    lockedUntil: number;
}

// Interface do vault de credenciais
interface BiometricVault {
    credentials: string; // Criptografado
    createdAt: number;
    expiresAt: number;
    checksum: string;
}

// Interface de credenciais
interface BiometricCredentials {
    email: string;
    password: string;
}

// Hook principal de biometria melhorado
export function useBiometricAuth() {
    const [isAvailable, setIsAvailable] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [biometricType, setBiometricType] = useState<BiometricType>(BiometricType.UNKNOWN);
    const [isLoading, setIsLoading] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const initializationRef = useRef(false);
    const configRef = useRef<BiometricConfig | null>(null);

    // Verificar se está no Expo Go
    const isExpoGo = Constants.appOwnership === 'expo';

    // Verificar disponibilidade de biometria
    const checkBiometricAvailability = useCallback(async () => {
        try {
            // Se estiver no Expo Go, simular biometria disponível
            if (isExpoGo) {
                console.log('🔐 Executando no Expo Go - Simulando biometria disponível');
                setBiometricType(BiometricType.FACE_ID);
                setIsAvailable(true);
                await loadBiometricConfig();
                return;
            }

            // Verificar hardware
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            if (!hasHardware) {
                setIsAvailable(false);
                return;
            }

            // Verificar se há biometria registrada
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            if (!isEnrolled) {
                setIsAvailable(false);
                return;
            }

            // Identificar tipo de biometria
            const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
            let type = BiometricType.UNKNOWN;

            if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                type = BiometricType.FACE_ID;
            } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
                type = BiometricType.FINGERPRINT;
            } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
                type = BiometricType.IRIS;
            }

            setBiometricType(type);
            setIsAvailable(true);

            // Carregar configuração
            await loadBiometricConfig();
        } catch (error) {
            console.error('Erro ao verificar biometria:', error);
            setIsAvailable(false);
            setError('Erro ao verificar biometria');
        }
    }, [isExpoGo]);

    // Carregar configuração biométrica
    const loadBiometricConfig = async () => {
        try {
            const configData = await SecureStore.getItemAsync(BIOMETRIC_CONFIG_KEY);
            if (configData) {
                const config: BiometricConfig = JSON.parse(configData);
                configRef.current = config;
                
                // Verificar se está bloqueado
                if (config.lockedUntil > Date.now()) {
                    setIsLocked(true);
                    setIsEnabled(false);
                } else {
                    setIsEnabled(config.enabled);
                    setIsLocked(false);
                    
                    // Resetar tentativas se o bloqueio expirou
                    if (config.failedAttempts > 0) {
                        config.failedAttempts = 0;
                        config.lockedUntil = 0;
                        await saveBiometricConfig(config);
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao carregar configuração biométrica:', error);
        }
    };

    // Salvar configuração biométrica
    const saveBiometricConfig = async (config: BiometricConfig) => {
        try {
            configRef.current = config;
            await SecureStore.setItemAsync(BIOMETRIC_CONFIG_KEY, JSON.stringify(config));
        } catch (error) {
            console.error('Erro ao salvar configuração biométrica:', error);
            throw error;
        }
    };

    // Configurar biometria (memoizado para evitar re-criação)
    const setupBiometric = useCallback(async (email: string, password: string): Promise<boolean> => {
        try {
            if (!isAvailable) {
                setError('Biometria não disponível neste dispositivo');
                return false;
            }

            // Solicitar autenticação biométrica
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: `Configurar ${biometricName}`,
                fallbackLabel: 'Usar senha',
                disableDeviceFallback: false,
                cancelLabel: 'Cancelar',
            });

            if (!result.success) {
                setError('Autenticação cancelada');
                return false;
            }

            // Criar vault de credenciais
            const credentials: BiometricCredentials = { email, password };
            const encryptedCredentials = await encrypt(JSON.stringify(credentials));

            const vault: BiometricVault = {
                credentials: encryptedCredentials,
                createdAt: Date.now(),
                expiresAt: Date.now() + VAULT_EXPIRATION,
                checksum: await generateVaultChecksum(encryptedCredentials)
            };

            // Salvar vault
            await SecureStore.setItemAsync(BIOMETRIC_VAULT_KEY, JSON.stringify(vault));

            // Atualizar configuração
            const config: BiometricConfig = {
                enabled: true,
                type: biometricType,
                lastUsed: Date.now(),
                failedAttempts: 0,
                lockedUntil: 0
            };

            await saveBiometricConfig(config);
            setIsEnabled(true);
            setError(null);

            return true;
        } catch (error) {
            console.error('Erro ao configurar biometria:', error);
            setError('Erro ao configurar biometria');
            return false;
        }
    }, [isAvailable, biometricName, biometricType]);

    // Autenticar com biometria (memoizado para performance)
    const authenticate = useCallback(async (): Promise<BiometricCredentials | null> => {
        try {
            if (!isEnabled) {
                setError('Biometria não está habilitada');
                return null;
            }

            if (isLocked) {
                setError('Biometria bloqueada temporariamente');
                return null;
            }

            // Verificar vault
            const vaultData = await SecureStore.getItemAsync(BIOMETRIC_VAULT_KEY);
            if (!vaultData) {
                setError('Credenciais biométricas não encontradas');
                await disableBiometric();
                return null;
            }

            const vault: BiometricVault = JSON.parse(vaultData);

            // Verificar expiração
            if (vault.expiresAt < Date.now()) {
                setError('Credenciais biométricas expiraram');
                await disableBiometric();
                return null;
            }

            // Se estiver no Expo Go, simular autenticação
            if (isExpoGo) {
                console.log('🔐 Simulando autenticação biométrica no Expo Go');

                // Mostrar alerta informativo e aguardar resposta
                const confirmed = await new Promise<boolean>((resolve) => {
                    const Alert = require('react-native').Alert;
                    Alert.alert(
                        '🔐 Simulação de Face ID',
                        'No Expo Go, a biometria é simulada. Em um build de produção, o Face ID/Touch ID real será usado.',
                        [
                            {
                                text: 'Cancelar',
                                onPress: () => resolve(false),
                                style: 'cancel'
                            },
                            {
                                text: 'Simular Autenticação',
                                onPress: () => resolve(true)
                            }
                        ],
                        { cancelable: false }
                    );
                });

                if (!confirmed) {
                    await handleFailedAttempt();
                    return null;
                }

                // Simular delay da autenticação
                await new Promise(resolve => setTimeout(resolve, 500));
            } else {
                // Solicitar autenticação real
                const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: `Entrar com ${biometricName}`,
                    fallbackLabel: 'Usar senha',
                    disableDeviceFallback: true,
                    cancelLabel: 'Cancelar',
                });

                if (!result.success) {
                    await handleFailedAttempt();
                    return null;
                }
            }

            // Verificar integridade do vault
            const currentChecksum = await generateVaultChecksum(vault.credentials);
            if (currentChecksum !== vault.checksum) {
                setError('Credenciais comprometidas');
                await disableBiometric();
                return null;
            }

            // Descriptografar credenciais
            const decryptedData = await decrypt(vault.credentials);
            const credentials: BiometricCredentials = JSON.parse(decryptedData);

            // Atualizar último uso
            if (configRef.current) {
                configRef.current.lastUsed = Date.now();
                configRef.current.failedAttempts = 0;
                await saveBiometricConfig(configRef.current);
            }

            setError(null);
            return credentials;
        } catch (error) {
            console.error('Erro na autenticação biométrica:', error);
            setError('Erro na autenticação');
            await handleFailedAttempt();
            return null;
        }
    }, [isEnabled, isLocked, isExpoGo, biometricName]);

    // Lidar com tentativa falha
    const handleFailedAttempt = async () => {
        try {
            if (!configRef.current) return;

            configRef.current.failedAttempts++;

            if (configRef.current.failedAttempts >= MAX_BIOMETRIC_ATTEMPTS) {
                // Bloquear biometria temporariamente
                configRef.current.lockedUntil = Date.now() + BIOMETRIC_LOCKOUT_DURATION;
                setIsLocked(true);
                setError(`Muitas tentativas. Bloqueado por 30 minutos.`);
            } else {
                const remaining = MAX_BIOMETRIC_ATTEMPTS - configRef.current.failedAttempts;
                setError(`Tentativa falhou. ${remaining} tentativas restantes.`);
            }

            await saveBiometricConfig(configRef.current);
        } catch (error) {
            console.error('Erro ao registrar tentativa falha:', error);
        }
    };

    // Desabilitar biometria
    const disableBiometric = async (): Promise<boolean> => {
        try {
            // Limpar vault
            await SecureStore.deleteItemAsync(BIOMETRIC_VAULT_KEY);

            // Atualizar configuração
            const config: BiometricConfig = {
                enabled: false,
                type: biometricType,
                lastUsed: 0,
                failedAttempts: 0,
                lockedUntil: 0
            };

            await saveBiometricConfig(config);
            setIsEnabled(false);
            setIsLocked(false);
            setError(null);

            return true;
        } catch (error) {
            console.error('Erro ao desabilitar biometria:', error);
            setError('Erro ao desabilitar biometria');
            return false;
        }
    };

    // Gerar checksum do vault
    const generateVaultChecksum = async (data: string): Promise<string> => {
        // Implementação simples - você pode usar uma biblioteca de hash mais robusta
        return btoa(data.slice(0, 20) + data.slice(-20));
    };

    // Obter nome da biometria (memoizado para performance)
    const biometricName = useMemo((): string => {
        switch (biometricType) {
            case BiometricType.FACE_ID:
                return Platform.OS === 'ios' ? 'Face ID' : 'Reconhecimento Facial';
            case BiometricType.FINGERPRINT:
                return Platform.OS === 'ios' ? 'Touch ID' : 'Impressão Digital';
            case BiometricType.IRIS:
                return 'Reconhecimento de Íris';
            default:
                return 'Biometria';
        }
    }, [biometricType]);

    // Verificar se credenciais precisam ser renovadas
    const shouldRenewCredentials = async (): Promise<boolean> => {
        try {
            const vaultData = await SecureStore.getItemAsync(BIOMETRIC_VAULT_KEY);
            if (!vaultData) return true;

            const vault: BiometricVault = JSON.parse(vaultData);
            const daysUntilExpiration = (vault.expiresAt - Date.now()) / (24 * 60 * 60 * 1000);
            
            // Renovar se faltar menos de 7 dias para expirar
            return daysUntilExpiration < 7;
        } catch (error) {
            return true;
        }
    };

    // Resetar bloqueio (para uso administrativo)
    const resetLockout = async () => {
        if (configRef.current) {
            configRef.current.failedAttempts = 0;
            configRef.current.lockedUntil = 0;
            await saveBiometricConfig(configRef.current);
            setIsLocked(false);
            setError(null);
        }
    };

    // Inicialização
    useEffect(() => {
        if (!initializationRef.current) {
            initializationRef.current = true;
            checkBiometricAvailability().finally(() => {
                setIsLoading(false);
            });
        }
    }, [checkBiometricAvailability]);

    // Verificar expiração do bloqueio periodicamente
    useEffect(() => {
        if (isLocked && configRef.current) {
            const checkInterval = setInterval(() => {
                if (configRef.current && configRef.current.lockedUntil <= Date.now()) {
                    setIsLocked(false);
                    configRef.current.failedAttempts = 0;
                    configRef.current.lockedUntil = 0;
                    saveBiometricConfig(configRef.current);
                    clearInterval(checkInterval);
                }
            }, 5000); // Verificar a cada 5 segundos

            return () => clearInterval(checkInterval);
        }
    }, [isLocked]);

    // Memoizar valores calculados para melhor performance
    const remainingAttempts = useMemo(() => {
        return configRef.current
            ? Math.max(0, MAX_BIOMETRIC_ATTEMPTS - configRef.current.failedAttempts)
            : MAX_BIOMETRIC_ATTEMPTS;
    }, [configRef.current?.failedAttempts]);

    const lockoutRemaining = useMemo(() => {
        return configRef.current && configRef.current.lockedUntil > Date.now()
            ? Math.ceil((configRef.current.lockedUntil - Date.now()) / 60000)
            : 0;
    }, [configRef.current?.lockedUntil, isLocked]);

    return {
        // Estados
        isAvailable,
        isEnabled,
        isLoading,
        isLocked,
        biometricType,
        biometricName,
        error,

        // Métodos
        setupBiometric,
        authenticate,
        disableBiometric,
        shouldRenewCredentials,
        resetLockout,

        // Informações adicionais
        config: configRef.current,
        remainingAttempts,
        lockoutRemaining
    };
}