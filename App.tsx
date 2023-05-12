import {NavigationContainer} from '@react-navigation/native';
import {NativeBaseProvider, StatusBar} from "native-base";
import Routes from './src/routes';
import {AuthProvider} from './src/contexts/AuthContext';
import {AlertProvider} from "./src/contexts/alert";
import 'react-native-gesture-handler';
import {ConfigProvider} from "./src/contexts/ConfigContext";
import {TranslationProvider} from "./src/contexts/TranslationContext";
import {AudioPlayerProvider} from "./src/contexts/AudioPlayerContext";
import React from "react";

export default function App() {
    return (
        <NativeBaseProvider>
            <StatusBar backgroundColor="#0E1647"/>
            <AlertProvider>
                <NavigationContainer>
                    <AuthProvider>
                        <ConfigProvider>
                            <TranslationProvider>
                                <AudioPlayerProvider>
                                    <Routes/>
                                </AudioPlayerProvider>
                            </TranslationProvider>
                        </ConfigProvider>
                    </AuthProvider>
                </NavigationContainer>
            </AlertProvider>
        </NativeBaseProvider>
    );
}
