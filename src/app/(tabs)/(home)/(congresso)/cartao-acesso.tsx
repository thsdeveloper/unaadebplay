import {Box, Button, Heading, HStack, Image, ScrollView, Text, VStack} from "native-base";
import * as Clipboard from "expo-clipboard";
import colors from "@/constants/colors";
import React, {useContext, useEffect, useState} from "react";
import {getItems, getItemSingleton, setUpdateItem} from "@/services/items";
import {HospedagemTypes} from "@/types/HospedagemTypes";
import AlertContext from "@/contexts/AlertContext";
import {formatCurrency} from "@/utils/directus";
import {MaterialIcons} from "@expo/vector-icons";
import axios from "axios";
import {SubscribedHosTypes} from "@/types/SubscribedHosTypes";
import {useAuth} from "@/contexts/AuthContext";

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
                    _eq: user?.id, // Utiliza o operador _eq para buscar registros com user_id igual ao userId
                },
            },
        };

        const loadHospedagem = async () => {
            try {
                const [hospedagens, subscribed_hos, ] = await Promise.all([
                    getItemSingleton<HospedagemTypes>('hospedagem'),
                    getItems<SubscribedHosTypes[]>('subscribed_hos', filter),
                ]);
                setSubscribedHos(subscribed_hos)
                setHospedagem(hospedagens);
            } catch (error) {
                alert.error("Houve um erro ao carregar os dados. Por favor, tente novamente mais tarde.", 10000);
            } finally {
                setLoading(false)
            }
        };
        loadHospedagem();
    }, []);

    async function pagarHospedagem() {
        const pagamentoObject = {
            transaction_amount: 35.99,
            description: "Minha descrição",
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
            alert.success(`Erro ao processar o pagamento. ${e}`)
        }
    }


    return (
        <ScrollView flex={1} p={4}>

            <HStack backgroundColor={'orange.200'} p={2} my={4} alignItems={'center'} space={2} borderLeftWidth={3}
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
                <Button onPress={pagarHospedagem} size={'lg'} isLoading={false} rounded={'full'} width={'full'}
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


            {paymentObjectMP && (
                <Box p={4} mb={4}>
                    <Text bold>Pagamento via PIX</Text>
                    <Text>Chave PIX: {paymentObjectMP.transaction_details.external_resource_url}</Text>
                    <Text>Valor: R$ {paymentObjectMP.transaction_amount.toFixed(2)}</Text>
                    <Text>Data de Expiração: {new Date(paymentObjectMP.date_of_expiration).toLocaleString()}</Text>

                    <Text bold>QR Code:</Text>
                    {/* Certifique-se de que seu componente de imagem pode lidar com base64 */}
                    <Image source={{uri: `data:image/png;base64,${paymentObjectMP.point_of_interaction.transaction_data.qr_code_base64}`}} style={{width: 200, height: 200}} />

                    <Button onPress={() => Clipboard.setStringAsync(paymentObjectMP.transaction_details.external_resource_url)}>
                        Copiar chave PIX
                    </Button>
                </Box>
            )}
        </ScrollView>
    )
}