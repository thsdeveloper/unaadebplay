import {NavigationContainer} from '@react-navigation/native';
import {NativeBaseProvider, StatusBar} from "native-base";
import Routes from './src/routes';
import {AuthProvider} from './src/contexts/AuthContext';
import {AlertProvider} from "./src/contexts/AlertContext";
import 'react-native-gesture-handler';
import {ConfigProvider} from "./src/contexts/ConfigContext";
import {TranslationProvider} from "./src/contexts/TranslationContext";
import {AudioPlayerProvider} from "./src/contexts/AudioPlayerContext";
import { Alert } from 'react-native';
import * as Updates from 'expo-updates';
import {useEffect} from "react";

export default function App() {

    useEffect(() => {
        checkForUpdate();
    }, []);

    const checkForUpdate = async () => {
        try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
                Alert.alert(
                    "Nova atualização disponível",
                    "Deseja atualizar o aplicativo agora?",
                    [
                        {
                            text: "Sim",
                            onPress: async () => {
                                await Updates.fetchUpdateAsync();
                                // ... atualiza o aplicativo ...
                                await Updates.reloadAsync();
                            }
                        },
                        {
                            text: "Não",
                        }
                    ]
                );
            }
        } catch (e) {
            // tratar erro
        }
    };

    return (
        <>
            <NativeBaseProvider>
                <StatusBar backgroundColor="#0E1647"/>
                <NavigationContainer>
                    <AlertProvider>
                        <AuthProvider>
                            <ConfigProvider>
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
