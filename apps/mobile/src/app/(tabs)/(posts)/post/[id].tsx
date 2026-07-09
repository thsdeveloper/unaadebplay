import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text as RNText,
  Pressable,
  Animated,
  Share,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import RenderHtml, { defaultSystemFonts } from 'react-native-render-html';
import {
  ArrowLeft, Share2, Clock, Eye, CalendarDays, Newspaper, Tag, ArrowUpRight,
} from 'lucide-react-native';
import { DirectusImage } from '@/components/DirectusImage';
import { NewsListCard } from '@/components/news/NewsListCard';
import { useNewsItem } from '@/hooks/useNews';
import { SHEET } from '@/constants/sheetTokens';
import type { NewsTypes } from '@/types/NewsTypes';

const HERO_HEIGHT = 360;
const BAR_HEIGHT = 50;

/* ---- Tipografia do corpo (HTML) — dark, links/citações em marca. Objetos ESTÁVEIS
   (fora do render) porque o react-native-render-html re-processa se a ref muda. ---- */
const HTML_BASE = { color: SHEET.textSecondary, fontSize: 16.5, lineHeight: 27 } as const;
const HTML_TAGS = {
  p: { marginTop: 0, marginBottom: 16 },
  h1: { color: SHEET.textPrimary, fontSize: 25, fontWeight: '800', lineHeight: 31, marginTop: 8, marginBottom: 12 },
  h2: { color: SHEET.textPrimary, fontSize: 21, fontWeight: '800', lineHeight: 27, marginTop: 12, marginBottom: 10 },
  h3: { color: SHEET.textPrimary, fontSize: 18, fontWeight: '700', lineHeight: 24, marginTop: 10, marginBottom: 8 },
  strong: { color: SHEET.textPrimary, fontWeight: '700' },
  b: { color: SHEET.textPrimary, fontWeight: '700' },
  em: { fontStyle: 'italic' },
  a: { color: SHEET.brand, textDecorationLine: 'none', fontWeight: '600' },
  li: { color: SHEET.textSecondary, marginBottom: 6 },
  ul: { marginBottom: 12 },
  ol: { marginBottom: 12 },
  img: { borderRadius: 14, marginVertical: 8 },
  blockquote: {
    marginVertical: 14,
    marginLeft: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 3,
    borderLeftColor: SHEET.brand,
    backgroundColor: SHEET.brandTint,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
} as const;
const HTML_SYSTEM_FONTS = [...defaultSystemFonts];

/** Chip de metadado (data, tempo de leitura, views) — ícone + texto, dark. */
const MetaChip: React.FC<{ Icon: any; label: string }> = ({ Icon, label }) => (
  <View style={s.metaChip}>
    <Icon size={13} color={SHEET.textMuted} />
    <RNText style={s.metaChipText}>{label}</RNText>
  </View>
);

function NewsDetail() {
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { news, relatedNews, isLoading, error } = useNewsItem(id as string);

  // Scroll (JS driver: a barra de progresso usa width em %, que não é nativo-compatível;
  // manter TUDO no mesmo driver evita o crash "both native and JS driver").
  const scrollY = useRef(new Animated.Value(0)).current;
  const [scrollRange, setScrollRange] = useState(1);
  const layoutH = useRef(0);
  const contentH = useRef(0);

  const recomputeRange = useCallback(() => {
    setScrollRange(Math.max(1, contentH.current - layoutH.current));
  }, []);

  const onScroll = useMemo(
    () => Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false }),
    [scrollY],
  );

  const headerHeight = insets.top + BAR_HEIGHT;

  const headerBgOpacity = scrollY.interpolate({
    inputRange: [HERO_HEIGHT - 160, HERO_HEIGHT - 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const heroContentOpacity = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT * 0.45],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const heroTranslate = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT],
    outputRange: [0, HERO_HEIGHT * 0.35],
    extrapolateLeft: 'clamp',
  });
  const heroScale = scrollY.interpolate({
    inputRange: [-HERO_HEIGHT, 0],
    outputRange: [2.2, 1],
    extrapolateRight: 'clamp',
  });
  const progressWidth = scrollY.interpolate({
    inputRange: [0, scrollRange],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const onShare = useCallback(async () => {
    if (!news) return;
    try {
      await Share.share({ title: news.title, message: `${news.title}\n\n${news.excerpt || ''}\n\nLeia no app UNAADEB Play!` });
    } catch {
      /* usuário cancelou */
    }
  }, [news]);

  const publishedAt = useMemo(() => {
    if (!news?.publish_date) return '';
    const d = new Date(news.publish_date);
    return isNaN(d.getTime()) ? '' : format(d, "d 'de' MMM 'de' yyyy", { locale: ptBR });
  }, [news?.publish_date]);

  const htmlSource = useMemo(() => ({ html: news?.content || '' }), [news?.content]);

  // Header CUSTOM sobreposto (headerShown:false). No iOS 26 o header do native-stack
  // desenha um "vidro" atrás dos botões → pílulas duplicadas. Desenhamos pílulas sólidas
  // nós mesmos, como overlay absoluto. Ver [[ios26-native-header-glass-platter]].
  const renderHeader = useCallback((compactTitle?: string) => (
    <>
      <Animated.View
        pointerEvents="none"
        style={[hs.bg, { height: headerHeight, opacity: headerBgOpacity }]}
      />
      <View style={[hs.bar, { paddingTop: insets.top + 5, height: headerHeight }]} pointerEvents="box-none">
        <Pressable onPress={() => router.back()} hitSlop={8} style={hs.pill} accessibilityRole="button" accessibilityLabel="Voltar">
          <ArrowLeft size={21} color={SHEET.textPrimary} strokeWidth={2.5} />
        </Pressable>
        {compactTitle ? (
          <Animated.Text numberOfLines={1} style={[hs.compactTitle, { opacity: headerBgOpacity }]}>
            {compactTitle}
          </Animated.Text>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        <Pressable onPress={onShare} hitSlop={8} style={hs.pill} accessibilityRole="button" accessibilityLabel="Compartilhar">
          <Share2 size={18} color={SHEET.textPrimary} strokeWidth={2.4} />
        </Pressable>
      </View>
      {/* Barra de progresso de leitura */}
      <View style={[hs.progressTrack, { top: headerHeight - 2.5 }]} pointerEvents="none">
        <Animated.View style={[hs.progressFill, { width: progressWidth }]} />
      </View>
    </>
  ), [headerHeight, headerBgOpacity, insets.top, router, onShare, progressWidth]);

  /* -------------------------------- Loading -------------------------------- */
  if (isLoading) {
    return (
      <View style={s.screen}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar style="light" />
        {renderHeader()}
        <View style={{ height: HERO_HEIGHT, backgroundColor: SHEET.bgDeep }} />
        <View style={s.body}>
          <View style={[sk.line, { width: '55%', height: 14 }]} />
          <View style={[sk.line, { width: '90%', height: 26, marginTop: 12 }]} />
          <View style={[sk.line, { width: '70%', height: 26, marginTop: 8 }]} />
          <View style={[sk.card, { marginTop: 20 }]} />
          <View style={[sk.line, { width: '100%', marginTop: 22 }]} />
          <View style={[sk.line, { width: '96%' }]} />
          <View style={[sk.line, { width: '92%' }]} />
          <View style={[sk.line, { width: '98%' }]} />
          <View style={[sk.line, { width: '60%' }]} />
        </View>
      </View>
    );
  }

  /* --------------------------------- Erro ---------------------------------- */
  if (error || !news) {
    return (
      <View style={s.screen}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar style="light" />
        {renderHeader()}
        <View style={s.centered}>
          <View style={s.emptyIcon}><Newspaper size={30} color={SHEET.danger} /></View>
          <RNText style={s.emptyTitle}>Notícia não encontrada</RNText>
          <RNText style={s.emptyDesc}>{error || 'Não foi possível carregar esta notícia.'}</RNText>
          <Pressable onPress={() => router.back()} style={s.emptyBtn}>
            <RNText style={s.emptyBtnText}>Voltar</RNText>
          </Pressable>
        </View>
      </View>
    );
  }

  const catColor = news.category?.color || SHEET.brand;

  /* -------------------------------- Conteúdo ------------------------------- */
  return (
    <View style={s.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <Animated.ScrollView
        style={s.screen}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        onLayout={(e) => { layoutH.current = e.nativeEvent.layout.height; recomputeRange(); }}
        onContentSizeChange={(_, h) => { contentH.current = h; recomputeRange(); }}
      >
        {/* Hero */}
        <View style={s.hero}>
          <Animated.View style={[s.heroImgWrap, { transform: [{ translateY: heroTranslate }, { scale: heroScale }] }]}>
            {news.featured_image ? (
              <DirectusImage
                assetId={news.featured_image}
                bucket="images"
                resizeMode="cover"
                priority="high"
                style={s.heroImg}
                placeholder={<View style={s.heroPlaceholder} />}
                fallback={<View style={s.heroPlaceholder} />}
              />
            ) : (
              <View style={[s.heroImg, s.heroFallback]}><Newspaper size={54} color={SHEET.textFaint} /></View>
            )}
          </Animated.View>
          <LinearGradient colors={['rgba(13,15,23,0.35)', 'transparent', 'rgba(13,15,23,0.5)', SHEET.bg]} locations={[0, 0.35, 0.75, 1]} style={s.heroScrim} />

          <Animated.View style={[s.heroContent, { opacity: heroContentOpacity }]}>
            {!!news.category && (
              <View style={[s.catPill, { backgroundColor: catColor }]}>
                <RNText style={s.catText} numberOfLines={1}>{news.category.name}</RNText>
              </View>
            )}
            <RNText style={s.heroTitle} numberOfLines={4}>{news.title}</RNText>
          </Animated.View>
        </View>

        {/* Corpo */}
        <View style={s.body}>
          {/* Autor + metadados */}
          <View style={s.authorRow}>
            {news.author ? (
              <>
                {news.author.avatar ? (
                  <DirectusImage assetId={news.author.avatar} bucket="avatars" resizeMode="cover" style={s.avatar} />
                ) : (
                  <View style={[s.avatar, s.avatarFallback]}>
                    <RNText style={s.avatarInitials}>{(news.author.first_name?.charAt(0) || 'U').toUpperCase()}</RNText>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <RNText style={s.authorName} numberOfLines={1}>
                    {news.author.first_name} {news.author.last_name}
                  </RNText>
                  {!!publishedAt && <RNText style={s.authorMeta}>{publishedAt}</RNText>}
                </View>
              </>
            ) : (
              !!publishedAt && (
                <View style={s.authorRowNoAvatar}>
                  <CalendarDays size={15} color={SHEET.textMuted} />
                  <RNText style={s.authorMeta}>{publishedAt}</RNText>
                </View>
              )
            )}
          </View>

          <View style={s.metaChipsRow}>
            {!!news.reading_time && <MetaChip Icon={Clock} label={`${news.reading_time} min de leitura`} />}
            {news.views_count !== undefined && news.views_count > 0 && (
              <MetaChip Icon={Eye} label={`${news.views_count} visualizações`} />
            )}
          </View>

          {!!news.excerpt && (
            <View style={s.excerptWrap}>
              <RNText style={s.excerpt}>{news.excerpt}</RNText>
            </View>
          )}

          <View style={s.divider} />

          {/* Conteúdo HTML */}
          <RenderHtml
            contentWidth={width - 32}
            source={htmlSource}
            baseStyle={HTML_BASE}
            tagsStyles={HTML_TAGS as any}
            systemFonts={HTML_SYSTEM_FONTS}
            enableExperimentalMarginCollapsing
          />

          {/* Tags */}
          {!!news.tags && news.tags.length > 0 && (
            <View style={s.tagsWrap}>
              <View style={s.sectionHeader}>
                <Tag size={16} color={SHEET.brand} />
                <RNText style={s.sectionTitle}>Tags</RNText>
              </View>
              <View style={s.tagsRow}>
                {news.tags.map((tag) => (
                  <View key={tag.id} style={s.tagPill}>
                    <RNText style={s.tagText}>#{tag.name}</RNText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Galeria */}
          {!!news.gallery && news.gallery.length > 0 && (
            <View style={s.galleryWrap}>
              <View style={s.sectionHeader}>
                <RNText style={s.sectionTitle}>Galeria</RNText>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.galleryRow}>
                {news.gallery.map((img, i) => (
                  <View key={`${img}-${i}`} style={s.galleryItem}>
                    <DirectusImage assetId={img} bucket="images" resizeMode="cover" style={s.galleryImg} placeholder={<View style={s.heroPlaceholder} />} />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Relacionadas */}
        {relatedNews.length > 0 && (
          <View style={s.relatedWrap}>
            <View style={[s.sectionHeader, s.relatedHeader]}>
              <RNText style={s.sectionTitle}>Leia também</RNText>
              <Pressable onPress={() => router.push('/(tabs)/(posts)' as any)} hitSlop={8} style={s.seeAllBtn} accessibilityRole="button" accessibilityLabel="Ver todas as notícias">
                <RNText style={s.seeAll}>Ver todas</RNText>
                <ArrowUpRight size={15} color={SHEET.brand} />
              </Pressable>
            </View>
            {relatedNews.map((item: NewsTypes) => (
              <NewsListCard key={item.id} news={item} />
            ))}
          </View>
        )}
      </Animated.ScrollView>

      {renderHeader(news.title)}
    </View>
  );
}

export default React.memo(NewsDetail);

/* --------------------------------- Header -------------------------------- */
const PILL_BG = 'rgba(10,12,20,0.58)';
const PILL_BORDER = 'rgba(255,255,255,0.22)';

const hs = StyleSheet.create({
  bg: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 15,
    backgroundColor: SHEET.bg,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: SHEET.border,
  },
  bar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingBottom: 5,
  },
  pill: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: PILL_BG,
    borderWidth: StyleSheet.hairlineWidth, borderColor: PILL_BORDER,
  },
  compactTitle: { flex: 1, color: SHEET.textPrimary, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  progressTrack: {
    position: 'absolute', left: 0, right: 0, height: 2.5, zIndex: 21,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  progressFill: { height: 2.5, backgroundColor: SHEET.brand },
});

/* ---------------------------------- Tela --------------------------------- */
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SHEET.bg },
  scroll: { paddingBottom: 44 },

  hero: { height: HERO_HEIGHT, width: '100%', backgroundColor: SHEET.bgDeep, overflow: 'hidden' },
  heroImgWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroImg: { height: HERO_HEIGHT, width: '100%', backgroundColor: SHEET.bgDeep },
  heroPlaceholder: { flex: 1, backgroundColor: SHEET.bgDeep },
  heroFallback: { alignItems: 'center', justifyContent: 'center' },
  heroScrim: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  heroContent: { position: 'absolute', left: 16, right: 16, bottom: 16, gap: 10 },
  catPill: { alignSelf: 'flex-start', maxWidth: '70%', paddingHorizontal: 11, paddingVertical: 5, borderRadius: 999 },
  catText: { color: SHEET.textPrimary, fontSize: 12, fontWeight: '700' },
  heroTitle: { color: SHEET.textPrimary, fontSize: 27, fontWeight: '800', lineHeight: 33 },

  body: { paddingHorizontal: 16, paddingTop: 18 },

  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  authorRowNoAvatar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: SHEET.bgDeep },
  avatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.brandTint },
  avatarInitials: { color: SHEET.brand, fontSize: 16, fontWeight: '800' },
  authorName: { color: SHEET.textPrimary, fontSize: 15, fontWeight: '700' },
  authorMeta: { color: SHEET.textMuted, fontSize: 13, marginTop: 1 },

  metaChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
  metaChipText: { color: SHEET.textMuted, fontSize: 12.5, fontWeight: '600' },

  excerptWrap: { marginTop: 16 },
  excerpt: { color: SHEET.textPrimary, fontSize: 17, lineHeight: 25, fontWeight: '500' },

  divider: { height: 1, backgroundColor: SHEET.hairline, marginVertical: 18 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { color: SHEET.textPrimary, fontSize: 16, fontWeight: '800' },

  tagsWrap: { marginTop: 24 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagPill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
  tagText: { color: SHEET.textSecondary, fontSize: 13, fontWeight: '600' },

  galleryWrap: { marginTop: 26 },
  galleryRow: { gap: 12, paddingRight: 4 },
  galleryItem: { width: 260, height: 168, borderRadius: 16, overflow: 'hidden', backgroundColor: SHEET.bgDeep },
  galleryImg: { width: 260, height: 168 },

  relatedWrap: { marginTop: 30, paddingHorizontal: 0 },
  relatedHeader: { justifyContent: 'space-between', paddingHorizontal: 16 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  seeAll: { color: SHEET.brand, fontSize: 13.5, fontWeight: '700' },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border, marginBottom: 16 },
  emptyTitle: { color: SHEET.textPrimary, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptyDesc: { color: SHEET.textMuted, fontSize: 13.5, textAlign: 'center', marginTop: 6, lineHeight: 19 },
  emptyBtn: { marginTop: 18, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
  emptyBtnText: { color: SHEET.textPrimary, fontSize: 14, fontWeight: '700' },
});

/* ------------------------------- Skeleton -------------------------------- */
const sk = StyleSheet.create({
  line: { height: 15, borderRadius: 7, backgroundColor: SHEET.glass, marginTop: 10 },
  card: { height: 64, borderRadius: 16, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
});
