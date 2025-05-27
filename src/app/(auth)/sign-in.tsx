import React, { useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
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

// Temporary components (will be replaced with atomic design)
import { AuthTemplate } from "@/components/templates";
import {LoginForm} from "@/components/organisms/LoginForm";
import {BiometricLogin} from "@/components/organisms/BiometricLogin";
import {AuthFooter} from "@/components/organisms/AuthFooter";
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

type FormDataProps = Yup.InferType<typeof signInSchema>;

export default function SignIn() {
    const { login, loadSavedCredentials } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const { t } = useContext(TranslationContext);
    const config = useContext(ConfigContext);
    
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
        loadSavedCredentials().then(credentials => {
            if (credentials) {
                setValue('email', credentials.email);
                setValue('password', credentials.password);
                setRememberMe(credentials.rememberMe);
            }
        }).catch(error => {
            console.error('Erro ao carregar credenciais:', error);
        });
    }, [setValue, loadSavedCredentials]);

    // Login normal
    const handleSignIn = async (data: FormDataProps) => {
        if (loading) return;

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
                        `Deseja usar ${biometricName} para entrar mais rapidamente?`,
                        [
                            { text: 'Agora não', style: 'cancel' },
                            { text: 'Ativar', onPress: () => handleSetupBiometric() }
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

    // Login com biometria
    const handleBiometricLogin = async () => {
        if (!biometricEnabled || loading || biometricLocked) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setLoading(true);

        try {
            const credentials = await authenticateBiometric();
            if (credentials) {
                await login(credentials.email, credentials.password, true);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
        } catch (error) {
            console.error("Erro ao fazer login com biometria:", error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
        }
    };

    // Configurar biometria
    const handleSetupBiometric = async () => {
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
                `${biometricName} configurado com sucesso!`,
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
    };

    return (
        <AuthTemplate
            isLoading={(config as any)?.isLoading || biometricLoading}
            title={(t as any)?.('login_title') || 'Bem-vindo'}
            subtitle="Entre com sua conta para continuar"
        >
            <LoginForm
                control={control}
                errors={errors}
                isValid={isValid}
                loading={loading}
                rememberMe={rememberMe}
                onRememberMeChange={setRememberMe}
                onSubmit={handleSubmit(handleSignIn)}
            />

            {biometricAvailable && (
                <>
                    {isExpoGo && (
                        <Text variant="caption" color="warning" align="center" className="mb-2">
                            ⚠️ Biometria simulada (Expo Go)
                        </Text>
                    )}
                    <BiometricLogin
                        biometricName={biometricName + (isExpoGo ? ' (Simulado)' : '')}
                        isEnabled={biometricEnabled}
                        isLocked={biometricLocked}
                        lockoutRemaining={lockoutRemaining}
                        loading={loading}
                        onBiometricLogin={handleBiometricLogin}
                        onSetupBiometric={handleSetupBiometric}
                    />
                </>
            )}

            <AuthFooter
                showSignUp={(config as any)?.allow_signup !== false}
                copyrightText={(config as any)?.copyright_text}
            />
        </AuthTemplate>
    );
}