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
    Flex, Box, Button as NBButton
} from "native-base";
import RenderHtml from 'react-native-render-html';
import * as Yup from "yup";
import {Controller, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup/dist/yup";
import {useContext, useEffect, useState} from "react";
import {Button} from '@/components/Button'
import {CustomSelect} from '@/components/Select'
import {Input} from '@/components/input'
import {Platform} from "react-native";
import {emailExists, setUser} from "@/services/user";
import {getItems} from "@/services/items";
import {LegalDocumentsTypes} from "@/types/LegalDocumentsTypes";
import ConfigContext from "@/contexts/ConfigContext";
import TranslationContext from "@/contexts/TranslationContext";
import CheckboxCustom from "@/components/Checkbox";
import {useAuth} from "@/contexts/AuthContext";
import colors from "@/constants/colors";
import AlertContext from "@/contexts/AlertContext";
import {Sector} from "@/types/Sector";
import {GlobalQueryParams} from "@/types/GlobalQueryParamsTypes";
import {formatPhoneNumber} from "@/utils/directus";
import {RadioInput} from "@/components/Radio";
import {sendVerificationSMS, verifyCode} from "@/services/twilio";
import CountdownTimer from "@/components/CountdownTimer";
import { FontAwesome6 } from '@expo/vector-icons';


const signUpSchema = Yup.object({
    first_name: Yup.string().trim().min(2, 'O primeiro nome deve ter pelo menos 2 caracteres').required('O primeiro nome é obrigatório'),
    last_name: Yup.string().trim().min(2, 'O sobrenome deve ter pelo menos 2 caracteres').required('O sobrenome é obrigatório'),
    email: Yup.string()
        .email('Digite um email válido')
        .required('Email é obrigatório')
        .test(
            'check-email-exists',
            'Este e-mail já está cadastrado',
            async (value) => {
                const exists = await emailExists(value);
                return !exists; // retornar true se o e-mail NÃO existir
            }
        ),
    password: Yup.string().min(4, 'Senha deve ter no mínimo 4 caracteres').required('Senha é obrigatória'),
    sector: Yup.string().required('Escolha seu setor'),
    gender: Yup.string().required('O campo sexo deve ser preenchido'),
    phone: Yup.string().required('O campo telefone deve ser preenchido').matches(
        /^(\([0-9]{2}\)\s)?([0-9]{4,5}-[0-9]{4})$/,
        'Número de telefone inválido'
    ),
    birthdate: Yup.string().required('O campo Data de Nascimento deve ser preenchido')
        .test('is-valid-date', 'Data de Nascimento inválida', (value) => {
            if (!value) return false; // verifica se o valor é nulo
            const parts = value.split('/');
            if (parts.length !== 3) return false; // verifica se a data está no formato DD/MM/AAAA

            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // mês é indexado a partir de 0
            const year = parseInt(parts[2], 10);

            const date = new Date(year, month, day);
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0); // zera as horas para comparar apenas a data

            // Verifica se a data é válida e se não é uma data futura
            return date && date.getMonth() === month && date.getDate() === day && date.getFullYear() === year && date <= currentDate;
        }),
    password_confirmed: Yup.string().oneOf([Yup.ref('password'), null], 'As senhas não coincidem.'),
    acceptTerms: Yup.boolean().oneOf([true], 'Você deve aceitar os Termos de Uso e a Política de Privacidade para se cadastrar'),
})

type FormDataProps = Yup.InferType<typeof signUpSchema>;

const FormSigUpUser = () => {
    const window = useWindowDimensions();
    const contentWidth = window.width;
    const {login} = useAuth();

    const {id_role_default, project_logo} = useContext(ConfigContext);
    const {t} = useContext(TranslationContext);

    const [loading, setLoading] = useState(false);
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [step, setStep] = useState(1); // Controla o passo atual do fluxo
    const [verificationCode, setVerificationCode] = useState(''); // Armazena o código de verificação inserido pelo usuário

    const [legalDocuments, setLegalDocuments] = useState<LegalDocumentsTypes[]>([]);
    const [activeDocument, setActiveDocument] = useState<"terms" | "privacy" | null>(null);
    const [userObject, setUserObject] = useState<any>(null);
    const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);
    const alert = useContext(AlertContext)

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

    const {control, handleSubmit, trigger, formState: {errors, isValid}} = useForm<FormDataProps>({
        resolver: yupResolver(signUpSchema),
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

    const formatDateToISO = (birthdate) => {
        const parts = birthdate.split('/');
        const formattedDate = new Date(parts[2], parts[1] - 1, parts[0]); // Note que os meses são indexados a partir de 0
        return formattedDate.toISOString(); // Converte para o formato ISO string
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
            console.error(error)
            // const message = handleErrors(error.errors);
            alert.error('Não consigos enviar o código de rastreio')
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyCode = async () => {
        const formattedPhoneNumber = formatPhoneNumber(userObject.phone);

        try {
            const verificationCheckType = await verifyCode(formattedPhoneNumber, verificationCode);

            if (verificationCheckType.status === 'approved') {
                const user = await setUser(userObject);
                if(user){
                    await login(userObject.email, userObject.password);
                    alert.success(`Usuário ${user.first_name} cadastrado com sucesso`)
                }
            } else {
                alert.error(`Código de verificação inválido com status: ${verificationCheckType.status}`);
            }
        }catch (e) {
            console.error(e)
            alert.error('Erro no processo de verificação do código.');
        }
    };

    const radioOptions = [
        { value: 'masculino', label: 'Masculino' },
        { value: 'feminino', label: 'Feminino' },
    ];

    const keyExtractor = (_: any, index: number) => index.toString();

    const calculateAge = (birthdate) => {
        // Converte a data de DD/MM/AAAA para AAAA-MM-DD
        const parts = birthdate.split('/');
        const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

        const birthDate = new Date(formattedDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const isMinor = (birthdate) => {
        const age = calculateAge(birthdate);
        return age < 18; // Retorna true se o usuário for menor de idade, false caso contrário
    };


    const renderItem = () => (
        <VStack>
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
                            onBlur={() => {
                                if (isMinor(value)) {
                                    // Coloque aqui sua lógica para lidar com menores de idade
                                    alert.error("Usuários menores de idade não são permitidos.");
                                }
                            }}
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
                <Controller
                    control={control}
                    name={'sector'}
                    render={({field: {onChange}}) => (
                        <CustomSelect
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
                        isLoadingText="Cadastrando..."/>
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
                    <Box p={10} width={'100%'}>
                        <Box alignContent={'center'} alignItems={'center'} p={10}>
                            <FontAwesome6 name="comment-sms" size={150} color={colors.secundary3} />
                        </Box>
                        <Box pb={4}>
                            <Text textAlign={'center'}>Insira o código de 6 dígitos que enviamos para o seu número de telefone. Este código ajuda a verificar sua identidade e proteger sua conta.</Text>
                        </Box>
                        <Box p={4} textAlign={"center"} width={'100%'}>
                            <CountdownTimer />
                        </Box>
                        <Input
                            size={'2xl'}
                            mb={4}
                            placeholder="Código de verificação"
                            value={verificationCode}
                            onChangeText={setVerificationCode}
                            keyboardType="numeric"
                        />
                        <Button shadow={'6'} size={'lg'} title="Verificar Código" onPress={handleVerifyCode} />
                        <NBButton shadow={'6'} size={'lg'} variant={'link'} onPress={handleVerifyCode}>Enviar código novamente</NBButton>
                    </Box>
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
