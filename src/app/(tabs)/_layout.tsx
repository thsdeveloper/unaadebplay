import React from "react";
import { ActivityIndicator } from "react-native";
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Redirect, ThemeProvider, DarkTheme } from "expo-router";
import AudioPlayer from "@/components/AudioPlayer/AudioPlayer";
import { useApiErrorHandler } from "@/utils/apiErrorHandler";
import { useAuth } from "@/contexts/AuthContext";
import { useRepertorieContext } from "@/contexts/AudioPlayerContext";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { SHEET } from "@/constants/sheetTokens";

/**
 * Tab bar NATIVA (UITabBar). No iOS 26+ vem com Liquid Glass automático e o conteúdo
 * rola por trás nativamente; o inset inferior das telas é tratado pelo próprio nativo
 * (não usar padding manual). O mini-player de áudio vai no slot nativo BottomAccessory.
 * ThemeProvider(DarkTheme) evita o flash branco em transições no iOS 26.
 */
export default function TabsLayout() {
    useApiErrorHandler();
    const { signed, loading, user } = useAuth();
    const { repertorieID } = useRepertorieContext();

    if (loading) {
        return (
            <Center className="flex-1">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="mt-4 text-gray-600">Verificando autenticação...</Text>
            </Center>
        );
    }

    if (!signed || !user) {
        return <Redirect href="/(auth)/sign-in" />;
    }

    return (
        <ThemeProvider value={DarkTheme}>
            <NativeTabs tintColor={SHEET.brand}>
                <NativeTabs.Trigger name="(home)">
                    <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
                    <NativeTabs.Trigger.Label>Início</NativeTabs.Trigger.Label>
                </NativeTabs.Trigger>

                <NativeTabs.Trigger name="(posts)">
                    <NativeTabs.Trigger.Icon sf="newspaper.fill" md="rss_feed" />
                    <NativeTabs.Trigger.Label>Notícias</NativeTabs.Trigger.Label>
                </NativeTabs.Trigger>

                <NativeTabs.Trigger name="(events)">
                    <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
                    <NativeTabs.Trigger.Label>Eventos</NativeTabs.Trigger.Label>
                </NativeTabs.Trigger>

                <NativeTabs.Trigger name="(settings)">
                    <NativeTabs.Trigger.Icon sf="gearshape.fill" md="settings" />
                    <NativeTabs.Trigger.Label>Configurações</NativeTabs.Trigger.Label>
                </NativeTabs.Trigger>

                {/* Só monta o acessório nativo quando há áudio tocando — senão fica
                    uma cápsula de vidro vazia flutuando acima da tab bar. */}
                {repertorieID ? (
                    <NativeTabs.BottomAccessory>
                        <AudioPlayer />
                    </NativeTabs.BottomAccessory>
                ) : null}
            </NativeTabs>
        </ThemeProvider>
    );
}
