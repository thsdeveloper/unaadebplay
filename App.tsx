import {NavigationContainer} from '@react-navigation/native';
import {NativeBaseProvider, StatusBar} from "native-base";
import Routes from './src/routes';
import {AuthProvider} from './src/contexts/auth';
import {AlertProvider} from "./src/contexts/alert";
import 'react-native-gesture-handler';
import {ConfigProvider} from "./src/contexts/ConfigContext";
import {TranslationProvider} from "./src/contexts/TranslationContext";

export default function App() {
    return (
        <NativeBaseProvider>
            <StatusBar backgroundColor="#0E1647"/>
            <AlertProvider>
                <NavigationContainer>
                    <AuthProvider>
                        <ConfigProvider>
                            <TranslationProvider>
                                <Routes/>
                            </TranslationProvider>
                        </ConfigProvider>
                    </AuthProvider>
                </NavigationContainer>
            </AlertProvider>
        </NativeBaseProvider>
    );
}
