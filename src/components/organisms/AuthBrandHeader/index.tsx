import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';

interface AuthBrandHeaderProps {
  title: string;
  subtitle?: string;
  /** Ícone alternativo no badge (lucide etc.); por padrão usa o ícone do app */
  icon?: React.ReactNode;
}

/** Cabeçalho padrão das telas de auth: badge da marca com glow + título + subtítulo. */
export const AuthBrandHeader: React.FC<AuthBrandHeaderProps> = ({ title, subtitle, icon }) => {
  return (
    <View className="items-center mb-2">
      <View style={styles.badge}>
        {icon ?? (
          <Image source={require('@/assets/icon.png')} style={styles.badgeImage} resizeMode="cover" />
        )}
      </View>
      <Text className="mt-5 text-3xl font-bold text-typography-0 text-center">{title}</Text>
      {!!subtitle && (
        <Text className="mt-2 text-base text-typography-400 text-center">{subtitle}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default AuthBrandHeader;
