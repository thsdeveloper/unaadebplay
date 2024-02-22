import {Stack} from 'expo-router';
import React from "react";

export default function PostsLayout() {
    return (
        <Stack screenOptions={{
            headerBackTitle: 'Voltar'
        }}>
            <Stack.Screen name={'index'} options={{title: 'Notícias'}} />
            <Stack.Screen name={'post/[id]'} options={{title: 'Notícia detail>'}} />
        </Stack>
    );
}
