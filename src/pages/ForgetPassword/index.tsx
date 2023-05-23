import React, {useContext, useRef, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { VStack, Box, Text } from "native-base";
import { Button } from "../../components/Button";
import { Input } from "../../components/input";
import { View } from 'react-native';
import LottieView from 'lottie-react-native';
import TranslationContext from "../../contexts/TranslationContext";
import AuthContext from "../../contexts/AuthContext";
import {emailExists} from "../../services/user";
import AlertContext from "../../contexts/AlertContext";

const forgetPasswordSchema = Yup.object({
    email: Yup.string()
        .email("Digite um email válido")
        .required("Email é obrigatório"),
});

type FormDataProps = Yup.InferType<typeof forgetPasswordSchema>;

export default function ForgetPassword() {
    const animation = useRef(null);
    const [loading, setLoading] = useState(false);
    const {requestPasswordReset} = useContext(AuthContext)
    const {t} = useContext(TranslationContext);
    const alert = useContext(AlertContext)

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
                alert.error('O email informado não está associado a uma conta existente. Verifique se digitou o email corretamente ou crie uma nova conta.')
                setLoading(false);
                return;
            }

            await requestPasswordReset(data.email);
            alert.success(`Solicitação de redefinição de senha enviada para ${data.email}`)
        } catch (error) {
            alert.error('Ocorreu um erro ao processar a solicitação')
        } finally {
            setLoading(false);
        }
    };


    return (
        <View>
            <VStack p={10}>
                <Box alignItems="center" justifyContent="center">
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
                <VStack space={4} pt={4}>
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
            </VStack>
        </View>
    );
}