import React from "react";
import { View, StyleSheet, Text } from "react-native";

const CongressoPage = () => {
    return (
        <View style={styles.center}>
            <Text>Congresso Page</Text>
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