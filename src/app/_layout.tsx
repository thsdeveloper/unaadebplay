import React, {useEffect, useState} from "react";
import "../../global.css";
import {GluestackUIProvider} from "@/components/ui/gluestack-ui-provider";
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
import {useApiErrorHandler} from "@/utils/apiErrorHandler";
import {NotificationProvider} from "@/contexts/NotificationContext";
import {NotificationToast} from "@/components/NotificationToast";

export default function RootLayout() {
    const [appIsReady, setAppIsReady] = useState(false);
    const [config, setConfig] = useState({});

    // Registrar o tratador de erros de API
    useApiErrorHandler();

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

        prepare();''
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
        <GluestackUIProvider mode="light">
            <AlertProvider>
                <AuthProvider>
                    <ConfigProvider value={config}>
                        <NotificationProvider>
                            <TranslationProvider>
                                <AudioPlayerProvider>
                                    <NotificationToast/>
                                    <FlashMessage position="top"/>
                                    <AppUpdateManager/>
                                    <Slot/>
                                </AudioPlayerProvider>
                            </TranslationProvider>
                        </NotificationProvider>
                    </ConfigProvider>
                </AuthProvider>
            </AlertProvider>
        </GluestackUIProvider>
    );
}
