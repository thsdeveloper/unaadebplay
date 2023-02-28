import React from "react";
import {View, Button, StyleSheet} from "react-native";
import {useAuth} from "../../contexts/auth";

const styles = StyleSheet.create({
    container: {flex: 1, justifyContent: 'center'}
})

export default function Dashboard() {
    const {signOut} = useAuth()

    async function handleSignOut(){
        signOut();
    }

    return (
        <View style={styles.container}>
            <Button title={'SignOut'} onPress={handleSignOut} />
        </View>
    );
}