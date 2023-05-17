import {NavigationContainer} from '@react-navigation/native';
import {NativeBaseProvider, StatusBar} from "native-base";
import Routes from './src/routes';
import {AuthProvider} from './src/contexts/AuthContext';
import {AlertProvider} from "./src/contexts/AlertContext";
import 'react-native-gesture-handler';
import {ConfigProvider} from "./src/contexts/ConfigContext";
import {TranslationProvider} from "./src/contexts/TranslationContext";
import {AudioPlayerProvider} from "./src/contexts/AudioPlayerContext";
import * as SplashScreen from 'expo-splash-screen';
import {useEffect, useState} from "react";
import {getConfig} from "./src/services/config";

export default function App() {
    const [appIsReady, setAppIsReady] = useState(false);
    const [config, setConfig] = useState({});

    useEffect(() => {
        async function prepare() {
            try {
                // Mantém a tela de splash enquanto estamos preparando os recursos
                await SplashScreen.preventAutoHideAsync();

                // Carrega todas as configurações
                const configData = await getConfig();
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
        <>
            <NativeBaseProvider>
                <StatusBar backgroundColor="#0E1647" barStyle="light-content" />
                <NavigationContainer>
                    <AlertProvider>
                        <AuthProvider>
                            <ConfigProvider value={config}>
                                <TranslationProvider>
                                    <AudioPlayerProvider>
                                        <Routes/>
                                    </AudioPlayerProvider>
                                </TranslationProvider>
                            </ConfigProvider>
                        </AuthProvider>
                    </AlertProvider>
                </NavigationContainer>
            </NativeBaseProvider>
        </>
    );
}
