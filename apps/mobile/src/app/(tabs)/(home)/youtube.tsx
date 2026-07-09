import React, { useEffect, useState, useRef } from "react";
import { View, TouchableOpacity, Animated, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Entypo, Feather } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { getItemSingleton } from "@/services/items";
import { Text } from "@/components/ui/text";
import { Stack, useRouter } from "expo-router";
import { useThemedColors } from "@/hooks/useThemedColors";

const YoutubePage = () => {
    const colors = useThemedColors();

    const [youtube, setYoutube] = useState<any>();
    const [loading, setLoading] = useState(true);
    const buttonScale = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(50)).current;
    const router = useRouter();

    useEffect(() => {
        const loadInfoYoutube = async () => {
            try {
                setLoading(true);
                const responseYoutube = await getItemSingleton('youtube');
                setYoutube(responseYoutube);
            } catch (error) {
                console.error('Erro ao carregar dados do YouTube:', error);
            } finally {
                setLoading(false);
            }
        };

        loadInfoYoutube();

        // Animar a entrada dos elementos
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true
            })
        ]).start();
    }, []);

    const openYoutube = () => {
        if (youtube?.url) {
            Linking.openURL(youtube.url);
        }
    }

    const handlePressIn = () => {
        Animated.spring(buttonScale, {
            toValue: 0.95,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(buttonScale, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#121212' }}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: "Canal no YouTube",
                    headerStyle: {
                        backgroundColor: '#FF0000'
                    },
                    headerTintColor: "#fff",
                    headerTitleStyle: {
                        fontWeight: "bold",
                    },
                    headerLeft: () => (
                        <TouchableOpacity
                            style={{
                                marginLeft: 8,
                                padding: 8,
                                borderRadius: 20,
                                backgroundColor: 'rgba(0,0,0,0.3)'
                            }}
                            onPress={() => router.back()}
                        >
                            <Feather name="x" size={20} color="#fff" />
                        </TouchableOpacity>
                    )
                }}
            />

            <StatusBar barStyle="light-content" />

            <LinearGradient
                colors={['#1a1a1a', '#000000']}
                style={{
                    flex: 1,
                    paddingHorizontal: 24,
                    paddingTop: 24,
                    paddingBottom: 32,
                    justifyContent: 'center'
                }}
            >
                <Animated.View
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: fadeAnim,
                        transform: [{ translateY: translateY }]
                    }}
                >
                    {/* Ícone do YouTube */}
                    <View style={{ marginBottom: 24 }}>
                        <View style={{
                            backgroundColor: '#FF0000',
                            width: 120,
                            height: 84,
                            borderRadius: 24,
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: '#FF0000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 6
                        }}>
                            <View style={{
                                backgroundColor: 'white',
                                width: 50,
                                height: 36,
                                borderRadius: 12,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <View style={{
                                    borderLeftWidth: 16,
                                    borderLeftColor: '#FF0000',
                                    borderTopWidth: 10,
                                    borderTopColor: 'transparent',
                                    borderBottomWidth: 10,
                                    borderBottomColor: 'transparent',
                                    marginLeft: 6
                                }} />
                            </View>
                        </View>
                    </View>

                    {/* Conteúdo */}
                    <View style={{
                        width: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 24,
                        padding: 24,
                        marginBottom: 32,
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                    }}>
                        <Text style={{
                            color: 'white',
                            fontSize: 24,
                            fontWeight: 'bold',
                            textAlign: 'center',
                            marginBottom: 12
                        }}>
                            {loading ? "Carregando..." : youtube?.title || "Nosso Canal do YouTube"}
                        </Text>

                        <Text style={{
                            color: '#E0E0E0',
                            textAlign: 'center',
                            marginBottom: 16
                        }}>
                            {loading ? "..." : youtube?.description || "Acesse nosso canal e confira todos os vídeos exclusivos do congresso e muito mais."}
                        </Text>

                        {/* Stats */}
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            marginTop: 8
                        }}>
                            <View style={{ alignItems: 'center', marginHorizontal: 12 }}>
                                <Feather name="video" size={20} color="#FF0000" />
                                <Text style={{ color: 'white', fontSize: 12, marginTop: 4 }}>Vídeos</Text>
                            </View>
                            <View style={{ alignItems: 'center', marginHorizontal: 12 }}>
                                <Feather name="users" size={20} color="#FF0000" />
                                <Text style={{ color: 'white', fontSize: 12, marginTop: 4 }}>Inscritos</Text>
                            </View>
                            <View style={{ alignItems: 'center', marginHorizontal: 12 }}>
                                <Feather name="eye" size={20} color="#FF0000" />
                                <Text style={{ color: 'white', fontSize: 12, marginTop: 4 }}>Visualizações</Text>
                            </View>
                        </View>
                    </View>

                    {/* Botão */}
                    <Animated.View
                        style={{
                            width: '100%',
                            transform: [{ scale: buttonScale }]
                        }}
                    >
                        <TouchableOpacity
                            style={{ width: '100%' }}
                            onPress={openYoutube}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            activeOpacity={1}
                        >
                            <LinearGradient
                                colors={['#FF0000', '#CC0000']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    width: '100%',
                                    paddingVertical: 16,
                                    borderRadius: 12,
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    shadowColor: "#FF0000",
                                    shadowOffset: {
                                        width: 0,
                                        height: 4,
                                    },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                    elevation: 6,
                                }}
                            >
                                <Entypo name="youtube" size={24} color="white" />
                                <Text style={{
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: 18,
                                    marginLeft: 8
                                }}>
                                    Acessar Canal
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Disclaimer */}
                    <View style={{ marginTop: 32, width: '100%', paddingHorizontal: 16 }}>
                        <Text style={{ color: '#999999', fontSize: 12, textAlign: 'center' }}>
                            O conteúdo das nossas transmissões é protegido por direitos autorais.
                            Ao acessar, você concorda com os termos de uso do YouTube.
                        </Text>
                    </View>

                    {/* Vídeos em destaque (simulado) */}
                    <View style={{ width: '100%', marginTop: 32 }}>
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>
                            Vídeos em destaque
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            {[1, 2, 3].map((item) => (
                                <View key={item} style={{
                                    width: '30%',
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                    backgroundColor: 'rgba(255, 0, 0, 0.1)'
                                }}>
                                    <View style={{ height: 64, backgroundColor: 'rgba(255, 0, 0, 0.3)' }} />
                                    <View style={{
                                        height: 8,
                                        width: 32,
                                        marginTop: 8,
                                        marginLeft: 8,
                                        backgroundColor: 'rgba(150, 150, 150, 0.5)',
                                        borderRadius: 4
                                    }} />
                                    <View style={{
                                        height: 8,
                                        width: 64,
                                        marginTop: 4,
                                        marginBottom: 8,
                                        marginLeft: 8,
                                        backgroundColor: 'rgba(120, 120, 120, 0.3)',
                                        borderRadius: 4
                                    }} />
                                </View>
                            ))}
                        </View>
                    </View>
                </Animated.View>
            </LinearGradient>
        </View>
    );
};

export default YoutubePage;
