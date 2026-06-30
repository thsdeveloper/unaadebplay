import React, { useContext, useState } from "react";
import { View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Mail, Send } from "lucide-react-native";

import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Center } from "@/components/ui/center";
import { Pressable } from "react-native";

import { AuthTemplate } from "@/components/templates";
import { AuthBrandHeader } from "@/components/organisms/AuthBrandHeader";
import { GlassInput } from "@/components/molecules/GlassInput";
import { GradientButton } from "@/components/atoms/GradientButton";

import AuthContext from "@/contexts/AuthContext";
import AlertContext from "@/contexts/AlertContext";

const forgetPasswordSchema = Yup.object({
    email: Yup.string().email("Digite um email válido").required("Email é obrigatório"),
});

type FormDataProps = Yup.InferType<typeof forgetPasswordSchema>;

export default function ForgetPassword() {
    const router = useRouter();
    const { requestPasswordReset } = useContext(AuthContext);
    const alert = useContext(AlertContext);
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

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
            // Sempre mostra sucesso (anti-enumeração). O Supabase só envia se a conta existir.
            await requestPasswordReset(data.email);
            setEmailSent(true);
        } catch (error) {
            console.error("Erro ao resetar senha:", error);
            alert.error("Erro ao enviar email. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    if (emailSent) {
        return (
            <AuthTemplate>
                <Center className="flex-1">
                    <View className="w-32 h-32 rounded-full items-center justify-center mb-6 bg-success-500/15">
                        <Ionicons name="checkmark-circle" size={84} color="#10b981" />
                    </View>
                    <Text className="text-typography-0 text-2xl font-bold text-center">Email enviado!</Text>
                    <Text className="text-typography-400 text-center mt-3 px-4">
                        Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                    </Text>
                    <Text className="text-typography-500 text-sm text-center mt-2">
                        Não esqueça de checar a pasta de spam.
                    </Text>
                    <View className="w-full mt-8">
                        <GradientButton
                            label="Voltar ao login"
                            onPress={() => router.replace("/(auth)/sign-in")}
                            leftIcon={<Ionicons name="arrow-back" size={20} color="#fff" />}
                        />
                    </View>
                </Center>
            </AuthTemplate>
        );
    }

    return (
        <AuthTemplate>
            <AuthBrandHeader
                title="Esqueceu a senha?"
                subtitle="Digite seu email e enviaremos instruções para redefinir sua senha."
                icon={<MaterialIcons name="lock-reset" size={48} color="#F472B6" />}
            />

            <VStack space="lg" className="w-full mt-2">
                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <GlassInput
                            icon={<Mail size={20} color="rgba(226,232,240,0.7)" />}
                            placeholder="Email cadastrado"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={errors.email?.message}
                            keyboardType="email-address"
                            returnKeyType="send"
                            onSubmitEditing={handleSubmit(handleResetPassword)}
                        />
                    )}
                />

                <GradientButton
                    label="Enviar instruções"
                    onPress={handleSubmit(handleResetPassword)}
                    loading={loading}
                    disabled={!isValid}
                    leftIcon={<Send size={20} color="#fff" />}
                />

                <Center className="mt-2">
                    <Pressable onPress={() => router.replace("/(auth)/sign-in")} hitSlop={8}>
                        <HStack className="items-center" space="xs">
                            <Ionicons name="arrow-back" size={16} color="#F472B6" />
                            <Text style={{ color: "#F472B6", fontWeight: "600" }}>Voltar ao login</Text>
                        </HStack>
                    </Pressable>
                </Center>
            </VStack>
        </AuthTemplate>
    );
}
