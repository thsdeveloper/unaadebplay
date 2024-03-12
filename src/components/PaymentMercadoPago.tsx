import React, { useState, useContext } from "react";
import { Box, Button } from "native-base";
import { CreditCardInput } from "react-native-credit-card-input";
import { loadMercadoPago } from "@mercadopago/sdk-js";

import AlertContext from "@/contexts/AlertContext";
import colors from "@/constants/colors";

export default function PaymentMercadoPago() {
    const [cardData, setCardData] = useState(null);
    const alert = useContext(AlertContext);


    const cardTokenGeneration = async () => {
        try {

            await loadMercadoPago();
            const mp = new window.MercadoPago("YOUR_PUBLIC_KEY", {
                locale: "en-US",
            });

            // Certifique-se de que cardData não é nulo e está completo
            if (!cardData || !cardData.valid) {
                alert.error("Dados do cartão inválidos ou incompletos.");
                return;
            }

            const { values, status } = cardData;
            const expirationDate = values.expiry.split('/');

            const tokenResponse = await createCardToken({
                cardNumber: values.number.replace(/\s/g, ''), // Remove espaços
                securityCode: values.cvc,
                expirationMonth: expirationDate[0],
                expirationYear: `20${expirationDate[1]}`,
                cardholder: {
                    name: values.name,
                    identification: {
                        type: 'CPF', // Adapte conforme necessário
                        number: 'SEU_CPF_AQUI', // Substitua pela identificação real
                    },
                },
            });

            console.log('Card Token Response:', tokenResponse);
        } catch (e) {
            console.error(e);
            alert.error(`Ocorreu um erro ao cadastrar um novo cartão -> ${e}`);
        }
    };

    const handleCardChange = (formData) => {
        setCardData(formData);
    };

    return (
        <Box>
            <Box pb={4}>
                <CreditCardInput
                    labelStyle={{ color: colors.dark }}
                    inputStyle={{ color: colors.dark }}
                    allowScroll={true}
                    onChange={handleCardChange}
                    labels={{ number: "NÚMERO DO CARTÃO", expiry: "VALIDADE", cvc: "CVC", name: 'NOME DO TITULAR' }}
                    placeholders={{
                        number: "1234 5678 1234 5678",
                        expiry: "MM/AA",
                        cvc: "CVC",
                        name: "Ex. Jose Oliveira"
                    }}
                    cardScale={1}
                    requiresName={true}
                />
            </Box>

            <Box p={8}>
                <Button onPress={cardTokenGeneration}>Pay</Button>
            </Box>
        </Box>
    );
}
