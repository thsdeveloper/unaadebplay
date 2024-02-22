import {Link, Stack} from 'expo-router';
import React from "react";
import {Feather} from "@expo/vector-icons";
import {Avatar} from "@/components/Avatar";
import {useAuth} from "@/contexts/AuthContext";
import colors from "@/constants/colors";

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
                        <Link href={'/users'}>
                            <Feather name="settings" size={20} color={colors.white}/>
                        </Link>
                    ),
                    headerLeft: () => (
                        <Link href={'/modal'}>
                            <Avatar userAvatarID={user?.avatar} height={28} width={28}/>
                        </Link>
                    )
                }}/>
                <Stack.Screen name={'contribua'} options={{title: 'Contribua com a UNAADEB'}}/>
                <Stack.Screen name={'congresso'} options={{title: 'Home page de Tabs'}}/>
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
