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
import {Heading} from "@/components/ui/heading";
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
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <Stack.Screen
                options={{
                    title: 'Notificações',
                    headerStyle: {
                        backgroundColor: '#ffffff',
                    },
                    headerTintColor: '#000',
                }}
            />

            <ScrollView showsVerticalScrollIndicator={false} className="px-4 pt-4">
                {/* Status geral de notificações */}
                <Box className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-4 shadow-sm">
                    <HStack justifyContent="space-between" alignItems="center">
                        <HStack space="md" alignItems="center">
                            <Box className={`p-2 rounded-full ${notificationsEnabled ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                <Icon 
                                    as={Ionicons} 
                                    name={notificationsEnabled ? "notifications" : "notifications-off"} 
                                    size="lg" 
                                    className={notificationsEnabled ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}
                                />
                            </Box>
                            <VStack>
                                <Heading size="sm" className="text-gray-900 dark:text-white">Notificações</Heading>
                                <Text className="text-sm text-gray-500 dark:text-gray-400">
                                    {notificationsEnabled ? 'Ativadas' : 'Desativadas'}
                                </Text>
                            </VStack>
                        </HStack>

                        {loading ? (
                            <Spinner size="small" className="text-blue-600" />
                        ) : (
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={handleToggleNotifications}
                                trackColor={{ true: '#3B82F6', false: '#E5E7EB' }}
                                thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
                            />
                        )}
                    </HStack>

                    {!notificationsEnabled && (
                        <Box className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <HStack space="sm" alignItems="center">
                                <Icon as={Ionicons} name="alert-circle" size="sm" className="text-amber-600 dark:text-amber-400"/>
                                <Text className="text-xs text-amber-700 dark:text-amber-300 flex-1">
                                    Ative as notificações para receber atualizações importantes
                                </Text>
                            </HStack>
                        </Box>
                    )}
                </Box>

                {/* Resumo de notificações */}
                <Box className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-4 shadow-sm">
                    <Heading size="sm" className="text-gray-900 dark:text-white mb-4">Resumo</Heading>

                    <Box className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                        <HStack justifyContent="space-between" alignItems="center">
                            <HStack space="md" alignItems="center">
                                <Icon as={Ionicons} name="mail-unread-outline" size="md" className="text-gray-600 dark:text-gray-400"/>
                                <Text className="text-gray-700 dark:text-gray-300">Não lidas</Text>
                            </HStack>
                            <Box className={`px-3 py-1 rounded-full ${unreadCount > 0 ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-200 dark:bg-gray-600'}`}>
                                <Text className={`font-semibold ${unreadCount > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                    {unreadCount}
                                </Text>
                            </Box>
                        </HStack>
                    </Box>

                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 border-blue-600 dark:border-blue-400"
                            onPress={markAllAsRead}
                        >
                            <Icon as={Ionicons} name="checkmark-done" size="sm" className="text-blue-600 dark:text-blue-400 mr-2"/>
                            <ButtonText className="text-blue-600 dark:text-blue-400">Marcar todas como lidas</ButtonText>
                        </Button>
                    )}
                </Box>

                {notificationsEnabled && (
                    <Box className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-4 shadow-sm">
                        <Heading size="sm" className="text-gray-900 dark:text-white mb-4">Preferências</Heading>

                        <VStack space="sm">
                            {notificationTypes.map((type, index) => (
                                <Box key={type.id}>
                                    <HStack justifyContent="space-between" alignItems="center" className="py-3">
                                        <HStack space="md" alignItems="center" className="flex-1">
                                            <Box className="w-1 h-8 bg-blue-500 rounded-full"/>
                                            <Text className="text-gray-700 dark:text-gray-300">{type.label}</Text>
                                        </HStack>
                                        <Switch
                                            value={preferences[type.id]}
                                            onValueChange={() => togglePreference(type.id)}
                                            trackColor={{ true: '#3B82F6', false: '#E5E7EB' }}
                                            thumbColor={preferences[type.id] ? '#ffffff' : '#f4f3f4'}
                                        />
                                    </HStack>
                                    {index < notificationTypes.length - 1 && <Divider className="bg-gray-100 dark:bg-gray-700"/>}
                                </Box>
                            ))}
                        </VStack>
                    </Box>
                )}

                {/* Dicas e informações */}
                <Box className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-4 shadow-sm">
                    <HStack space="sm" alignItems="center" className="mb-4">
                        <Icon as={Ionicons} name="bulb-outline" size="md" className="text-yellow-500"/>
                        <Heading size="sm" className="text-gray-900 dark:text-white">Dicas</Heading>
                    </HStack>

                    <VStack space="md">
                        {[
                            { icon: "color-palette-outline", text: "Personalize suas preferências de notificação", color: "text-purple-600 dark:text-purple-400" },
                            { icon: "time-outline", text: "Receba atualizações em tempo real", color: "text-green-600 dark:text-green-400" },
                            { icon: "phone-portrait-outline", text: "Ajuste também nas configurações do dispositivo", color: "text-blue-600 dark:text-blue-400" }
                        ].map((tip, index) => (
                            <HStack key={index} space="md" alignItems="center" className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <Icon as={Ionicons} name={tip.icon} size="sm" className={tip.color} />
                                <Text className="text-sm text-gray-600 dark:text-gray-300 flex-1">
                                    {tip.text}
                                </Text>
                            </HStack>
                        ))}
                    </VStack>
                </Box>

                {/* Ações rápidas */}
                <Box className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-6 shadow-sm">
                    <Heading size="sm" className="text-gray-900 dark:text-white mb-4">Ações rápidas</Heading>
                    
                    <VStack space="md">
                        <TouchableOpacity
                            onPress={() => {
                                if (Platform.OS === 'ios') {
                                    Linking.openURL('app-settings:');
                                } else {
                                    Linking.openSettings();
                                }
                            }}
                            className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                        >
                            <HStack justifyContent="space-between" alignItems="center">
                                <HStack space="md" alignItems="center">
                                    <Icon as={Ionicons} name="settings-outline" size="md" className="text-gray-600 dark:text-gray-400" />
                                    <Text className="text-gray-700 dark:text-gray-300 font-medium">
                                        Configurações do dispositivo
                                    </Text>
                                </HStack>
                                <Icon as={Ionicons} name="open-outline" size="sm" className="text-gray-400" />
                            </HStack>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={async () => {
                                await Notifications.scheduleNotificationAsync({
                                    content: {
                                        title: "Teste de Notificação 🔔",
                                        body: "Suas notificações estão funcionando perfeitamente!",
                                        data: { route: '/notifications' }
                                    },
                                    trigger: null
                                });
                            }}
                            className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg"
                        >
                            <HStack justifyContent="space-between" alignItems="center">
                                <HStack space="md" alignItems="center">
                                    <Icon as={Ionicons} name="notifications-outline" size="md" className="text-blue-600 dark:text-blue-400" />
                                    <Text className="text-blue-700 dark:text-blue-300 font-medium">
                                        Enviar notificação de teste
                                    </Text>
                                </HStack>
                                <Icon as={Ionicons} name="send" size="sm" className="text-blue-600 dark:text-blue-400" />
                            </HStack>
                        </TouchableOpacity>
                    </VStack>
                </Box>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({});
