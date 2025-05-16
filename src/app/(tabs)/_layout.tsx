import {Tabs} from 'expo-router/tabs';
import {Feather} from "@expo/vector-icons";
import React from "react";
import {View} from "react-native";
import AudioPlayer from "@/components/AudioPlayer/AudioPlayer";
import {BottomTabBar} from "@react-navigation/bottom-tabs";
import {Box} from "@/components/ui/box";
import {useApiErrorHandler} from "@/utils/apiErrorHandler";

export default function TabsLayout() {
    // Registrar o tratador de erros de API
    useApiErrorHandler();

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
