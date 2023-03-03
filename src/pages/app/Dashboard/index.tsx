import React, {useState} from "react";
import {View, StyleSheet} from "react-native";
import {Box, Button, Heading, Text, FlatList, HStack, Avatar, VStack, Spacer, ScrollView} from "native-base";
import {useAuth} from "../../../contexts/auth";
import api from "../../../services/api";
import {ReponseUser} from "../../../services/auth";

const styles = StyleSheet.create({
    container: {flex: 1, justifyContent: 'center'}
})

export default function Dashboard({navigation}: { navigation: any }) {
    const {signOut, user} = useAuth()
    const [users, setUsers] = useState<ReponseUser[]>([])

    async function handleSignOut() {
        signOut();
    }

    async function handleGetUsers() {
        const {data} = await api.get('/users')


        console.log('response', data.data)
        setUsers(data.data)
    }


    const Example = () => {
        return (
            <Box alignItems="center">
                <Button onPress={handleSignOut}>Sair da Aplicação</Button>
                <Text>{user?.first_name}</Text>
                <Text>{user?.email}</Text>

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
                <Box borderBottomWidth="1" _dark={{borderColor: "muted.50"}} borderColor="muted.800" pl={["0", "4"]}
                     pr={["0", "5"]} py="2">
                    <HStack space={[2, 3]} justifyContent="space-between">
                        <Avatar size="48px" source={{
                            uri: item.avatar
                        }}/>
                        <VStack>
                            <Text _dark={{
                                color: "warmGray.50"
                            }} color="coolGray.800" bold>
                                {item.first_name}
                            </Text>
                            <Text color="coolGray.600" _dark={{
                                color: "warmGray.200"
                            }}>
                                {item.email}
                            </Text>
                        </VStack>
                        <Spacer/>
                        <Text fontSize="xs" _dark={{
                            color: "warmGray.50"
                        }} color="coolGray.800" alignSelf="flex-start">
                            {item.last_access}
                        </Text>
                    </HStack>
                </Box>
            } keyExtractor={item => item.id}/>
        </Box>;
    };
    return (
        <View style={styles.container}>
            <Example/>
            <ListUsers/>
        </View>
    );
}