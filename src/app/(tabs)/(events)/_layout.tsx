import {Stack} from 'expo-router';
import React from "react";

export default function EventLayout() {
    return (
        <Stack screenOptions={{
            headerBackTitle: 'Voltar'
        }}>
            <Stack.Screen name={'index'} options={{title: 'Events'}} />
            <Stack.Screen name={'event/[id]'} options={{title: 'event detail>'}} />
        </Stack>
    );
}
