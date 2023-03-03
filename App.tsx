import {StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {NativeBaseProvider, StatusBar} from "native-base";
import Routes from './src/routes';
import {AuthProvider} from './src/contexts/auth';
import {AlertProvider} from "./src/contexts/alert";
import 'react-native-gesture-handler';

export default function App() {
    return (
        <NativeBaseProvider>
            <StatusBar backgroundColor="#0E1647"/>
            <AlertProvider>
                <NavigationContainer>
                    <AuthProvider>
                        <Routes/>
                    </AuthProvider>
                </NavigationContainer>
            </AlertProvider>
        </NativeBaseProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
