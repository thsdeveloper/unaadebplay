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

                {/* Adicionamos a tela de notificações à stack */}
                <Stack.Screen
                    name={'notifications'}
                    options={{
                        title: 'Notificações',
                        headerStyle: {
                            backgroundColor: colors.primary,
                        },
                        headerBackTitle: 'Voltar',
                        headerTintColor: colors.textInverse,
                    }}
                />

                <Stack.Screen
                    name={'contribua'}
                    options={{headerShown: false, presentation: 'modal'}}
                />
                <Stack.Screen
                    name={'(congresso)/[id]'}
                    options={{
                        title: 'Home page de Tabs',
                        headerTransparent: false
                    }}
                />
                <Stack.Screen
                    name={'(congresso)/convidado/[id]'}
                    options={
                        {title: 'Convidado', presentation: 'modal'}
                    }/>
                <Stack.Screen
                    name={'(congresso)/hospedagem/index'}
                    options={{
                        title: 'Hospedagem',
                        headerStyle: {
                            backgroundColor: colors.primary,
                        },
                        headerBackTitle: 'Voltar',
                        headerTintColor: colors.textInverse,
                    }}
                />
                <Stack.Screen
                    name={'(congresso)/cartao-acesso'}
                    options={{
                        title: 'Cartão de acesso',
                        headerStyle: {
                            backgroundColor: colors.primary,
                        },
                        headerBackTitle: 'Voltar',
                        headerTintColor: colors.textInverse,
                    }}
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
                <Stack.Screen
                    name={'users'}
                    options={{
                        title: 'Usuários',
                        headerBackTitle: 'Voltar',
                        headerTintColor: colors.textInverse,
                        headerStyle: {
                            backgroundColor: colors.primary,
                        }
                    }}
                />
                <Stack.Screen
                    name={'(profile)/[id]'}
                    options={{
                        title: 'Perfil',
                        headerBackTitle: 'Voltar',
                        headerTintColor: colors.textInverse,
                        headerStyle: {
                            backgroundColor: colors.primary,
                        }
                    }}
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
                    options={{title: 'Repertórios', presentation: 'modal'}}/>
            </Stack>
        </>
    );
}
