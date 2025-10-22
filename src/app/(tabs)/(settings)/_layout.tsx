import {Stack} from 'expo-router';
import React from "react";
import {useThemedColors} from "@/hooks/useThemedColors";

export default function SettingsLayout() {
    const colors = useThemedColors();

    return (
        <Stack screenOptions={{
            headerBackTitle: 'Voltar',
            headerTintColor: colors.textInverse,
            headerStyle: {
                backgroundColor: colors.primary,
            }
        }}>
            <Stack.Screen name={'index'} options={{title: 'Minhas configurações'}} />
        </Stack>
    );
}
