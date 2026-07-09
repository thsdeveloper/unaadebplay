import React, { useContext, useState } from "react";
import { View, Text as RNText, Pressable, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Lock, Check, ArrowLeft, KeyRound } from "lucide-react-native";

import { AuthTemplate } from "@/components/templates";
import { AuthBrandHeader } from "@/components/organisms/AuthBrandHeader";
import { GlassInput } from "@/components/molecules/GlassInput";
import { GradientButton } from "@/components/atoms/GradientButton";
import { PasswordStrengthIndicator } from "@/components/molecules";

import AuthContext from "@/contexts/AuthContext";
import AlertContext from "@/contexts/AlertContext";

const BRAND_LIGHT = "#FF4D6D";

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
        subtitle="Crie uma senha forte para proteger sua conta."
        icon={<KeyRound size={44} color={BRAND_LIGHT} />}
      />

      {!tokenHash && (
        <View style={s.invalidBanner}>
          <RNText style={s.invalidText}>
            Link inválido ou expirado. Volte e solicite a recuperação novamente.
          </RNText>
        </View>
      )}

      <View style={s.form}>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <GlassInput
                icon={<Lock size={20} color="rgba(226,232,240,0.7)" />}
                placeholder="Nova senha"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                password
              />
              <PasswordStrengthIndicator password={value} />
            </View>
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

        <Pressable onPress={() => router.replace("/(auth)/sign-in")} hitSlop={8} style={s.centerRow}>
          <ArrowLeft size={16} color={BRAND_LIGHT} />
          <RNText style={s.accentLink}>Voltar ao login</RNText>
        </Pressable>
      </View>
    </AuthTemplate>
  );
}

const s = StyleSheet.create({
  form: { width: "100%", marginTop: 8, gap: 16 },
  centerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 6 },
  accentLink: { color: BRAND_LIGHT, fontSize: 14.5, fontWeight: "700" },
  invalidBanner: {
    backgroundColor: "rgba(244,63,94,0.10)",
    borderWidth: 1,
    borderColor: "rgba(244,63,94,0.3)",
    borderRadius: 14,
    padding: 12,
    marginTop: 4,
  },
  invalidText: { color: "#FCA5A5", fontSize: 13, textAlign: "center", lineHeight: 18 },
});
