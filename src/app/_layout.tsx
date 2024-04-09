import React, {useEffect, useState} from "react";
import {NativeBaseProvider, StatusBar} from "native-base";
import {AuthProvider} from '@/contexts/AuthContext';
import {AlertProvider} from "@/contexts/AlertContext";
import 'react-native-gesture-handler';
import {ConfigProvider} from "@/contexts/ConfigContext";
import {TranslationProvider} from "@/contexts/TranslationContext";
import {AudioPlayerProvider} from "@/contexts/AudioPlayerContext";
import * as SplashScreen from 'expo-splash-screen';
import {getSettings} from "@/services/settings";
import FlashMessage from "react-native-flash-message";
import {Slot} from 'expo-router'
import AppUpdateManager from "@/components/AppUpdateManager";

export default function RootLayout() {
    const [appIsReady, setAppIsReady] = useState(false);
    const [config, setConfig] = useState({});

    useEffect(() => {
        async function prepare() {
            try {
                // Mantém a tela de splash enquanto estamos preparando os recursos
                await SplashScreen.preventAutoHideAsync();

                // Carrega todas as configurações
                const configData = await getSettings();
                setConfig(configData);
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
            }
        }

        prepare();
    }, []);

    useEffect(() => {
        if (appIsReady) {
            SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return null;
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="light-content" translucent={true}/>
            <AlertProvider>
                <AuthProvider>
                    <ConfigProvider value={config}>
                        <TranslationProvider>
                            <AudioPlayerProvider>
                                <FlashMessage position="top"/>
                                <AppUpdateManager/>
                                <Slot/>
                            </AudioPlayerProvider>
                        </TranslationProvider>
                    </ConfigProvider>
                </AuthProvider>
            </AlertProvider>

        </NativeBaseProvider>
    )
}