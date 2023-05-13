import {useContext, useState} from "react";
import {useForm, Controller} from 'react-hook-form'
import {yupResolver} from '@hookform/resolvers/yup'
import {Button} from '../../components/Button'
import {useAuth} from "../../contexts/AuthContext";
import {Input} from '../../components/input'
import {
    Box,
    Center,
    Heading,
    HStack,
    Link,
    VStack,
    Text,
    KeyboardAvoidingView,
    Icon,
    IconButton,
    Pressable
} from "native-base";
import * as Yup from 'yup';
import TranslationContext from "../../contexts/TranslationContext";
import {Image} from "../../components/Image";
import ConfigContext from "../../contexts/ConfigContext";
import {Platform} from "react-native";
import {MaterialIcons} from "@expo/vector-icons";
import colors from "../../constants/colors";

const signInSchema = Yup.object({
    email: Yup.string().email('Digite um email válido').required('Email é obrigatório'),
    password: Yup.string().min(4, 'Senha deve ter no mínimo 4 caracteres').required('Senha é obrigatória'),
})

type FormDataProps = Yup.InferType<typeof signInSchema>;


export default function SignIn({navigation}: { navigation: any }) {
    const {signIn} = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const {t} = useContext(TranslationContext);
    const config = useContext(ConfigContext);

    const {control, handleSubmit, formState: {errors, isValid}} = useForm<FormDataProps>({
        resolver: yupResolver(signInSchema)
    });

    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    }


    async function handleSignIn(data: FormDataProps) {
        setLoading(true)
        try {
            await signIn(data.email, data.password);
        } finally {
            setLoading(false)
        }
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
            <Center flex={1} px="8" bgColor={'#0E1647'}>
                    <Box>
                        <Box p={4}>
                            <Image width={'100%'} height={'20'} assetId={config.project_logo} resizeMode={'contain'}/>
                        </Box>

                        <Heading mt="1" color="blue.200" fontWeight="medium" size="xs">
                            {t('title_sign_in')}
                        </Heading>

                        <VStack space={3} mt="5">
                            <Controller
                                control={control}
                                name={'email'}
                                render={({field: {onChange, onBlur, value}}) => (
                                    <Input
                                        color={"blue.100"}
                                        placeholder={'Seu e-mail'}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        value={value}
                                        errorMessage={errors.email?.message}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                )}/>

                            <Controller
                                control={control}
                                name={'password'}
                                render={({field: {onChange, onBlur, value}}) => (
                                    <Input
                                        color={"blue.100"}
                                        placeholder={'Sua senha'}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        value={value}
                                        errorMessage={errors.password?.message}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        InputRightElement={
                                                <IconButton
                                                    onPress={handleShowPassword}
                                                    icon={<Icon as={MaterialIcons} name={showPassword ? "visibility-off" : "visibility"} />}
                                                />
                                        }
                                    />
                                )}/>


                            <Pressable onPress={() => navigation.navigate('ForgetPassword')}>
                                <Text alignSelf="flex-end" fontWeight={500} color={colors.text}>Esqueceu a sua senha?</Text>
                            </Pressable>

                            <Button title={'Entrar'}
                                    height={12}
                                    mt="2"
                                    colorScheme="indigo"
                                    onPress={handleSubmit(handleSignIn)}
                                    isLoading={loading}
                                    isLoadingText="Aguarde..."/>


                            <HStack mt="2" justifyContent="center">
                                <Text fontSize="sm" color="blue.100" _dark={{
                                    color: "warmGray.200"
                                }}>
                                    É um novo usuário?{" "}
                                </Text>
                                <Pressable onPress={() => navigation.navigate('SignUp')}>
                                    <Text color={colors.text} fontWeight={500}>Cadastre-se agora!</Text>
                                </Pressable>
                            </HStack>
                        </VStack>
                    </Box>
            </Center>
        </KeyboardAvoidingView>
    );
}