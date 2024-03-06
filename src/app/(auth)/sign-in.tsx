import React, {useContext, useEffect, useState} from "react";
import {useForm, Controller} from 'react-hook-form'
import {yupResolver} from '@hookform/resolvers/yup'
import {Button} from '@/components/Button'
import {useAuth} from "@/contexts/AuthContext";
import {Input} from '@/components/Forms/Input'
import {
    Box,
    Center,
    Heading,
    HStack,
    VStack,
    Text,
    KeyboardAvoidingView,
    Pressable, StatusBar
} from "native-base";
import * as Yup from 'yup';
import TranslationContext from "@/contexts/TranslationContext";
import {Image} from "@/components/Image";
import ConfigContext from "@/contexts/ConfigContext";
import {Platform} from "react-native";
import colors from "@/constants/colors";
import {Link} from "expo-router";
import { Video } from 'expo-av';
import { useNavigation } from 'expo-router';

const signInSchema = Yup.object({
    email: Yup.string().email('Digite um email válido').required('Email é obrigatório'),
    password: Yup.string().min(4, 'Senha deve ter no mínimo 4 caracteres').required('Senha é obrigatória'),
})
type FormDataProps = Yup.InferType<typeof signInSchema>;

export default function SignIn() {
    const {login} = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const {t} = useContext(TranslationContext);
    const config = useContext(ConfigContext);
    const navigation = useNavigation();

    const {control, handleSubmit, formState: {errors, isValid}} = useForm<FormDataProps>({
        resolver: yupResolver(signInSchema)
    });

    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    }

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    async function handleSignIn(data: FormDataProps) {
        setLoading(true)
        try {
            await login(data.email, data.password);
        } finally {
            setLoading(false)
        }
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
            <StatusBar backgroundColor="#0E1647" barStyle="light-content"/>
            <Video
                source={{uri: "https://back-unaadeb.onrender.com/assets/651b3b4b-26e0-48cc-a5f1-9fb203b518b9"}} // Defina a URL do seu vídeo
                rate={1.0}
                volume={0.0}
                isMuted={true}
                resizeMode="cover"
                shouldPlay
                isLooping
                style={{position: 'absolute', width: '100%', height: '100%'}}
            />
            <Center flex={1} px="8" style={{backgroundColor: 'rgba(0, 0, 60, 0.8)'}}>
                <Box>
                    <Box p={4}>
                        <Image width={'100%'} height={"12"} assetId={config.project_logo}/>
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
                                    keyboardType={'email-address'}
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
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    isPassword={true}
                                />
                            )}/>

                        <Link href={'/(auth)/forget-password'} asChild>
                            <Pressable>
                                <Text alignSelf="flex-end" fontWeight={500} color={colors.text}>
                                    Esqueceu a sua senha?
                                </Text>
                            </Pressable>
                        </Link>

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
                            <Link href={'/sign-up'} asChild>
                                <Pressable>
                                    <Text color={colors.text} fontWeight={500}>Cadastre-se agora!</Text>
                                </Pressable>
                            </Link>
                        </HStack>
                    </VStack>
                </Box>
            </Center>
        </KeyboardAvoidingView>
    );
}