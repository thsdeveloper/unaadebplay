import {Link, Stack} from 'expo-router';
import React from "react";
import {Feather} from "@expo/vector-icons";
import {Avatar} from "@/components/Avatar";
import {useAuth} from "@/contexts/AuthContext";
import colors from "@/constants/colors";
import {Platform, TouchableOpacity} from "react-native";
import {Box} from "native-base";

export default function HomeLayout() {
    const {user} = useAuth()
    const padding = Platform.OS === 'android' ? 4 : 0

    return (
            <Stack screenOptions={{
                headerTransparent: false,
                headerTintColor: colors.dark,
            }}>
                <Stack.Screen name={'index'} options={{
                    headerTransparent: true,
                    headerTintColor: colors.white,
                    title: `Olá ${user?.first_name}`,
                    headerRight: () => (
                        <Link href={'/users'} asChild>
                            <TouchableOpacity activeOpacity={0.7} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                                <Feather name="users" size={24} color={colors.white}/>
                            </TouchableOpacity>
                        </Link>
                    ),
                    headerLeft: () => (
                        <Box pr={padding}>
                            <Link href={'/modal'}>
                                <Avatar userAvatarID={user?.avatar} height={28} width={28}/>
                            </Link>
                        </Box>
                    )
                }}/>
                <Stack.Screen name={'contribua'} options={{headerShown: false, presentation: 'modal'}}/>
                <Stack.Screen name={'(congresso)/[id]'}
                              options={{
                                  title: 'Home page de Tabs',
                                  headerTransparent: false
                }}/>
                <Stack.Screen name={'(congresso)/convidado/[id]'}
                              options={{title: 'Convidado', presentation: 'modal'}}/>
                <Stack.Screen name={'(congresso)/hospedagem/index'} options={{
                    title: 'Hospedagem',
                    headerStyle: {
                        backgroundColor: colors.primary,
                    },
                    headerBackTitle: 'Voltar',
                    headerTintColor: colors.white,
                }
                }/>
                <Stack.Screen name={'(congresso)/pagamento-hospedagem'} options={{
                    title: 'Pagamento Hospedagem',
                    headerStyle: {
                        backgroundColor: colors.primary,
                    },
                    headerBackTitle: 'Voltar',
                    headerTintColor: colors.white,
                }
                }/>
                <Stack.Screen name={'[itemId]'} options={{title: 'Details itemID'}}/>
                <Stack.Screen name={'users'} options={{
                    title: 'Usuários',
                    headerBackTitle: 'Voltar',
                    headerTintColor: colors.light,
                    headerStyle: {
                        backgroundColor: colors.primary,
                    }
                }}/>
                <Stack.Screen name={'(profile)/[id]'} options={{
                    title: 'Perfil',
                    headerBackTitle: 'Voltar',
                    headerTintColor: colors.white,
                    headerStyle: {
                        backgroundColor: colors.primary,
                    }
                }}/>
                <Stack.Screen name={'modal'} options={{
                    title: 'Minhas informações',
                    headerTintColor: colors.light,
                    presentation: 'modal',
                    headerStyle: {
                        backgroundColor: colors.primary,
                    }
                }}/>
                <Stack.Screen name={'youtube'} options={{title: 'Youtube', presentation: 'modal'}}/>
                <Stack.Screen name={'repertories'} options={{title: 'Repertórios', presentation: 'modal'}}/>
            </Stack>
    );
}
