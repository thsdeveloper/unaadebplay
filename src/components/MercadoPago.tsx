import React from 'react';
import {
    initMercadoPago,
    createCardToken,
    CardNumber,
    SecurityCode,
    ExpirationDate,
} from '@mercadopago/sdk-react';
import {Box, Button} from "native-base";
initMercadoPago('TEST-cce89c8b-59b3-4459-b8c5-ef9dd33e7ffb');

const MercadoPago = () => {
    const cardToken = async () => {
        const response = await createCardToken({
            cardholderName: '<CARD_HOLDER_NAME>',
            identificationType: '<BUYER_IDENTIFICATION_TYPE>',
            identificationNumber: '<BUYER_IDENTIFICATION_NUMBER>',
        })
        console.log('Card Token Response = ', response)
    }
    return (
        <Box>
            <Button onClick={() => cardToken()}>Pay</Button>
        </Box>
    );
    // Restante do seu componente...
};
export default MercadoPago;