import React, { useContext, useRef, useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Animated, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import * as Clipboard from 'expo-clipboard';
import AlertContext from "@/contexts/AlertContext";
import QRCode from 'react-native-qrcode-svg';
import { Text } from "@/components/ui/text";
import { Stack, useRouter } from "expo-router";
import { Feather } from '@expo/vector-icons';
import { useThemedColors } from "@/hooks/useThemedColors";

export default function Contribua() {
    const colors = useThemedColors();

    const animation = useRef(null);
    const [showQRCode, setShowQRCode] = useState(false);
    const alert = useContext(AlertContext);
    const router = useRouter();
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

    // Animações
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(30)).current;
    const qrCodeScale = useRef(new Animated.Value(0)).current;
    const qrCodeOpacity = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Animação de entrada dos elementos
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

    // Animação ao mostrar/esconder QR code
    useEffect(() => {
        Animated.parallel([
            Animated.spring(qrCodeScale, {
                toValue: showQRCode ? 1 : 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true
            }),
            Animated.timing(qrCodeOpacity, {
                toValue: showQRCode ? 1 : 0,
                duration: 300,
                useNativeDriver: true
            })
        ]).start();
    }, [showQRCode]);

    const pixKey = 'pix@unaadeb.com.br';
    const pixPayload = `00020101021226850014br.gov.bcb.pix0136${pixKey}52040000530398654040.005802BR5908UNAADEB6009Brasilia62070503***6304D3F2`;

    const handleCopyKey = async () => {
        Animated.sequence([
            Animated.timing(buttonScale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true
            }),
            Animated.timing(buttonScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true
            })
        ]).start();

        await Clipboard.setStringAsync(pixKey);
        alert.success('Chave PIX copiada com sucesso!');
    };

    const toggleQRCode = () => {
        setShowQRCode(!showQRCode);
    };

    const handleAmountSelect = (amount: number) => {
        setSelectedAmount(amount);
    };

    // Valores sugeridos para contribuição
    const suggestedAmounts = [20, 50, 100, 200, 500];

    return (
        <View style={{ flex: 1, backgroundColor: colors.secundary3 }}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: "Contribuir para UNAADEB",
                    headerStyle: {
                        backgroundColor: colors.secundary2,
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
                                backgroundColor: 'rgba(0,0,0,0.2)'
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
                colors={[colors.secundary2, colors.secundary3]}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={{ flex: 1, paddingHorizontal: 24 }}
                    contentContainerStyle={{ paddingTop: 16, paddingBottom: 48 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View
                        style={{
                            alignItems: 'center',
                            opacity: fadeAnim,
                            transform: [{ translateY: translateY }]
                        }}
                    >
                        {/* Animação Lottie */}
                        <View style={{ width: '100%', height: 220, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <LottieView
                                autoPlay
                                ref={animation}
                                loop
                                style={{
                                    width: '90%',
                                    height: 220,
                                }}
                                source={require('@/assets/99977-money-pf.json')}
                            />
                        </View>

                        {/* Card principal */}
                        <View style={{
                            width: '100%',
                            backgroundColor: 'white',
                            borderRadius: 24,
                            padding: 24,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                            elevation: 5,
                            marginBottom: 24
                        }}>
                            <Text style={{
                                fontSize: 22,
                                fontWeight: 'bold',
                                color: colors.secundary2,
                                textAlign: 'center',
                                marginBottom: 16
                            }}>
                                Contribua para o Congresso UNAADEB 2023
                            </Text>

                            <View style={{
                                width: '100%',
                                height: 1,
                                backgroundColor: colors.secundary3 + '30',
                                marginVertical: 16
                            }} />

                            <Text style={{
                                color: '#555',
                                textAlign: 'center',
                                marginBottom: 24
                            }}>
                                Ajude-nos a fazer do Congresso da UNAADEB um sucesso. Com a sua contribuição,
                                podemos criar um evento memorável e impactante para todos os participantes.
                            </Text>

                            {/* Valores sugeridos */}
                            <Text style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: colors.secundary2,
                                marginBottom: 12
                            }}>
                                Escolha um valor para contribuir:
                            </Text>

                            <View style={{
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                                marginBottom: 24
                            }}>
                                {suggestedAmounts.map((amount) => (
                                    <TouchableOpacity
                                        key={amount}
                                        style={{
                                            margin: 4,
                                            padding: 12,
                                            borderRadius: 30,
                                            minWidth: 80,
                                            alignItems: 'center',
                                            backgroundColor: selectedAmount === amount
                                                ? colors.secundary2
                                                : 'white',
                                            borderWidth: 2,
                                            borderColor: selectedAmount === amount
                                                ? colors.secundary2
                                                : colors.secundary3 + '30'
                                        }}
                                        onPress={() => handleAmountSelect(amount)}
                                    >
                                        <Text style={{
                                            fontWeight: 'bold',
                                            color: selectedAmount === amount
                                                ? 'white'
                                                : colors.secundary2
                                        }}>
                                            R$ {amount}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity
                                    style={{
                                        margin: 4,
                                        padding: 12,
                                        borderRadius: 30,
                                        minWidth: 80,
                                        alignItems: 'center',
                                        backgroundColor: selectedAmount === 0
                                            ? colors.secundary2
                                            : 'white',
                                        borderWidth: 2,
                                        borderColor: selectedAmount === 0
                                            ? colors.secundary2
                                            : colors.secundary3 + '30'
                                    }}
                                    onPress={() => handleAmountSelect(0)}
                                >
                                    <Text style={{
                                        fontWeight: 'bold',
                                        color: selectedAmount === 0
                                            ? 'white'
                                            : colors.secundary2
                                    }}>
                                        Outro
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Chave PIX */}
                            <View style={{
                                backgroundColor: colors.secundary3 + '15',
                                padding: 16,
                                borderRadius: 12,
                                marginBottom: 20
                            }}>
                                <Text style={{
                                    fontSize: 13,
                                    color: '#666',
                                    marginBottom: 4
                                }}>
                                    Chave PIX
                                </Text>
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: 'bold',
                                    color: colors.secundary2
                                }}>
                                    {pixKey}
                                </Text>
                            </View>

                            {/* Botões de ação */}
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <Animated.View
                                    style={{
                                        flex: 1,
                                        transform: [{ scale: buttonScale }]
                                    }}
                                >
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: colors.secundary2,
                                            paddingVertical: 16,
                                            borderRadius: 12,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexDirection: 'row'
                                        }}
                                        onPress={handleCopyKey}
                                    >
                                        <Feather name="copy" size={18} color="white" />
                                        <Text style={{
                                            color: 'white',
                                            fontWeight: 'bold',
                                            marginLeft: 8
                                        }}>
                                            Copiar Chave
                                        </Text>
                                    </TouchableOpacity>
                                </Animated.View>

                                <TouchableOpacity
                                    style={{
                                        paddingHorizontal: 16,
                                        paddingVertical: 16,
                                        borderRadius: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: showQRCode
                                            ? colors.secundary2 + 'E0'
                                            : colors.secundary2
                                    }}
                                    onPress={toggleQRCode}
                                >
                                    <Feather
                                        name={showQRCode ? 'eye-off' : 'eye'}
                                        size={18}
                                        color="white"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* QR Code com animação */}
                        {/* Não mais usando altura animada, apenas escala e opacidade */}
                        {showQRCode && (
                            <Animated.View
                                style={{
                                    alignItems: 'center',
                                    backgroundColor: 'white',
                                    padding: 24,
                                    borderRadius: 24,
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 8,
                                    elevation: 5,
                                    marginBottom: 24,
                                    opacity: qrCodeOpacity,
                                    transform: [{ scale: qrCodeScale }]
                                }}
                            >
                                <Text style={{
                                    color: colors.secundary2,
                                    fontWeight: 'bold',
                                    marginBottom: 16
                                }}>
                                    Escaneie o QR Code PIX
                                </Text>
                                <QRCode
                                    value={pixPayload}
                                    size={200}
                                    color={colors.secundary2}
                                    backgroundColor="white"
                                />
                            </Animated.View>
                        )}

                        {/* Informações adicionais */}
                        <View style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: 16,
                            padding: 16,
                            marginBottom: 32
                        }}>
                            <Text style={{ color: 'white', textAlign: 'center', fontSize: 14 }}>
                                Sua contribuição será utilizada para melhorar a infraestrutura, atrair palestrantes
                                de renome e proporcionar uma experiência inesquecível a todos os participantes.
                            </Text>
                        </View>

                        {/* Passos para contribuir */}
                        <View style={{ marginBottom: 32, width: '100%' }}>
                            <Text style={{
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: 18,
                                marginBottom: 16
                            }}>
                                Como contribuir:
                            </Text>

                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                marginBottom: 12
                            }}>
                                <View style={{
                                    backgroundColor: 'white',
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 12,
                                    marginTop: 2
                                }}>
                                    <Text style={{ color: colors.secundary2, fontWeight: 'bold' }}>1</Text>
                                </View>
                                <Text style={{ color: 'white', flex: 1 }}>
                                    Abra o aplicativo do seu banco
                                </Text>
                            </View>

                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                marginBottom: 12
                            }}>
                                <View style={{
                                    backgroundColor: 'white',
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 12,
                                    marginTop: 2
                                }}>
                                    <Text style={{ color: colors.secundary2, fontWeight: 'bold' }}>2</Text>
                                </View>
                                <Text style={{ color: 'white', flex: 1 }}>
                                    Selecione a opção PIX
                                </Text>
                            </View>

                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                marginBottom: 12
                            }}>
                                <View style={{
                                    backgroundColor: 'white',
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 12,
                                    marginTop: 2
                                }}>
                                    <Text style={{ color: colors.secundary2, fontWeight: 'bold' }}>3</Text>
                                </View>
                                <Text style={{ color: 'white', flex: 1 }}>
                                    Cole a chave PIX copiada ou escaneie o QR Code
                                </Text>
                            </View>

                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'flex-start'
                            }}>
                                <View style={{
                                    backgroundColor: 'white',
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 12,
                                    marginTop: 2
                                }}>
                                    <Text style={{ color: colors.secundary2, fontWeight: 'bold' }}>4</Text>
                                </View>
                                <Text style={{ color: 'white', flex: 1 }}>
                                    Informe o valor e finalize a transação
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                </ScrollView>
            </LinearGradient>
        </View>
    );
}
