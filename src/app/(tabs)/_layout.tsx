import { Tabs } from 'expo-router/tabs';
import {Feather} from "@expo/vector-icons";
import React from "react";
import {useAuth} from "@/contexts/AuthContext";
import {Redirect} from "expo-router";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";
export default function TabsLayout() {
    const {signed, loading} = useAuth();
    // // Only require authentication within the (tabs) group's layout as users
    // // need to be able to access the (auth) group and sign in again.
    if (!signed) {
        // On web, static rendering will stop here as the user is not authenticated
        // in the headless Node process that the pages are rendered in.
        return <Redirect href="/(auth)/sign-in" />;
    }

    return (
        <>
            <Tabs screenOptions={{
                headerShown: true,
            }}>
                <Tabs.Screen name={'(home)'} options={{
                    title: 'Início',
                    tabBarIcon: ({color, size}) => (
                        <Feather name="home" size={size} color={color} />
                    )
                }} />
                <Tabs.Screen name={'(posts)'} options={{
                    headerShown: true,
                    title: 'Notícias',
                    tabBarIcon: ({color, size}) => (
                        <Feather name="rss" size={size} color={color} />
                    )
                }} />
                <Tabs.Screen name={'(events)'} options={{
                    headerShown: true,
                    title: 'Eventos',
                    tabBarIcon: ({color, size}) => (
                        <Feather name="calendar" size={size} color={color} />
                    )
                }} />
                <Tabs.Screen name={'(settings)'} options={{
                    headerShown: true,
                    title: 'Configurações',
                    tabBarIcon: ({color, size}) => (
                        <Feather name="settings" size={size} color={color} />
                    )
                }} />
            </Tabs>
        </>
    );
}