import React, {useContext, useEffect, useState} from "react";
import { View, StyleSheet, Text } from "react-native";
import { realtime } from "@directus/sdk";
import AlertContext from "../../../contexts/AlertContext";
import directusClient from "../../../services/api";

const clientRealTime = directusClient.with(realtime());

const CongressoPage = () => {
    const [clientReady, setClientReady] = useState(false);
    const alert = useContext(AlertContext)

    useEffect(() => {
        const initClient = async () => {
            try {
                await clientRealTime.connect();
                setClientReady(true);
                console.log('WebSocket connection established');

                // Define a função de alerta
                const showAlert = (message) => {
                    // Aqui você pode customizar sua mensagem de alerta
                    alert.success(`Mensagem recebida: ${message}`);
                };

                // Setup WebSocket event listeners
                clientRealTime.onWebSocket('open', () => console.log({ event: 'onopen' }));
                clientRealTime.onWebSocket('message', (message) => {
                    console.log({ event: 'onmessage', message })
                });
                clientRealTime.onWebSocket('close', () => console.log({ event: 'onclose' }));
                clientRealTime.onWebSocket('error', (error) => console.log({ event: 'onerror', error }));
            } catch (error) {
                console.error('Error initializing client:', error);
            }
        };

        initClient();

        // Cleanup function to disconnect the client and remove listeners
        return () => {
            clientRealTime.disconnect();
            // client.removeAllWebSocketListeners();
            console.log('WebSocket connection closed');
        };
    }, []);

    useEffect(() => {
        if (clientReady) {
            const subscribe = async () => {
                const { subscription } = await clientRealTime.subscribe('messages', {
                    event: 'update',
                    query: { fields: ['user', 'text'] },
                });

                for await (const item of subscription) {
                    alert.success('temos novidade chegando!!!')
                }
            };

            subscribe().catch(console.error);
        }
    }, [clientReady]);

    return (
        <View style={styles.center}>
            <Text>Página do Congresso</Text>
            <Text>Em breve mais informações sobre o congresso geral da UNAADEB 2024</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
    },
});

export default CongressoPage;
