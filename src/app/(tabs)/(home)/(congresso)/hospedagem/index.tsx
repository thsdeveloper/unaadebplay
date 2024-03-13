import React, {useContext, useEffect, useState} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {
    Box,
    Text,
    Heading,
    KeyboardAvoidingView,
    ScrollView,
    Divider, Button, Center, HStack
} from 'native-base';
import * as Yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';
import {useAuth} from "@/contexts/AuthContext";
import AlertContext from "@/contexts/AlertContext";
import {RadioInput} from "@/components/Forms/Radio";
import {getItemSingleton} from "@/services/items";
import {Platform} from "react-native";
import {Switch} from "@/components/Forms/Switch";
import colors from "@/constants/colors";
import {Input} from "@/components/Forms/Input";
import {HospedagemTypes} from "@/types/HospedagemTypes";
import {HospedagemSkeleton} from "@/components/Skeletons/HospedagemSkeletons";
import {formatCurrency} from "@/utils/directus";
import {MaterialIcons} from "@expo/vector-icons";

const schema = Yup.object({
    accommodation: Yup.boolean().required('Você deve concordar com o termo').oneOf([true], 'Você deve concordar com o termo'),
    child_companion: Yup.boolean().required('O campo acompanhante é obrigatório'),
    take_medication: Yup.boolean().required('O campo medicamentos é obrigatório'),
    take_medication_description: Yup.string().defined('Descrição dos medicamentos é obrigatória'),
    blood_type: Yup.string().required('O campo Tipo sanguíneo é obrigatório'),
    blood_type_rh: Yup.string().required('O campo Fator RH é obrigatório'),
    allergies: Yup.boolean().required('O campo alergia é obrigatório'),
    allergies_description: Yup.string().required('O campo descrição da alergia é obrigatório'),
    emergency_contact: Yup.string().required('O campo contato de emergência é obrigatório'),
});

const RegistrationFormHospedagem = () => {
    const {user} = useAuth();
    const [hos, setHos] = useState<HospedagemTypes>();
    const [dataForms, setDataForms] = useState<FormDataProps>();
    const [loading, setLoading] = useState<boolean>(true);
    const alert = useContext(AlertContext)

    useEffect(() => {
        const loadData = async () => {
            try {
                const [hospedagens] = await Promise.all([
                    getItemSingleton<HospedagemTypes>('hospedagem'),
                ]);
                setHos(hospedagens);
            } catch (error) {
                alert.error("Houve um erro ao carregar os dados. Por favor, tente novamente mais tarde.", 10000);
            }finally {
                setLoading(false)
            }
        };

        loadData();
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
            accommodation: false,
            take_medication: false,
            child_companion: false,
            allergies: false,
        },
        mode: 'all'
    });

    const takeMedicationValue = watch('take_medication');
    const allergiesValue = watch('allergies');

    const onCheckFormAndSubmit = (data: FormDataProps) => {
        setDataForms(data)

        trigger().then((isFormValid: any) => {
            if (!isFormValid) {
                // Se o formulário não estiver válido, mostra um alerta de erro
                alert.error("Existem campos que faltam ser preenchidos");
            } else {
                // Se o formulário estiver válido, prepara os dados para submissão
                // handleSubmit(handleSignUp)();
            }
        });
    };
    const optionsChildrens = [
        {value: 'sem_acompanhantes', label: 'Não estarei acompanhado.'},
        {value: 'com_acompanhantes', label: 'Sim, estarei com meu filho menor de 10 anos'},
        {value: 'com_acompanhantes', label: 'Sim, estarei com meu filha menor de 10 anos'},
    ];
    const optionsTrueFalse = [
        {value: true, label: 'Sim'},
        {value: false, label: 'Não'},
    ];
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
                                <MaterialIcons name="pix" size={40} color={colors.dark} />
                                <Text pr={20}>No momento o nosso método de pagamento será o PIX identificado. Estamos trabalhando para fornecer outros meio de pagamento.</Text>
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
                                            A Secretaria de Hospedagem estará disponibilizando espaços no Arena Hall, local de
                                            realização do Congresso, para os inscritos para a hospedagem 2023. Será fornecido
                                            somente o colchonete, cada inscrito deverá levar sua roupa de cama, travesseiro e
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
                                        <Heading pb={2}>Faz uso de medicamentos e/ou está sob cuidados médicos?</Heading>
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
                                name="accommodation"
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Heading pb={2}>Orientações, regras e normas gerais:</Heading>
                                        <Text pb={2}>
                                            Direitos do inscrito: Colchonete para a hospedagem; A alimentação será
                                            café-da-manhã, almoço e jantar no dia 10/06; A Pulseira de identificação que servirá
                                            como um passaporte para as refeições e alojamentos. Obs: como a hospedagem será no
                                            próprio Arena Hall, não teremos transporte incluso na hospedagem.
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
                                name="accommodation"
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Text pb={2}>
                                            O primeiro objetivo da hospedagem é Apoiar a Diretoria Geral da UNAADEB na
                                            realização da hospedagem para o Congresso Geral, oferecendo um local acessível aos
                                            congressistas que optarem por se hospedar no evento.
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
                                name="accommodation"
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Text pb={2}>
                                            Como o Congresso é um local de reunião e adoração à Deus, esperamos de cada um,
                                            atitude digna de cristão, observando os critérios disciplinares, evitando conversas
                                            apimentadas, gritarias, algazarras e todo comportamento que possa prejudicar o
                                            ambiente harmonioso.
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
                                name="accommodation"
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Text pb={2}>
                                            A distribuição dos inscritos nos respectivos alojamentos será por Setores da ADEB,
                                            desde que a inscrição seja realizada até 02/06 (Sexta-feira), a partir desta data
                                            não serão aceitas novas inscrições por meio deste formulário. No início do
                                            Congresso, se ainda estiverem vagas, a Secretaria de Hospedagem irá disponibilizar
                                            vagas para novos inscritos, não sendo garantido que o inscrito fique junto com seu
                                            Setor.
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
                                name="accommodation"
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Text pb={2}>
                                            A troca de alojamentos não será autorizada, a não ser por motivo justificado à
                                            Secretaria de Hospedagem.
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
                                name="accommodation"
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Text pb={2}>
                                            Os hóspedes devem zelar pela conservação dos alojamentos, mantendo sempre arrumados
                                            e limpos os quartos e banheiros dos locais de hospedagem.
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
                                name="accommodation"
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Text pb={2}>
                                            Só será permitida a presença nos alojamentos de pessoas devidamente inscritas pela
                                            Secretaria de Hospedagem. Não será permitido o ingresso de meninos no alojamento das
                                            meninas e vice-versa.
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
                                name="accommodation"
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Text pb={2}>
                                            O inscrito menor, só poderá se ausentar dos locais programados com prévia
                                            autorização do responsável e informado à Secretaria de Hospedagem para controle.
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
                                name="accommodation"
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Text pb={2}>
                                            Os inscritos deverão zelar pelos seus objetos de valor e/ou aparelhos eletrônicos,
                                            sendo os mesmos de responsabilidade única e exclusiva do seu dono, eximindo de
                                            qualquer responsabilidade a Secretaria de Hospedagem.
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
                                name="accommodation"
                                render={({field: {onChange, value}}) => (
                                    <>
                                        <Text pb={2}>
                                            Concordo com as Regra e Normas Gerais. Estou ciente que se desrespeitar as Regras e
                                            Normas acima, poderei ter a minha permanência suspensa a qualquer momento e meus
                                            pais e/ou responsáveis poderão ter sua presença solicitada pela Secretaria de
                                            Hospedagem e o valor pago por mim não será restituído. Todos os assuntos omissos
                                            neste regulamento serão tratados pela Secretaria de Hospedagem.
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

                            {/*<Button*/}
                            {/*    size={'lg'}*/}
                            {/*    rounded={'full'}*/}
                            {/*    mt="2"*/}
                            {/*    onPress={handleSubmit(onCheckFormAndSubmit)}*/}
                            {/*    isLoading={isSubmitting}*/}
                            {/*    isLoadingText="Cadastrando...">*/}
                            {/*    Cadastrar*/}
                            {/*</Button>*/}

                            <Box backgroundColor={"blue.900"}>
                                <Text color={colors.light}>
                                    {JSON.stringify(dataForms, null, 2)}
                                </Text>
                            </Box>
                        </Box>
                    </ScrollView>
                    <Center position="absolute" bottom={0} p={2} width="100%" backgroundColor={colors.white} shadow={4}>
                        {/* O uso de safeArea.bottom garante que o botão não sobreponha a área de segurança em dispositivos com entalhe ou bordas arredondadas */}
                        <Button
                            size={'lg'}
                            colorScheme={'danger'}
                            rounded={'full'}
                            onPress={handleSubmit(onCheckFormAndSubmit)}
                            isLoading={isSubmitting}
                            isLoadingText="Cadastrando..."
                            width="100%" // Ajuste a largura conforme necessário
                        >
                            Inscreva-se agora!
                        </Button>
                    </Center>
                </>
            ): (
                <>
                <Box>
                    <HospedagemSkeleton />
                </Box>
                </>
            )}
        </KeyboardAvoidingView>
    );
};

export default RegistrationFormHospedagem;
