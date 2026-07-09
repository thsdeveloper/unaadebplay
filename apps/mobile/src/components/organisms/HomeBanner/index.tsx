import React, { useCallback, useState } from 'react';
import { View, Text as RNText, Pressable, Dimensions, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { DirectusImage } from '@/components/DirectusImage';
import { SHEET } from '@/constants/sheetTokens';

/** Banner promocional gerenciado no admin (tabela `banners`). */
export interface HomeBanner {
    id: string;
    image: string;
    title?: string | null;
    description?: string | null;
    action_label?: string | null;
    /** Rota de destino (ex.: `/(tabs)/(events)/event` ou com placeholder `[id]`). */
    page_route?: string | null;
    /** Id passado como param `id` para a rota (ex.: id do evento). */
    params_id?: string | null;
    screen?: string | null;
}

const { width: SCREEN_W } = Dimensions.get('window');
const H_MARGIN = 12;
const CARD_W = SCREEN_W - H_MARGIN * 2;
const CARD_H = 96; // mesma altura do Cartão de acesso (ActionTile feature)
const RADIUS = 18;

/**
 * Card de banner acima do "Acesso rápido". Dirigido por dados (`banners` do admin):
 * ao tocar, navega para `page_route`/`params_id` — tipicamente um evento. Não renderiza
 * nada quando não há banner ativo (a home segue cheia com os demais blocos).
 */
export const HomeBannerCard = React.memo<{ banner?: HomeBanner }>(({ banner }) => {
    const router = useRouter();
    const [pressed, setPressed] = useState(false);

    const onPress = useCallback(() => {
        if (!banner) return;
        const route = (banner.page_route || banner.screen || '').trim();
        if (!route) return;
        const id = banner.params_id?.trim();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (id && route.includes('[id]')) router.push({ pathname: route as any, params: { id } });
        else if (id) router.push(`${route.replace(/\/$/, '')}/${id}` as any);
        else router.push(route as any);
    }, [banner, router]);

    if (!banner?.image) return null;

    // Só sobrepõe texto quando há descrição/CTA. Cartazes (que já trazem o texto na arte,
    // como o do Imersão) ficam LIMPOS — o `title` serve só para admin/acessibilidade.
    const hasOverlay = !!(banner.description || banner.action_label);

    return (
        <View style={s.wrap}>
            <Pressable
                onPress={onPress}
                onPressIn={() => setPressed(true)}
                onPressOut={() => setPressed(false)}
                accessibilityRole="button"
                accessibilityLabel={banner.title ?? 'Abrir banner'}
                // Array ESTÁTICO (a forma `({pressed})=>[...]` some com o layout sob NativeWind).
                style={[s.card, pressed && s.cardPressed]}
            >
                <DirectusImage assetId={banner.image} bucket="images" width={CARD_W} height={CARD_H} resizeMode="cover" />
                {hasOverlay && (
                    <>
                        <LinearGradient
                            colors={['transparent', 'rgba(13,15,23,0.55)', 'rgba(13,15,23,0.92)']}
                            locations={[0, 0.5, 1]}
                            style={s.scrim}
                        />
                        <View style={s.content}>
                            {!!banner.title && (
                                <RNText style={s.title} numberOfLines={2}>
                                    {banner.title}
                                </RNText>
                            )}
                            {!!banner.description && (
                                <RNText style={s.desc} numberOfLines={1}>
                                    {banner.description}
                                </RNText>
                            )}
                            {!!banner.action_label && (
                                <View style={s.cta}>
                                    <RNText style={s.ctaText}>{banner.action_label}</RNText>
                                    <Feather name="arrow-right" size={14} color="#FFFFFF" />
                                </View>
                            )}
                        </View>
                    </>
                )}
            </Pressable>
        </View>
    );
});

HomeBannerCard.displayName = 'HomeBannerCard';

const s = StyleSheet.create({
    wrap: { paddingHorizontal: H_MARGIN, marginTop: 4, marginBottom: 6 },
    card: { width: CARD_W, height: CARD_H, borderRadius: RADIUS, overflow: 'hidden', backgroundColor: SHEET.surface },
    cardPressed: { opacity: 0.92 },
    scrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: Math.round(CARD_H * 0.85) },
    content: { position: 'absolute', left: 16, right: 16, bottom: 14 },
    title: { color: '#F9FAFB', fontSize: 19, fontWeight: '800', lineHeight: 23 },
    desc: { color: SHEET.textSecondary, fontSize: 13, marginTop: 3 },
    cta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        marginTop: 10,
        backgroundColor: SHEET.brand,
        paddingHorizontal: 13,
        paddingVertical: 7,
        borderRadius: 999,
    },
    ctaText: { color: '#FFFFFF', fontSize: 12.5, fontWeight: '700' },
});
