import React, { useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { VStack, Box, Text, KeyboardAvoidingView } from "native-base";
import { Button } from "@/components/Button";
import { Input } from "@/components/input";
import { Platform, ScrollView } from 'react-native';
import TranslationContext from "../../contexts/TranslationContext";
import AuthContext from "@/contexts/AuthContext";
import { emailExists } from "@/services/user";
import AlertContext from "@/contexts/AlertContext";
import {Feather} from "@expo/vector-icons";

const forgetPasswordSchema = Yup.object({
    email: Yup.string()
        .email("Digite um email válido")
        .required("Email é obrigatório"),
});

type FormDataProps = Yup.InferType<typeof forgetPasswordSchema>;

export default function ForgetPassword() {
    const [loading, setLoading] = useState(false);
    const { requestPasswordReset } = useContext(AuthContext);
    const { t } = useContext(TranslationContext);
    const alert = useContext(AlertContext);

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
                alert.error('O email informado não está associado a uma conta existente. Verifique se digitou o email corretamente ou crie uma nova conta.');
                setLoading(false);
                return;
            }
            await requestPasswordReset(data.email);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <VStack p={10} space={4} flex={1} alignItems={"center"}>
                    <Feather name="unlock" size={40} color="black" />
                    <Text>
                        {t('reset_password_description')}
                    </Text>
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
                                keyboardType={'email-address'}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        )}
                    />
                    <Button
                        width={'full'}
                        title={t('text_password_send')}
                        height={12}
                        onPress={handleSubmit(handleResetPassword)}
                        isLoading={loading}
                        isLoadingText="Enviando..."
                    />
                </VStack>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
