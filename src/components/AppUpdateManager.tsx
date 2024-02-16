import {useContext, useEffect} from 'react';
import { Alert } from 'react-native';
import * as Updates from 'expo-updates';
import AlertContext from "../contexts/AlertContext";

const AppUpdateManager = () => {
    const alert = useContext(AlertContext);

    const appUpdateManager = {
        async checkForUpdates() {
            if (__DEV__) {
                console.log('Atualizações não são verificadas no modo de desenvolvimento.');
                return false;
            }

            try {
                const update = await Updates.checkForUpdateAsync();
                return update.isAvailable;
            } catch (error) {
                console.error('Erro ao verificar atualizações:', error);
                alert.error('Não foi possível verificar atualizações.');
                return false;
            }
        },

        async applyUpdate() {
            try {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
                alert.success('O aplicativo foi atualizado com sucesso!');
            } catch (error) {
                console.error('Erro ao aplicar a atualização:', error);
                alert.error('Não foi possível atualizar o aplicativo.');
            }
        },
    };

    useEffect(() => {
        async function handleUpdateCheck() {
            const isUpdateAvailable = await appUpdateManager.checkForUpdates();
            if (isUpdateAvailable) {
                Alert.alert(
                    'Nova atualização disponível',
                    'Atualize o aplicativo para continuar usando os recursos mais recentes!',
                    [
                        { text: 'Atualizar', onPress: () => appUpdateManager.applyUpdate() },
                    ],
                );
            }
        }

        handleUpdateCheck();
    }, []);

    return null; // Este componente não renderiza nada
};

export default AppUpdateManager;
