import * as React from "react";
import {Box, Heading, VStack, FormControl, Center, NativeBaseProvider, useToast} from "native-base";
import * as Yup from "yup";
import {Controller, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup/dist/yup";
import {handleErrors} from "../../utils/directus";
import {useState} from "react";
import {Button} from '../../components/Button'
import {Input} from '../../components/input'
import {useAuth} from "../../contexts/auth";



const signUpSchema = Yup.object({
    first_name: Yup.string()
        .trim()
        .min(2, 'O primeiro nome deve ter pelo menos 2 caracteres')
        .required('O primeiro nome é obrigatório'),
    last_name: Yup.string()
        .trim()
        .min(2, 'O sobrenome deve ter pelo menos 2 caracteres')
        .required('O sobrenome é obrigatório'),
    location: Yup.string().required('Escolha sua cidade'),
    email: Yup.string().email('Digite um email válido').required('Email é obrigatório'),
    password: Yup.string().min(4, 'Senha deve ter no mínimo 8 caracteres').required('Senha é obrigatória'),
    password_confirmed: Yup.string().oneOf([Yup.ref('password'), null], 'As senhas não coincidem.')
})

type FormDataProps = Yup.InferType<typeof signUpSchema>;

const FormSigUpUser = () => {
    const {signed, signUp} = useAuth();
    const [loading, setLoading] = useState(false);
    const toast = useToast()

    const {control, handleSubmit, formState: {errors, isValid}} = useForm<FormDataProps>({
        resolver: yupResolver(signUpSchema)
    });

    async function handleSignUp(data: FormDataProps) {
        setLoading(true)
        try {
            const response = await signUp(data);
            setLoading(false)
            toast.show({title: 'Usuário cadastrado com sucesso', bgColor: 'green.500'});
        } catch (error: any) {
            const message = handleErrors(error.response.data.errors);
            toast.show({title: message, bgColor: 'red.500'});
            setLoading(false)
        }
    }



    return <Center w="100%">
        <Box safeArea p="2" w="100%" py="8">
            <Heading size="2xl" color="gray.800" fontWeight="semibold">
                Cadastre-se!
            </Heading>
            <Heading mt="1" color="gray.500" fontWeight="medium" size="xs">
                Faça o cadastro e tenha a UNAADEB sempre perto.
            </Heading>
            <VStack space={3} mt="5">
                <Controller
                    control={control}
                    name={'first_name'}
                    render={({field: {onChange}}) => (
                        <Input
                            placeholder={'Primeiro nome'}
                            placeholderTextColor={'gray.600'}
                            color={"blue.900"}
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
                            placeholderTextColor={'gray.600'}
                            color={"blue.900"}
                            onChangeText={onChange}
                            errorMessage={errors.last_name?.message}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    )}/>
                <Controller
                    control={control}
                    name={'location'}
                    render={({field: {onChange}}) => (
                        <Input
                            placeholder={'Localização'}
                            placeholderTextColor={'gray.600'}
                            color={"blue.900"}
                            onChangeText={onChange}
                            errorMessage={errors.location?.message}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    )}/>
                <Controller
                    control={control}
                    name={'email'}
                    render={({field: {onChange}}) => (
                        <Input
                            placeholder={'E-mail'}
                            placeholderTextColor={'gray.600'}
                            color={"blue.900"}
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
                            placeholderTextColor={'gray.600'}
                            color={"blue.900"}
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
                            placeholderTextColor={'gray.600'}
                            color={"blue.900"}
                            onChangeText={onChange}
                            errorMessage={errors.password_confirmed?.message}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    )}/>


                <Button title={'Cadastrar'}
                        height={12}
                        mt="2"
                        colorScheme="indigo"
                        onPress={handleSubmit(handleSignUp)}
                        isLoading={loading}
                        // isDisabled={!isValid}
                        isLoadingText="Cadastrando..."/>
            </VStack>
        </Box>
    </Center>;
};

export default function SignUp(){
    return (
            <Center flex={1} px="3">
                <FormSigUpUser />
            </Center>
    );
};
