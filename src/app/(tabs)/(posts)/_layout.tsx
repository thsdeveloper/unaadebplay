import {Stack} from 'expo-router';
import React from "react";
import { useThemedColors } from "@/hooks/useThemedColors";

export default function PostsLayout() {
    const colors = useThemedColors();

    return (
        <Stack screenOptions={{
            headerBackTitle: 'Voltar',
            headerTintColor: colors.light,
            headerStyle: {
                backgroundColor: colors.primary,
            }
        }}>
            <Stack.Screen name={'index'} options={{title: 'Notícias'}} />
            <Stack.Screen name={'post/[id]'} options={{title: 'Notícia detail'}} />
        </Stack>
    );
}
