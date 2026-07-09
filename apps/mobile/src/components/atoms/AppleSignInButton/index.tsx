import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, type ViewStyle } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

interface AppleSignInButtonProps {
  onPress: () => void;
  style?: ViewStyle;
}

/**
 * Botão OFICIAL "Sign in with Apple" (expo-apple-authentication). A Apple exige o uso do
 * botão nativo deles (não um custom) — por isso usamos AppleAuthenticationButton.
 * Renderiza NADA fora do iOS ou quando o recurso não está disponível (iOS < 13), então é
 * seguro colocar direto na tela sem checagens extras. Estilo WHITE combina com o fundo escuro.
 */
export const AppleSignInButton: React.FC<AppleSignInButtonProps> = ({ onPress, style }) => {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    let alive = true;
    // try/catch cobre o módulo nativo AUSENTE (build sem o pod expo-apple-authentication,
    // ex.: builds de time-free): isAvailableAsync lança → o botão simplesmente fica oculto,
    // sem crashar a tela de login.
    (async () => {
      try {
        const v = await AppleAuthentication.isAvailableAsync();
        if (alive) setAvailable(v);
      } catch {
        /* módulo nativo indisponível → botão oculto */
      }
    })();
    return () => { alive = false; };
  }, []);

  if (Platform.OS !== 'ios' || !available) return null;

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
      cornerRadius={16}
      style={[styles.button, style]}
      onPress={onPress}
    />
  );
};

const styles = StyleSheet.create({
  button: { width: '100%', height: 52 },
});

export default AppleSignInButton;
