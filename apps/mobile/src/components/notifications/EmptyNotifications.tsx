import React, { memo } from 'react';
import { View, Pressable, Text as RNText, ActivityIndicator, StyleSheet } from 'react-native';
import { BellOff, RefreshCw } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SHEET } from '@/constants/sheetTokens';

interface EmptyNotificationsProps {
    isLoading: boolean;
    onRefresh: () => void;
}

export const EmptyNotifications = memo<EmptyNotificationsProps>(({ isLoading, onRefresh }) => {
    if (isLoading) {
        return (
            <Animated.View entering={FadeIn.duration(300)} style={s.center}>
                <ActivityIndicator size="large" color={SHEET.brand} />
                <RNText style={s.loadingText}>Carregando notificações…</RNText>
            </Animated.View>
        );
    }

    return (
        <Animated.View entering={FadeInDown.duration(450)} style={s.center}>
            <View style={s.iconCircle}>
                <BellOff size={34} color={SHEET.textFaint} strokeWidth={1.8} />
            </View>
            <RNText style={s.title}>Nenhuma notificação</RNText>
            <RNText style={s.subtitle}>Você está em dia. Novas atividades{'\n'}aparecerão aqui.</RNText>

            <Pressable onPress={onRefresh} style={s.refreshBtn}>
                <RefreshCw size={17} color={SHEET.textPrimary} strokeWidth={2.4} />
                <RNText style={s.refreshText}>Atualizar</RNText>
            </Pressable>
        </Animated.View>
    );
});

EmptyNotifications.displayName = 'EmptyNotifications';

const s = StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingTop: 40 },
    loadingText: { color: SHEET.textMuted, fontSize: 14, marginTop: 14 },

    iconCircle: {
        width: 84,
        height: 84,
        borderRadius: 42,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: SHEET.glass,
        borderWidth: 1,
        borderColor: SHEET.border,
        marginBottom: 20,
    },
    title: { color: SHEET.textPrimary, fontSize: 18, fontWeight: '800', textAlign: 'center' },
    subtitle: { color: SHEET.textMuted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8 },

    refreshBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 24,
        paddingHorizontal: 22,
        paddingVertical: 12,
        borderRadius: 999,
        backgroundColor: SHEET.glass,
        borderWidth: 1,
        borderColor: SHEET.border,
    },
    refreshBtnPressed: { opacity: 0.7 },
    refreshText: { color: SHEET.textPrimary, fontSize: 14.5, fontWeight: '700' },
});
