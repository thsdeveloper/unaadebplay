import React, { useContext, useState, useCallback } from 'react';
import { View, Text, ScrollView, Switch, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Instagram, Linkedin, Music2, MessageCircle, Share2, ChevronRight, Pencil } from 'lucide-react-native';
import { SheetGroup } from '@/components/molecules/SheetGroup';
import { SheetRow } from '@/components/molecules/SheetRow';
import { SHEET } from '@/constants/sheetTokens';
import { updateUserMe } from '@/services/user';
import authContext from '@/contexts/AuthContext';
import AlertContext from '@/contexts/AlertContext';
import type { SocialVisibility } from '@/types/UserTypes';

type NetKey = keyof SocialVisibility;

const NETWORKS: { key: NetKey; label: string; Icon: any; color: string }[] = [
  { key: 'instagram', label: 'Instagram', Icon: Instagram, color: '#E1306C' },
  { key: 'linkedin', label: 'LinkedIn', Icon: Linkedin, color: '#0A66C2' },
  { key: 'tiktok', label: 'TikTok', Icon: Music2, color: SHEET.textPrimary },
  { key: 'whatsapp', label: 'WhatsApp', Icon: MessageCircle, color: '#25D366' },
];

const DEFAULT_VIS: Record<NetKey, boolean> = { instagram: true, linkedin: true, tiktok: true, whatsapp: true };

/**
 * Escolha de QUAIS redes sociais exibir no perfil público. Os handles são cadastrados em
 * "Editar perfil"; aqui o usuário liga/desliga a exibição de cada uma (grava em
 * profiles.social_visibility). O get_public_profiles mascara no servidor o que estiver off.
 */
export default function SocialLinksScreen() {
  const { user, setUser } = useContext(authContext);
  const alert = useContext(AlertContext);

  const [vis, setVis] = useState<Record<NetKey, boolean>>({
    instagram: user?.social_visibility?.instagram ?? true,
    linkedin: user?.social_visibility?.linkedin ?? true,
    tiktok: user?.social_visibility?.tiktok ?? true,
    whatsapp: user?.social_visibility?.whatsapp ?? false, // WhatsApp é PII → opt-in (oculto por padrão)
  });
  const [saving, setSaving] = useState(false);

  const handleOf = useCallback((key: NetKey): string | undefined => {
    const raw = (user as any)?.[key];
    return raw && String(raw).trim() ? String(raw).trim() : undefined;
  }, [user]);

  const toggle = useCallback(async (key: NetKey) => {
    if (saving) return; // 1 salvamento por vez: cada PATCH faz REPLACE do jsonb; concorrência
    // com todas as 4 chaves geraria last-write-wins e perderia uma alteração no servidor.
    const prev = vis;
    const next = { ...vis, [key]: !vis[key] };
    setVis(next); // otimista
    setSaving(true);
    try {
      const updated = await updateUserMe({ social_visibility: next });
      await setUser(updated);
    } catch (e: any) {
      setVis(prev); // reverte
      alert?.error?.('Não foi possível salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }, [saving, vis, setUser, alert]);

  const trackColor = { true: SHEET.brand, false: 'rgba(255,255,255,0.16)' };

  return (
    <View style={st.screen}>
      <ScrollView contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>
        {/* Cabeçalho explicativo */}
        <View style={st.card}>
          <View style={st.rowLeft}>
            <View style={st.iconChip}>
              <Share2 size={20} color={SHEET.brand} />
            </View>
            <View style={st.flex}>
              <Text style={st.cardTitle}>Redes sociais no perfil</Text>
              <Text style={st.cardSub}>Escolha quais redes ficam visíveis para outros membros.</Text>
            </View>
          </View>
        </View>

        {/* Toggles por rede */}
        <SheetGroup title="EXIBIR NO PERFIL">
          {NETWORKS.map(({ key, label, Icon, color }) => {
            const handle = handleOf(key);
            return (
              <SheetRow
                key={key}
                icon={<Icon size={18} color={color} />}
                label={label}
                description={handle ? handle : 'Não cadastrado — adicione em Editar perfil'}
                trailing={
                  <Switch
                    value={!!vis[key]}
                    onValueChange={() => toggle(key)}
                    disabled={saving}
                    trackColor={trackColor}
                    thumbColor="#ffffff"
                  />
                }
              />
            );
          })}
        </SheetGroup>

        {/* Atalho para cadastrar/editar os handles */}
        <SheetRow
          standalone
          tone="primary"
          icon={<Pencil size={18} color={SHEET.brand} />}
          label="Editar meus perfis"
          description="Cadastre ou altere @usuários e telefone"
          trailing={<ChevronRight size={18} color={SHEET.textFaint} />}
          onPress={() => router.push('/(tabs)/(settings)/profile')}
        />

        <Text style={st.footer}>
          Redes desativadas ficam ocultas para outros membros — nem aparecem no seu perfil público.
        </Text>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SHEET.bg },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },
  flex: { flex: 1 },
  card: { backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border, borderRadius: 16, padding: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconChip: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.brandTint },
  cardTitle: { color: SHEET.textPrimary, fontSize: 16, fontWeight: '700' },
  cardSub: { color: SHEET.textMuted, fontSize: 13, marginTop: 2, lineHeight: 18 },
  footer: { color: SHEET.textFaint, fontSize: 12.5, textAlign: 'center', lineHeight: 17, paddingHorizontal: 8 },
});
