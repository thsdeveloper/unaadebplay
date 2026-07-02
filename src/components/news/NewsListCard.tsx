import React, { memo, useCallback, useState } from 'react';
import { View, Text as RNText, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Eye, Star, ChevronRight } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DirectusImage } from '@/components/DirectusImage';
import { SHEET } from '@/constants/sheetTokens';
import type { NewsTypes } from '@/types/NewsTypes';

const IMAGE_HEIGHT = 178;
const FEATURED_IMAGE_HEIGHT = 240;

interface Props {
  news: NewsTypes;
  featured?: boolean;
}

/**
 * Card de notícia (lista) — dark, cor sempre via SHEET (nunca o Text atom com color).
 * Estilo do Pressable é array ESTÁTICO + onPressIn/Out (o cssInterop do NativeWind
 * descarta a forma de função). Ver [[nativewind-pressable-function-style]].
 * `featured` = imagem maior + título maior (1º item da lista).
 */
function Base({ news, featured = false }: Props) {
  const router = useRouter();
  const [pressed, setPressed] = useState(false);

  const open = useCallback(
    () => router.push(`/(tabs)/(posts)/post/${news.id}` as any),
    [router, news.id],
  );

  const when = (() => {
    const d = new Date(news.publish_date);
    return isNaN(d.getTime()) ? '' : formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
  })();

  const catColor = news.category?.color || SHEET.brand;
  const imgH = featured ? FEATURED_IMAGE_HEIGHT : IMAGE_HEIGHT;

  return (
    <Pressable
      onPress={open}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[c.card, pressed && c.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`Abrir notícia ${news.title}`}
    >
      <View style={[c.media, { height: imgH }]}>
        <DirectusImage
          assetId={news.featured_image ?? ''}
          bucket="images"
          resizeMode="cover"
          priority={featured ? 'high' : 'normal'}
          className="bg-transparent"
          style={{ height: imgH, width: '100%', backgroundColor: SHEET.bgDeep }}
          placeholder={<View style={c.imgPlaceholder} />}
          fallback={<View style={c.imgPlaceholder} />}
        />
        <LinearGradient colors={['transparent', 'rgba(13,15,23,0.9)']} style={[c.scrim, { height: imgH * 0.7 }]} />

        {!!news.category && (
          <View style={[c.catPill, { backgroundColor: catColor }]}>
            <RNText style={c.catText} numberOfLines={1}>{news.category.name}</RNText>
          </View>
        )}
        {news.featured && (
          <View style={c.starBadge}>
            <Star size={13} color={SHEET.bgDeep} fill={SHEET.gold} />
          </View>
        )}
      </View>

      <View style={c.body}>
        <RNText style={[c.title, featured && c.titleFeatured]} numberOfLines={featured ? 3 : 2}>
          {news.title}
        </RNText>
        {!!news.excerpt && (
          <RNText style={c.excerpt} numberOfLines={2}>{news.excerpt}</RNText>
        )}

        <View style={c.metaRow}>
          {!!when && <RNText style={c.metaText}>{when}</RNText>}
          {!!news.reading_time && (
            <>
              <View style={c.dot} />
              <Clock size={13} color={SHEET.textMuted} />
              <RNText style={c.metaText}>{news.reading_time} min</RNText>
            </>
          )}
          {!!news.views_count && news.views_count > 0 && (
            <>
              <View style={c.dot} />
              <Eye size={13} color={SHEET.textMuted} />
              <RNText style={c.metaText}>{news.views_count}</RNText>
            </>
          )}
          <View style={{ flex: 1 }} />
          <RNText style={c.cta}>Ler</RNText>
          <ChevronRight size={16} color={SHEET.brand} />
        </View>
      </View>
    </Pressable>
  );
}

export const NewsListCard = memo(Base, (a, b) => a.news.id === b.news.id && a.featured === b.featured);
NewsListCard.displayName = 'NewsListCard';

const c = StyleSheet.create({
  card: { marginHorizontal: 16, marginBottom: 14, borderRadius: 18, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border, overflow: 'hidden' },
  cardPressed: { opacity: 0.92, backgroundColor: SHEET.pressed },
  media: { width: '100%', backgroundColor: SHEET.bgDeep },
  imgPlaceholder: { flex: 1, backgroundColor: SHEET.bgDeep },
  scrim: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  catPill: { position: 'absolute', top: 12, left: 12, maxWidth: '70%', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  catText: { color: SHEET.textPrimary, fontSize: 11.5, fontWeight: '700' },
  starBadge: { position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(13,15,23,0.6)', borderWidth: 1, borderColor: SHEET.border },
  body: { padding: 14, gap: 7 },
  title: { color: SHEET.textPrimary, fontSize: 17, fontWeight: '800', lineHeight: 22 },
  titleFeatured: { fontSize: 21, lineHeight: 27 },
  excerpt: { color: SHEET.textSecondary, fontSize: 13.5, lineHeight: 19 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2, paddingTop: 10, borderTopWidth: 1, borderTopColor: SHEET.hairline },
  metaText: { color: SHEET.textMuted, fontSize: 12.5 },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: SHEET.textFaint, marginHorizontal: 2 },
  cta: { color: SHEET.brand, fontSize: 13.5, fontWeight: '700' },
});
