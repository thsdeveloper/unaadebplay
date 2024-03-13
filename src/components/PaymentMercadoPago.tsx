import React, { useState, useContext } from "react";
import { Box, Button } from "native-base";
import { loadMercadoPago } from "@mercadopago/sdk-js";

import AlertContext from "@/contexts/AlertContext";
import colors from "@/constants/colors";

export default function PaymentMercadoPago() {
    const [cardData, setCardData] = useState(null);
    const alert = useContext(AlertContext);


    const cardTokenGeneration = async () => {
        try {


        } catch (e) {
            console.error(e);
            alert.error(`Ocorreu um erro ao cadastrar um novo cartão -> ${e}`);
        }
    };

    const handleCardChange = (formData: any) => {
        setCardData(formData);
    };

    return (
        <Box>
             <Box p={8}>
                <Button onPress={cardTokenGeneration}>Pay</Button>
            </Box>
        </Box>
    );
}
