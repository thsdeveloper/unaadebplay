import { Stack } from 'expo-router';
import React from 'react';
import { SHEET } from '@/constants/sheetTokens';

export default function SettingsLayout() {
    // Header escuro por padrão em toda a stack de configurações (mata a barra vermelha).
    return (
        <Stack
            screenOptions={{
                headerBackTitle: 'Voltar',
                headerTintColor: SHEET.textPrimary,
                headerStyle: { backgroundColor: SHEET.bg },
                headerShadowVisible: false,
                contentStyle: { backgroundColor: SHEET.bg },
            }}
        >
            <Stack.Screen name={'index'} options={{ headerShown: false }} />
            <Stack.Screen name={'notification-settings'} options={{ title: 'Notificações' }} />
        </Stack>
    );
}
