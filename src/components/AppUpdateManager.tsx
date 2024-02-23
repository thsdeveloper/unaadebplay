import { useContext, useEffect } from 'react';
import { Alert, AppState } from 'react-native';
import * as Updates from 'expo-updates';
import AlertContext from "../contexts/AlertContext";

const AppUpdateManager = () => {
    const alert = useContext(AlertContext);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', async (nextAppState) => {
            if (nextAppState === 'active') {
                console.log('App entrou em foreground, verificando atualizações...');
                try {
                    const update = await Updates.checkForUpdateAsync();
                    if (update.isAvailable) {
                        console.log('Atualização disponível, aplicando...');
                       await Updates.fetchUpdateAsync();
                        Alert.alert(
                            'Atualização Disponível',
                            'Uma nova atualização será aplicada agora.',
                            [{ text: 'OK', onPress: () => Updates.reloadAsync() }]
                        );
                    }
                } catch (error) {
                    console.error('Erro ao verificar/aplicar atualizações:', error);
                    alert.error('Não foi possível verificar/aplicar atualizações.');
                }
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    return null; // Este componente não renderiza nada
};

export default AppUpdateManager;
