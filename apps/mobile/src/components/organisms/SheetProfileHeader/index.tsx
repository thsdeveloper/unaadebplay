import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, MapPin } from 'lucide-react-native';
import { Avatar } from '@/components/Avatar';
import { GradientButton } from '@/components/atoms/GradientButton';
import { SHEET } from '@/constants/sheetTokens';

interface SheetProfileHeaderProps {
  /** Id do usuário exibido — habilita a bolinha de presença REAL (só quando online). */
  userId?: string | null;
  userAvatarID?: string;
  name: string;
  email: string;
  sector?: string;
  onProfilePress?: () => void;
}

/**
 * Hero de perfil do sheet: wash de marca + avatar com anel/glow + nome/email +
 * chip de setor (opcional) + CTA "Ver perfil" (reusa o GradientButton).
 * Cor sempre via SHEET (nunca o Text atom com color).
 */
export const SheetProfileHeader = memo<SheetProfileHeaderProps>(({
  userId,
  userAvatarID,
  name,
  email,
  sector,
  onProfilePress,
}) => (
  <View style={s.wrap}>
    <LinearGradient
      colors={['rgba(229,28,68,0.30)', 'rgba(229,28,68,0.06)', 'transparent']}
      style={s.wash}
      pointerEvents="none"
    />
    <View style={s.ring}>
      <Avatar userId={userId} userAvatarID={userAvatarID} name={name} size="2xl" />
    </View>
    <Text style={s.name} numberOfLines={1}>{name}</Text>
    {!!email && <Text style={s.email} numberOfLines={1}>{email}</Text>}
    {!!sector && (
      <View style={s.chip}>
        <MapPin size={12} color={SHEET.gold} />
        <Text style={s.chipText} numberOfLines={1}>{sector}</Text>
      </View>
    )}
    {!!onProfilePress && (
      <GradientButton
        label="Ver perfil"
        onPress={onProfilePress}
        rightIcon={<ChevronRight size={16} color="#fff" />}
        style={s.cta}
      />
    )}
  </View>
));

SheetProfileHeader.displayName = 'SheetProfileHeader';

const s = StyleSheet.create({
  wrap: { alignItems: 'center', paddingTop: 8, paddingBottom: 20 },
  wash: { position: 'absolute', top: 0, left: 0, right: 0, height: 160 },
  ring: {
    padding: 3,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: SHEET.brandRing,
    backgroundColor: SHEET.bg,
    shadowColor: SHEET.brand,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 10,
  },
  name: { color: SHEET.textPrimary, fontSize: 22, fontWeight: '700', marginTop: 14 },
  email: { color: SHEET.textMuted, fontSize: 14, marginTop: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: SHEET.glass,
    borderWidth: 1,
    borderColor: SHEET.border,
  },
  chipText: { color: '#E5E7EB', fontSize: 12.5, fontWeight: '600', maxWidth: 220 },
  cta: { width: '100%', marginTop: 18 },
});
