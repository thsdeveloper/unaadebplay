import * as React from "react";
import {useWindowDimensions, FlatList} from 'react-native';
import {
    Heading,
    VStack,
    Text,
    KeyboardAvoidingView,
    Checkbox,
    Pressable,
    Modal,
    Flex, Box, Button as NBButton, StatusBar, ScrollView, HStack
} from "native-base";
import RenderHtml from 'react-native-render-html';
import * as Yup from "yup";
import {Controller, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup/dist/yup";
import {useContext, useEffect, useState} from "react";
import {Button} from '@/components/Button'
import {CustomSelect} from '@/components/Forms/Select'
import {Input} from '@/components/Forms/Input'
import {Platform} from "react-native";
import {setUser} from "@/services/user";
import {getItems} from "@/services/items";
import {LegalDocumentsTypes} from "@/types/LegalDocumentsTypes";
import ConfigContext from "@/contexts/ConfigContext";
import TranslationContext from "@/contexts/TranslationContext";
import CheckboxCustom from "@/components/Forms/Checkbox";
import {useAuth} from "@/contexts/AuthContext";
import colors from "@/constants/colors";
import AlertContext from "@/contexts/AlertContext";
import {Sector} from "@/types/Sector";
import {GlobalQueryParams} from "@/types/GlobalQueryParamsTypes";
import {calculateAge, formatDateToISO, formatPhoneNumber} from "@/utils/directus";
import {RadioInput} from "@/components/Forms/Radio";
import {sendVerificationSMS, verifyCode} from "@/services/twilio";
import CountdownTimer from "@/components/CountdownTimer";
import {FontAwesome6} from '@expo/vector-icons';
import {validateSchemaSignUp} from '@/schema-validations/sign-up-validation'


const FormSigUpUser = () => {
    const window = useWindowDimensions();
    const contentWidth = window.width;
    const {login} = useAuth();

    const {id_role_default} = useContext(ConfigContext);
    const {t} = useContext(TranslationContext);

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
                filter: {status: {_eq: 'published'}},
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

    const {control, handleSubmit, trigger, formState: {errors, isValid, isLoading}} = useForm<FormDataProps>({
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
        {value: 'masculino', label: 'Masculino'},
        {value: 'feminino', label: 'Feminino'},
    ];

    const keyExtractor = (_: any, index: number) => index.toString();

    const handleBirthdateChange = (birthdate: string) => {
        const age = calculateAge(birthdate)
        if(age < 18){
            setIsMinor(age < 18);
            alert.warning('Usuários menores de idade devem preencher informações do responsável legal.', 10000)
        }

    };


    const renderItem = () => (
        <VStack>
            <StatusBar barStyle="dark-content"/>
            <Box p={4}>
                <Heading mt="2" textAlign={"center"} color="light.600" fontWeight="medium" size="sm" px={2}>
                    {t('description_sign_up')}
                </Heading>
            </Box>
            <VStack space={3} mt="0" p={4}>
                <Controller
                    control={control}
                    name={'first_name'}
                    render={({field: {onChange}}) => (
                        <Input
                            placeholder={'Nome'}
                            placeholderTextColor={'gray.400'}
                            onChangeText={onChange}
                            errorMessage={errors.first_name?.message}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    )}/>
                <Controller
                    control={control}
                    name={'last_name'}
                    render={({field: {onChange}}) => (
                        <Input
                            placeholder={'Sobrenome'}
                            placeholderTextColor={'gray.400'}
                            onChangeText={onChange}
                            errorMessage={errors.last_name?.message}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    )}/>
                <Controller
                    control={control}
                    name={'birthdate'}
                    render={({field: {onChange, value}}) => (
                        <Input
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
                    <VStack space={2} borderLeftWidth={4} borderLeftColor={'coolGray.400'} pl={2}>
                        <Heading size={'md' +
                            ''}>Dados do responsável</Heading>
                        <Controller
                            control={control}
                            name={'email_responsavel'}
                            render={({field: {onChange}}) => (
                                <Input
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
                            render={({field: {onChange}}) => (
                                <Input
                                    placeholder={'Nome do Responsável'}
                                    onChangeText={onChange}
                                    errorMessage={errors.nome_responsavel?.message}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name={'telefone_responsavel'}
                            render={({field: {onChange, value}}) => (
                                <Input
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
                    render={({field: {onChange}}) => (
                        <CustomSelect
                            maxLength={50}
                            options={sectors}
                            labelKey="name"
                            valueKey="id"
                            placeholder="Selecione o seu setor"
                            onValueChange={onChange}
                            errorMessage={errors.sector?.message}
                        />
                    )}/>
                <Controller
                    control={control}
                    name={'email'}
                    render={({field: {onChange}}) => (
                        <Input
                            placeholder={'E-mail'}
                            placeholderTextColor={'gray.400'}
                            onChangeText={onChange}
                            errorMessage={errors.email?.message}
                            autoCapitalize="none"
                            keyboardType={'email-address'}
                            autoCorrect={false}
                        />
                    )}/>
                <Controller
                    control={control}
                    name={'phone'}
                    render={({field: {onChange, value}}) => (
                        <Input
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
                    render={({field: {onChange}}) => (
                        <Input
                            type={'password'}
                            placeholder={'Senha'}
                            placeholderTextColor={'gray.400'}
                            onChangeText={onChange}
                            errorMessage={errors.password?.message}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    )}/>
                <Controller
                    control={control}
                    name={'password_confirmed'}
                    render={({field: {onChange}}) => (
                        <Input
                            type={'password'}
                            placeholder={'Confirme a senha'}
                            placeholderTextColor={'gray.400'}
                            onChangeText={onChange}
                            errorMessage={errors.password_confirmed?.message}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    )}/>
                <Controller
                    control={control}
                    name={'gender'}
                    render={({field: {onChange, value}}) => (
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
                    rules={{required: 'Você deve aceitar os termos e condições.'}}
                    render={({field: {onChange, value}}) => {
                        return (
                            <Checkbox.Group>
                                <Flex flexDirection="row">
                                    <CheckboxCustom
                                        field={{
                                            onChange: (isChecked) => onChange(isChecked),
                                            value: '',
                                            isChecked: !!value,
                                        }}
                                        label="Aceito os termos e condições"
                                        error={errors.acceptTerms?.message}
                                    />
                                </Flex>
                                <Flex flexDirection="row">
                                    <Text fontSize="sm" pr={1}>
                                        Veja os
                                    </Text>
                                    <Pressable
                                        onPress={() => {
                                            toggleTermsModal();
                                            setActiveDocument('terms');
                                        }}
                                    >
                                        <Text color="blue.500" pr={1}>Termos de Uso</Text>
                                    </Pressable>
                                    <Text fontSize="sm" pr={1}>
                                        e
                                    </Text>
                                    <Pressable
                                        onPress={() => {
                                            toggleTermsModal();
                                            setActiveDocument('privacy');
                                        }}
                                    >
                                        <Text color="blue.500">Política de Privacidade</Text>
                                    </Pressable>
                                </Flex>
                            </Checkbox.Group>
                        );
                    }}
                />
                <Button title={'Cadastrar'}
                        height={12}
                        mt="2"
                        onPress={onCheckFormAndSubmit}
                        isLoading={loading}
                        isLoadingText="Aguarde..."/>
            </VStack>
        </VStack>
    );

    return (
        <>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{flex: 1}}
            >
                {step === 1 && (
                    <>
                        <FlatList
                            data={[0]} // Fornecer um único elemento para renderizar
                            renderItem={renderItem}
                            keyExtractor={keyExtractor}
                            contentContainerStyle={{paddingHorizontal: 10, paddingBottom: 100}}
                        />

                        <Modal isOpen={isTermsModalVisible} onClose={toggleTermsModal} width={"full"}>
                            <Modal.Content>
                                <Modal.CloseButton/>
                                <Modal.Header>{activeDocument === "terms" ? "Termos de Uso" : "Política de Privacidade"}</Modal.Header>
                                <Modal.Body>
                                    <RenderHtml
                                        contentWidth={contentWidth} // contentWidth deve ser definido
                                        source={{
                                            html:
                                                activeDocument === "terms"
                                                    ? legalDocuments.find((doc) => doc.type === "terms")?.content || ""
                                                    : legalDocuments.find((doc) => doc.type === "privacy")?.content || ""
                                        }}
                                    />
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button title={`Fechar`} onPress={toggleTermsModal}/>
                                </Modal.Footer>
                            </Modal.Content>
                        </Modal>
                    </>
                )}

                {step === 2 && (
                    <ScrollView contentContainerStyle={{flexGrow: 1}}>
                        <Box p={10} width={'100%'}>
                            <Box alignContent={'center'} alignItems={'center'} p={10}>
                                <FontAwesome6 name="comment-sms" size={150} color={colors.secundary3}/>
                            </Box>
                            <Box pb={4}>
                                <Text textAlign={'center'}>Insira o código de 6 dígitos que enviamos para o seu número
                                    de telefone. Este código ajuda a verificar sua identidade e proteger sua
                                    conta.</Text>
                            </Box>
                            <HStack p={4} textAlign={"center"} justifyContent={'center'} width={'100%'}>
                                <CountdownTimer/>
                            </HStack>
                            <Input
                                size={'2xl'}
                                mb={4}
                                textAlign={"center"}
                                height={20}
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
                            <NBButton onPress={handleVerifyCode} rounded={"full"} colorScheme={'danger'} height={16} isLoading={loading} isLoadingText={'Verificando codigo...'}>Verificar código</NBButton>
                        </Box>
                    </ScrollView>
                )}

            </KeyboardAvoidingView>
        </>
    );
};

export default function SignUp() {
    return (
        <FormSigUpUser/>
    );
};
