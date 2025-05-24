import {Link, Stack} from 'expo-router';
import React from "react";
import {Avatar} from "@/components/Avatar";
import {useAuth} from "@/contexts/AuthContext";
import colors from "@/constants/colors";
import {Box} from "@/components/ui/box";
import {NotificationBell} from "@/components/NotificationBell"; // Importamos o novo componente

export default function HomeLayout() {
    const {user} = useAuth()
    console.log('user', user)
    return (
        <>
            <Stack screenOptions={{
                headerTransparent: false,
                headerTintColor: colors.dark,
            }}>
                <Stack.Screen name={'index'} options={{
                    headerTransparent: true,
                    headerTintColor: colors.white,
                    title: `Olá ${user?.first_name}, bem-vindo`,
                    headerShadowVisible: false,
                    headerRight: () => user ? (
                        <Box>
                            <NotificationBell color={colors.white} />
                        </Box>
                    ) : null,
                    headerLeft: () => user ? (
                        <Box>
                            <Link href={'/modal'}>
                                <Avatar
                                    userAvatarID={user?.avatar}
                                    name={user?.first_name}
                                    size={'sm'}/>
                            </Link>
                        </Box>
                    ) : null
                }}/>

                {/* Adicionamos a tela de notificações à stack */}
                <Stack.Screen
                    name={'notifications'}
                    options={{
                        title: 'Notificações',
                        headerStyle: {
                            backgroundColor: colors.primary,
                        },
                        headerBackTitle: 'Voltar',
                        headerTintColor: colors.white,
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
                        headerTintColor: colors.white,
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
                        headerTintColor: colors.white,
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
                        headerTintColor: colors.white,
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
                        headerTintColor: colors.light,
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
                        headerTintColor: colors.white,
                        headerStyle: {
                            backgroundColor: colors.primary,
                        }
                    }
                    }/>
                <Stack.Screen
                    name={'modal'}
                    options={{
                        title: 'Minhas informações',
                        headerTintColor: colors.light,
                        presentation: 'modal',
                        headerStyle: {
                            backgroundColor: colors.primary,
                        }
                    }
                    }/>
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
