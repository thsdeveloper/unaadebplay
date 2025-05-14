import React, {useContext, useEffect, useState} from 'react';
import {useForm, Controller} from 'react-hook-form';
import * as Yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';
import {useAuth} from "@/contexts/AuthContext";
import AlertContext from "@/contexts/AlertContext";
import {RadioInput} from "@/components/Forms/Radio";
import {getItems, getItemSingleton, setCreateItem, setUpdateItem} from "@/services/items";
import {KeyboardAvoidingView, Platform, ScrollView} from "react-native";
import {Switch} from "@/components/Forms/Switch";
import colors from "@/constants/colors";
import {CustomInput } from "@/components/Forms/Input";
import {HospedagemTypes} from "@/types/HospedagemTypes";
import {HospedagemSkeleton} from "@/components/Skeletons/HospedagemSkeletons";
import {formatCurrency} from "@/utils/directus";
import {MaterialIcons} from "@expo/vector-icons";
import {SubscribedHosTypes} from "@/types/SubscribedHosTypes";
import {router} from 'expo-router';
import {Box} from "@/components/ui/box";
import {Heading} from "@/components/ui/heading";
import {HStack} from "@/components/ui/hstack";

const schema = Yup.object({
    accommodation: Yup.boolean().required('Você deve concordar com o termo').oneOf([true], 'Você deve concordar com o termo'),
    child_companion: Yup.boolean().required('O campo acompanhante é obrigatório'),
    take_medication: Yup.boolean().required('O campo medicamentos é obrigatório'),
    take_medication_description: Yup.string().optional(),
    blood_type: Yup.string().required('O campo Tipo sanguíneo é obrigatório'),
    blood_type_rh: Yup.string().required('O campo Fator RH é obrigatório'),
    allergies: Yup.boolean().required('O campo alergia é obrigatório'),
    allergies_description: Yup.string().optional(),
    emergency_contact: Yup.string().required('O campo contato de emergência é obrigatório'),

    normas_um: Yup.boolean().required('Você deve concordar com o termo').oneOf([true], 'Você deve concordar com o termo'),
    normas_dois: Yup.boolean().required('Você deve concordar com o termo').oneOf([true], 'Você deve concordar com o termo'),
    normas_tres: Yup.boolean().required('Você deve concordar com o termo').oneOf([true], 'Você deve concordar com o termo'),
    normas_quatro: Yup.boolean().required('Você deve concordar com o termo').oneOf([true], 'Você deve concordar com o termo'),
    normas_cinco: Yup.boolean().required('Você deve concordar com o termo').oneOf([true], 'Você deve concordar com o termo'),
    normas_seis: Yup.boolean().required('Você deve concordar com o termo').oneOf([true], 'Você deve concordar com o termo'),
    normas_sete: Yup.boolean().required('Você deve concordar com o termo').oneOf([true], 'Você deve concordar com o termo'),
    normas_oito: Yup.boolean().required('Você deve concordar com o termo').oneOf([true], 'Você deve concordar com o termo'),
    normas_nove: Yup.boolean().required('Você deve concordar com o termo').oneOf([true], 'Você deve concordar com o termo'),
    normas_dez: Yup.boolean().required('Você deve concordar com o termo').oneOf([true], 'Você deve concordar com o termo'),

    member: Yup.string().required()
});

const RegistrationFormHospedagem = () => {
    const {user} = useAuth();
    const [hos, setHos] = useState<HospedagemTypes>();
    const [dataForms, setDataForms] = useState<FormDataProps>();
    const [loading, setLoading] = useState<boolean>(true);
    const [paymentData, setPaymentData] = useState(null);
    const alert = useContext(AlertContext)

    useEffect(() => {
        const loadHospedagem = async () => {
            try {
                const [hospedagens] = await Promise.all([
                    getItemSingleton<HospedagemTypes>('hospedagem'),
                ]);
                setHos(hospedagens);
            } catch (error) {
                alert.error("Houve um erro ao carregar os dados. Por favor, tente novamente mais tarde.", 10000);
            } finally {
                setLoading(false)
            }
        };
        loadHospedagem();
    }, []);


    type FormDataProps = Yup.InferType<typeof schema>;

    const {
        control,
        handleSubmit,
        trigger,
        watch,
        formState: {
            errors,
            isValid,
            isSubmitting,
            isLoading
        }
    } = useForm<FormDataProps>({
        resolver: yupResolver(schema),
        defaultValues: {
            member: user?.id,
            accommodation: false,
            take_medication: false,
            child_companion: false,
            allergies: false,
        },
        mode: 'all'
    });

    const takeMedicationValue = watch('take_medication');
    const allergiesValue = watch('allergies');

    const onCheckFormAndSubmit = async (data: FormDataProps) => {
        try {
            const filter = {
                filter: {
                    member: {
                        _eq: user?.id, // Utiliza o operador _eq para buscar registros com user_id igual ao userId
                    },
                },
            };
            const existingRecords = await getItems<SubscribedHosTypes[]>('subscribed_hos', filter);
            if (existingRecords && existingRecords.length > 0) {
                alert.warning('Já existe um registro de hospedagem para esse usuário. Consulte na página do congresso para mais informações', 10000)
            } else {
                const response = await setCreateItem<SubscribedHosTypes>('subscribed_hos', data);
                if (response) {
                    router.replace('/(tabs)/(home)/(congresso)/cartao-acesso');
                    alert.success('Inscrição realizada com sucesso')
                }
            }

        } catch (e) {
            alert.error('Erro no processo de inscrição da hospedagem')
        }

        setDataForms(data)

        trigger().then((isFormValid: any) => {
            if (!isFormValid) {
                alert.error("Existem campos que faltam ser preenchidos");
            } else {
                // Se o formulário estiver válido, prepara os dados para submissão
                // handleSubmit(handleSignUp)();
            }
        });
    };
    const optionsBloodYype = [
        {value: 'a', label: 'A'},
        {value: 'b', label: 'B'},
        {value: 'ab', label: 'AB'},
        {value: 'o', label: 'O'},
        {value: 'nao_sabe', label: 'Não sei meu tipo sanguíneo.'},
    ];
    const optionsBloodYypeRh = [
        {value: 'positivo', label: 'Positivo'},
        {value: 'negativo', label: 'Negativo'},
        {value: 'nao_sabe', label: 'Não sei meu fator Rh'},
    ];

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{flex: 1}}
        >
            {!loading ? (
                <>
                    <ScrollView>
                        <Box p={4} mb={20}>
                            <Box>
                                <Heading>Solicitante, {user?.first_name}</Heading>
                                <Heading size={'sm'}>Investimento: {formatCurrency(hos?.custo)}</Heading>
                            </Box>

                            <HStack backgroundColor={'orange.200'} p={2} my={4} alignItems={'center'} space={2}>
                                <MaterialIcons name="pix" size={40} color={colors.dark}/>
                                <Text pr={20}>No momento o nosso método de pagamento será o PIX identificado. Estamos
                                    trabalhando para fornecer outros meio de pagamento.</Text>
                            </HStack>
                            <Text>{hos?.regras}</Text>
                            <Divider my={4}/>
                            <Controller
                                control={control}
                                name="accommodation"
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Heading pb={2}>Alojamento:</Heading>
                                        <Text pb={2}>
                                            A Secretaria de Hospedagem estará disponibilizando espaços no Arena Hall,
                                            local de
                                            realização do Congresso, para os inscritos para a hospedagem 2023. Será
                                            fornecido
                                            somente o colchonete, cada inscrito deverá levar sua roupa de cama,
                                            travesseiro e
                                            itens de higiene pessoal.
                                        </Text>
                                        <Switch
                                            textTrue={'Concordo'}
                                            textFalse={'Discordo'}
                                            value={value}
                                            onChange={onChange}
                                            errorMessage={errors.accommodation?.message}
                                        />
                                    </>
                                )}
                            />


                            <Divider my={4}/>
                            <Controller
                                control={control}
                                name={'child_companion'}
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Heading pb={2}>Hospedagem de crianças:</Heading>
                                        <Switch
                                            textTrue={'com acompanhado'}
                                            textFalse={'Sem acompanhante'}
                                            value={value}
                                            onChange={onChange}
                                            message={'Crianças de até 10 anos só podem se hospedar quando acompanhados por um dos pais ou representante legal. A criança menor de 10 anos é isenta do pagamento. Lembrando que os alojamentos são separados para meninos/varões e meninas/irmãs.'}
                                            errorMessage={errors.child_companion?.message}
                                        />
                                    </>
                                )}
                            />
                            <Divider my={4}/>
                            <Controller
                                control={control}
                                name={'take_medication'}
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Heading pb={2}>Faz uso de medicamentos e/ou está sob cuidados
                                            médicos?</Heading>
                                        <Switch
                                            textTrue={'Sim'}
                                            textFalse={'Não'}
                                            value={value}
                                            onChange={onChange}
                                            errorMessage={errors.take_medication?.message}
                                        />
                                    </>
                                )}
                            />
                            {takeMedicationValue === true && (
                                <Controller
                                    control={control}
                                    name="take_medication_description"
                                    render={({field: {onChange, value, onBlur}}) => (
                                        <Input
                                            mt={2}
                                            placeholder={'Especifique o uso de medicamentos e os cuidados médicos necessários:'}
                                            value={value}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            errorMessage={errors.take_medication_description?.message}
                                        />
                                    )}
                                />
                            )}
                            <Divider my={4}/>
                            <Controller
                                control={control}
                                name={'blood_type'}
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Heading>Tipo sanguíneo:</Heading>
                                        <RadioInput
                                            stackType={'vertical'}
                                            message=""
                                            value={value}
                                            options={optionsBloodYype}
                                            onChange={onChange}
                                            errorMessage={errors.blood_type?.message}
                                        />
                                    </>
                                )}
                            />
                            <Divider my={4}/>
                            <Controller
                                control={control}
                                name={'blood_type_rh'}
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Heading>Fator Rh:</Heading>
                                        <RadioInput
                                            stackType={'vertical'}
                                            message=""
                                            value={value}
                                            options={optionsBloodYypeRh}
                                            onChange={onChange}
                                            errorMessage={errors.blood_type_rh?.message}
                                        />
                                    </>
                                )}
                            />
                            <Divider my={4}/>
                            <Controller
                                control={control}
                                name={'allergies'}
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Heading pb={2}>Possui alergia?</Heading>
                                        <Switch
                                            textTrue={'Sim'}
                                            textFalse={'Não'}
                                            value={value}
                                            onChange={onChange}
                                            errorMessage={errors.allergies?.message}
                                        />
                                    </>
                                )}
                            />
                            {allergiesValue === true && (
                                <Controller
                                    control={control}
                                    name={'allergies_description'}
                                    render={({field: {onChange, value}}) => (
                                        <>
                                            <Input
                                                mt={2}
                                                placeholder={'Especifique qual alergia:'}
                                                value={value}
                                                onChangeText={onChange}
                                                errorMessage={errors.allergies_description?.message}
                                            />
                                        </>
                                    )}
                                />
                            )}
                            <Divider my={4}/>
                            <Controller
                                control={control}
                                name={'emergency_contact'}
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Heading pb={4}>Em caso de acidente ou mal súbito ligar para:</Heading>
                                        <Input
                                            placeholder={'Ex: José, 61 999949449'}
                                            value={value}
                                            onChangeText={onChange}
                                            errorMessage={errors.emergency_contact?.message}
                                        />
                                    </>
                                )}
                            />
                            <Divider my={4}/>
                            <Controller
                                control={control}
                                name="normas_um"
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Heading pb={2}>Orientações, regras e normas gerais:</Heading>
                                        <Text pb={2}>
                                            Direitos do inscrito: Colchonete para a hospedagem; A alimentação será
                                            café-da-manhã, almoço e jantar no dia 10/06; A Pulseira de identificação que
                                            servirá
                                            como um passaporte para as refeições e alojamentos. Obs: como a hospedagem
                                            será no
                                            próprio Arena Hall, não teremos transporte incluso na hospedagem.
                                        </Text>
                                        <Switch
                                            textTrue={'Concordo'}
                                            textFalse={'Discordo'}
                                            value={value}
                                            onChange={onChange}
                                            errorMessage={errors.normas_um?.message}
                                        />
                                    </>
                                )}
                            />
                            <Divider my={4}/>
                            <Controller
                                control={control}
                                name="normas_dois"
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Text pb={2}>
                                            O primeiro objetivo da hospedagem é Apoiar a Diretoria Geral da UNAADEB na
                                            realização da hospedagem para o Congresso Geral, oferecendo um local
                                            acessível aos
                                            congressistas que optarem por se hospedar no evento.
                                        </Text>
                                        <Switch
                                            textTrue={'Concordo'}
                                            textFalse={'Discordo'}
                                            value={value}
                                            onChange={onChange}
                                            errorMessage={errors.normas_dois?.message}
                                        />
                                    </>
                                )}
                            />
                            <Divider my={4}/>
                            <Controller
                                control={control}
                                name="normas_tres"
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Text pb={2}>
                                            Como o Congresso é um local de reunião e adoração à Deus, esperamos de cada
                                            um,
                                            atitude digna de cristão, observando os critérios disciplinares, evitando
                                            conversas
                                            apimentadas, gritarias, algazarras e todo comportamento que possa prejudicar
                                            o
                                            ambiente harmonioso.
                                        </Text>
                                        <Switch
                                            textTrue={'Concordo'}
                                            textFalse={'Discordo'}
                                            value={value}
                                            onChange={onChange}
                                            errorMessage={errors.normas_tres?.message}
                                        />
                                    </>
                                )}
                            />
                            <Divider my={4}/>
                            <Controller
                                control={control}
                                name="normas_quatro"
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Text pb={2}>
                                            A distribuição dos inscritos nos respectivos alojamentos será por Setores da
                                            ADEB,
                                            desde que a inscrição seja realizada até 02/06 (Sexta-feira), a partir desta
                                            data
                                            não serão aceitas novas inscrições por meio deste formulário. No início do
                                            Congresso, se ainda estiverem vagas, a Secretaria de Hospedagem irá
                                            disponibilizar
                                            vagas para novos inscritos, não sendo garantido que o inscrito fique junto
                                            com seu
                                            Setor.
                                        </Text>
                                        <Switch
                                            textTrue={'Concordo'}
                                            textFalse={'Discordo'}
                                            value={value}
                                            onChange={onChange}
                                            errorMessage={errors.normas_quatro?.message}
                                        />
                                    </>
                                )}
                            />
                            <Divider my={4}/>
                            <Controller
                                control={control}
                                name="normas_cinco"
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Text pb={2}>
                                            A troca de alojamentos não será autorizada, a não ser por motivo justificado
                                            à
                                            Secretaria de Hospedagem.
                                        </Text>
                                        <Switch
                                            textTrue={'Concordo'}
                                            textFalse={'Discordo'}
                                            value={value}
                                            onChange={onChange}
                                            errorMessage={errors.normas_cinco?.message}
                                        />
                                    </>
                                )}
                            />
                            <Divider my={4}/>
                            <Controller
                                control={control}
                                name="normas_seis"
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Text pb={2}>
                                            Os hóspedes devem zelar pela conservação dos alojamentos, mantendo sempre
                                            arrumados
                                            e limpos os quartos e banheiros dos locais de hospedagem.
                                        </Text>
                                        <Switch
                                            textTrue={'Concordo'}
                                            textFalse={'Discordo'}
                                            value={value}
                                            onChange={onChange}
                                            errorMessage={errors.normas_seis?.message}
                                        />
                                    </>
                                )}
                            />
                            <Divider my={4}/>
                            <Controller
                                control={control}
                                name="normas_sete"
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Text pb={2}>
                                            Só será permitida a presença nos alojamentos de pessoas devidamente
                                            inscritas pela
                                            Secretaria de Hospedagem. Não será permitido o ingresso de meninos no
                                            alojamento das
                                            meninas e vice-versa.
                                        </Text>
                                        <Switch
                                            textTrue={'Concordo'}
                                            textFalse={'Discordo'}
                                            value={value}
                                            onChange={onChange}
                                            errorMessage={errors.normas_sete?.message}
                                        />
                                    </>
                                )}
                            />
                            <Divider my={4}/>
                            <Controller
                                control={control}
                                name="normas_oito"
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Text pb={2}>
                                            O inscrito menor, só poderá se ausentar dos locais programados com prévia
                                            autorização do responsável e informado à Secretaria de Hospedagem para
                                            controle.
                                        </Text>
                                        <Switch
                                            textTrue={'Concordo'}
                                            textFalse={'Discordo'}
                                            value={value}
                                            onChange={onChange}
                                            errorMessage={errors.normas_oito?.message}
                                        />
                                    </>
                                )}
                            />
                            <Divider my={4}/>
                            <Controller
                                control={control}
                                name="normas_nove"
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Text pb={2}>
                                            Os inscritos deverão zelar pelos seus objetos de valor e/ou aparelhos
                                            eletrônicos,
                                            sendo os mesmos de responsabilidade única e exclusiva do seu dono, eximindo
                                            de
                                            qualquer responsabilidade a Secretaria de Hospedagem.
                                        </Text>
                                        <Switch
                                            textTrue={'Concordo'}
                                            textFalse={'Discordo'}
                                            value={value}
                                            onChange={onChange}
                                            errorMessage={errors.normas_nove?.message}
                                        />
                                    </>
                                )}
                            />
                            <Divider my={4}/>
                            <Controller
                                control={control}
                                name="normas_dez"
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Text pb={2}>
                                            Concordo com as Regra e Normas Gerais. Estou ciente que se desrespeitar as
                                            Regras e
                                            Normas acima, poderei ter a minha permanência suspensa a qualquer momento e
                                            meus
                                            pais e/ou responsáveis poderão ter sua presença solicitada pela Secretaria
                                            de
                                            Hospedagem e o valor pago por mim não será restituído. Todos os assuntos
                                            omissos
                                            neste regulamento serão tratados pela Secretaria de Hospedagem.
                                        </Text>
                                        <Switch
                                            textTrue={'Concordo'}
                                            textFalse={'Discordo'}
                                            value={value}
                                            onChange={onChange}
                                            errorMessage={errors.normas_dez?.message}
                                        />
                                    </>
                                )}
                            />
                        </Box>
                    </ScrollView>
                    <Center position="absolute" bottom={0} p={2} width="100%" backgroundColor={colors.white} shadow={4}>
                        <Button
                            size={'lg'}
                            colorScheme={'danger'}
                            rounded={'full'}
                            onPress={handleSubmit(onCheckFormAndSubmit)}
                            isLoading={isSubmitting}
                            isLoadingText="Cadastrando..."
                            width="100%"
                        >
                            Inscreva-se agora!
                        </Button>
                    </Center>
                </>
            ) : (
                <>
                    <Box>
                        <HospedagemSkeleton/>
                    </Box>
                </>
            )}
        </KeyboardAvoidingView>
    );
};

export default RegistrationFormHospedagem;
