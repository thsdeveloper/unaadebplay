import * as Clipboard from "expo-clipboard";
import colors from "@/constants/colors";
import React, {useContext, useEffect, useState} from "react";
import {getItems, getItemSingleton, setUpdateItem} from "@/services/items";
import {HospedagemTypes} from "@/types/HospedagemTypes";
import AlertContext from "@/contexts/AlertContext";
import {formatCurrency} from "@/utils/directus";
import {FontAwesome6, MaterialIcons} from "@expo/vector-icons";
import axios from "axios";
import {SubscribedHosTypes} from "@/types/SubscribedHosTypes";
import {useAuth} from "@/contexts/AuthContext";
import {Linking, ScrollView} from "react-native";
import {VStack} from "@/components/ui/vstack";
import {Spinner} from "@/components/ui/spinner";
import {Box} from "@/components/ui/box";
import {HStack} from "@/components/ui/hstack";
import {Heading} from "@/components/ui/heading";
import {Button} from "@/components/ui/button";

export default function CartaoAcesso() {
    const [loading, setLoading] = useState<boolean>(true);
    const [hospedagem, setHospedagem] = useState<HospedagemTypes>();
    const [subscribedHos, setSubscribedHos] = useState<SubscribedHosTypes[]>();
    const [paymentObjectMP, setPaymentObjectMP] = useState();
    const alert = useContext(AlertContext)
    const {user} = useAuth();


    useEffect(() => {
        const filter = {
            filter: {
                member: {
                    _eq: user?.id,
                },
            },
        };

        const loadHospedagem = async () => {
            try {
                const [hospedagens, subscribed_hos] = await Promise.all([
                    getItemSingleton<HospedagemTypes>('hospedagem'),
                    getItems<SubscribedHosTypes[]>('subscribed_hos', filter),
                ]);
                setSubscribedHos(subscribed_hos);
                setHospedagem(hospedagens);

                // Verifique se existe informações de pagamento em subscribed_hos e defina o paymentObjectMP
                if (subscribed_hos.length > 0 && subscribed_hos[0].payment) {
                    setPaymentObjectMP(subscribed_hos[0].payment);
                }
            } catch (error) {
                alert.error("Houve um erro ao carregar os dados. Por favor, tente novamente mais tarde.", 10000);
            } finally {
                setLoading(false);
            }
        };
        loadHospedagem();
    }, [user?.id, alert]);

    async function pagarHospedagem() {
        const pagamentoObject = {
            transaction_amount: parseFloat(hospedagem?.custo),
            description: "Inscrição de acesso Hospedagem 2024",
            payment_method_id: "pix",
            email: user?.email
        }
        try {
            const payment = await axios.post('https://back-unaadeb.onrender.com/mercado-pago/pagamento', pagamentoObject);
            alert.success(`Pagamento iniciado. ${payment.data.id}`)

            // Armazene os dados de pagamento no estado
            setPaymentObjectMP(payment.data);

            const updatedObject = {
                payment: payment.data
            }
            if (subscribedHos) {
                const responseUpdated = await setUpdateItem('subscribed_hos', subscribedHos[0].id, updatedObject)
                if (responseUpdated) {
                    alert.success(`Pagamento atualizado. ${payment.data.status}`)
                }
            }

        } catch (e) {
            alert.error(`Erro ao processar o pagamento. ${e}`)
        }
    }

    const abrirLink = async (url: string) => {
        const podeAbrir = await Linking.canOpenURL(url);
        if (podeAbrir) {
            await Linking.openURL(url);
        } else {
            alert.error('Não foi possível abrir o link.');
        }
    };


    return (
        <ScrollView flex={1} p={4}>
            {loading ? (
                <VStack space={2} alignItems="center" mt={10}>
                    <Spinner color="primary.500" accessibilityLabel="Carregando dados"/>
                    <Text>Carregando...</Text>
                </VStack>
            ) : (
                <>
                    {!paymentObjectMP && (
                        <Box>
                            <HStack backgroundColor={'orange.200'} p={2} my={4} alignItems={'center'} space={2}
                                    borderLeftWidth={3}
                                    borderLeftColor={'yellow.800'}>
                                <MaterialIcons name="pix" size={40} color={colors.dark}/>
                                <Text pr={20}>No momento o nosso método de pagamento será o PIX identificado. Estamos
                                    trabalhando para fornecer outros meio de pagamento.</Text>
                            </HStack>


                            <Box alignItems={"center"}>
                                <Heading p={2}>{hospedagem?.titulo}</Heading>
                                <Text p={2} textAlign={"center"}>{hospedagem?.descricao}</Text>
                            </Box>

                            <Box alignItems={"center"}>
                                <Button onPress={pagarHospedagem} size={'lg'} isLoading={false} rounded={'full'}
                                        width={'full'}
                                        colorScheme={"success"}>COMPRAR
                                    INGRESSO</Button>
                                <Text>Valor: {formatCurrency(hospedagem?.custo)}</Text>
                            </Box>

                            <VStack p={4} space={4}>
                                <Box>
                                    <Heading size={'sm'}>Comodidades:</Heading>
                                    {hospedagem?.comodidades}
                                </Box>
                                <Box>
                                    <Heading size={'sm'}>Observações:</Heading>
                                    {hospedagem?.regras}
                                </Box>
                            </VStack>

                            <Box>
                                <Heading p={2}>Vagas disponíveis: {hospedagem?.vagas_disponiveis}</Heading>
                            </Box>
                        </Box>
                    )}

                    {paymentObjectMP && (
                        <Box p={4} mb={4}>
                            <HStack alignItems={"center"} space={2}>
                                <FontAwesome6 name="pix" size={24} color="black"/>
                                <Heading textAlign={"center"}>Pagamento via PIX</Heading>
                            </HStack>
                            <VStack space={4} mt={4}>
                                <Badge colorScheme="error">AGUARDANDO PAGAMENTO</Badge>
                                <Text>Estamos aguardando a confirmação do seu pagamento via PIX, você precisa realizar o
                                    pagamento até o dia <Text
                                        fontWeight={"black"}>{new Date(paymentObjectMP.date_of_expiration).toLocaleString()}</Text></Text>
                            </VStack>
                            <HStack alignItems={"center"} mt={2} space={1} justifyContent={"center"}>
                                <Text>Valor:</Text>
                                <Text fontWeight={'bold'} fontSize={'3xl'}
                                      letterSpacing={'xs'}>R$ {paymentObjectMP.transaction_amount.toFixed(2)}</Text>
                            </HStack>
                            <VStack justifyContent={"center"} alignItems={"center"} borderRadius={6} shadow={"6"}>
                                <Image
                                    borderRadius={8}
                                    alt={'QR CODE'}
                                    source={{uri: `data:image/png;base64,${paymentObjectMP.point_of_interaction.transaction_data.qr_code_base64}`}}
                                    style={{width: 200, height: 200}}/>
                            </VStack>
                            <Button
                                mt={6}
                                variant={'outline'}
                                borderRadius={'full'}
                                onPress={() => {
                                    Clipboard.setStringAsync(paymentObjectMP.point_of_interaction.transaction_data.qr_code)
                                    alert.success('Chave PIX copiada com sucesso!')
                                }}>
                                Copiar chave PIX
                            </Button>

                            <Button rounded={'full'} my={4}>
                                Atualizar status de pagamento
                            </Button>

                            <Button variant={'link'} textAlign={"center"}
                                    onPress={() => abrirLink(paymentObjectMP.point_of_interaction.transaction_data.ticket_url)}>
                                {paymentObjectMP.point_of_interaction.transaction_data.ticket_url}
                            </Button>

                            <Text mt={4} textAlign={"center"} fontWeight={'bold'}>Data de
                                Expiração: {new Date(paymentObjectMP.date_of_expiration).toLocaleString()}</Text>
                            <Text textAlign={"center"}>{hospedagem?.anfitriao}</Text>
                        </Box>
                    )}
                </>
            )}


        </ScrollView>
    )
}
