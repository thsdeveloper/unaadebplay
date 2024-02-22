import {Stack} from 'expo-router';
import React from "react";

export default function SettingsLayout() {
    return (
        <Stack screenOptions={{
            headerBackTitle: 'Voltar'
        }}>
            <Stack.Screen name={'index'} options={{title: 'Configurações'}} />
        </Stack>
    );
}
