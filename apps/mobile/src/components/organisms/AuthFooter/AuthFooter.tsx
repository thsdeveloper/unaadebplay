import React from 'react';
import { View, Text as RNText, Pressable, StyleSheet } from 'react-native';

interface AuthFooterProps {
  showSignUp?: boolean;
  showSignIn?: boolean;
  copyrightText?: string;
  onSignUpPress?: () => void;
  onSignInPress?: () => void;
}

/**
 * Rodapé das telas de auth: divisor "ou" + CTA secundário. Cores EXPLÍCITAS (o outline
 * Button do Gluestack ficava apagado demais no fundo escuro).
 */
export const AuthFooter: React.FC<AuthFooterProps> = React.memo(({
  showSignUp = false,
  showSignIn = false,
  copyrightText,
  onSignUpPress,
  onSignInPress,
}) => {
  const showDivider = showSignUp || showSignIn;

  return (
    <View style={styles.wrap}>
      {showDivider && (
        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <RNText style={styles.ou}>ou</RNText>
          <View style={styles.line} />
        </View>
      )}

      {showSignUp && onSignUpPress && (
        <Pressable
          onPress={onSignUpPress}
          accessibilityRole="button"
          accessibilityLabel="Criar conta"
          style={({ pressed }) => [styles.createBtn, pressed && styles.createBtnPressed]}
        >
          <RNText style={styles.createBtnText}>Criar conta</RNText>
        </Pressable>
      )}

      {showSignIn && onSignInPress && (
        <View style={styles.signinRow}>
          <RNText style={styles.muted}>Já tem uma conta?</RNText>
          <Pressable onPress={onSignInPress} hitSlop={8}>
            <RNText style={styles.link}>Entrar</RNText>
          </Pressable>
        </View>
      )}

      {!!copyrightText && <RNText style={styles.copyright}>{copyrightText}</RNText>}
    </View>
  );
});

AuthFooter.displayName = 'AuthFooter';

const styles = StyleSheet.create({
  wrap: { marginTop: 4, gap: 18 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.14)' },
  ou: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },

  createBtn: {
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  createBtnPressed: { backgroundColor: 'rgba(229,28,68,0.12)', borderColor: 'rgba(229,28,68,0.55)' },
  createBtnText: { color: '#F1F5F9', fontSize: 16, fontWeight: '700', textAlign: 'center' },

  signinRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  muted: { color: '#94A3B8', fontSize: 14 },
  link: { color: '#FF4D6D', fontSize: 14, fontWeight: '700' },

  copyright: { color: '#64748B', fontSize: 12, textAlign: 'center', marginTop: 20, lineHeight: 17 },
});

export default AuthFooter;
