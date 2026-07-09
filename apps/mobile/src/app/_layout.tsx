import React, {useEffect, useState} from "react";
import "../../global.css";
import "@/utils/setupCrypto"; // Importar configuração de crypto ANTES de outros imports
import {AuthProvider} from '@/contexts/AuthContext';
import {PresenceProvider} from '@/contexts/PresenceContext';
import {AlertProvider} from "@/contexts/AlertContext";
import 'react-native-gesture-handler';
import {ConfigProvider} from "@/contexts/ConfigContext";
import {TranslationProvider} from "@/contexts/TranslationContext";
import {AudioPlayerProvider} from "@/contexts/AudioPlayerContext";
import {ThemeProvider} from "@/contexts/ThemeContext";
import {ThemedGluestackProvider} from "@/components/ThemedGluestackProvider";
import * as SplashScreen from 'expo-splash-screen';
import {getSettings} from "@/services/settings";
import FlashMessage from "react-native-flash-message";
import {Slot} from 'expo-router'
import AppUpdateManager from "@/components/AppUpdateManager";
import {useApiErrorHandler} from "@/utils/apiErrorHandler";
import {NotificationProvider} from "@/contexts/NotificationContext";
import {NotificationToast} from "@/components/NotificationToast";
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {ToastProvider} from '@/components/ui/toast';
// import {FeedbackToast, useFeedbackToast} from '@/components/FeedbackToast';
import {View} from 'react-native';
import {AnimatedSplash} from '@/components/AnimatedSplash';

// Mantém o splash NATIVO até o splash animado custom assumir (handoff sem flash).
SplashScreen.preventAutoHideAsync().catch(() => {});

// Wrapper para gerenciar o Toast globalmente
const ToastWrapper = ({ children }: { children: React.ReactNode }) => {
    // const { toastConfig, hideToast } = useFeedbackToast();
    
    return (
        <>
            {children}
            {/* <FeedbackToast
                visible={toastConfig.visible}
                message={toastConfig.message}
                type={toastConfig.type}
                onHide={hideToast}
                position="top"
            /> */}
        </>
    );
};

export default function RootLayout() {
    const [appIsReady, setAppIsReady] = useState(false);
    const [splashGone, setSplashGone] = useState(false);
    const [config, setConfig] = useState({});

    // Registrar o tratador de erros de API
    useApiErrorHandler();

    useEffect(() => {
        async function prepare() {
            try {
                console.log('🚀 [App] Iniciando app...');
                console.log('🔗 [App] API URL:', process.env.EXPO_PUBLIC_API_URL);

                // Carrega todas as configurações
                console.log('⚙️  [App] Carregando configurações...');
                const configData = await getSettings();
                console.log('✅ [App] Configurações carregadas:', configData);
                setConfig(configData);
            } catch (e) {
                console.error('❌ [App] Erro ao preparar app:', e);
                // Mesmo com erro, marcar como pronto com config vazio
                setConfig({});
            } finally {
                setAppIsReady(true);
            }
        }

        prepare();
        ''
    }, []);

    return (
        <GestureHandlerRootView style={{flex: 1}}>
            {appIsReady && (
            <ThemeProvider>
                <ThemedGluestackProvider>
                    <ToastProvider>
                        <AlertProvider>
                            <AuthProvider>
                                <PresenceProvider>
                                <ConfigProvider value={config}>
                                    <NotificationProvider>
                                        <TranslationProvider>
                                            <AudioPlayerProvider>
                                                <ToastWrapper>
                                                    <NotificationToast/>
                                                    <FlashMessage position="top"/>
                                                    <AppUpdateManager/>
                                                    <Slot/>
                                                </ToastWrapper>
                                            </AudioPlayerProvider>
                                        </TranslationProvider>
                                    </NotificationProvider>
                                </ConfigProvider>
                                </PresenceProvider>
                            </AuthProvider>
                        </AlertProvider>
                    </ToastProvider>
                </ThemedGluestackProvider>
            </ThemeProvider>
            )}

            {!splashGone && (
                <AnimatedSplash appReady={appIsReady} onExitComplete={() => setSplashGone(true)} />
            )}
        </GestureHandlerRootView>
    );
}
