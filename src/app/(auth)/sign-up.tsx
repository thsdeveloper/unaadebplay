import * as React from "react";
import { useWindowDimensions, FlatList, Platform } from 'react-native';
import RenderHtml from 'react-native-render-html';
import * as Yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import { useContext, useEffect, useState } from "react";

// Componentes locais
import {
    Box
} from "@/components/ui/box";
import {
    VStack
} from "@/components/ui/vstack";
import {
    HStack
} from "@/components/ui/hstack";
import {
    Text
} from "@/components/ui/text";
import {
    Heading
} from "@/components/ui/heading";
import {
    KeyboardAvoidingView
} from "@/components/ui/keyboard-avoiding-view";
import {
    Pressable
} from "@/components/ui/pressable";
import {
    ScrollView
} from "@/components/ui/scroll-view";
import {
    Center
} from "@/components/ui/center";
import {
    Modal,
    ModalContent,
    ModalCloseButton,
    ModalHeader,
    ModalBody,
    ModalFooter
} from "@/components/ui/modal";
import {
    Checkbox,
    CheckboxIndicator,
    CheckboxIcon,
    CheckboxLabel,
    CheckboxGroup
} from "@/components/ui/checkbox";

// Componentes de formulário e outras importações
import { Button } from '@/components/Button';
import { CustomSelect } from '@/components/Forms/Select';
import { CustomInput } from '@/components/Forms/Input';
import { setUser } from "@/services/user";
import { getItems } from "@/services/items";
import { LegalDocumentsTypes } from "@/types/LegalDocumentsTypes";
import ConfigContext from "@/contexts/ConfigContext";
import TranslationContext from "@/contexts/TranslationContext";
import CheckboxCustom from "@/components/Forms/Checkbox";
import { useAuth } from "@/contexts/AuthContext";
import colors from "@/constants/colors";
import AlertContext from "@/contexts/AlertContext";
import { Sector } from "@/types/Sector";
import { GlobalQueryParams } from "@/types/GlobalQueryParamsTypes";
import { calculateAge, formatDateToISO, formatPhoneNumber } from "@/utils/directus";
import { RadioInput } from "@/components/Forms/Radio";
import { sendVerificationSMS, verifyCode } from "@/services/twilio";
import CountdownTimer from "@/components/CountdownTimer";
import { FontAwesome6 } from '@expo/vector-icons';
import { validateSchemaSignUp } from '@/schema-validations/sign-up-validation';
import { StatusBar } from "expo-status-bar";

const FormSigUpUser = () => {
    const window = useWindowDimensions();
    const contentWidth = window.width;
    const { login } = useAuth();

    const { id_role_default } = useContext(ConfigContext);
    const { t } = useContext(TranslationContext);

    const [loading, setLoading] = useState(false);
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [step, setStep] = useState(1); // Controla o passo atual do fluxo
    const [verificationCode, setVerificationCode] = useState(''); // Armazena o código de verificação inserido pelo usuário

    const [legalDocuments, setLegalDocuments] = useState<LegalDocumentsTypes[]>([]);
    const [activeDocument, setActiveDocument] = useState<"terms" | "privacy" | null>(null);
    const [userObject, setUserObject] = useState<any>(null);
    const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);
    const [isMinor, setIsMinor] = useState<boolean>(false);
    const alert = useContext(AlertContext)

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
    }, []);

    const toggleTermsModal = () => {
        setIsTermsModalVisible(!isTermsModalVisible);
    };

    const { control, handleSubmit, trigger, formState: { errors, isValid, isLoading } } = useForm<FormDataProps>({
        resolver: yupResolver(validationSchema),
        mode: 'all'
    });

    const onCheckFormAndSubmit = () => {
        // Força a validação de todos os campos do formulário
        trigger().then(isFormValid => {
            if (!isFormValid) {
                // Se o formulário não estiver válido, mostra um alerta de erro
                alert.error("Existem campos que faltam ser preenchidos");
            } else {
                // Se o formulário estiver válido, prepara os dados para submissão
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
            alert.success(`SMS enviado com sucesso, confirme o código de acesso para o número ${statusVerification.to}`, 8000)

            setUserObject(newUserObject);
            setStep(2);
        } catch (error) {
            alert.error(`Não foi possível enviar o código de ativação: ${error}`)
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
                    alert.success(`Usuário ${user.first_name} cadastrado com sucesso!`)
                }
            } else {
                alert.error(`Código de verificação inválido com status: ${verificationCheckType.status}`);
            }
        } catch (e) {
            console.error(e)
            alert.error(`Erro no processo de verificação do código. ${codigoFormatado}`);
        } finally {
            setLoading(false)
        }
    };

    const radioOptions = [
        { value: 'masculino', label: 'Masculino' },
        { value: 'feminino', label: 'Feminino' },
    ];

    const keyExtractor = (_: any, index: number) => index.toString();

    const handleBirthdateChange = (birthdate: string) => {
        const age = calculateAge(birthdate)
        if (age < 18) {
            setIsMinor(age < 18);
            alert.warning('Usuários menores de idade devem preencher informações do responsável legal.', 10000)
        }
    };

    const renderItem = () => (
        <VStack>
            <StatusBar style="dark" />
            <Box className="p-4">
                <Heading className="mt-2 text-center text-gray-600 font-medium px-2" size="sm">
                    {t('description_sign_up')}
                </Heading>
            </Box>
            <VStack className="space-y-3 mt-0 p-4">
                <Controller
                    control={control}
                    name={'first_name'}
                    render={({ field: { onChange } }) => (
                        <CustomInput
                            placeholder={'Nome'}
                            placeholderTextColor={'gray.400'}
                            onChangeText={onChange}
                            errorMessage={errors.first_name?.message}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    )} />
                <Controller
                    control={control}
                    name={'last_name'}
                    render={({ field: { onChange } }) => (
                        <CustomInput
                            placeholder={'Sobrenome'}
                            placeholderTextColor={'gray.400'}
                            onChangeText={onChange}
                            errorMessage={errors.last_name?.message}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    )} />
                <Controller
                    control={control}
                    name={'birthdate'}
                    render={({ field: { onChange, value } }) => (
                        <CustomInput
                            placeholder={'Data de Nascimento'}
                            value={value}
                            onChangeText={onChange}
                            errorMessage={errors.birthdate?.message}
                            keyboardType={'numeric'}
                            onBlur={() => handleBirthdateChange(value)}
                            mask={{
                                type: 'custom',
                                options: {
                                    // Define uma máscara para data no formato DD/MM/AAAA
                                    mask: '99/99/9999'
                                }
                            }}
                        />
                    )}
                />

                {isMinor && (
                    <VStack className="space-y-2 border-l-4 border-gray-400 pl-2">
                        <Heading size="md">Dados do responsável</Heading>
                        <Controller
                            control={control}
                            name={'email_responsavel'}
                            render={({ field: { onChange } }) => (
                                <CustomInput
                                    placeholder={'E-mail do Responsável'}
                                    onChangeText={onChange}
                                    keyboardType={'email-address'}
                                    errorMessage={errors.email_responsavel?.message}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name={'nome_responsavel'}
                            render={({ field: { onChange } }) => (
                                <CustomInput
                                    placeholder={'Nome do Responsável'}
                                    onChangeText={onChange}
                                    errorMessage={errors.nome_responsavel?.message}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name={'telefone_responsavel'}
                            render={({ field: { onChange, value } }) => (
                                <CustomInput
                                    placeholder={'Telefone do Responsável'}
                                    onChangeText={onChange}
                                    value={value}
                                    errorMessage={errors.telefone_responsavel?.message}
                                    mask={{
                                        type: 'cel-phone',
                                        options: {
                                            maskType: 'BRL',
                                            withDDD: true,
                                            dddMask: '(99) ',
                                        }
                                    }}
                                />
                            )}
                        />
                    </VStack>
                )}

                <Controller
                    control={control}
                    name={'sector'}
                    render={({ field: { onChange } }) => (
                        <CustomSelect
                            maxLength={50}
                            options={sectors}
                            labelKey="name"
                            valueKey="id"
                            placeholder="Selecione o seu setor"
                            onValueChange={onChange}
                            errorMessage={errors.sector?.message}
                        />
                    )} />
                <Controller
                    control={control}
                    name={'email'}
                    render={({ field: { onChange } }) => (
                        <CustomInput
                            placeholder={'E-mail'}
                            placeholderTextColor={'gray.400'}
                            onChangeText={onChange}
                            errorMessage={errors.email?.message}
                            autoCapitalize="none"
                            keyboardType={'email-address'}
                            autoCorrect={false}
                        />
                    )} />
                <Controller
                    control={control}
                    name={'phone'}
                    render={({ field: { onChange, value } }) => (
                        <CustomInput
                            placeholder={'Celular'}
                            value={value}
                            onChangeText={onChange}
                            errorMessage={errors.phone?.message}
                            mask={{
                                type: 'cel-phone',
                                options: {
                                    maskType: 'BRL',
                                    withDDD: true,
                                    dddMask: '(99) ',
                                }
                            }}
                        />
                    )}
                />
                <Controller
                    control={control}
                    name={'password'}
                    render={({ field: { onChange } }) => (
                        <CustomInput
                            isPassword={true}
                            placeholder={'Senha'}
                            placeholderTextColor={'gray.400'}
                            onChangeText={onChange}
                            errorMessage={errors.password?.message}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    )} />
                <Controller
                    control={control}
                    name={'password_confirmed'}
                    render={({ field: { onChange } }) => (
                        <CustomInput
                            isPassword={true}
                            placeholder={'Confirme a senha'}
                            placeholderTextColor={'gray.400'}
                            onChangeText={onChange}
                            errorMessage={errors.password_confirmed?.message}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    )} />
                <Controller
                    control={control}
                    name={'gender'}
                    render={({ field: { onChange, value } }) => (
                        <RadioInput
                            message="Sexo?"
                            value={value}
                            options={radioOptions}
                            onChange={onChange}
                            errorMessage={errors.gender?.message}
                        />
                    )}
                />
                <Controller
                    control={control}
                    name="acceptTerms"
                    defaultValue={false}
                    rules={{ required: 'Você deve aceitar os termos e condições.' }}
                    render={({ field: { onChange, value } }) => {
                        return (
                            <Box>
                                <CheckboxCustom
                                    field={{
                                        onChange: (isChecked) => onChange(isChecked),
                                        value: '',
                                        isChecked: !!value,
                                    }}
                                    label="Aceito os termos e condições"
                                    error={errors.acceptTerms?.message}
                                />
                                <HStack className="mt-1">
                                    <Text className="text-sm pr-1">
                                        Veja os
                                    </Text>
                                    <Pressable
                                        onPress={() => {
                                            toggleTermsModal();
                                            setActiveDocument('terms');
                                        }}
                                    >
                                        <Text className="text-blue-500 pr-1">Termos de Uso</Text>
                                    </Pressable>
                                    <Text className="text-sm pr-1">
                                        e
                                    </Text>
                                    <Pressable
                                        onPress={() => {
                                            toggleTermsModal();
                                            setActiveDocument('privacy');
                                        }}
                                    >
                                        <Text className="text-blue-500">Política de Privacidade</Text>
                                    </Pressable>
                                </HStack>
                            </Box>
                        );
                    }}
                />
                <Button
                    title={'Cadastrar'}
                    height={12}
                    className="mt-2"
                    onPress={onCheckFormAndSubmit}
                    isLoading={loading}
                    isLoadingText="Aguarde..."
                />
            </VStack>
        </VStack>
    );

    return (
        <>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                {step === 1 && (
                    <>
                        <FlatList
                            data={[0]} // Fornecer um único elemento para renderizar
                            renderItem={renderItem}
                            keyExtractor={keyExtractor}
                            contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 100 }}
                        />

                        {isTermsModalVisible && (
                            <Modal isOpen={isTermsModalVisible} onClose={toggleTermsModal}>
                                <ModalContent>
                                    <ModalCloseButton />
                                    <ModalHeader>{activeDocument === "terms" ? "Termos de Uso" : "Política de Privacidade"}</ModalHeader>
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
                                        <Button title={`Fechar`} onPress={toggleTermsModal} />
                                    </ModalFooter>
                                </ModalContent>
                            </Modal>
                        )}
                    </>
                )}

                {step === 2 && (
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                        <Box className="p-10 w-full">
                            <Center className="p-10">
                                <FontAwesome6 name="comment-sms" size={150} color={colors.secundary3} />
                            </Center>
                            <Box className="pb-4">
                                <Text className="text-center">
                                    Insira o código de 6 dígitos que enviamos para o seu número
                                    de telefone. Este código ajuda a verificar sua identidade e proteger sua
                                    conta.
                                </Text>
                            </Box>
                            <HStack className="p-4 justify-center w-full">
                                <CountdownTimer />
                            </HStack>
                            <CustomInput
                                className="text-center h-20 mb-4"
                                size="2xl"
                                placeholder="Código de verificação"
                                value={verificationCode}
                                onChangeText={setVerificationCode}
                                keyboardType="numeric"
                                mask={{
                                    type: 'custom',
                                    options: {
                                        mask: '9-9-9-9-9-9'
                                    }
                                }}
                            />
                            <Button
                                title={loading ? "Verificando código..." : "Verificar código"}
                                className="rounded-full"
                                height={16}
                                backgroundColor={colors.secundary3}
                                onPress={handleVerifyCode}
                                isLoading={loading}
                            />
                        </Box>
                    </ScrollView>
                )}
            </KeyboardAvoidingView>
        </>
    );
};

export default function SignUp() {
    return (
        <FormSigUpUser />
    );
};
