import React, { useState, useCallback, useEffect } from 'react';
import { View, Text as RNText, ScrollView, Pressable, StyleSheet } from 'react-native';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
} from '@/components/ui/actionsheet';
import { Star, Tag as TagIcon } from 'lucide-react-native';
import { GradientButton } from '@/components/atoms/GradientButton';
import { GlassSurface } from '@/components/atoms/GlassSurface';
import { SHEET } from '@/constants/sheetTokens';
import type { NewsFilters, NewsTag } from '@/types/NewsTypes';

interface NewsFiltersSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: NewsFilters) => void;
  activeFilters: NewsFilters;
  tags: NewsTag[];
}

const Chip: React.FC<{ label: string; Icon?: any; active: boolean; onPress: () => void }> = ({ label, Icon, active, onPress }) => (
  <Pressable onPress={onPress} style={[ch.chip, active && ch.chipActive]} accessibilityRole="button" accessibilityLabel={label}>
    {Icon && <Icon size={14} color={active ? SHEET.textPrimary : SHEET.textMuted} />}
    <RNText style={[ch.chipText, active && ch.chipTextActive]}>{label}</RNText>
  </Pressable>
);

/** Bottom sheet de filtros de notícias — dark/glass, tags (multi) + toggle de destaques. */
export const NewsFiltersSheet: React.FC<NewsFiltersSheetProps> = ({ isOpen, onClose, onApplyFilters, activeFilters, tags }) => {
  const [temp, setTemp] = useState<NewsFilters>(activeFilters);

  useEffect(() => {
    if (isOpen) setTemp(activeFilters);
  }, [isOpen, activeFilters]);

  const toggleTag = useCallback((id: string) => {
    setTemp((prev) => {
      const cur = prev.tags ?? [];
      const next = cur.includes(id) ? cur.filter((t) => t !== id) : [...cur, id];
      return { ...prev, tags: next.length ? next : undefined };
    });
  }, []);

  const toggleFeatured = useCallback(() => {
    setTemp((p) => ({ ...p, featured: p.featured ? undefined : true }));
  }, []);

  const apply = useCallback(() => { onApplyFilters(temp); onClose(); }, [temp, onApplyFilters, onClose]);

  // "Limpar" remove só tags/destaques — categoria e busca ficam (são controladas fora do sheet).
  const clear = useCallback(() => {
    const { tags: _t, featured: _f, ...rest } = activeFilters;
    setTemp(rest);
    onApplyFilters(rest);
    onClose();
  }, [activeFilters, onApplyFilters, onClose]);

  const count = (temp.tags?.length ?? 0) + (temp.featured ? 1 : 0);

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent
        style={{ backgroundColor: 'transparent', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 0, paddingBottom: 0, overflow: 'hidden' }}
      >
        <GlassSurface style={StyleSheet.absoluteFill} glassEffectStyle="regular" blurIntensity={40} fallbackColor={SHEET.bg} pointerEvents="none" />
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator style={{ backgroundColor: SHEET.grabber }} />
        </ActionsheetDragIndicatorWrapper>

        <View style={f.body}>
          <View style={f.header}>
            <RNText style={f.heading}>Filtrar notícias</RNText>
            {count > 0 && (
              <View style={f.countBadge}>
                <RNText style={f.countText}>{count} {count === 1 ? 'ativo' : 'ativos'}</RNText>
              </View>
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }} keyboardShouldPersistTaps="handled">
            <RNText style={f.label}>Destaques</RNText>
            <View style={f.chips}>
              <Chip label="Somente destaques" Icon={Star} active={!!temp.featured} onPress={toggleFeatured} />
            </View>

            {tags.length > 0 && (
              <>
                <RNText style={f.label}>Tags</RNText>
                <View style={f.chips}>
                  {tags.map((tag) => (
                    <Chip key={tag.id} label={tag.name} Icon={TagIcon} active={temp.tags?.includes(tag.id) ?? false} onPress={() => toggleTag(tag.id)} />
                  ))}
                </View>
              </>
            )}
            <View style={{ height: 8 }} />
          </ScrollView>

          <View style={f.footer}>
            <Pressable onPress={clear} style={f.clearBtn} accessibilityRole="button" accessibilityLabel="Limpar filtros">
              <RNText style={f.clearText}>Limpar</RNText>
            </Pressable>
            <View style={{ flex: 1 }}>
              <GradientButton label="Aplicar" onPress={apply} />
            </View>
          </View>
        </View>
      </ActionsheetContent>
    </Actionsheet>
  );
};

export default NewsFiltersSheet;

const ch = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
  chipActive: { backgroundColor: SHEET.brand, borderColor: SHEET.brand },
  chipText: { color: SHEET.textMuted, fontSize: 13.5, fontWeight: '600' },
  chipTextActive: { color: SHEET.textPrimary },
});

const f = StyleSheet.create({
  body: { width: '100%', paddingHorizontal: 16, paddingBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, paddingBottom: 16 },
  heading: { color: SHEET.textPrimary, fontSize: 20, fontWeight: '800' },
  countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: SHEET.brandTint },
  countText: { color: SHEET.brand, fontSize: 12, fontWeight: '700' },
  label: { color: SHEET.textSecondary, fontSize: 14, fontWeight: '700', marginTop: 18, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  clearBtn: { height: 58, paddingHorizontal: 24, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
  clearText: { color: SHEET.textSecondary, fontSize: 15, fontWeight: '700' },
});
