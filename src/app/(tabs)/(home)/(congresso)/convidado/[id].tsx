import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text as RNText, Pressable, ScrollView, ActivityIndicator, Share, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Share2, User, Info } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { supabase } from '@/services/supabase';
import { SHEET } from '@/constants/sheetTokens';

interface Profile {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar?: string | null;
  title?: string | null;
  description?: string | null;
}

const ConvidadoPage = React.memo(() => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar, title, description')
          .eq('id', id as any)
          .maybeSingle();
        if (alive) setProfile(data as Profile | null);
      } catch (e) {
        console.error('[Convidado] erro ao carregar', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const name = useMemo(
    () => [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim() || 'Convidado',
    [profile],
  );

  const onShare = useCallback(async () => {
    if (!profile) return;
    try {
      await Share.share({ title: name, message: `${name}${profile.title ? ` — ${profile.title}` : ''}\n\nConfira no app UNAADEB!` });
    } catch { /* cancelado */ }
  }, [profile, name]);

  const header = (right?: React.ReactNode) => (
    <View style={[h.bar, { paddingTop: insets.top + 6 }]} pointerEvents="box-none">
      <Pressable onPress={() => router.back()} hitSlop={8} style={h.pill} accessibilityRole="button" accessibilityLabel="Fechar">
        <X size={21} color={SHEET.textPrimary} strokeWidth={2.5} />
      </Pressable>
      {right ?? <View style={h.spacer} />}
    </View>
  );

  if (loading) {
    return (
      <View style={s.screen}>
        <Stack.Screen options={{ headerShown: false }} />
        {header()}
        <View style={s.centered}><ActivityIndicator size="large" color={SHEET.brand} /></View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={s.screen}>
        <Stack.Screen options={{ headerShown: false }} />
        {header()}
        <View style={s.centered}>
          <View style={s.emptyIcon}><User size={30} color={SHEET.danger} /></View>
          <RNText style={s.emptyTitle}>Convidado não encontrado</RNText>
          <Pressable onPress={() => router.back()} style={s.emptyBtn}><RNText style={s.emptyBtnText}>Voltar</RNText></Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={[s.scroll, { paddingTop: insets.top + 64 }]} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[SHEET.brandTint, 'transparent']} style={s.topGlow} pointerEvents="none" />

        <View style={s.headerBlock}>
          <View style={s.avatarRing}>
            <Avatar userAvatarID={profile.avatar ?? undefined} name={profile.first_name ?? undefined} size={120} />
          </View>
          <RNText style={s.name} numberOfLines={2}>{name}</RNText>
          {!!profile.title && (
            <View style={s.rolePill}>
              <RNText style={s.roleText}>{profile.title}</RNText>
            </View>
          )}
        </View>

        {!!profile.description && (
          <View style={s.card}>
            <View style={s.sectionHeader}>
              <Info size={17} color={SHEET.brand} />
              <RNText style={s.sectionTitle}>Sobre</RNText>
            </View>
            <RNText style={s.description}>{profile.description}</RNText>
          </View>
        )}
      </ScrollView>

      {header(
        <Pressable onPress={onShare} hitSlop={8} style={h.pill} accessibilityRole="button" accessibilityLabel="Compartilhar">
          <Share2 size={18} color={SHEET.textPrimary} strokeWidth={2.4} />
        </Pressable>
      )}
    </View>
  );
});

ConvidadoPage.displayName = 'ConvidadoPage';

export default ConvidadoPage;

const PILL_BG = 'rgba(10,12,20,0.58)';
const PILL_BORDER = 'rgba(255,255,255,0.22)';

const h = StyleSheet.create({
  bar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 6,
  },
  spacer: { width: 40, height: 40 },
  pill: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: PILL_BG, borderWidth: StyleSheet.hairlineWidth, borderColor: PILL_BORDER,
  },
});

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SHEET.bg },
  scroll: { paddingBottom: 40, paddingHorizontal: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  topGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 260 },

  headerBlock: { alignItems: 'center', paddingVertical: 12 },
  avatarRing: { padding: 4, borderRadius: 999, borderWidth: 2, borderColor: SHEET.brand, marginBottom: 14 },
  name: { color: SHEET.textPrimary, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  rolePill: {
    marginTop: 10, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
    backgroundColor: SHEET.brandTint, borderWidth: 1, borderColor: SHEET.brand,
  },
  roleText: { color: SHEET.brand, fontSize: 13, fontWeight: '700' },

  card: { marginTop: 20, borderRadius: 18, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border, padding: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { color: SHEET.textPrimary, fontSize: 15.5, fontWeight: '800' },
  description: { color: SHEET.textSecondary, fontSize: 14.5, lineHeight: 22 },

  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border, marginBottom: 16 },
  emptyTitle: { color: SHEET.textPrimary, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptyBtn: { marginTop: 18, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
  emptyBtnText: { color: SHEET.textPrimary, fontSize: 14, fontWeight: '700' },
});
