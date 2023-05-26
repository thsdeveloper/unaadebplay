import React, {useState, useEffect, useContext} from 'react';
import {FlatList, TouchableOpacity} from 'react-native';
import {Box, Text, VStack, Divider, Spinner, Stack, Icon, Input, HStack, Center} from 'native-base';
import {getItems} from '../../../services/items';
import {UserTypes} from '../../../types/UserTypes'; // Defina o tipo do usuário aqui
import { FontAwesome } from '@expo/vector-icons';
import colors from "../../../constants/colors";
import {getUsers} from "../../../services/user";
import UserItem from "../../../components/UserItem";
import {LoadingLottier} from "../../../components/LoadingLottier";

const PAGE_SIZE = 20; // Defina o número de usuários para carregar por vez

const UserListPage = ({navigation}) => {
    const [users, setUsers] = useState<UserTypes[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        loadUsers();
    }, [search, page]);

    const loadUsers = async () => {
        setIsLoadingList(true);
        const filters = search ? {
            filter: {
                first_name: {
                    _contains: search,
                },
            },
        } : {};

        const responseUsers = await getUsers({
            ...filters,
            limit: PAGE_SIZE, // Limite os resultados retornados para o tamanho da página
            offset: (page - 1) * PAGE_SIZE, // O offset é a quantidade de resultados a pular
        });
        console.log('BUSCOU MAIS >>>')

        setUsers(prevUsers => [...prevUsers, ...responseUsers]); // Adicione os novos usuários à lista existente
        setIsLoadingList(false);
    };

    const handleUserPress = async (user: UserTypes) => {
        setIsLoadingUser(true);
        navigation.navigate('Dashboard', {screen: 'UserProfile', params: {id: user.id}});
        setIsLoadingUser(false);
    };

    const handleLoadMore = () => {
        setPage(prevPage => prevPage + 1); // Quando o usuário chega ao final da lista, carregue a próxima página
    };

    const renderItem = ({ item }) => (
        <UserItem item={item} handleUserPress={handleUserPress} />
    );

    return (
        <Box flex={1} bg="white">
            <HStack width="100%" py={2} px={3}>
                <Input
                    flex={1}
                    placeholder="Digite o nome do usuário"
                    onChangeText={text => setSearch(text)}
                    value={search}
                    InputRightElement={
                        <TouchableOpacity onPress={loadUsers}>
                            <Icon as={FontAwesome} name="search" size="sm" m={2} />
                        </TouchableOpacity>
                    }
                />
            </HStack>

            {isLoadingList ? (
                <LoadingLottier />
            ) : users?.length > 0 ? (
                <FlatList
                    data={users}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    onEndReached={handleLoadMore} // Carregue mais usuários quando o usuário chegar ao final da lista
                    onEndReachedThreshold={0.5} // Comece a carregar quando o usuário estiver a meio caminho de alcançar o final da lista
                />
            ) : (
                <Center>
                    <Text>Nenhum membro encontrado.</Text>
                </Center>
            )}

            {isLoadingUser  && (
                <LoadingLottier />
            )}
        </Box>
    );
};

export default UserListPage;
