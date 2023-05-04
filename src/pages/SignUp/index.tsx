import * as React from "react";
import {useWindowDimensions, FlatList, StyleSheet} from 'react-native';
import {
    Heading,
    VStack,
    Text,
    KeyboardAvoidingView,
    useToast,
    Checkbox,
    Pressable,
    Modal,
    Flex, Box, AspectRatio, View,
} from "native-base";
import RenderHtml from 'react-native-render-html';
import * as Yup from "yup";
import {Controller, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup/dist/yup";
import {emailExists, handleErrors} from "../../utils/directus";
import {loadSectors, SectorItem} from "../../services/sector";
import {useContext, useEffect, useState} from "react";
import {Button} from '../../components/Button'
import {CustomSelect} from '../../components/Select'
import {Input} from '../../components/input'
import {Platform} from "react-native";
import {createUser, getUsers, UserData} from "../../services/user";
import {AxiosError} from "axios";
import {getItems} from "../../services/items";
import {LegalDocuments} from "../../types/LegalDocuments";
import ConfigContext from "../../contexts/ConfigContext";
import TranslationContext from "../../contexts/TranslationContext";
import CheckboxCustom from "../../components/Checkbox";
import {Image} from "../../components/Image";


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

    //Informacoes de configuracoes
    const config = useContext(ConfigContext);
    const {t} = useContext(TranslationContext);

    const [loading, setLoading] = useState(false);
    const [sectors, setSectors] = useState<SectorItem[]>([]);

    const [legalDocuments, setLegalDocuments] = useState<LegalDocuments[]>([]);
    const [activeDocument, setActiveDocument] = useState<"terms" | "privacy" | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);
    const toast = useToast()

    useEffect(() => {
        loadSectors(setSectors, setIsLoading, setError);

        async function fetchData() {
            const infosLegalDocuments = await getItems<LegalDocuments>('legal_documents');
            setLegalDocuments(infosLegalDocuments)
            // Faça algo com os usuários aqui, por exemplo, atualize o estado
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

    async function handleSignUp(data: FormDataProps) {
        data.acceptTerms
        setLoading(true)

        const user: UserData = {
            location: "aa",
            ...data,
            title: t('member_unaadeb'),
            description: t('member_description'),
            tags: null,
            avatar: null,
            language: "pt-BR",
            theme: "auto",
            tfa_secret: null,
            status: "active",
            role: config.id_role_default
        }

        console.log('suserXXX', user)

        try {
            await createUser(user);
            toast.show({title: `Usuário ${user.first_name} cadastrado com sucesso`, bgColor: 'green.500'});
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                // @ts-ignore
                const message = handleErrors(error.response.data.errors);
                toast.show({title: message, bgColor: 'red.500'});
            } else {
                // Trate outros tipos de erros, se necessário
            }
        } finally {
            setLoading(false)
        }
    }

    const keyExtractor = (_: any, index: number) => index.toString();

    const renderItem = () => (
        <VStack p={4} pt={8}>
            <Box>
                <Image assetId={config.project_logo}
                       alt={'title'}
                       size="xs"
                       width="100%"
                       resizeMode="contain"/>
            </Box>
            <Heading mt="1" textAlign={"center"} color="gray.500" fontWeight="medium" size="xs" px={4}>
                {t('description_sign_up')}
            </Heading>

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
                    contentContainerStyle={{paddingHorizontal: 6}}
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
