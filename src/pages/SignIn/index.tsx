import {useContext, useState} from "react";
import {useForm, Controller} from 'react-hook-form'
import {yupResolver} from '@hookform/resolvers/yup'
import {Button} from '../../components/Button'
import {useAuth} from "../../contexts/auth";
import {Input} from '../../components/input'
import {Box, Center, Heading, HStack, Link, VStack, Text, StatusBar, Image, useToast} from "native-base";
import * as Yup from 'yup';
import AlertContext from "../../contexts/alert";
import {handleErrors} from "../../utils/directus";

const signInSchema = Yup.object({
    email: Yup.string().email('Digite um email válido').required('Email é obrigatório'),
    password: Yup.string().min(4, 'Senha deve ter no mínimo 8 caracteres').required('Senha é obrigatória'),
})

type FormDataProps = Yup.InferType<typeof signInSchema>;


export default function SignIn({navigation}: { navigation: any }) {
    const {signed, signIn} = useAuth();
    const [loading, setLoading] = useState(false);
    const alert = useContext(AlertContext)
    const toast = useToast()



    const {control, handleSubmit, formState: {errors, isValid}} = useForm<FormDataProps>({
        resolver: yupResolver(signInSchema)
    });


    async function handleSignIn(data: FormDataProps) {
        setLoading(true)
        try {
            const response = await signIn(data.email, data.password);
            setLoading(false)
        } catch (error: any) {
            console.log('error', error)
            const message = handleErrors(error.response.data.errors);
            console.log('message', message)
            toast.show({
                title: message,
                bgColor: 'red.500'
            });
            setLoading(false)
        }
    }

    return (
        <Center flex={1} px="3" bgColor={'#0E1647'}>
            <Center w="100%">
                <Box safeArea p="2" py="8" w="90%" maxW="290">
                    <Heading size="2xl" fontWeight="600" color="blue.100" _dark={{
                        color: "warmGray.50"
                    }}>
                       UNAADEB Play
                    </Heading>
                    <Heading mt="1" _dark={{
                        color: "warmGray.200"
                    }} color="blue.200" fontWeight="medium" size="xs">
                        Junte-se a milhares de adolescentes com propósitos! Vem com a gente!
                    </Heading>

                    <VStack space={3} mt="5">

                        <Controller
                            control={control}
                            name={'email'}
                            render={({field: {onChange}}) => (
                                <Input
                                    placeholder={'Seu e-mail'}
                                    onChangeText={onChange}
                                    errorMessage={errors.email?.message}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            )}/>

                        <Controller control={control} name={'password'} render={({field: {onChange}}) => (
                            <Input
                                placeholder={'Sua senha'}
                                onChangeText={onChange}
                                errorMessage={errors.password?.message}
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        )}/>

                        <Link _text={{
                            fontSize: "xs",
                            fontWeight: "500",
                            color: "blue.300"
                        }} alignSelf="flex-end" mt="1" onPress={() => navigation.navigate('ForgetPassword')}>
                            Esqueceu a sua senha?
                        </Link>

                        <Button title={'Entrar'}
                                height={12}
                                mt="2"
                                colorScheme="indigo"
                                onPress={handleSubmit(handleSignIn)}
                                isLoading={loading}
                                isDisabled={!isValid}
                                isLoadingText="Aguarde..."/>


                        <HStack mt="6" justifyContent="center">
                            <Text fontSize="sm" color="blue.100" _dark={{
                                color: "warmGray.200"
                            }}>
                                É um novo usuário?{" "}
                            </Text>
                            <Link h={'30'} _text={{
                                color: "blue.300",
                                fontWeight: "medium",
                                fontSize: "sm",
                            }} onPress={() => navigation.navigate('SignUp')}>
                                Cadastre-se
                            </Link>
                        </HStack>
                    </VStack>
                </Box>
            </Center>
        </Center>
    );
}