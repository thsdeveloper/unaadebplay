import React from 'react';
import { View, Text as RNText, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { SHEET } from '@/constants/sheetTokens';

export interface LegalSection {
  heading: string;
  /** Parágrafos do bloco. Itens iniciados com "• " viram bullets. */
  body: string[];
}

interface LegalScreenProps {
  title: string;
  updatedAt: string;
  intro?: string;
  sections: LegalSection[];
}

/**
 * Página modal de documento legal (Termos / Privacidade) no padrão dark (SHEET).
 * Cabeçalho fixo com botão fechar, corpo rolável com seções numeradas e bullets.
 * Conteúdo estruturado para a auditoria da App Store (transparência de dados/LGPD).
 */
export const LegalScreen: React.FC<LegalScreenProps> = ({ title, updatedAt, intro, sections }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={s.screen}>
      <StatusBar style="light" />
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <RNText style={s.title} numberOfLines={1}>{title}</RNText>
        <Pressable onPress={() => router.back()} hitSlop={10} style={s.closeBtn} accessibilityRole="button" accessibilityLabel="Fechar">
          <X size={20} color={SHEET.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
      >
        <RNText style={s.updated}>Última atualização: {updatedAt}</RNText>
        {!!intro && <RNText style={s.intro}>{intro}</RNText>}

        {sections.map((sec, i) => (
          <View key={i} style={s.section}>
            <RNText style={s.heading}>{i + 1}. {sec.heading}</RNText>
            {sec.body.map((p, j) => {
              const isBullet = p.startsWith('• ');
              return (
                <RNText key={j} style={[s.paragraph, isBullet && s.bullet]}>
                  {p}
                </RNText>
              );
            })}
          </View>
        ))}

        <RNText style={s.footer}>UNAADEB Play — União da Mocidade da Assembleia de Deus.</RNText>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SHEET.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SHEET.border,
    backgroundColor: SHEET.bgDeep,
  },
  title: { color: SHEET.textPrimary, fontSize: 18, fontWeight: '800', flex: 1, marginRight: 12 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border,
  },
  updated: { color: SHEET.textFaint, fontSize: 12.5, marginBottom: 14 },
  intro: { color: SHEET.textSecondary, fontSize: 14.5, lineHeight: 21, marginBottom: 18 },
  section: { marginBottom: 20 },
  heading: { color: SHEET.textPrimary, fontSize: 15.5, fontWeight: '700', marginBottom: 8 },
  paragraph: { color: SHEET.textSecondary, fontSize: 14, lineHeight: 21, marginBottom: 8 },
  bullet: { marginLeft: 6 },
  footer: { color: SHEET.textFaint, fontSize: 12.5, textAlign: 'center', marginTop: 8, lineHeight: 18 },
});

export default LegalScreen;
