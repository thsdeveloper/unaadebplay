import * as React from "react";
import { useWindowDimensions, FlatList, Platform, Animated, View } from 'react-native';
import RenderHtml from 'react-native-render-html';
import * as Yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import { useContext, useEffect, useState, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Ionicons, FontAwesome6 } from '@expo/vector-icons';
import { Link } from 'expo-router';

// Componentes locais
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Pressable } from "@/components/ui/pressable";
import { ScrollView } from "@/components/ui/scroll-view";
import { Center } from "@/components/ui/center";
import {
    Modal,
    ModalContent,
    ModalCloseButton,
    ModalHeader,
    ModalBody,
    ModalFooter
} from "@/components/ui/modal";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";

// Componentes de autenticação
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthInput } from "@/components/auth/AuthInput";

// Componentes de formulário e outras importações
import { CustomSelect } from '@/components/Forms/Select';
import { CustomInput } from '@/components/Forms/Input';
import { setUser } from "@/services/user";
import { getItems } from "@/services/items";
import { LegalDocumentsTypes } from "@/types/LegalDocumentsTypes";
import ConfigContext from "@/contexts/ConfigContext";
import TranslationContext from "@/contexts/TranslationContext";
import CheckboxCustom from "@/components/Forms/Checkbox";
import { useAuth } from "@/contexts/AuthContext";
import AlertContext from "@/contexts/AlertContext";
import { Sector } from "@/types/Sector";
import { GlobalQueryParams } from "@/types/GlobalQueryParamsTypes";
import { calculateAge, formatDateToISO, formatPhoneNumber } from "@/utils/directus";
import { RadioInput } from "@/components/Forms/Radio";
import { sendVerificationSMS, verifyCode } from "@/services/twilio";
import CountdownTimer from "@/components/CountdownTimer";
import { validateSchemaSignUp } from '@/schema-validations/sign-up-validation';

export default function SignUp() {
    const window = useWindowDimensions();
    const contentWidth = window.width;
    const { login } = useAuth();

    const { id_role_default } = useContext(ConfigContext);
    const { t } = useContext(TranslationContext);
    const config = useContext(ConfigContext);

    const [loading, setLoading] = useState(false);
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [step, setStep] = useState(1);
    const [verificationCode, setVerificationCode] = useState('');

    const [legalDocuments, setLegalDocuments] = useState<LegalDocumentsTypes[]>([]);
    const [activeDocument, setActiveDocument] = useState<"terms" | "privacy" | null>(null);
    const [userObject, setUserObject] = useState<any>(null);
    const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);
    const [isMinor, setIsMinor] = useState<boolean>(false);
    const alert = useContext(AlertContext);

    // Animações
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    const validationSchema = validateSchemaSignUp(isMinor);
    type FormDataProps = Yup.InferType<typeof validationSchema>;

    useEffect(() => {
        async function fetchData() {
            const params: GlobalQueryParams = {
                filter: { status: { _eq: 'published' } },
                sort: 'name'
            }
            const infosLegalDocuments = await getItems('legal_documents');
            const setores = await getItems('setores', params);
            setSectors(setores)
            setLegalDocuments(infosLegalDocuments)
        }

        fetchData();

        // Animação de entrada
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    const toggleTermsModal = () => {
        setIsTermsModalVisible(!isTermsModalVisible);
    };

    const { control, handleSubmit, trigger, formState: { errors, isValid } } = useForm<FormDataProps>({
        resolver: yupResolver(validationSchema),
        mode: 'all'
    });

    const onCheckFormAndSubmit = () => {
        trigger().then(isFormValid => {
            if (!isFormValid) {
                alert.error("Por favor, preencha todos os campos obrigatórios");
            } else {
                handleSubmit(handleSignUp)();
            }
        });
    };

    async function handleSignUp(dataUserForm: FormDataProps) {
        setLoading(true)
        const formattedBirthdate = formatDateToISO(dataUserForm.birthdate);

        const newUserObject = {
            ...dataUserForm,
            title: t('member_unaadeb'),
            description: t('member_description'),
            role: id_role_default,
            birthdate: formattedBirthdate,
        }

        try {
            const formattedPhoneNumber = formatPhoneNumber(dataUserForm.phone);
            const statusVerification = await sendVerificationSMS(formattedPhoneNumber, 'sms');
            alert.success(`Código enviado para ${statusVerification.to}`, 8000)

            setUserObject(newUserObject);
            
            // Animação de transição para o próximo passo
            Animated.timing(progressAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setStep(2);
            });
        } catch (error) {
            alert.error(`Erro ao enviar código: ${error}`)
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyCode = async () => {
        const formattedPhoneNumber = formatPhoneNumber(userObject.phone);
        const codigoFormatado = verificationCode.replace(/-/g, "");
        setLoading(true)
        try {
            const verificationCheckType = await verifyCode(formattedPhoneNumber, codigoFormatado);

            if (verificationCheckType.status === 'approved') {
                const user = await setUser(userObject);
                if (user) {
                    await login(userObject.email, userObject.password);
                    alert.success(`Bem-vindo(a), ${user.first_name}!`)
                }
            } else {
                alert.error(`Código inválido. Tente novamente.`);
            }
        } catch (e) {
            console.error(e)
            alert.error(`Erro na verificação. Tente novamente.`);
        } finally {
            setLoading(false)
        }
    };

    const radioOptions = [
        { value: 'masculino', label: 'Masculino' },
        { value: 'feminino', label: 'Feminino' },
    ];

    const handleBirthdateChange = (birthdate: string) => {
        const age = calculateAge(birthdate)
        if (age < 18) {
            setIsMinor(age < 18);
            alert.warning('Menores de idade devem informar dados do responsável.', 10000)
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

    if (step === 2) {
        return (
            <AuthLayout gradientColors={gradientColors}>
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        flex: 1,
                        justifyContent: 'center'
                    }}
                >
                    <Center className="mb-8">
                        <Box className="w-32 h-32 bg-green-500/20 rounded-full items-center justify-center mb-6">
                            <FontAwesome6 name="shield-halved" size={60} color="#10b981" />
                        </Box>
                        <Heading className="text-white text-2xl font-bold mb-2">
                            Verificação de Segurança
                        </Heading>
                        <Text className="text-center text-white/70 px-8">
                            Enviamos um código de 6 dígitos para o número cadastrado. 
                            Digite-o abaixo para confirmar sua identidade.
                        </Text>
                    </Center>

                    <VStack className="space-y-6">
                        <Center>
                            <CountdownTimer />
                        </Center>

                        <CustomInput
                            className="text-center text-2xl font-bold h-16"
                            placeholder="0-0-0-0-0-0"
                            value={verificationCode}
                            onChangeText={setVerificationCode}
                            keyboardType="numeric"
                            style={{ letterSpacing: 8, color: 'white' }}
                            mask={{
                                type: 'custom',
                                options: {
                                    mask: '9-9-9-9-9-9'
                                }
                            }}
                        />

                        <Button
                            className="rounded-xl bg-green-500 h-14"
                            onPress={handleVerifyCode}
                            isDisabled={verificationCode.replace(/-/g, '').length !== 6}
                        >
                            {loading ? (
                                <ButtonSpinner color="white" />
                            ) : (
                                <>
                                    <MaterialIcons
                                        name="verified-user"
                                        size={20}
                                        color="white"
                                        style={{marginRight: 8}}
                                    />
                                    <ButtonText className="font-semibold text-base">
                                        Verificar Código
                                    </ButtonText>
                                </>
                            )}
                        </Button>

                        <Pressable
                            onPress={() => setStep(1)}
                            className="items-center mt-4"
                        >
                            <Text className="text-white/60 text-sm">
                                Não recebeu o código? <Text className="text-blue-400 font-semibold">Voltar</Text>
                            </Text>
                        </Pressable>
                    </VStack>
                </Animated.View>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout gradientColors={gradientColors}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <AuthHeader 
                        title="Criar Conta"
                        subtitle="Junte-se à comunidade UNAADEB"
                        showLogo={true}
                    />

                    <VStack className="space-y-4">
                        {/* Dados Pessoais */}
                        <Box className="space-y-3">
                            <HStack className="space-x-3">
                                <Box className="flex-1">
                                    <AuthInput
                                        control={control}
                                        name="first_name"
                                        label="Nome"
                                        placeholder="Seu nome"
                                        error={errors.first_name}
                                        leftIcon="person"
                                    />
                                </Box>
                                <Box className="flex-1">
                                    <AuthInput
                                        control={control}
                                        name="last_name"
                                        label="Sobrenome"
                                        placeholder="Seu sobrenome"
                                        error={errors.last_name}
                                    />
                                </Box>
                            </HStack>

                            <AuthInput
                                control={control}
                                name="birthdate"
                                label="Data de Nascimento"
                                placeholder="DD/MM/AAAA"
                                error={errors.birthdate}
                                leftIcon="calendar-today"
                                mask={{
                                    type: 'custom',
                                    options: {
                                        mask: '99/99/9999'
                                    }
                                }}
                            />

                            {/* Dados do Responsável (para menores) */}
                            {isMinor && (
                                <Box className="border-l-4 border-yellow-400 pl-4 space-y-3 bg-yellow-400/10 rounded-r-lg p-3">
                                    <Heading className="text-yellow-400 text-lg font-semibold">
                                        Dados do Responsável
                                    </Heading>
                                    <AuthInput
                                        control={control}
                                        name="nome_responsavel"
                                        label="Nome do Responsável"
                                        placeholder="Nome completo"
                                        error={errors.nome_responsavel}
                                    />
                                    <AuthInput
                                        control={control}
                                        name="email_responsavel"
                                        label="Email do Responsável"
                                        placeholder="email@exemplo.com"
                                        error={errors.email_responsavel}
                                        type="email"
                                    />
                                    <AuthInput
                                        control={control}
                                        name="telefone_responsavel"
                                        label="Telefone do Responsável"
                                        placeholder="(00) 00000-0000"
                                        error={errors.telefone_responsavel}
                                        mask={{
                                            type: 'cel-phone',
                                            options: {
                                                maskType: 'BRL',
                                                withDDD: true,
                                                dddMask: '(99) ',
                                            }
                                        }}
                                    />
                                </Box>
                            )}

                            <Controller
                                control={control}
                                name="sector"
                                render={({ field: { onChange } }) => (
                                    <CustomSelect
                                        options={sectors}
                                        labelKey="name"
                                        valueKey="id"
                                        placeholder="Selecione seu setor"
                                        onValueChange={onChange}
                                        errorMessage={errors.sector?.message}
                                        className="bg-white/10 border-white/20"
                                    />
                                )}
                            />

                            <AuthInput
                                control={control}
                                name="email"
                                label="Email"
                                placeholder="seu@email.com"
                                error={errors.email}
                                type="email"
                                leftIcon="email"
                            />

                            <AuthInput
                                control={control}
                                name="phone"
                                label="Celular"
                                placeholder="(00) 00000-0000"
                                error={errors.phone}
                                leftIcon="phone"
                                mask={{
                                    type: 'cel-phone',
                                    options: {
                                        maskType: 'BRL',
                                        withDDD: true,
                                        dddMask: '(99) ',
                                    }
                                }}
                            />

                            <AuthInput
                                control={control}
                                name="password"
                                label="Senha"
                                placeholder="Mínimo 8 caracteres"
                                error={errors.password}
                                type="password"
                                leftIcon="lock"
                            />

                            <AuthInput
                                control={control}
                                name="password_confirmed"
                                label="Confirmar Senha"
                                placeholder="Digite a senha novamente"
                                error={errors.password_confirmed}
                                type="password"
                                leftIcon="lock"
                            />

                            <Controller
                                control={control}
                                name="gender"
                                render={({ field: { onChange, value } }) => (
                                    <RadioInput
                                        message="Sexo"
                                        value={value}
                                        options={radioOptions}
                                        onChange={onChange}
                                        errorMessage={errors.gender?.message}
                                        className="text-white"
                                    />
                                )}
                            />

                            {/* Termos e Condições */}
                            <Controller
                                control={control}
                                name="acceptTerms"
                                defaultValue={false}
                                render={({ field: { onChange, value } }) => (
                                    <Box>
                                        <CheckboxCustom
                                            field={{
                                                onChange: (isChecked) => onChange(isChecked),
                                                value: '',
                                                isChecked: !!value,
                                            }}
                                            label="Aceito os termos e condições"
                                            error={errors.acceptTerms?.message}
                                            className="text-white"
                                        />
                                        <HStack className="mt-2 flex-wrap">
                                            <Text className="text-white/70 text-sm">
                                                Li e concordo com os{' '}
                                            </Text>
                                            <Pressable
                                                onPress={() => {
                                                    toggleTermsModal();
                                                    setActiveDocument('terms');
                                                }}
                                            >
                                                <Text className="text-blue-400 text-sm font-semibold">
                                                    Termos de Uso
                                                </Text>
                                            </Pressable>
                                            <Text className="text-white/70 text-sm"> e </Text>
                                            <Pressable
                                                onPress={() => {
                                                    toggleTermsModal();
                                                    setActiveDocument('privacy');
                                                }}
                                            >
                                                <Text className="text-blue-400 text-sm font-semibold">
                                                    Política de Privacidade
                                                </Text>
                                            </Pressable>
                                        </HStack>
                                    </Box>
                                )}
                            />
                        </Box>

                        {/* Botão de Cadastro */}
                        <Button
                            className="rounded-xl bg-blue-500 h-14 mt-6"
                            onPress={onCheckFormAndSubmit}
                            isDisabled={loading}
                        >
                            {loading ? (
                                <ButtonSpinner color="white" />
                            ) : (
                                <>
                                    <Ionicons
                                        name="person-add"
                                        size={20}
                                        color="white"
                                        style={{marginRight: 8}}
                                    />
                                    <ButtonText className="font-semibold text-base">
                                        Criar Conta
                                    </ButtonText>
                                </>
                            )}
                        </Button>

                        {/* Link para Login */}
                        <HStack className="justify-center mt-4">
                            <Text className="text-white/70 text-sm">
                                Já tem uma conta?
                            </Text>
                            <Link href="/(auth)/sign-in" asChild>
                                <Pressable>
                                    <Text className="text-blue-400 text-sm font-semibold ml-1">
                                        Fazer login
                                    </Text>
                                </Pressable>
                            </Link>
                        </HStack>
                    </VStack>
                </Animated.View>
            </ScrollView>

            {/* Modal de Termos */}
            {isTermsModalVisible && (
                <Modal isOpen={isTermsModalVisible} onClose={toggleTermsModal}>
                    <ModalContent>
                        <ModalCloseButton />
                        <ModalHeader>
                            {activeDocument === "terms" ? "Termos de Uso" : "Política de Privacidade"}
                        </ModalHeader>
                        <ModalBody>
                            <RenderHtml
                                contentWidth={contentWidth}
                                source={{
                                    html:
                                        activeDocument === "terms"
                                            ? legalDocuments.find((doc) => doc.type === "terms")?.content || ""
                                            : legalDocuments.find((doc) => doc.type === "privacy")?.content || ""
                                }}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button 
                                className="bg-blue-500" 
                                onPress={toggleTermsModal}
                            >
                                <ButtonText>Fechar</ButtonText>
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            )}
        </AuthLayout>
    );
}