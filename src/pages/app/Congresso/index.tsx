import React from "react";
import { View, StyleSheet, Text } from "react-native";
import MercadoPago from "../../../components/MercadoPago";

const CongressoPage = () => {
    return (
        <View style={styles.center}>
            <Text>Página do Congresso</Text>
            <Text>Em breve mais informações sobre o congresso geral da UNAADEB 2024</Text>
            <MercadoPago />
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
