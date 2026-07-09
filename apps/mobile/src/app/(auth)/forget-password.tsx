import React, { useContext, useState } from "react";
import { View, Text as RNText, Pressable, StyleSheet } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useRouter } from "expo-router";
import { Mail, Send, ArrowLeft, KeyRound, CheckCircle2, RefreshCw } from "lucide-react-native";

import { AuthTemplate } from "@/components/templates";
import { AuthBrandHeader } from "@/components/organisms/AuthBrandHeader";
import { GlassInput } from "@/components/molecules/GlassInput";
import { GradientButton } from "@/components/atoms/GradientButton";

import AuthContext from "@/contexts/AuthContext";
import AlertContext from "@/contexts/AlertContext";

const BRAND_LIGHT = "#FF4D6D";

const forgetPasswordSchema = Yup.object({
  email: Yup.string().email("Digite um email válido").required("Email é obrigatório"),
});
type FormDataProps = Yup.InferType<typeof forgetPasswordSchema>;

export default function ForgetPassword() {
  const router = useRouter();
  const { requestPasswordReset } = useContext(AuthContext);
  const alert = useContext(AlertContext);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormDataProps>({
    resolver: yupResolver(forgetPasswordSchema),
    mode: "all",
  });

  const submit = async (data: FormDataProps) => {
    setLoading(true);
    try {
      // Sempre mostra sucesso (anti-enumeração). O Supabase só envia se a conta existir.
      await requestPasswordReset(data.email);
      setSentEmail(data.email);
      setEmailSent(true);
    } catch (error) {
      console.error("Erro ao resetar senha:", error);
      alert.error("Erro ao enviar email. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!sentEmail || resending) return;
    setResending(true);
    try {
      await requestPasswordReset(sentEmail);
      alert.success("Email reenviado!");
    } catch {
      alert.error("Não foi possível reenviar. Tente novamente.");
    } finally {
      setResending(false);
    }
  };

  const goLogin = () => router.replace("/(auth)/sign-in");

  // ---------- Estado de sucesso ----------
  if (emailSent) {
    return (
      <AuthTemplate>
        <View style={s.successWrap}>
          <View style={s.successIcon}>
            <CheckCircle2 size={64} color="#22C55E" strokeWidth={2} />
          </View>
          <RNText style={s.successTitle}>Email enviado!</RNText>
          <RNText style={s.successBody}>
            Enviamos um link de redefinição para{"\n"}
            <RNText style={s.emailHighlight}>{sentEmail}</RNText>
          </RNText>
          <RNText style={s.hint}>Não recebeu? Confira a caixa de spam.</RNText>

          <View style={s.successActions}>
            <GradientButton
              label="Voltar ao login"
              onPress={goLogin}
              leftIcon={<ArrowLeft size={20} color="#fff" />}
            />
            <Pressable onPress={resend} disabled={resending} hitSlop={8} style={s.centerRow}>
              <RefreshCw size={15} color={BRAND_LIGHT} />
              <RNText style={s.accentLink}>{resending ? "Reenviando..." : "Reenviar email"}</RNText>
            </Pressable>
          </View>
        </View>
      </AuthTemplate>
    );
  }

  // ---------- Formulário ----------
  return (
    <AuthTemplate>
      <AuthBrandHeader
        title="Esqueceu a senha?"
        subtitle="Sem problemas. Informe seu email e enviaremos um link para você criar uma nova senha."
        icon={<KeyRound size={44} color={BRAND_LIGHT} />}
      />

      <View style={s.form}>
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
              onSubmitEditing={handleSubmit(submit)}
            />
          )}
        />

        <GradientButton
          label="Enviar link de redefinição"
          onPress={handleSubmit(submit)}
          loading={loading}
          disabled={!isValid}
          leftIcon={<Send size={20} color="#fff" />}
        />

        <Pressable onPress={goLogin} hitSlop={8} style={s.centerRow}>
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

  // sucesso
  successWrap: { alignItems: "center", paddingHorizontal: 8 },
  successIcon: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(34,197,94,0.12)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.3)",
    marginBottom: 22,
  },
  successTitle: { color: "#F8FAFC", fontSize: 24, fontWeight: "800", textAlign: "center" },
  successBody: { color: "#94A3B8", fontSize: 15, textAlign: "center", lineHeight: 22, marginTop: 10 },
  emailHighlight: { color: "#F1F5F9", fontWeight: "700" },
  hint: { color: "#64748B", fontSize: 13, textAlign: "center", marginTop: 10 },
  successActions: { width: "100%", marginTop: 28, gap: 14 },
});
