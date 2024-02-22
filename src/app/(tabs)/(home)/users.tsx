import React, {useState, useCallback, useEffect} from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { Box, Icon, Input, HStack } from 'native-base';
import { FontAwesome } from '@expo/vector-icons';
import { getUsers } from "@/services/user";
import UserItem from "@/components/UserItem";
import UserSkeleton from '@/components/Skeletons/UserListSkeletons'
import {UserTypes} from "@/types/UserTypes";
import {useRouter} from 'expo-router'

const PAGE_SIZE = 20;

const UserListPage = () => {
    const [users, setUsers] = useState<UserTypes[]>([]);
    const [search, setSearch] = useState<string>();
    const [inputText, setInputText] = useState('');
    const [page, setPage] = useState(1);
    const [isLoadingUser, setIsLoadingUser] = useState(false);
    const router = useRouter();

    const loadUsers = useCallback(async (reset = false, searchText = search) => {
        const filters = searchText ? {
            filter: {
                first_name: {
                    _contains: searchText,
                },
            },
        } : {};

        const responseUsers = await getUsers({
            ...filters,
            sort: 'first_name',
            limit: PAGE_SIZE,
            offset: reset ? 0 : (page - 1) * PAGE_SIZE,
        });

        if (reset) {
            setUsers(responseUsers);
        } else {
            setUsers(prevUsers => [...prevUsers, ...responseUsers]);
        }
    }, [search, page]);


    const handleUserPress = async (user: UserTypes) => {
        setIsLoadingUser(true);
        router.push(`/(tabs)/(home)/(profile)/${user.id}`);
        setIsLoadingUser(false);
    };

    const handleLoadMore = () => {
        setPage(prevPage => prevPage + 1);
    };

    const handleSearch = () => {
        setSearch(inputText);
        setPage(1);
        loadUsers(true, inputText);
    };

    const renderItem = ({ item, index }: any) => (
        <UserItem key={`${item.id}-${index}`} item={item} handleUserPress={handleUserPress} />
    );

    useEffect(() => {
        loadUsers();
    }, [page, loadUsers]);

    return (
        <Box flex={1} bg="white">
            <HStack width="100%" py={2} px={3} background={'blue.800'}>
                <Input
                    flex={1}
                    size={'2xl'}
                    placeholder="Digite o nome do usuário"
                    onChangeText={setInputText}
                    value={inputText}
                    InputRightElement={
                        <TouchableOpacity onPress={handleSearch}>
                            <Icon as={FontAwesome} name="search" size="sm" m={2} />
                        </TouchableOpacity>
                    }
                />
            </HStack>

            {users.length === 0 ? (
                <UserSkeleton />
            ) : users.length > 0 && (
                <FlatList
                    data={users}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                />
            )}

        </Box>
    );
};

export default UserListPage;
