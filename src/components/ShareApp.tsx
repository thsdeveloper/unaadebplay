import React from 'react';
import { Button, Box} from 'native-base';
import * as Sharing from 'expo-sharing';

export default function ShareApp() {
    const shareApp = async () => {
        try {
            const shareOptions = {
                message: 'Confira este incrível aplicativo: https://kljhdskjhghk.com.br',
                title: 'Compartilhe nosso aplicativo',
                dialogTitle: 'Compartilhe nosso aplicativo',
            };

            await Sharing.shareAsync('http://localhost:8080', shareOptions);
        } catch (error) {
            console.log("Erro ao compartilhar: ", error.message);
        }
    };

    return (
        <Box>
            <Button onPress={shareApp}>Compartilhar</Button>
        </Box>
    );
}
