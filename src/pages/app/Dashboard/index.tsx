import React, {useEffect, useState} from "react";
import {View, StyleSheet} from "react-native";
import {Box, Button, Heading, Text, FlatList, HStack, Avatar, VStack, Spacer, ScrollView} from "native-base";
import {useAuth} from "../../../contexts/auth";
import api from "../../../services/api";
import {ReponseUser} from "../../../services/auth";
import {ItemListUser} from "../../../components/ItemListUser";

const styles = StyleSheet.create({
    container: {flex: 1, justifyContent: 'center'}
})

export default function Dashboard({navigation}: { navigation: any }) {
    const [users, setUsers] = useState<ReponseUser[]>([])

    async function handleGetUsers() {
        const {data} = await api.get('/users')
        console.log('response', data.data)
        setUsers(data.data)
    }


    const Example = () => {
        return (
            <Box alignItems="center">
                <Box p={8}>
                    <Button onPress={handleGetUsers}>Buscar usuários</Button>
                </Box>

                <Box p={8}>
                    <Button onPress={() => navigation.navigate('About')}>Buscar usuários</Button>
                </Box>
            </Box>
        );
    };


    const ListUsers = () => {

        return <Box p={4}>
            <Heading fontSize="xl" pb="3">
                Membros
            </Heading>
            <FlatList data={users} horizontal={false} h={'300'} renderItem={({item}) =>
                <ItemListUser user={item} />}
                      keyExtractor={item => item.id} />
        </Box>;
    };
    return (
        <View style={styles.container}>
            <Example/>
            <ListUsers/>
        </View>
    );
}