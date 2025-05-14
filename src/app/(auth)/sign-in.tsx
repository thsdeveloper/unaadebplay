import React, { useContext, useEffect, useState, useRef } from "react";
import { Platform, Animated, ActivityIndicator } from "react-native";
import { useNavigation, Link } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

import { useAuth } from "@/contexts/AuthContext";
import TranslationContext from "@/contexts/TranslationContext";
import ConfigContext from "@/contexts/ConfigContext";
import { Image } from "@/components/Image";

import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Pressable } from "@/components/ui/pressable";
import { ScrollView } from "@/components/ui/scroll-view";
import { KeyboardAvoidingView } from "@/components/ui/keyboard-avoiding-view";
import { Button, ButtonText, ButtonIcon, ButtonSpinner } from "@/components/ui/button";
import { CustomInput } from "@/components/Forms/Input";
import { Icon } from "@/components/ui/icon";

const signInSchema = Yup.object({
    email: Yup.string().email("Digite um email válido").required("Email é obrigatório"),
    password: Yup.string().min(4, "Senha deve ter no mínimo 4 caracteres").required("Senha é obrigatória"),
});

type FormDataProps = Yup.InferType<typeof signInSchema>;

export default function SignIn() {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const { t } = useContext(TranslationContext);
    const config = useContext(ConfigContext);
    const navigation = useNavigation();
    const lottieRef = useRef(null);

    // Animações
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    const { control, handleSubmit, formState: { errors, isValid } } = useForm<FormDataProps>({
        resolver: yupResolver(signInSchema),
    });

    useEffect(() => {
        navigation.setOptions?.({ headerShown: false });

        // Inicia as animações apenas se config não estiver carregando
        if (!config.isLoading) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                })
            ]).start();

            // Inicia a animação Lottie
            if (lottieRef.current) {
                lottieRef.current.play();
            }
        }
    }, [fadeAnim, slideAnim, scaleAnim, navigation, config.isLoading]);

    async function handleSignIn(data: FormDataProps) {
        setLoading(true);
        try {
            await login(data.email, data.password);
        } catch (error) {
            console.error("Erro ao fazer login:", error);
        } finally {
            setLoading(false);
        }
    }

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
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            >
                <ActivityIndicator size="large" color="#3498db" />
                <Text className="text-white mt-4">Carregando...</Text>
            </LinearGradient>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <Box className="flex-1 px-8 py-12 justify-center">
                        <Animated.View style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
                        }}>
                            <Center className="mb-8">
                                {config.project_logo ? (
                                    <Image
                                        width="180px"
                                        height="54px"
                                        assetId={config.project_logo}
                                        fallbackSource={require('@/assets/default.png')}
                                    />
                                ) : (
                                    <Text className="text-blue-200 text-2xl font-bold">
                                        {config.project_name || 'Meu Aplicativo'}
                                    </Text>
                                )}

                                <Box className="h-20 w-20 mt-6">
                                    <LottieView
                                        ref={lottieRef}
                                        source={require('@/assets/login-animation.json')}
                                        autoPlay
                                        loop
                                    />
                                </Box>
                            </Center>

                            <Heading className="text-center text-blue-200 text-2xl font-bold mb-8">
                                {config.login_title || 'Bem-vindo de volta'}
                            </Heading>

                            <VStack className="space-y-6">
                                <Controller
                                    control={control}
                                    name="email"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <CustomInput
                                            placeholder="Digite seu e-mail"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            errorMessage={errors.email?.message}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            leftIcon={
                                                <Icon
                                                    as={MaterialIcons}
                                                    name="email"
                                                    size="md"
                                                    color="blue.300"
                                                />
                                            }
                                        />
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="password"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <CustomInput
                                            placeholder="Digite sua senha"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            errorMessage={errors.password?.message}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            isPassword
                                            leftIcon={
                                                <Icon
                                                    as={MaterialIcons}
                                                    name="lock"
                                                    size="md"
                                                    color="blue.300"
                                                />
                                            }
                                        />
                                    )}
                                />

                                <Link href="/(auth)/forget-password" asChild>
                                    <Pressable className="self-end">
                                        <Text className="text-sm text-blue-300 font-medium">
                                            {config.forgot_password_text || 'Esqueceu a sua senha?'}
                                        </Text>
                                    </Pressable>
                                </Link>

                                <Button
                                    className="rounded-lg bg-blue-600"
                                    isDisabled={!isValid || loading}
                                    size={'lg'}
                                    onPress={handleSubmit(handleSignIn)}
                                    opacity={isValid ? 1 : 0.6}
                                >
                                    {loading ? (
                                        <ButtonSpinner color="white" />
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
                                                <Text className="text-sm text-blue-300 font-semibold">
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
                        </Animated.View>
                    </Box>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}
