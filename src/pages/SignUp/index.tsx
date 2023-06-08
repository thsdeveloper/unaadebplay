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
    Flex, Box
} from "native-base";
import RenderHtml from 'react-native-render-html';
import * as Yup from "yup";
import {Controller, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup/dist/yup";
import {loadSectors, SectorItem} from "../../services/sector";
import {useContext, useEffect, useState} from "react";
import {Button} from '../../components/Button'
import {CustomSelect} from '../../components/Select'
import {Input} from '../../components/input'
import {Platform} from "react-native";
import {createUser, emailExists} from "../../services/user";
import {AxiosError} from "axios";
import {getItems} from "../../services/items";
import {LegalDocumentsTypes} from "../../types/LegalDocumentsTypes";
import ConfigContext from "../../contexts/ConfigContext";
import TranslationContext from "../../contexts/TranslationContext";
import CheckboxCustom from "../../components/Checkbox";
import {Image} from "../../components/Image";
import {useAuth} from "../../contexts/AuthContext";
import {handleErrors} from "../../services/api";
import colors from "../../constants/colors";
import AlertContext from "../../contexts/AlertContext";
import {RadioInput} from "../../components/Radio";


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
    password_confirmed: Yup.string().oneOf([Yup.ref('password'), null], 'As senhas não coincidem.'),
    acceptTerms: Yup.boolean().oneOf([true], 'Você deve aceitar os Termos de Uso e a Política de Privacidade para se cadastrar'),
})

type FormDataProps = Yup.InferType<typeof signUpSchema>;

const FormSigUpUser = () => {
    const window = useWindowDimensions();
    const contentWidth = window.width;
    const {signed, signIn} = useAuth();

    //Informacoes de configuracoes
    const config = useContext(ConfigContext);
    const {t} = useContext(TranslationContext);

    const [loading, setLoading] = useState(false);
    const [sectors, setSectors] = useState<SectorItem[]>([]);

    const [legalDocuments, setLegalDocuments] = useState<LegalDocumentsTypes[]>([]);
    const [activeDocument, setActiveDocument] = useState<"terms" | "privacy" | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);
    const alert = useContext(AlertContext)

    useEffect(() => {
        loadSectors(setSectors, setIsLoading, setError);

        async function fetchData() {
            const infosLegalDocuments = await getItems<LegalDocumentsTypes>('legal_documents');
            setLegalDocuments(infosLegalDocuments)
        }

        fetchData();
    }, []);

    const toggleTermsModal = () => {
        setIsTermsModalVisible(!isTermsModalVisible);
    };

    const {control, handleSubmit, formState: {errors, isValid}} = useForm<FormDataProps>({
        resolver: yupResolver(signUpSchema),
        mode: 'all'
    });

    async function handleSignUp(dataUserForm: FormDataProps) {
        setLoading(true)

        const user = {
            ...dataUserForm,
            title: t('member_unaadeb'),
            description: t('member_description'),
            role: config.id_role_default,
        }
        try {
            const response = await createUser(user);
            if(response?.status === 200){
                await signIn(dataUserForm.email, dataUserForm.password);
                alert.success(`Usuário ${user.first_name} cadastrado com sucesso`)
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                const message = handleErrors(error.response.data.errors);
                alert.error(message)
            } else {
                alert.error('Error: 748, Entre em contato com o administrador!')
            }
        } finally {
            setLoading(false)
        }
    }

    const keyExtractor = (_: any, index: number) => index.toString();

    const renderItem = () => (
        <VStack>
            <Box backgroundColor={colors.secundary} p={4}>
                <Image assetId={config.project_logo}
                       alt={'title'}
                       width={'100%'}
                       height={'10'}
                       resizeMode="contain"/>
                <Heading mt="1" textAlign={"center"} color="gray.100" fontWeight="medium" size="xs" px={4}>
                    {t('description_sign_up')}
                </Heading>
            </Box>
            <VStack space={3} mt="5" p={4}>
                <Controller
                    control={control}
                    name={'first_name'}
                    render={({field: {onChange}}) => (
                        <Input
                            placeholder={'Primeiro nome'}
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
                            placeholder={'Segundo nome'}
                            placeholderTextColor={'gray.400'}
                            onChangeText={onChange}
                            errorMessage={errors.last_name?.message}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    )}/>
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
                            autoCorrect={false}
                        />
                    )}/>
                <Controller
                    control={control}
                    name={'phone'}
                    render={({field: {onChange, value}}) => (
                        <Input
                            placeholder={'Telefone'}
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
                    name={'gender'}
                    render={({field: {onChange, value}}) => (
                        <RadioInput
                            message={'Escolha o seu gênero:'}
                            errorMessage={errors.gender?.message}
                            options={[
                                { value: 'masculino', label: 'Masculino' },
                                { value: 'feminino', label: 'Feminino' },
                            ]}
                            value={value}
                            onChange={onChange}
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
                        onPress={handleSubmit(handleSignUp)}
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
                <FlatList
                    data={[0]} // Fornecer um único elemento para renderizar
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={{paddingHorizontal: 0}}
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
            </KeyboardAvoidingView>
        </>
    );
};

export default function SignUp() {
    return (
        <FormSigUpUser/>
    );
};
