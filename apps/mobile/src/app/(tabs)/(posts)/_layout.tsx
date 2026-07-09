import {Stack} from 'expo-router';
import React from "react";
import { useThemedColors } from "@/hooks/useThemedColors";

export default function PostsLayout() {
    const colors = useThemedColors();

    return (
        <Stack screenOptions={{
            headerBackTitle: 'Voltar',
            headerTintColor: colors.textInverse,
            headerStyle: {
                backgroundColor: colors.primary,
            }
        }}>
            <Stack.Screen name={'index'} options={{ headerShown: false }} />
            <Stack.Screen name={'post/[id]'} options={{ headerShown: false }} />
        </Stack>
    );
}
