import {Stack} from 'expo-router';
import React from "react";
import colors from "@/constants/colors";

export default function SettingsLayout() {
    return (
        <Stack screenOptions={{
            headerBackTitle: 'Voltar',
            headerTintColor: colors.light,
            headerStyle: {
                backgroundColor: colors.primary,
            }
        }}>
            <Stack.Screen name={'index'} options={{title: 'Minhas configurações'}} />
        </Stack>
    );
}
