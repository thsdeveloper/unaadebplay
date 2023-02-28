import React from "react";
import {View, Button, StyleSheet} from "react-native";
import {useAuth} from "../../contexts/auth";

const styles = StyleSheet.create({
    container: {flex: 1, justifyContent: 'center'}
})

export default function SignIn() {
    const {signed, signIn} = useAuth()
    console.log('signed', signed)

    async function handleSignIn(){
        signIn();
    }

    return (
        <View style={styles.container}>
            <Button title={'SignIn'} onPress={handleSignIn} />
        </View>
    );
}