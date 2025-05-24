import {Tabs} from 'expo-router/tabs';
import {Feather} from "@expo/vector-icons";
import React from "react";
import {View, ActivityIndicator} from "react-native";
import AudioPlayer from "@/components/AudioPlayer/AudioPlayer";
import {BottomTabBar} from "@react-navigation/bottom-tabs";
import {Box} from "@/components/ui/box";
import {useApiErrorHandler} from "@/utils/apiErrorHandler";
import {useAuth} from "@/contexts/AuthContext";
import {Redirect} from "expo-router";
import {Center} from "@/components/ui/center";
import {Text} from "@/components/ui/text";

export default function TabsLayout() {
    // Registrar o tratador de erros de API
    useApiErrorHandler();
    
    const {signed, loading, user} = useAuth();

    // Mostrar loading enquanto verifica autenticação
    if (loading) {
        return (
            <Center className="flex-1">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="mt-4 text-gray-600">Verificando autenticação...</Text>
            </Center>
        );
    }

    // Se não estiver autenticado, redirecionar para login
    if (!signed || !user) {
        return <Redirect href="/(auth)/sign-in" />;
    }

    return (
        <View style={{flex: 1}}>
            <Tabs
                screenOptions={
                    {
                        headerShown: false,
                    }}
                tabBar={(props) => (
                    <Box>
                        <Box>
                            <AudioPlayer />
                        </Box>
                        <BottomTabBar {...props} />
                    </Box>
                )}
            >
                <Tabs.Screen name={'(home)'} options={{
                    title: 'Início',
                    tabBarIcon: ({color, size}) => (
                        <Feather name="home" size={size} color={color}/>
                    )
                }}/>
                <Tabs.Screen name={'(posts)'} options={{
                    title: 'Notícias',
                    tabBarIcon: ({color, size}) => (
                        <Feather name="rss" size={size} color={color}/>
                    )
                }}/>
                <Tabs.Screen name={'(events)'} options={{
                    title: 'Eventos',
                    tabBarIcon: ({color, size}) => (
                        <Feather name="calendar" size={size} color={color}/>
                    )
                }}/>
                <Tabs.Screen name={'(settings)'} options={{
                    title: 'Configurações',
                    tabBarIcon: ({color, size}) => (
                        <Feather name="settings" size={size} color={color}/>
                    )
                }}/>
            </Tabs>
        </View>
    );
}
