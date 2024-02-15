import React, {useContext, useEffect, useState} from "react";
import { View, StyleSheet, Text } from "react-native";
import {StripeProvider, useStripe, usePaymentSheet, Address, BillingDetails} from "@stripe/stripe-react-native";
import { Button } from "native-base";
import AlertContext from "../../../contexts/AlertContext";

const CongressoPage = () => {
    const { initPaymentSheet, presentPaymentSheet} = useStripe();
    const {loading} = usePaymentSheet();
    const alert = useContext(AlertContext)

    const fetchPaymentSheetParams = async () => {
        try {
            const response = await fetch(`https://back-unaadeb.onrender.com/stripe/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const { paymentIntent, ephemeralKey, customer} = await response.json();

            return {
                paymentIntent,
                ephemeralKey,
                customer,
            };
        }catch (error){
            alert.error( `Your order is confirmed! ${error.message}`);
        }
    };

    const initializePaymentSheet = async () => {
        const {
            paymentIntent,
            ephemeralKey,
            customer,
            publishableKey,
        } = await fetchPaymentSheetParams();

        const address: Address = {
            city: 'San Francisco',
            country: 'AT',
            line1: '510 Townsend St.',
            line2: '123 Street',
            postalCode: '94102',
            state: 'California',
        };
        const billingDetails: BillingDetails = {
            name: 'Jane Doe',
            email: 'foo@bar.com',
            phone: '555-555-555',
            address: address,
        };

        const { error } = await initPaymentSheet({
            merchantDisplayName: "UNAADEB Play",
            customerId: customer,
            customerEphemeralKeySecret: ephemeralKey,
            paymentIntentClientSecret: paymentIntent,
            // Set `allowsDelayedPaymentMethods` to true if your business can handle payment
            //methods that complete payment after a delay, like SEPA Debit and Sofort.
            allowsDelayedPaymentMethods: true,
            defaultBillingDetails: billingDetails
        });
        if (!error) {
            alert.success( `Tudo pronto só pagar agora!`);
        }
    };

    const openPaymentSheet = async () => {
        const { error } = await presentPaymentSheet();

        if (error) {
            alert.error(error.message);
        } else {
            alert.error( 'Your order is confirmed!');
        }
    };

    useEffect(() => {
        initializePaymentSheet();
    }, []);

    return (
        <View style={styles.center}>
            <StripeProvider
                publishableKey="pk_test_51LIHhXBXRLAVGEx1kwfSm4rCRci6LLGAvMTu5Nd7RSvsioCzJKaGg7adVPqpOJroecanriQcXIV6PorgFbyt8YbJ00Qaov4NjL"
                urlScheme="your-url-scheme" // required for 3D Secure and bank redirects
                merchantIdentifier="merchant.com.{{YOUR_APP_NAME}}" // required for Apple Pay
            >
                <Text>Em breve mais informações sobre o congresso</Text>
                <Button size={'lg'}  onPress={openPaymentSheet}>
                    BUTTON
                </Button>
            </StripeProvider>
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