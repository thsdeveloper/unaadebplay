import React from 'react';
import { View, Image, Text as RNText, StyleSheet } from 'react-native';

interface AuthBrandHeaderProps {
  title: string;
  subtitle?: string;
  /** Ícone alternativo no badge (lucide etc.); por padrão usa o ícone do app */
  icon?: React.ReactNode;
}

/**
 * Cabeçalho padrão das telas de auth: badge da marca com glow + título + subtítulo.
 * Cores EXPLÍCITAS (não `text-typography-*`) — o token typography-0 resolve escuro no
 * ui/text desta config e deixava o título invisível no fundo escuro.
 */
export const AuthBrandHeader: React.FC<AuthBrandHeaderProps> = ({ title, subtitle, icon }) => {
  return (
    <View style={styles.wrap}>
      <View style={styles.badge}>
        {icon ?? (
          <Image source={require('@/assets/icon.png')} style={styles.badgeImage} resizeMode="cover" />
        )}
      </View>
      <RNText style={styles.title}>{title}</RNText>
      {!!subtitle && <RNText style={styles.subtitle}>{subtitle}</RNText>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 8 },
  badge: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#E51C44',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 12,
  },
  badgeImage: { width: 64, height: 64, borderRadius: 18 },
  title: {
    marginTop: 20,
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    marginTop: 8,
    color: '#94A3B8',
    fontSize: 15.5,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default AuthBrandHeader;
