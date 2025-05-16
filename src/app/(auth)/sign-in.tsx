import React, {useContext, useEffect, useState, useRef} from "react";
import {Platform, ActivityIndicator, Alert, TouchableOpacity} from "react-native";
import {useNavigation, Link} from "expo-router";
import {useForm, Controller} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {LinearGradient} from "expo-linear-gradient";
import {MaterialIcons, FontAwesome5} from "@expo/vector-icons";
import * as LocalAuthentication from 'expo-local-authentication';

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
import {Button, ButtonText, ButtonIcon, ButtonSpinner} from "@/components/ui/button";
import {CustomInput} from "@/components/Forms/Input";
import {Icon} from "@/components/ui/icon";
import {useBiometricAuth} from "@/hooks/useBiometricAuth";

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
            console.log("Tentando autenticar com biometria...");
            setBiometricLoginAttempted(true);
            const credentials = await authenticateWithBiometrics();
            if (credentials && mountedRef.current) {
                console.log("Credenciais biométricas obtidas, fazendo login...");
                await login(credentials.email, credentials.password, true);
            } else {
                console.log("Autenticação biométrica falhou ou foi cancelada");
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

    // Função para configurar biometria manualmente
    const configureBiometrics = async (email: string, password: string) => {
        console.log("Iniciando configuração de biometria...");
        try {
            // Tentar salvar credenciais biométricas
            const success = await saveBiometricCredentials(email, password);

            if (success) {
                Alert.alert(
                    "Configuração Concluída",
                    `${biometricType} configurado com sucesso! Agora você pode fazer login usando ${biometricType}.`,
                    [{text: "OK"}]
                );
            } else {
                Alert.alert(
                    "Erro na Configuração",
                    `Não foi possível configurar ${biometricType}. Tente novamente mais tarde.`,
                    [{text: "OK"}]
                );
            }
        } catch (error) {
            console.error("Erro ao configurar biometria:", error);
            Alert.alert(
                "Erro",
                "Ocorreu um erro ao configurar a biometria. Tente novamente mais tarde.",
                [{text: "OK"}]
            );
        }
    };

    // Função para verificar manualmente a biometria (debug)
    const checkBiometricManually = async () => {
        try {
            const available = await LocalAuthentication.hasHardwareAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            Alert.alert(
                "Status da Biometria",
                `Hardware disponível: ${available ? "Sim" : "Não"}\n` +
                `Biometria registrada: ${enrolled ? "Sim" : "Não"}\n` +
                `Biometria habilitada no app: ${isBiometricEnabled ? "Sim" : "Não"}\n` +
                `Inicialização concluída: ${biometricInitialized ? "Sim" : "Não"}\n` +
                `Tipo: ${biometricType}`
            );
        } catch (error) {
            console.error('Erro ao verificar biometria manualmente:', error);
            Alert.alert("Erro", "Não foi possível verificar o status da biometria");
        }
    };

    // Manipulador do envio do formulário
    async function handleSignIn(data: FormDataProps) {
        if (loading) return;

        setLoading(true);
        try {
            console.log("Tentando login com email e senha...");
            await login(data.email, data.password, rememberMe);
            console.log("Login bem-sucedido, verificando configuração de biometria");

            // Verificar se podemos configurar biometria
            console.log("Status para configuração de biometria:", {
                rememberMe,
                biometriaDisponivel: isBiometricAvailable,
                biometriaHabilitada: isBiometricEnabled
            });

            // Se lembrar-me estiver marcado e biometria disponível, pergunte se deseja configurar
            if (rememberMe && isBiometricAvailable && !isBiometricEnabled && mountedRef.current) {
                console.log("Condições satisfeitas para oferecer configuração de biometria");

                // Usar setTimeout para garantir que o alerta aparece após o login completo
                setTimeout(() => {
                    if (mountedRef.current) {
                        Alert.alert(
                            "Configurar biometria",
                            `Deseja usar ${biometricType} para login futuro?`,
                            [
                                {text: "Não", style: "cancel"},
                                {
                                    text: "Sim",
                                    onPress: () => configureBiometrics(data.email, data.password)
                                }
                            ]
                        );
                    }
                }, 500);
            } else {
                console.log("Condições para configuração de biometria não satisfeitas");
            }
        } catch (error) {
            console.error("Erro ao fazer login:", error);
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    }

    // Inicialização e animações
    useEffect(() => {
        navigation.setOptions?.({headerShown: false});

        // Logs de debug da biometria
        if (biometricInitialized) {
            console.log('Status da biometria:', {
                disponível: isBiometricAvailable,
                habilitada: isBiometricEnabled,
                tipo: biometricType
            });
        }

        // Autenticação biométrica automática - com limitação para evitar loops
        if (isBiometricEnabled && !loading && !config.isLoading && biometricInitialized && !biometricLoginAttempted) {
            console.log('Tentando auto-autenticação com biometria...');
            // Usar setTimeout para adiar a execução fora da fase de renderização
            const timer = setTimeout(() => {
                if (mountedRef.current && !loading && !biometricLoginAttempted) {
                    handleBiometricLogin();
                }
            }, 1000);

            // Limpar o timer na desmontagem
            return () => clearTimeout(timer);
        }

        // Marcar a referência de montagem na desmontagem
        return () => {
            mountedRef.current = false;
        };
    }, [navigation, config.isLoading, isBiometricEnabled, biometricInitialized, biometricLoginAttempted]);

    // Cores do degradê - usando valores do config se disponíveis
    const gradientColors = config.hasError
        ? ['#0c2d48', '#1a3b5a', '#0a1d2e']
        : [
            config.primary_dark_color || '#0c2d48',
            config.primary_color || '#1a3b5a',
            config.primary_darker_color || '#0a1d2e'
        ];

    // Renderiza um loader enquanto as configurações estão carregando
    if (config.isLoading) {
        return (
            <LinearGradient
                colors={['#0c2d48', '#1a3b5a', '#0a1d2e']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
            >
                <ActivityIndicator size="large" color="#3498db"/>
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
                >
                    <Box className="flex-1 px-8 py-12 justify-center">
                        <Heading
                            className="text-center text-blue-200 text-2xl font-bold mb-8"
                            onLongPress={checkBiometricManually}
                        >
                            {t('login_title')}
                        </Heading>

                        <VStack className="space-y-6">
                            <Controller
                                control={control}
                                name="email"
                                render={({field: {onChange, onBlur, value}}) => (
                                    <CustomInput
                                        label={'Digite seu e-mail'}
                                        placeholder="Digite seu e-mail"
                                        helperText="Seu nome completo, como no documento"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        errorMessage={errors.email?.message}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        leftIcon="email"
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name="password"
                                render={({field: {onChange, onBlur, value}}) => (
                                    <CustomInput
                                        label={'Senha'}
                                        placeholder="Digite sua senha"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        errorMessage={errors.password?.message}
                                        helperText="Mínimo de 8 caracteres"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        isPassword={true}
                                        isRequired={true}
                                        leftIcon="lock"
                                    />
                                )}
                            />

                            <HStack className="justify-between items-center mt-4 mb-4">
                                <Pressable
                                    onPress={() => {
                                        setRememberMe(!rememberMe);
                                        console.log("Lembrar-me:", !rememberMe);
                                    }}
                                    className="flex-row items-center"
                                >
                                    <Box
                                        className={`h-5 w-5 rounded border border-blue-300 mr-2 items-center justify-center ${
                                            rememberMe ? 'bg-blue-600' : 'bg-transparent'
                                        }`}
                                    >
                                        {rememberMe && (
                                            <Icon
                                                as={MaterialIcons}
                                                name="check"
                                                size="sm"
                                                color="white"
                                            />
                                        )}
                                    </Box>
                                    <Text className="text-sm text-blue-200 font-bold">
                                        {config.remember_me_text || 'Lembrar-me (necessário para biometria)'}
                                    </Text>
                                </Pressable>
                            </HStack>

                            <Box className={'py-4'}>
                                <Link href="/(auth)/forget-password" asChild>
                                    <Pressable>
                                        <Text className="text-sm text-blue-300 font-medium">
                                            {config.forgot_password_text || 'Esqueceu a sua senha?'}
                                        </Text>
                                    </Pressable>
                                </Link>
                            </Box>

                            {/* Botão de login biométrico - aparece quando disponível OU quando habilitado */}
                            {(isBiometricAvailable || isBiometricEnabled) && biometricInitialized && (
                                <TouchableOpacity
                                    onPress={() => {
                                        if (isBiometricEnabled) {
                                            handleBiometricLogin();
                                        } else {
                                            Alert.alert(
                                                "Autenticação Biométrica",
                                                `Você pode configurar o ${biometricType} após fazer login com seu email e senha. Marque "Lembrar-me" antes de fazer login.`,
                                                [{text: "OK"}]
                                            );
                                        }
                                    }}
                                    activeOpacity={0.8}
                                    style={{
                                        backgroundColor: '#2563eb', // bg-blue-700
                                        borderRadius: 8,
                                        paddingVertical: 14,
                                        marginBottom: 16,
                                        alignItems: 'center',
                                        flexDirection: 'row',
                                        justifyContent: 'center'
                                    }}
                                    disabled={loading}
                                >
                                    <FontAwesome5
                                        name={biometricType.toLowerCase().includes('face') ? 'face' : 'fingerprint'}
                                        size={16}
                                        color="white"
                                        style={{marginRight: 8}}
                                    />
                                    <Text style={{
                                        color: 'white',
                                        fontSize: 14,
                                        fontWeight: '600'
                                    }}>
                                        {isBiometricEnabled
                                            ? `Entrar com ${biometricType}`
                                            : `Configurar ${biometricType}`}
                                    </Text>
                                </TouchableOpacity>
                            )}

                            <Button
                                className="rounded-lg bg-blue-600"
                                isDisabled={!isValid || loading}
                                size={'lg'}
                                onPress={handleSubmit(handleSignIn)}
                            >
                                {loading ? (
                                    <ButtonSpinner color="white"/>
                                ) : (
                                    <ButtonIcon
                                        as={FontAwesome5}
                                        name="sign-in-alt"
                                        size="sm"
                                        color="white"
                                        mr="2"
                                    />
                                )}
                                <ButtonText className="font-medium text-sm ml-2">
                                    {loading ? "Autenticando..." : (config.login_button_text || "Entrar")}
                                </ButtonText>
                            </Button>

                            {config.allow_signup !== false && (
                                <HStack className="justify-center mt-4">
                                    <Text className="text-sm text-blue-100">
                                        {config.signup_question || 'Ainda não tem conta?'}
                                    </Text>
                                    <Link href="/sign-up" asChild>
                                        <Pressable>
                                            <Text className="text-sm text-blue-300 font-semibold ml-1">
                                                {config.signup_text || 'Cadastre-se'}
                                            </Text>
                                        </Pressable>
                                    </Link>
                                </HStack>
                            )}

                            <Center className="mt-8">
                                <Text className="text-xs text-blue-200 opacity-70">
                                    {config.copyright_text || `© ${new Date().getFullYear()} - Todos os direitos reservados`}
                                </Text>
                            </Center>
                        </VStack>
                    </Box>

                    {/* Botão de debug invisível para verificar biometria */}
                    <TouchableOpacity
                        onLongPress={checkBiometricManually}
                        style={{
                            position: 'absolute',
                            bottom: 20,
                            right: 20,
                            width: 40,
                            height: 40,
                            zIndex: 100
                        }}
                    />
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}
