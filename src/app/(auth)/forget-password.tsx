import React, { useContext, useState, useRef, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Platform, Animated } from 'react-native';
import { Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";

// Importações de componentes locais
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";
import { Pressable } from "@/components/ui/pressable";
import { Link } from "expo-router";

// Componentes de autenticação
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";

// Importações de contextos e serviços
import TranslationContext from "../../contexts/TranslationContext";
import AuthContext from "@/contexts/AuthContext";
import ConfigContext from "@/contexts/ConfigContext";
import { emailExists } from "@/services/user";
import AlertContext from "@/contexts/AlertContext";

const forgetPasswordSchema = Yup.object({
    email: Yup.string()
        .email("Digite um email válido")
        .required("Email é obrigatório"),
});

type FormDataProps = Yup.InferType<typeof forgetPasswordSchema>;

export default function ForgetPassword() {
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const { requestPasswordReset } = useContext(AuthContext);
    const { t } = useContext(TranslationContext);
    const config = useContext(ConfigContext);
    const alert = useContext(AlertContext);

    // Animações
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const checkmarkAnim = useRef(new Animated.Value(0)).current;

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<FormDataProps>({
        resolver: yupResolver(forgetPasswordSchema),
        mode: "all",
    });

    // Animação de entrada
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                delay: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleResetPassword = async (data: FormDataProps) => {
        setLoading(true);
        try {
            if (!(await emailExists(data.email))) {
                alert.error('Email não encontrado. Verifique e tente novamente.');
                setLoading(false);
                return;
            }
            
            await requestPasswordReset(data.email);
            
            // Animação de sucesso
            setEmailSent(true);
            Animated.spring(checkmarkAnim, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }).start();
            
        } catch (error) {
            console.error("Erro ao resetar senha:", error);
            alert.error('Erro ao enviar email. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    // Cores do degradê
    const gradientColors: readonly [string, string, ...string[]] = config.hasError
        ? ['#1e293b', '#334155', '#1e293b'] as const
        : [
            config.primary_dark_color || '#1e293b',
            config.primary_color || '#334155',
            config.primary_darker_color || '#0f172a'
        ] as const;

    if (emailSent) {
        return (
            <AuthLayout gradientColors={gradientColors}>
                <Animated.View
                    style={{
                        flex: 1,
                        opacity: fadeAnim,
                        transform: [{ scale: checkmarkAnim }]
                    }}
                >
                    <Center className="flex-1">
                        <Box className="w-32 h-32 bg-green-500/20 rounded-full items-center justify-center mb-6">
                            <Ionicons name="checkmark-circle" size={80} color="#10b981" />
                        </Box>
                        
                        <VStack className="space-y-4 items-center px-6">
                            <Text className="text-white text-2xl font-bold text-center">
                                Email Enviado!
                            </Text>
                            <Text className="text-white/70 text-center">
                                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                            </Text>
                            <Text className="text-white/50 text-sm text-center mt-2">
                                Não esqueça de verificar a pasta de spam.
                            </Text>
                            
                            <Link href="/(auth)/sign-in" asChild>
                                <Pressable className="mt-8">
                                    <Button className="rounded-xl bg-blue-500 h-14 px-8">
                                        <Ionicons
                                            name="arrow-back"
                                            size={20}
                                            color="white"
                                            style={{marginRight: 8}}
                                        />
                                        <ButtonText className="font-semibold text-base">
                                            Voltar ao Login
                                        </ButtonText>
                                    </Button>
                                </Pressable>
                            </Link>
                        </VStack>
                    </Center>
                </Animated.View>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout gradientColors={gradientColors}>
            <Animated.View
                style={{
                    flex: 1,
                    opacity: fadeAnim,
                }}
            >
                <Center className="flex-1">
                    <Animated.View
                        style={{
                            transform: [{ scale: scaleAnim }],
                            width: '100%'
                        }}
                    >
                        {/* Ícone e Título */}
                        <Center className="mb-8">
                            <Box className="w-24 h-24 bg-blue-500/20 rounded-full items-center justify-center mb-6">
                                <MaterialIcons name="lock-reset" size={50} color="#60a5fa" />
                            </Box>
                            
                            <VStack className="space-y-2 items-center">
                                <Text className="text-white text-2xl font-bold">
                                    Esqueceu sua senha?
                                </Text>
                                <Text className="text-center text-white/70 px-6">
                                    {t('reset_password_description') || 'Não se preocupe! Digite seu email e enviaremos instruções para redefinir sua senha.'}
                                </Text>
                            </VStack>
                        </Center>

                        {/* Formulário */}
                        <VStack className="space-y-4">
                            <AuthInput
                                control={control}
                                name="email"
                                label="Email cadastrado"
                                placeholder="seu@email.com"
                                error={errors.email}
                                type="email"
                                leftIcon="email"
                            />

                            <Button
                                className="rounded-xl bg-blue-500 h-14 mt-2"
                                onPress={handleSubmit(handleResetPassword)}
                                isDisabled={!isValid || loading}
                            >
                                {loading ? (
                                    <ButtonSpinner color="white" />
                                ) : (
                                    <>
                                        <Feather
                                            name="send"
                                            size={20}
                                            color="white"
                                            style={{marginRight: 8}}
                                        />
                                        <ButtonText className="font-semibold text-base">
                                            {t('text_password_send') || 'Enviar instruções'}
                                        </ButtonText>
                                    </>
                                )}
                            </Button>

                            {/* Link para voltar */}
                            <Center className="mt-6">
                                <Link href="/(auth)/sign-in" asChild>
                                    <Pressable className="flex-row items-center">
                                        <Ionicons
                                            name="arrow-back"
                                            size={16}
                                            color="#60a5fa"
                                            style={{marginRight: 4}}
                                        />
                                        <Text className="text-blue-400 font-semibold">
                                            Voltar ao login
                                        </Text>
                                    </Pressable>
                                </Link>
                            </Center>
                        </VStack>
                    </Animated.View>
                </Center>
            </Animated.View>
        </AuthLayout>
    );
}