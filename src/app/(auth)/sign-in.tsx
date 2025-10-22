import React, { useContext, useEffect, useState, useCallback, useRef } from "react";
import { Alert, View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';

// Contexts
import { useAuth } from "@/contexts/AuthContext";
import TranslationContext from "@/contexts/TranslationContext";
import ConfigContext from "@/contexts/ConfigContext";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";

// Components
import { AuthTemplate } from "@/components/templates";
import { LoginForm, type LoginFormData } from "@/components/organisms/LoginForm";
import { AuthFooter } from "@/components/organisms/AuthFooter";
import { Text } from "@/components/atoms";

// Schema de validação
const signInSchema = Yup.object({
    email: Yup.string()
        .email("Digite um email válido")
        .required("Email é obrigatório"),
    password: Yup.string()
        .min(6, "Senha deve ter no mínimo 6 caracteres")
        .required("Senha é obrigatória"),
});

type FormDataProps = LoginFormData;

export default function SignIn() {
    const { login, loadSavedCredentials } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [authenticatingBiometric, setAuthenticatingBiometric] = useState(false);
    const { t } = useContext(TranslationContext);
    const config = useContext(ConfigContext);

    // Refs para controlar execução única
    const hasAttemptedBiometric = useRef(false);
    const isInitialized = useRef(false);

    // Verificar se está no Expo Go
    const isExpoGo = Constants.appOwnership === 'expo';

    // Biometria
    const {
        isAvailable: biometricAvailable,
        isEnabled: biometricEnabled,
        isLoading: biometricLoading,
        isLocked: biometricLocked,
        biometricName,
        error: biometricError,
        setupBiometric,
        authenticate: authenticateBiometric,
        lockoutRemaining
    } = useBiometricAuth();

    // Form
    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
        setValue,
        watch
    } = useForm<FormDataProps>({
        resolver: yupResolver(signInSchema),
        mode: 'onChange'
    });

    const email = watch('email');
    const password = watch('password');

    // Carregar credenciais salvas
    useEffect(() => {
        if (isInitialized.current) return;

        loadSavedCredentials().then(credentials => {
            if (credentials) {
                setValue('email', credentials.email);
                setValue('password', credentials.password);
                setRememberMe(credentials.rememberMe);
            }
            isInitialized.current = true;
        }).catch(error => {
            console.error('Erro ao carregar credenciais:', error);
            isInitialized.current = true;
        });
    }, [setValue, loadSavedCredentials]);

    // Login automático com biometria (se habilitada)
    const attemptBiometricLogin = useCallback(async () => {
        // Verificações de segurança
        if (
            hasAttemptedBiometric.current ||
            !biometricEnabled ||
            biometricLocked ||
            biometricLoading ||
            loading ||
            authenticatingBiometric
        ) {
            return;
        }

        hasAttemptedBiometric.current = true;
        setAuthenticatingBiometric(true);

        try {
            // Pequeno delay para melhor UX
            await new Promise(resolve => setTimeout(resolve, 300));

            const credentials = await authenticateBiometric();

            if (credentials) {
                await login(credentials.email, credentials.password, true);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (error) {
            console.error("Erro no login biométrico automático:", error);
            // Silenciosamente permitir login manual
        } finally {
            setAuthenticatingBiometric(false);
        }
    }, [
        biometricEnabled,
        biometricLocked,
        biometricLoading,
        loading,
        authenticatingBiometric,
        authenticateBiometric,
        login
    ]);

    // Acionar biometria automaticamente quando tudo estiver pronto
    useEffect(() => {
        if (
            isInitialized.current &&
            !biometricLoading &&
            biometricEnabled &&
            !biometricLocked &&
            !hasAttemptedBiometric.current
        ) {
            attemptBiometricLogin();
        }
    }, [isInitialized.current, biometricLoading, biometricEnabled, biometricLocked, attemptBiometricLogin]);

    // Configurar biometria
    const handleSetupBiometric = useCallback(async () => {
        if (!email || !password) {
            Alert.alert('Atenção', 'Preencha email e senha primeiro');
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const success = await setupBiometric(email, password);

        if (success) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert(
                'Sucesso!',
                `${biometricName} configurado com sucesso! Na próxima vez será automático.`,
                [{ text: 'OK' }]
            );
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert(
                'Erro',
                biometricError || `Não foi possível configurar ${biometricName}`,
                [{ text: 'OK' }]
            );
        }
    }, [email, password, setupBiometric, biometricName, biometricError]);

    // Login normal
    const handleSignIn = async (data: FormDataProps) => {
        if (loading || authenticatingBiometric) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setLoading(true);

        try {
            await login(data.email, data.password, rememberMe);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Oferecer configuração de biometria após login bem-sucedido
            if (rememberMe && biometricAvailable && !biometricEnabled) {
                setTimeout(() => {
                    Alert.alert(
                        'Login Rápido',
                        `Deseja usar ${biometricName} para entrar automaticamente na próxima vez?`,
                        [
                            { text: 'Agora não', style: 'cancel' },
                            { text: 'Ativar', onPress: handleSetupBiometric }
                        ]
                    );
                }, 1000);
            }
        } catch (error) {
            console.error("Erro ao fazer login:", error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthTemplate
            isLoading={(config as any)?.isLoading || biometricLoading}
            title={(t as any)?.('login_title') || 'Bem-vindo'}
            subtitle="Entre com sua conta para continuar"
        >
            {/* Indicador de autenticação biométrica */}
            {authenticatingBiometric && (
                <View className="mb-6 items-center justify-center py-4 px-6 bg-background-50 dark:bg-background-900 rounded-2xl border border-outline-200 dark:border-outline-800">
                    <ActivityIndicator size="small" color="#6366F1" />
                    <Text className="mt-3 text-center text-typography-700 dark:text-typography-300 text-sm">
                        Autenticando com {biometricName}{isExpoGo ? ' (Simulado)' : ''}...
                    </Text>
                </View>
            )}

            {/* Formulário de login (oculto durante autenticação biométrica) */}
            {!authenticatingBiometric && (
                <LoginForm
                    control={control}
                    errors={errors}
                    isValid={isValid}
                    loading={loading}
                    rememberMe={rememberMe}
                    onRememberMeChange={setRememberMe}
                    onSubmit={handleSubmit(handleSignIn)}
                />
            )}

            {/* Aviso de biometria bloqueada */}
            {biometricLocked && !authenticatingBiometric && (
                <View className="mt-4 items-center">
                    <Text className="text-center text-error-500 text-sm">
                        🔒 {biometricName} bloqueado por {lockoutRemaining} minutos
                    </Text>
                    <Text className="mt-1 text-center text-typography-500 text-xs">
                        Use email e senha para entrar
                    </Text>
                </View>
            )}

            {/* Aviso Expo Go */}
            {isExpoGo && biometricAvailable && !authenticatingBiometric && (
                <Text variant="caption" align="center" className="mt-3 text-center text-typography-400">
                    ⚠️ Biometria simulada no Expo Go
                </Text>
            )}

            <AuthFooter
                showSignUp={(config as any)?.allow_signup !== false}
                copyrightText={(config as any)?.copyright_text}
                onSignUpPress={() => router.push('/sign-up')}
            />
        </AuthTemplate>
    );
}