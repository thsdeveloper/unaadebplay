import React, { useContext, useEffect, useState, useCallback, useRef } from "react";
import { Alert, View, Text as RNText, ActivityIndicator, Image, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, Easing } from "react-native-reanimated";
import { useRouter, useLocalSearchParams } from "expo-router";
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
import { LoginForm, type LoginFormData } from "@/components/organisms/LoginForm";
import { AppWordmark } from "@/components/atoms/AppWordmark";
import AlertContext from "@/contexts/AlertContext";
import { SHEET } from "@/constants/sheetTokens";

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
    const { login, loginWithApple, loadSavedCredentials, checkSession } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [authenticatingBiometric, setAuthenticatingBiometric] = useState(false);
    const { t } = useContext(TranslationContext);
    const config = useContext(ConfigContext);
    const insets = useSafeAreaInsets();
    const alert = useContext(AlertContext);

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

    // Prefill do email quando o usuário vem do cadastro ("email já cadastrado → Entrar").
    const params = useLocalSearchParams<{ email?: string }>();
    useEffect(() => {
        if (params?.email) setValue('email', String(params.email), { shouldValidate: true });
    }, [params?.email, setValue]);

    const email = watch('email');
    const password = watch('password');

    // Carregar credenciais salvas
    useEffect(() => {
        if (isInitialized.current) return;

        loadSavedCredentials().then(credentials => {
            if (credentials) {
                // Email vindo por param (cadastro → "Entrar") tem precedência sobre o salvo.
                if (!params?.email) setValue('email', credentials.email);
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

            if (credentials?.email) {
                // Preenche o email salvo
                setValue('email', credentials.email);

                // Se ainda há sessão válida persistida, entra direto (sem digitar senha).
                const hasSession = await checkSession();
                if (hasSession) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    router.replace('/(tabs)/(home)/');
                }
                // Caso contrário, o usuário conclui com a senha (sessão expirada).
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
        checkSession,
        setValue,
        router
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
        if (!email) {
            Alert.alert('Atenção', 'Preencha o email primeiro');
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const success = await setupBiometric(email);

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
        } catch {
            // O erro (flash + log) já é tratado dentro de login(); aqui só o feedback tátil e
            // NÃO seguir para o caminho de sucesso (haptic de sucesso / prompt de biometria).
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
        }
    };

    const heroTitle = (t as any)?.('login_title') || 'Bem-vindo de volta';

    // Animação de ENTRADA do card (sobe + fade). O wordmark do hero já anima por letra.
    const cardAnim = useSharedValue(0);
    useEffect(() => {
        cardAnim.value = withTiming(1, { duration: 620, easing: Easing.out(Easing.cubic) });
    }, [cardAnim]);
    const cardStyle = useAnimatedStyle(() => ({
        opacity: cardAnim.value,
        transform: [{ translateY: (1 - cardAnim.value) * 44 }],
    }));

    return (
        <View style={s.screen}>
            <StatusBar style="light" />
            <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                    contentContainerStyle={s.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    {/* HERO — wordmark "UNAADEB Play" com entrada animada (reveal por letra) */}
                    <View style={[s.hero, { paddingTop: insets.top }]}>
                        <LinearGradient
                            colors={['rgba(229,28,68,0.30)', 'transparent']}
                            style={StyleSheet.absoluteFill}
                        />
                        <View style={s.wordmark}>
                            <AppWordmark />
                        </View>
                    </View>

                    {/* CARD — sheet arredondado sobrepondo o hero, entra deslizando */}
                    <Animated.View style={[s.card, cardStyle, { paddingBottom: insets.bottom + 32 }]}>
                        <RNText style={s.title}>{heroTitle}</RNText>
                        <RNText style={s.subtitle}>Acesse sua conta para continuar</RNText>

                        {authenticatingBiometric ? (
                            <View style={s.bioBox}>
                                <ActivityIndicator size="small" color={BRAND} />
                                <RNText style={s.bioText}>
                                    Autenticando com {biometricName}{isExpoGo ? ' (Simulado)' : ''}...
                                </RNText>
                            </View>
                        ) : (
                            <>
                                <View style={{ marginTop: 22 }}>
                                    <LoginForm
                                        control={control}
                                        errors={errors}
                                        isValid={isValid}
                                        loading={loading}
                                        rememberMe={rememberMe}
                                        onRememberMeChange={setRememberMe}
                                        onSubmit={handleSubmit(handleSignIn)}
                                    />
                                </View>

                                {/* Divisor + login social */}
                                <View style={s.dividerRow}>
                                    <View style={s.line} />
                                    <RNText style={s.ou}>ou continue com</RNText>
                                    <View style={s.line} />
                                </View>
                                <View style={s.socialRow}>
                                    <SocialButton
                                        dark
                                        icon={<Ionicons name="logo-apple" size={20} color="#fff" />}
                                        label="Apple"
                                        onPress={() => loginWithApple()}
                                    />
                                    <SocialButton
                                        icon={<Ionicons name="logo-google" size={19} color="#EA4335" />}
                                        label="Google"
                                        onPress={() => alert?.warning?.('Login com Google em breve.')}
                                    />
                                </View>

                                {/* Criar conta — CTA secundário EVIDENTE (botão full-width) */}
                                <View style={s.createWrap}>
                                    <RNText style={s.createHint}>Ainda não tem uma conta?</RNText>
                                    <OutlineButton label="Criar conta" onPress={() => router.push('/sign-up')} />
                                </View>
                            </>
                        )}

                        {biometricLocked && !authenticatingBiometric && (
                            <View style={s.lockBox}>
                                <RNText style={s.lockText}>{biometricName} bloqueado por {lockoutRemaining} min</RNText>
                                <RNText style={s.lockSub}>Use email e senha para entrar</RNText>
                            </View>
                        )}

                        {isExpoGo && biometricAvailable && !authenticatingBiometric && (
                            <RNText style={s.expoGo}>Biometria simulada no Expo Go</RNText>
                        )}
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const BRAND = '#E51C44';

/**
 * Botão social em pílula (padrão do DS). `dark` = variante preta (Apple).
 * Estilo ESTÁTICO + onPressIn/Out: o Pressable com cssInterop do NativeWind IGNORA a forma
 * de função `style={({pressed})=>...}` para layout — a pílula perderia bg/tamanho.
 */
/**
 * Efeito de PRESSÃO springy — o MESMO do CTA do cadastro (GradientButton "Continuar"):
 * a escala cai para ~0.95 ao pressionar e volta com mola. Reanimated na UI thread.
 */
function usePressScale() {
    const scale = useSharedValue(1);
    const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    const onPressIn = () => { scale.value = withSpring(0.95, { damping: 15, stiffness: 350 }); };
    const onPressOut = () => { scale.value = withSpring(1, { damping: 11, stiffness: 220 }); };
    return { style, onPressIn, onPressOut };
}

const SocialButton: React.FC<{ icon: React.ReactNode; label: string; onPress: () => void; dark?: boolean }> = ({ icon, label, onPress, dark }) => {
    const press = usePressScale();
    return (
        <Animated.View style={[s.socialItem, press.style]}>
            <Pressable
                onPress={onPress}
                onPressIn={press.onPressIn}
                onPressOut={press.onPressOut}
                accessibilityRole="button"
                accessibilityLabel={`Entrar com ${label}`}
                style={[s.social, dark && s.socialDark]}
            >
                {icon}
                <RNText style={[s.socialText, dark && s.socialTextDark]}>{label}</RNText>
            </Pressable>
        </Animated.View>
    );
};

/** CTA de contorno (Criar conta) — mesmo efeito springy de pressão. */
const OutlineButton: React.FC<{ label: string; onPress: () => void }> = ({ label, onPress }) => {
    const press = usePressScale();
    return (
        <Animated.View style={[s.createItem, press.style]}>
            <Pressable
                onPress={onPress}
                onPressIn={press.onPressIn}
                onPressOut={press.onPressOut}
                accessibilityRole="button"
                accessibilityLabel={label}
                style={s.createBtn}
            >
                <RNText style={s.createBtnText}>{label}</RNText>
            </Pressable>
        </Animated.View>
    );
};

const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: SHEET.bgDeep },
    flex: { flex: 1 },
    scroll: { flexGrow: 1 },

    // hero
    hero: { height: 300, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    wordmark: { transform: [{ scale: 2.2 }] },

    // card
    card: {
        flex: 1,
        marginTop: -32,
        backgroundColor: SHEET.bg,
        borderTopLeftRadius: 34,
        borderTopRightRadius: 34,
        paddingHorizontal: 24,
        paddingTop: 30,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: SHEET.border,
    },
    title: { color: SHEET.textPrimary, fontSize: 26, fontWeight: '800', letterSpacing: 0.2 },
    subtitle: { color: SHEET.textMuted, fontSize: 14.5, marginTop: 6 },

    // divisor + social
    dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24 },
    line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.14)' },
    ou: { color: SHEET.textMuted, fontSize: 12.5 },
    socialRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
    socialItem: { flex: 1 },
    social: { width: '100%', height: 54, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
    socialDark: { backgroundColor: '#000000', borderColor: 'rgba(255,255,255,0.16)' },
    socialText: { color: SHEET.textPrimary, fontSize: 15, fontWeight: '700' },
    socialTextDark: { color: '#FFFFFF' },

    // criar conta (CTA secundário evidente)
    createWrap: { marginTop: 26, alignItems: 'center', gap: 12 },
    createHint: { color: SHEET.textMuted, fontSize: 14 },
    createItem: { width: '100%' },
    createBtn: { width: '100%', height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: SHEET.brand, backgroundColor: 'transparent' },
    createBtnText: { color: '#FF4D6D', fontSize: 16, fontWeight: '800' },

    // estados
    bioBox: { marginTop: 24, alignItems: 'center', gap: 12, padding: 20, borderRadius: 18, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
    bioText: { color: SHEET.textSecondary, fontSize: 14, textAlign: 'center' },
    lockBox: { marginTop: 16, alignItems: 'center', gap: 4 },
    lockText: { color: '#FCA5A5', fontSize: 13.5, textAlign: 'center' },
    lockSub: { color: SHEET.textFaint, fontSize: 12 },
    expoGo: { color: SHEET.textFaint, fontSize: 12, textAlign: 'center', marginTop: 12 },
});