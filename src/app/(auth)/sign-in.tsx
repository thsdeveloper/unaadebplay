import React, {useContext, useEffect, useState, useRef} from "react";
import {Platform, ActivityIndicator, Alert, Animated, View} from "react-native";
import {useNavigation, Link} from "expo-router";
import {useForm, Controller} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {LinearGradient} from "expo-linear-gradient";
import {MaterialIcons, FontAwesome5, Ionicons} from "@expo/vector-icons";

import {useAuth} from "@/contexts/AuthContext";
import TranslationContext from "@/contexts/TranslationContext";
import ConfigContext from "@/contexts/ConfigContext";

import {Box} from "@/components/ui/box";
import {Center} from "@/components/ui/center";
import {VStack} from "@/components/ui/vstack";
import {HStack} from "@/components/ui/hstack";
import {Heading} from "@/components/ui/heading";
import {Text} from "@/components/ui/text";
import {Pressable} from "@/components/ui/pressable";
import {ScrollView} from "@/components/ui/scroll-view";
import {KeyboardAvoidingView} from "@/components/ui/keyboard-avoiding-view";
import {Button, ButtonText, ButtonSpinner} from "@/components/ui/button";
import {CustomInput} from "@/components/Forms/Input";
import {useBiometricAuth} from "@/hooks/useBiometricAuth";
import {Image} from "react-native";

const signInSchema = Yup.object({
    email: Yup.string().email("Digite um email válido").required("Email é obrigatório"),
    password: Yup.string().min(4, "Senha deve ter no mínimo 4 caracteres").required("Senha é obrigatória"),
});

type FormDataProps = Yup.InferType<typeof signInSchema>;

export default function SignIn() {
    const {login, loadSavedCredentials} = useAuth();
    const [loading, setLoading] = useState(false);
    const {t} = useContext(TranslationContext);
    const config = useContext(ConfigContext);
    const navigation = useNavigation();
    const [rememberMe, setRememberMe] = useState(false);
    const [biometricLoginAttempted, setBiometricLoginAttempted] = useState(false);
    const mountedRef = useRef(true);

    // Animações
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    const {
        isBiometricAvailable,
        isBiometricEnabled,
        biometricType,
        loading: biometricLoading,
        initialized: biometricInitialized,
        saveBiometricCredentials,
        authenticateWithBiometrics,
        checkBiometricAvailability
    } = useBiometricAuth();

    const {control, handleSubmit, formState: {errors, isValid}, setValue} = useForm<FormDataProps>({
        resolver: yupResolver(signInSchema),
    });

    // Função para login com biometria
    const handleBiometricLogin = async () => {
        if (!isBiometricEnabled || loading || biometricLoginAttempted) return;

        setLoading(true);
        try {
            setBiometricLoginAttempted(true);
            const credentials = await authenticateWithBiometrics();
            if (credentials && mountedRef.current) {
                await login(credentials.email, credentials.password, true);
            }
        } catch (error) {
            console.error("Erro ao fazer login com biometria:", error);
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    };

    // Carregar credenciais salvas
    useEffect(() => {
        async function loadCreds() {
            try {
                const credentials = await loadSavedCredentials();
                if (credentials && !loading) {
                    setValue('email', credentials.email);
                    setValue('password', credentials.password);
                    setRememberMe(credentials.rememberMe);
                }
            } catch (error) {
                console.error('Erro ao carregar credenciais:', error);
            }
        }

        loadCreds();
    }, [setValue]);

    // Função para configurar biometria
    const configureBiometrics = async (email: string, password: string) => {
        try {
            const success = await saveBiometricCredentials(email, password);

            if (success) {
                Alert.alert(
                    "Biometria Configurada",
                    `${biometricType} foi configurado com sucesso! Use-o para fazer login rapidamente.`,
                    [{text: "OK"}]
                );
            } else {
                Alert.alert(
                    "Erro",
                    `Não foi possível configurar ${biometricType}. Tente novamente.`,
                    [{text: "OK"}]
                );
            }
        } catch (error) {
            console.error("Erro ao configurar biometria:", error);
        }
    };

    // Manipulador do envio do formulário
    async function handleSignIn(data: FormDataProps) {
        if (loading) return;

        setLoading(true);
        try {
            await login(data.email, data.password, rememberMe);

            // Oferecer configuração de biometria após login bem-sucedido
            if (rememberMe && isBiometricAvailable && !isBiometricEnabled && mountedRef.current) {
                setTimeout(() => {
                    if (mountedRef.current) {
                        Alert.alert(
                            "Ativar Login Rápido",
                            `Deseja usar ${biometricType} para entrar mais rapidamente?`,
                            [
                                {text: "Agora não", style: "cancel"},
                                {
                                    text: "Ativar",
                                    onPress: () => configureBiometrics(data.email, data.password)
                                }
                            ]
                        );
                    }
                }, 500);
            }
        } catch (error) {
            console.error("Erro ao fazer login:", error);
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    }

    // Animações de entrada
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                delay: 200,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                delay: 400,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // Inicialização
    useEffect(() => {
        navigation.setOptions?.({headerShown: false});

        // Tentar login automático com biometria
        if (isBiometricEnabled && !loading && !config.isLoading && biometricInitialized && !biometricLoginAttempted) {
            const timer = setTimeout(() => {
                if (mountedRef.current && !loading && !biometricLoginAttempted) {
                    handleBiometricLogin();
                }
            }, 1000);

            return () => clearTimeout(timer);
        }

        return () => {
            mountedRef.current = false;
        };
    }, [navigation, config.isLoading, isBiometricEnabled, biometricInitialized, biometricLoginAttempted]);

    // Cores do degradê
    const gradientColors: readonly [string, string, ...string[]] = config.hasError
        ? ['#1e293b', '#334155', '#1e293b'] as const
        : [
            config.primary_dark_color || '#1e293b',
            config.primary_color || '#334155',
            config.primary_darker_color || '#0f172a'
        ] as const;

    if (config.isLoading) {
        return (
            <LinearGradient
                colors={['#1e293b', '#334155', '#0f172a']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
            >
                <ActivityIndicator size="large" color="#60a5fa"/>
                <Text className="text-white mt-4">Carregando...</Text>
            </LinearGradient>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{flex: 1}}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <LinearGradient
                colors={gradientColors}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={{flex: 1}}
            >
                <ScrollView
                    contentContainerStyle={{flexGrow: 1}}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View
                        style={{
                            flex: 1,
                            opacity: fadeAnim,
                            transform: [{translateY: slideAnim}]
                        }}
                    >
                        <Box className="flex-1 px-6 py-8 justify-center">
                            {/* Logo e Título */}
                            <Animated.View
                                style={{
                                    transform: [{scale: scaleAnim}],
                                    alignItems: 'center',
                                    marginBottom: 40
                                }}
                            >
                                <Box className="w-32 h-32 mb-6 bg-white/10 rounded-full items-center justify-center">
                                    <Image
                                        source={require("@/assets/unaadeb-login.png")}
                                        className="w-28 h-28 rounded-full"
                                        alt="Logo"
                                    />
                                </Box>

                                <Heading className="text-center text-white text-3xl font-bold mb-2">
                                    {t('login_title') || 'Bem-vindo'}
                                </Heading>
                                <Text className="text-center text-blue-200 text-base">
                                    Entre com sua conta para continuar
                                </Text>
                            </Animated.View>

                            <VStack className="space-y-4">
                                {/* Campo de Email */}
                                <Controller
                                    control={control}
                                    name="email"
                                    render={({field: {onChange, onBlur, value}}) => (
                                        <Box>
                                            <CustomInput
                                                label="Email"
                                                placeholder="seu@email.com"
                                                value={value}
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                                errorMessage={errors.email?.message}
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                                autoCorrect={false}
                                                leftIcon="email"
                                                className="bg-white/10 border-white/20"
                                            />
                                        </Box>
                                    )}
                                />

                                {/* Campo de Senha */}
                                <Controller
                                    control={control}
                                    name="password"
                                    render={({field: {onChange, onBlur, value}}) => (
                                        <Box>
                                            <CustomInput
                                                label="Senha"
                                                placeholder="••••••••"
                                                value={value}
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                                errorMessage={errors.password?.message}
                                                autoCapitalize="none"
                                                autoCorrect={false}
                                                isPassword={true}
                                                leftIcon="lock"
                                                className="bg-white/10 border-white/20"
                                            />
                                        </Box>
                                    )}
                                />

                                {/* Opções: Lembrar-me e Esqueceu senha */}
                                <HStack className="justify-between items-center">
                                    <Pressable
                                        onPress={() => setRememberMe(!rememberMe)}
                                        className="flex-row items-center"
                                    >
                                        <Box
                                            className={`h-5 w-5 rounded border-2 mr-2 items-center justify-center ${
                                                rememberMe 
                                                    ? 'bg-blue-500 border-blue-500' 
                                                    : 'bg-transparent border-white/50'
                                            }`}
                                        >
                                            {rememberMe && (
                                                <MaterialIcons
                                                    name="check"
                                                    size={14}
                                                    color="white"
                                                />
                                            )}
                                        </Box>
                                        <Text className="text-sm text-white/80">
                                            Lembrar-me
                                        </Text>
                                    </Pressable>

                                    <Link href="/(auth)/forget-password" asChild>
                                        <Pressable>
                                            <Text className="text-sm text-blue-300 font-medium">
                                                Esqueceu a senha?
                                            </Text>
                                        </Pressable>
                                    </Link>
                                </HStack>

                                {/* Botão de Login */}
                                <Button
                                    className="rounded-xl bg-blue-500 h-14 shadow-lg"
                                    isDisabled={!isValid || loading}
                                    onPress={handleSubmit(handleSignIn)}
                                >
                                    {loading ? (
                                        <ButtonSpinner color="white"/>
                                    ) : (
                                        <>
                                            <Ionicons
                                                name="log-in"
                                                size={20}
                                                color="white"
                                                style={{marginRight: 8}}
                                            />
                                            <ButtonText className="font-semibold text-base">
                                                Entrar
                                            </ButtonText>
                                        </>
                                    )}
                                </Button>

                                {/* Botão de Biometria */}
                                {(isBiometricAvailable || isBiometricEnabled) && biometricInitialized && (
                                    <Pressable
                                        onPress={() => {
                                            if (isBiometricEnabled) {
                                                handleBiometricLogin();
                                            } else {
                                                Alert.alert(
                                                    "Login Biométrico",
                                                    `Para usar ${biometricType}, faça login primeiro e marque "Lembrar-me".`,
                                                    [{text: "Entendi"}]
                                                );
                                            }
                                        }}
                                        disabled={loading}
                                        className={`flex-row items-center justify-center h-14 rounded-xl border-2 ${
                                            isBiometricEnabled 
                                                ? 'border-green-400 bg-green-400/10' 
                                                : 'border-white/30 bg-white/5'
                                        }`}
                                    >
                                        <FontAwesome5
                                            name={biometricType.toLowerCase().includes('face') ? 'smile' : 'fingerprint'}
                                            size={20}
                                            color={isBiometricEnabled ? '#4ade80' : '#ffffff80'}
                                            style={{marginRight: 12}}
                                        />
                                        <Text className={`font-semibold text-base ${
                                            isBiometricEnabled ? 'text-green-400' : 'text-white/80'
                                        }`}>
                                            {isBiometricEnabled
                                                ? `Entrar com ${biometricType}`
                                                : `Configurar ${biometricType}`}
                                        </Text>
                                    </Pressable>
                                )}

                                {/* Divisor */}
                                <Box className="flex-row items-center my-4">
                                    <Box className="flex-1 h-px bg-white/20" />
                                    <Text className="mx-4 text-white/60 text-sm">ou</Text>
                                    <Box className="flex-1 h-px bg-white/20" />
                                </Box>

                                {/* Link para Cadastro */}
                                {config.allow_signup !== false && (
                                    <HStack className="justify-center">
                                        <Text className="text-sm text-white/70">
                                            Não tem uma conta?
                                        </Text>
                                        <Link href="/sign-up" asChild>
                                            <Pressable>
                                                <Text className="text-sm text-blue-400 font-semibold ml-1">
                                                    Cadastre-se
                                                </Text>
                                            </Pressable>
                                        </Link>
                                    </HStack>
                                )}

                                {/* Copyright */}
                                <Center className="mt-8">
                                    <Text className="text-xs text-white/40 text-center">
                                        {config.copyright_text || `© ${new Date().getFullYear()} UNAADEB. Todos os direitos reservados.`}
                                    </Text>
                                </Center>
                            </VStack>
                        </Box>
                    </Animated.View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}
