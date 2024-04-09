import {Tabs} from 'expo-router/tabs';
import {Feather} from "@expo/vector-icons";
import React from "react";
import {useAuth} from "@/contexts/AuthContext";
import {Redirect} from "expo-router";
import {View} from "react-native";
import AudioPlayer from "@/components/AudioPlayer/AudioPlayer";
import {BottomTabBar} from "@react-navigation/bottom-tabs";
import {Box} from "native-base";

export default function TabsLayout() {
    const {signed, loading} = useAuth();
    // // Only require authentication within the (tabs) group's layout as users
    // // need to be able to access the (auth) group and sign in again.
    if (!signed) {
        // On web, static rendering will stop here as the user is not authenticated
        // in the headless Node process that the pages are rendered in.
        return <Redirect href="/(auth)/sign-in"/>;
    }
    //

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
