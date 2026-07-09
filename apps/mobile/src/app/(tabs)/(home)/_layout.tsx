import {Stack} from 'expo-router';
import React from "react";
import {useThemedColors} from "@/hooks/useThemedColors";

export default function HomeLayout() {
    const colors = useThemedColors();

    return (
        <>
            <Stack screenOptions={{
                headerTransparent: false,
                headerTintColor: colors.text,
            }}>
                {/* Header nativo desligado: a Home desenha um header custom animado
                    (hide-on-scroll) dentro da própria tela. */}
                <Stack.Screen name={'index'} options={{ headerShown: false }} />

                {/* Notificações: header nativo desligado — a tela desenha um header dark custom. */}
                <Stack.Screen name={'notifications'} options={{ headerShown: false }} />

                <Stack.Screen
                    name={'contribua'}
                    options={{headerShown: false, presentation: 'modal'}}
                />
                {/* Telas do congresso refeitas no padrão dark SHEET: header nativo
                    desligado — cada tela desenha seu próprio header overlay. */}
                <Stack.Screen
                    name={'(congresso)/[id]'}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name={'(congresso)/convidado/[id]'}
                    options={{ headerShown: false, presentation: 'modal' }}
                />
                {/* Programação do congresso — modal (sobe de baixo); dark evita flash branco. */}
                <Stack.Screen
                    name={'(congresso)/programacao/[id]'}
                    options={{ headerShown: false, presentation: 'modal', contentStyle: { backgroundColor: '#0E1526' } }}
                />
                <Stack.Screen
                    name={'(congresso)/hospedagem/index'}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name={'(congresso)/cartao-acesso'}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name={'(congresso)/pagamento-hospedagem'}
                    options={{
                        title: 'Pagamento Hospedagem',
                        headerStyle: {
                            backgroundColor: colors.primary,
                        },
                        headerBackTitle: 'Voltar',
                        headerTintColor: colors.textInverse,
                    }}
                />
                <Stack.Screen
                    name={'[itemId]'}
                    options={{title: 'Details itemID'}}/>
                {/* Diretório de membros no padrão dark SHEET — header próprio (overlay). */}
                <Stack.Screen
                    name={'users'}
                    options={{ headerShown: false }}
                />
                {/* Perfil no padrão dark SHEET — header próprio (hero cinematográfico + voltar overlay). */}
                <Stack.Screen
                    name={'(profile)/[id]'}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name={'modal'}
                    options={{
                        presentation: 'modal',
                        headerShown: false,
                        // Sheet escuro desenha o próprio header; contentStyle evita o flash branco no mount/dismiss (iOS).
                        contentStyle: { backgroundColor: '#0E1526' },
                    }}
                />
                <Stack.Screen
                    name={'youtube'}
                    options={
                        {
                            title: 'Youtube', presentation: 'modal'
                        }
                    }/>
                <Stack.Screen
                    name={'repertories'}
                    options={{headerShown: false}}/>
            </Stack>
        </>
    );
}
