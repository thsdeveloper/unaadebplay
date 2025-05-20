import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ScrollView, Switch, TouchableOpacity, Linking, Platform, AppState} from 'react-native';
import {Stack, useFocusEffect} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

import {Box} from "@/components/ui/box";
import {HStack} from "@/components/ui/hstack";
import {VStack} from "@/components/ui/vstack";
import {Button, ButtonText} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";
import {Text} from "@/components/ui/text";
import {Spinner} from "@/components/ui/spinner";
import {useNotifications} from "@/contexts/NotificationContext";
import {Divider} from "@/components/ui/divider";

export default function NotificationSettingsScreen() {
    const {
        notificationsEnabled,
        requestPermissions,
        unreadCount,
        registerDevice,
        markAllAsRead,
        checkNotificationPermissions
    } = useNotifications();


    const [loading, setLoading] = useState(false);
    const [appState, setAppState] = useState(AppState.currentState);

    // Verificar permissões quando o estado do app mudar
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.match(/inactive|background/) && nextAppState === 'active') {
                // App voltou ao primeiro plano, verificar permissões
                checkPermissionsStatus();
            }
            setAppState(nextAppState);
        });

        return () => {
            subscription.remove();
        };
    }, [appState]);

    // Verificar permissões quando a tela receber foco
    useFocusEffect(
        React.useCallback(() => {
            checkPermissionsStatus();
            return () => {};
        }, [])
    );

    // Função para verificar status das permissões
    const checkPermissionsStatus = async () => {
        setLoading(true);
        // Use a função do seu contexto ou chame diretamente
        if (checkNotificationPermissions) {
            await checkNotificationPermissions();
        } else {
            // Alternativa se não tiver a função no contexto
            const { status } = await Notifications.getPermissionsAsync();
            // Você precisaria de um meio para atualizar o estado global aqui
        }
        setLoading(false);
    };


    // Toggle para solicitar permissões de notificações
    const handleToggleNotifications = async () => {
        setLoading(true);

        if (!notificationsEnabled) {
            // Solicitar permissões
            await requestPermissions();
        } else {
            // Abrir configurações do dispositivo para o app
            if (Platform.OS === 'ios') {
                await Linking.openURL('app-settings:');
            } else {
                await Linking.openSettings();
            }
        }

        setLoading(false);
    };

    // Tipos de notificações hipotéticos - adapte conforme necessário
    const notificationTypes = [
        { id: 'promotions', label: 'Promoções e ofertas', enabled: true },
        { id: 'updates', label: 'Atualizações do app', enabled: true },
        { id: 'transactions', label: 'Transações e pagamentos', enabled: true },
        { id: 'messages', label: 'Mensagens', enabled: true },
    ];

    // Estado local para controlar os switches
    const [preferences, setPreferences] = useState(
        notificationTypes.reduce((acc, type) => {
            acc[type.id] = type.enabled;
            return acc;
        }, {})
    );

    // Alterar preferência de notificação
    const togglePreference = (typeId) => {
        setPreferences(prev => ({
            ...prev,
            [typeId]: !prev[typeId]
        }));

        // Aqui você salvaria as preferências no backend
        // Exemplo: updateNotificationPreferences(typeId, !preferences[typeId]);
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Notificações',
                }}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Status geral de notificações */}
                <Box p="$4" bg="$white" borderRadius="$lg" mb="$4" shadow="$1">
                    <HStack justifyContent="space-between" alignItems="center" mb="$2">
                        <VStack>
                            <Text fontSize="$lg" fontWeight="$semibold">Notificações</Text>
                            <Text fontSize="$sm" color="$blueGray500">
                                {notificationsEnabled
                                    ? 'Notificações estão ativadas'
                                    : 'Notificações estão desativadas'}
                            </Text>
                        </VStack>

                        {loading ? (
                            <Spinner size="small" color="$blue600" />
                        ) : (
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={handleToggleNotifications}
                                trackColor={{ true: '$blue600', false: '$blueGray300' }}
                            />
                        )}
                    </HStack>

                    {!notificationsEnabled && (
                        <Text fontSize="$xs" color="$blueGray400" mt="$2">
                            Ative as notificações para receber atualizações importantes
                        </Text>
                    )}
                </Box>

                {/* Resumo de notificações */}
                <Box p="$4" bg="$white" borderRadius="$lg" mb="$4" shadow="$1">
                    <HStack justifyContent="space-between" alignItems="center" mb="$2">
                        <Text fontSize="$lg" fontWeight="$semibold">Resumo</Text>
                    </HStack>

                    <HStack justifyContent="space-between" alignItems="center" my="$2">
                        <Text fontSize="$md" color="$blueGray600">Notificações não lidas</Text>
                        <Box bg="$blue100" px="$2" py="$1" borderRadius="$full">
                            <Text color="$blue600" fontWeight="$semibold">{unreadCount}</Text>
                        </Box>
                    </HStack>

                    <Button
                        variant="outline"
                        size="sm"
                        mt="$2"
                        onPress={markAllAsRead}
                        borderColor="$blue600"
                        isDisabled={unreadCount === 0}
                    >
                        <ButtonText color="$blue600">Marcar todas como lidas</ButtonText>
                    </Button>
                </Box>

                {notificationsEnabled && (
                    <Box p="$4" bg="$white" borderRadius="$lg" mb="$4" shadow="$1">
                        <Text fontSize="$lg" fontWeight="$semibold" mb="$4">Tipos de notificações</Text>

                        <VStack space="md" divider={<Divider />}>
                            {notificationTypes.map((type) => (
                                <HStack key={type.id} justifyContent="space-between" alignItems="center" py="$2">
                                    <Text fontSize="$md">{type.label}</Text>
                                    <Switch
                                        value={preferences[type.id]}
                                        onValueChange={() => togglePreference(type.id)}
                                        trackColor={{ true: '$blue600', false: '$blueGray300' }}
                                    />
                                </HStack>
                            ))}
                        </VStack>
                    </Box>
                )}

                {/* Dicas e informações */}
                <Box p="$4" bg="$white" borderRadius="$lg" mb="$4" shadow="$1">
                    <Text fontSize="$lg" fontWeight="$semibold" mb="$2">Dicas</Text>

                    <VStack space="md" mt="$2">
                        <HStack space="md" alignItems="center">
                            <Icon as={Ionicons} name="information-circle-outline" size="$md" color="$blue600" />
                            <Text fontSize="$sm" color="$blueGray600">
                                Você pode personalizar quais notificações receber
                            </Text>
                        </HStack>

                        <HStack space="md" alignItems="center">
                            <Icon as={Ionicons} name="time-outline" size="$md" color="$blue600" />
                            <Text fontSize="$sm" color="$blueGray600">
                                As notificações são enviadas em tempo real
                            </Text>
                        </HStack>

                        <HStack space="md" alignItems="center">
                            <Icon as={Ionicons} name="settings-outline" size="$md" color="$blue600" />
                            <Text fontSize="$sm" color="$blueGray600">
                                Você também pode ajustar configurações no seu dispositivo
                            </Text>
                        </HStack>
                    </VStack>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => {
                            if (Platform.OS === 'ios') {
                                Linking.openURL('app-settings:');
                            } else {
                                Linking.openSettings();
                            }
                        }}
                    >
                        <Text color="$blue600" fontSize="$sm" fontWeight="$medium">
                            Abrir configurações do dispositivo
                        </Text>
                        <Icon as={Ionicons} name="chevron-forward" size="$sm" color="$blue600" />
                    </TouchableOpacity>

                    <Button
                        variant="solid"
                        size="sm"
                        mt="$4"
                        onPress={() => {
                            alert("Tentando registrar dispositivo...");
                            registerDevice(); // Certifique-se de expor esta função no contexto
                        }}
                    >
                        <ButtonText>Registrar dispositivo (Teste)</ButtonText>
                    </Button>
                </Box>
                <Box>
                    <Button
                        onPress={async () => {
                            // Esta é uma notificação local (no próprio dispositivo)
                            await Notifications.scheduleNotificationAsync({
                                content: {
                                    title: "Notificação de Teste",
                                    body: "Esta é uma notificação local para testar a configuração",
                                    data: { route: '/notifications' }
                                },
                                trigger: null // null = enviar imediatamente
                            });
                        }}
                    >
                        <ButtonText>Enviar Notificação de Teste</ButtonText>
                    </Button>
                </Box>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 16,
        paddingVertical: 8,
    },
});
