import React, { useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Platform, ScrollView } from 'react-native';
import { Feather } from "@expo/vector-icons";

// Importações de componentes locais (conforme estrutura do projeto)
import {
    VStack
} from "@/components/ui/vstack";
import {
    Text
} from "@/components/ui/text";
import {
    Center
} from "@/components/ui/center";
import {
    KeyboardAvoidingView
} from "@/components/ui/keyboard-avoiding-view";
import {
    Icon
} from "@/components/ui/icon";


// Importações de contextos e componentes
import { Button } from "@/components/Button";
import { CustomInput } from "@/components/Forms/Input";
import TranslationContext from "../../contexts/TranslationContext";
import AuthContext from "@/contexts/AuthContext";
import { emailExists } from "@/services/user";
import AlertContext from "@/contexts/AlertContext";
import { StatusBar } from "expo-status-bar";

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
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
        >
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <VStack
                    space="md"
                    className="flex-1 items-center p-10"
                >
                    <Center className="w-16 h-16 mb-2">
                        <Icon as={Feather} name="unlock" size="xl" color="$gray800" />
                    </Center>

                    <Text className="text-center text-gray-700 mb-4">
                        {t('reset_password_description')}
                    </Text>

                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange } }) => (
                            <CustomInput
                                placeholder="E-mail"
                                size="lg"
                                placeholderTextColor="gray.400"
                                onChangeText={onChange}
                                errorMessage={errors.email?.message}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                leftIcon={
                                    <Icon as={Feather} name="mail" size="sm" color="$gray500" />
                                }
                            />
                        )}
                    />

                    <Button
                        width="full"
                        title={loading ? "Enviando..." : t('text_password_send')}
                        height={12}
                        onPress={handleSubmit(handleResetPassword)}
                        isLoading={loading}
                        icon={loading ? undefined : <Icon as={Feather} name="send" size="sm" color="$white" />}
                    />
                </VStack>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
