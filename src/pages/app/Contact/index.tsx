import React from "react";
import { View, StyleSheet, Text } from "react-native";
import {Link} from "native-base";

export default function Contact({navigation}: { navigation: any }) {
    return (
        <View style={styles.center}>
            <Text>This is the contact screen</Text>
            <Link _text={{
                fontSize: "xs",
                fontWeight: "500",
                color: "blue.300"
            }} mt="1" onPress={() => navigation.navigate('About')}>
                Tela sobre
            </Link>
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