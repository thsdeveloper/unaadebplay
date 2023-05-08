import React, {useContext, useRef, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useToast } from "native-base";
import { VStack, Box, Text } from "native-base";
import { Button } from "../../components/Button";
import { Input } from "../../components/input";
import { View } from 'react-native';
import LottieView from 'lottie-react-native';
import TranslationContext from "../../contexts/TranslationContext";
import AuthContext from "../../contexts/AuthContext";
import {emailExists} from "../../services/user";

const forgetPasswordSchema = Yup.object({
    email: Yup.string()
        .email("Digite um email válido")
        .required("Email é obrigatório"),
});

type FormDataProps = Yup.InferType<typeof forgetPasswordSchema>;

export default function ForgetPassword() {
    const animation = useRef(null);
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const {requestPasswordReset} = useContext(AuthContext)
    const {t} = useContext(TranslationContext);

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<FormDataProps>({
        resolver: yupResolver(forgetPasswordSchema),
        mode: "all",
    });

    const handleResetPassword = async (data: FormDataProps) => {
        setLoading(true);

        try {
            if (!(await emailExists(data.email))) {
                toast.show({
                    title: "Usuário não encontrado",
                    description: "O email informado não está associado a uma conta existente. Verifique se digitou o email corretamente ou crie uma nova conta.",
                    bgColor: "red.500",
                    duration: 5000,
                });
                setLoading(false);
                return;
            }

            await requestPasswordReset(data.email);
            toast.show({
                title: `Solicitação de redefinição de senha enviada para ${data.email}`,
                bgColor: "green.500",
            });
        } catch (error) {
            toast.show({
                title: `Ocorreu um erro ao processar a solicitação`,
                bgColor: "red.500",
            });
        } finally {
            setLoading(false);
        }
    };


    return (
        <View>
            <Box p={10}>
                <Box>
                    <LottieView
                        autoPlay
                        ref={animation}
                        style={{
                            width: '100%',
                            height: 200,
                            aspectRatio: 1,
                        }}
                        source={require('../../assets/128278-reset-password.json')}
                    />
                </Box>
                <Box>
                    <Text>
                        {t('reset_password_description')}
                    </Text>
                </Box>
                <VStack space={4}>
                    <Controller
                        control={control}
                        name={"email"}
                        render={({ field: { onChange } }) => (
                            <Input
                                placeholder={"E-mail"}
                                size={"lg"}
                                placeholderTextColor={"gray.400"}
                                onChangeText={onChange}
                                errorMessage={errors.email?.message}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        )}
                    />
                    <Button
                        title={t('text_password_send')}
                        height={12}
                        mt="2"
                        onPress={handleSubmit(handleResetPassword)}
                        isLoading={loading}
                        isLoadingText="Enviando..."
                    />
                </VStack>
            </Box>
        </View>
    );
}