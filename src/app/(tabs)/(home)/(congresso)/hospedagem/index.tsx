import React, {useContext, useEffect, useState} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {
    Select,
    CheckIcon,
    Center,
    Box,
    Switch,
    Text,
    Heading,
    KeyboardAvoidingView,
    ScrollView,
    Divider
} from 'native-base';
import * as Yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';
import {useAuth} from "@/contexts/AuthContext";
import {Button} from "@/components/Button";
import AlertContext from "@/contexts/AlertContext";
import {RadioInput} from "@/components/Radio";
import {Sector} from "@/types/Sector";
import {GlobalQueryParams} from "@/types/GlobalQueryParamsTypes";
import {getItems} from "@/services/items";
import {Platform} from "react-native";
import {Input} from "@/components/input";

const schema = Yup.object().shape({
    iam: Yup.string().required('(Eu sou) é obrigatório'),
    accommodation: Yup.string().required('Acomodação é obrigatória'),
    children: Yup.string().required('Children é obrigatória'),
    email_answerable: Yup.string().required('Email do responsável é obrigatório'),
    take_medication: Yup.string().required('O campo Medicamentos/Cuidados Médicos é obrigatório'),
    take_medication_description: Yup.string().required('O campo descrição dos medicamentos e cuidado médicos é obrigatório'),
    blood_type: Yup.string().required('O campo Tipo sanguíneo é obrigatório'),
    blood_type_rh: Yup.string().required('O campo Fator RH é obrigatório'),
    allergies: Yup.string().required('O campo Alergias é obrigatório'),
    allergies_description: Yup.string().required('O campo descrição da alergia é obrigatório'),
});

const RegistrationForm = () => {
    const {user} = useAuth();
    const [sectors, setSectors] = useState<Sector[]>([]);
    const alert = useContext(AlertContext)

    type FormDataProps = Yup.InferType<typeof schema>;

    const {control, handleSubmit, trigger, formState: {errors, isValid}} = useForm<FormDataProps>({
        resolver: yupResolver(schema),
        mode: 'all'
    });

    useEffect(() => {
        // Função para carregar os setores da API
        const loadSectors = async () => {
            const params: GlobalQueryParams = {
                filter: {status: {_eq: 'published'}},
                sort: 'name'
            }
            const setores = await getItems<Sector[]>('setores', params);
            setSectors(setores)
        };
        loadSectors();
    }, []);

    const onCheckFormAndSubmit = () => {
        // Força a validação de todos os campos do formulário
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

    const radioOptionsIam = [
        {value: '1', label: 'Adolescente'},
        {value: '2', label: 'Líder local da UNAADEB'},
        {value: '3', label: 'Líder setorial da UNAADEB'},
        {value: '4', label: 'Outros'},
    ];
    const optionsChildrens = [
        {value: '1', label: 'Não estarei acompanhado.'},
        {value: '2', label: 'Sim, estarei com meu filho menor de 10 anos'},
        {value: '3', label: 'Sim, estarei com meu filha menor de 10 anos'},
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
        {value: null, label: 'Não sei meu tipo sanguíneo.'},
    ];
    const optionsBloodYypeRh = [
        {value: 'positivo', label: 'Positivo'},
        {value: 'negativo', label: 'Negativo'},
        {value: null, label: 'Não sei meu fator Rh'},
    ];

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{flex: 1}}
        >
            <ScrollView>
                <Box p={4}>
                    <Controller
                        control={control}
                        name={'iam'}
                        render={({field: {onChange, value}}) => (
                            <>
                                <Heading>Eu sou:</Heading>
                                <RadioInput
                                    stackType={'vertical'}
                                    message=""
                                    value={value}
                                    options={radioOptionsIam}
                                    onChange={onChange}
                                    errorMessage={errors.iam?.message}
                                />
                            </>
                        )}
                    />
                    <Divider my={4} />
                    <Controller
                        control={control}
                        name={'accommodation'}
                        render={({field: {onChange, value}}) => (
                            <>
                                <Heading>Alojamento:</Heading>
                                <Text>
                                    A Secretaria de Hospedagem estará disponibilizando espaços no Arena Hall, local de
                                    realização do Congresso, para os inscritos para a hospedagem 2023.
                                </Text>
                                <Switch onChange={onChange}/>
                                <Text> {errors.accommodation?.message}</Text>
                            </>
                        )}
                    />
                    <Divider my={4} />
                    <Controller
                        control={control}
                        name={'children'}
                        render={({field: {onChange, value}}) => (
                            <>
                                <Heading>Hospedagem de crianças:</Heading>
                                <RadioInput
                                    stackType={'vertical'}
                                    message=""
                                    value={value}
                                    options={optionsChildrens}
                                    onChange={onChange}
                                    errorMessage={errors.children?.message}
                                />
                            </>
                        )}
                    />
                    <Divider my={4} />
                    <Controller
                        control={control}
                        name={'email_answerable'}
                        render={({field: {onChange, value}}) => (
                            <>
                                <Heading>E-mail do responsável:</Heading>
                                <Input
                                    placeholder={'Digite o e-mail'}
                                    value={value}
                                    onChange={onChange}
                                    errorMessage={errors.email_answerable?.message}
                                />
                            </>
                        )}
                    />
                    <Divider my={4} />
                    <Controller
                        control={control}
                        name={'take_medication'}
                        render={({field: {onChange, value}}) => (
                            <>
                                <Heading>Faz uso de medicamentos e/ou está sob cuidados médicos?</Heading>
                                <RadioInput
                                    stackType={'vertical'}
                                    message=""
                                    value={value}
                                    options={optionsTrueFalse}
                                    onChange={onChange}
                                    errorMessage={errors.take_medication?.message}
                                />
                            </>
                        )}
                    />
                    <Controller
                        control={control}
                        name={'take_medication_description'}
                        render={({field: {onChange, value}}) => (
                            <>
                                <Input
                                    placeholder={'Especifique o uso de medicamentos e os cuidados médicos necessários:'}
                                    value={value}
                                    onChange={onChange}
                                    errorMessage={errors.take_medication_description?.message}
                                />
                            </>
                        )}
                    />
                    <Divider my={4} />
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
                    <Divider my={4} />
                    <Controller
                        control={control}
                        name={'blood_type_rh'}
                        render={({field: {onChange, value}}) => (
                            <>
                                <Heading>Tipo sanguíneo:</Heading>
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
                    <Divider my={4} />
                    <Controller
                        control={control}
                        name={'allergies'}
                        render={({field: {onChange, value}}) => (
                            <>
                                <Heading>Possui alergia:</Heading>
                                <RadioInput
                                    stackType={'vertical'}
                                    message=""
                                    value={value}
                                    options={optionsTrueFalse}
                                    onChange={onChange}
                                    errorMessage={errors.allergies?.message}
                                />
                            </>
                        )}
                    />
                    <Controller
                        control={control}
                        name={'allergies_description'}
                        render={({field: {onChange, value}}) => (
                            <>
                                <Input
                                    placeholder={'Especifique qual alergia:'}
                                    value={value}
                                    onChange={onChange}
                                    errorMessage={errors.allergies_description?.message}
                                />
                            </>
                        )}
                    />
                    <Divider my={4} />
                    <Controller
                        control={control}
                        name={'emergency_contact'}
                        render={({field: {onChange, value}}) => (
                            <>
                                <Heading pb={4}>Em caso de acidente ou mal súbito ligar para:</Heading>
                                <Input
                                    placeholder={'Em caso de acidente ou mal súbito ligar para:'}
                                    value={value}
                                    onChange={onChange}
                                    errorMessage={errors.emergency_contact?.message}
                                />
                            </>
                        )}
                    />
                    <Divider my={4} />

                    <Button title={'Cadastrar'}
                            height={12}
                            mt="2"
                            onPress={onCheckFormAndSubmit}
                        // isLoading={loading}
                            isLoadingText="Cadastrando..."/>
                </Box>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default RegistrationForm;
