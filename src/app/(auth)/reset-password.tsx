import React, { useContext, useState } from "react";
import { View, Pressable } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Lock, Check } from "lucide-react-native";

import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Center } from "@/components/ui/center";

import { AuthTemplate } from "@/components/templates";
import { AuthBrandHeader } from "@/components/organisms/AuthBrandHeader";
import { GlassInput } from "@/components/molecules/GlassInput";
import { GradientButton } from "@/components/atoms/GradientButton";

import AuthContext from "@/contexts/AuthContext";
import AlertContext from "@/contexts/AlertContext";

const resetPasswordSchema = Yup.object({
    password: Yup.string()
        .min(8, "Senha deve ter no mínimo 8 caracteres")
        .matches(/[A-Z]/, "Deve conter uma letra maiúscula")
        .matches(/[a-z]/, "Deve conter uma letra minúscula")
        .matches(/[0-9]/, "Deve conter um número")
        .required("Senha é obrigatória"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "As senhas não conferem")
        .required("Confirme a senha"),
});

type FormDataProps = Yup.InferType<typeof resetPasswordSchema>;

export default function ResetPassword() {
    const router = useRouter();
    const { resetPassword } = useContext(AuthContext);
    const alert = useContext(AlertContext);
    const [loading, setLoading] = useState(false);

    const params = useLocalSearchParams<{ token_hash?: string; token?: string; type?: string }>();
    const tokenHash = params.token_hash ?? params.token ?? "";

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<FormDataProps>({
        resolver: yupResolver(resetPasswordSchema),
        mode: "all",
    });

    const handleReset = async (data: FormDataProps) => {
        if (!tokenHash) {
            alert.error("Link de recuperação inválido ou expirado. Solicite um novo.");
            return;
        }
        setLoading(true);
        try {
            await resetPassword(tokenHash, data.password);
            alert.success("Senha redefinida com sucesso! Faça login com a nova senha.");
            router.replace("/(auth)/sign-in");
        } catch (error: any) {
            console.error("Erro ao redefinir senha:", error);
            alert.error(error?.message || "Não foi possível redefinir a senha. O link pode ter expirado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthTemplate>
            <AuthBrandHeader
                title="Nova senha"
                subtitle="Crie uma nova senha para acessar sua conta."
                icon={<MaterialIcons name="lock-reset" size={48} color="#F472B6" />}
            />

            {!tokenHash && (
                <Text className="text-center text-error-400 mb-2">
                    Link inválido ou expirado. Volte e solicite a recuperação novamente.
                </Text>
            )}

            <VStack space="lg" className="w-full mt-2">
                <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <GlassInput
                            icon={<Lock size={20} color="rgba(226,232,240,0.7)" />}
                            placeholder="Nova senha"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={errors.password?.message}
                            password
                        />
                    )}
                />
                <Controller
                    control={control}
                    name="confirmPassword"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <GlassInput
                            icon={<Lock size={20} color="rgba(226,232,240,0.7)" />}
                            placeholder="Confirmar senha"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={errors.confirmPassword?.message}
                            password
                        />
                    )}
                />

                <GradientButton
                    label="Redefinir senha"
                    onPress={handleSubmit(handleReset)}
                    loading={loading}
                    disabled={!isValid || !tokenHash}
                    leftIcon={<Check size={20} color="#fff" />}
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
