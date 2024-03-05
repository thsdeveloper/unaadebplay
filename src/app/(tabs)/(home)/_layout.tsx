import {Link, Stack} from 'expo-router';
import React from "react";
import {Feather} from "@expo/vector-icons";
import {Avatar} from "@/components/Avatar";
import {useAuth} from "@/contexts/AuthContext";
import colors from "@/constants/colors";
import {TouchableOpacity} from "react-native";

export default function HomeLayout() {
    const {user} = useAuth()

    return (
        <>
            <Stack screenOptions={{
                headerTransparent: false,
                headerTintColor: colors.dark,
            }}>
                <Stack.Screen name={'index'} options={{
                    headerTransparent: true,
                    headerTintColor: colors.white,
                    title: `Olá ${user?.first_name}`,
                    headerRight: () => (
                        <Link href={'/(tabs)/(settings)'} asChild>
                            <TouchableOpacity activeOpacity={0.7} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                                <Feather name="settings" size={24} color={colors.white}/>
                            </TouchableOpacity>
                        </Link>
                    ),
                    headerLeft: () => (
                        <Link href={'/modal'}>
                            <Avatar userAvatarID={user?.avatar} height={28} width={28}/>
                        </Link>
                    )
                }}/>
                <Stack.Screen name={'contribua'} options={{headerShown: false, presentation: 'modal'}}/>
                <Stack.Screen name={'(congresso)/[id]'} options={{title: 'Home page de Tabs', headerTransparent: true}}/>
                <Stack.Screen name={'(congresso)/convidado/[id]'} options={{title: 'Convidado', presentation: 'modal'}}/>
                <Stack.Screen name={'(congresso)/hospedagem/index'} options={{
                    title: 'Hospedagem',
                    headerStyle: {
                        backgroundColor: colors.primary, // Substitua '#corDesejada' pelo código hexadecimal da cor que você deseja.
                    },
                    headerBackTitle: 'Voltar',
                    headerTintColor: colors.white,
                }
                }/>
                <Stack.Screen name={'[itemId]'} options={{title: 'Details itemID'}}/>
                <Stack.Screen name={'users'} options={{title: 'Usuários'}}/>
                <Stack.Screen name={'(profile)/[id]'} options={{title: 'Perfil'}}/>
                <Stack.Screen name={'modal'} options={{title: 'Perfil', presentation: 'modal'}}/>
                <Stack.Screen name={'youtube'} options={{title: 'Youtube', presentation: 'modal'}}/>
                <Stack.Screen name={'repertories'} options={{title: 'Repertórios', presentation: 'modal'}}/>
            </Stack>
        </>
    );
}
