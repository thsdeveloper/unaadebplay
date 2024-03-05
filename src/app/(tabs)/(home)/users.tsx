import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FlatList, TouchableOpacity, Text, View } from 'react-native';
import { Box, Input, HStack } from 'native-base';
import { Feather } from '@expo/vector-icons';
import { getUsers } from "@/services/user";
import UserItem from "@/components/UserItem";
import UserSkeleton from '@/components/Skeletons/UserListSkeletons'
import { UserTypes } from "@/types/UserTypes";
import { useNavigation, useRouter } from 'expo-router'
import colors from "@/constants/colors";

const PAGE_SIZE = 20;

const UserListPage = () => {
    const [users, setUsers] = useState<UserTypes[]>([]);
    const [search, setSearch] = useState('');
    const [inputText, setInputText] = useState('');
    const [page, setPage] = useState(1);
    const [showSearchInput, setShowSearchInput] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef(null);
    const navigation = useNavigation();
    const router = useRouter();

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={handlePressSearch} activeOpacity={0.7}
                                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                    <Feather name="search" size={24} color={colors.white}/>
                </TouchableOpacity>
            ),
        });
    }, [showSearchInput]);

    const handlePressSearch = () => {
        setShowSearchInput(!showSearchInput);
        if (!showSearchInput) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    };

    const handleUserPress = async (user: UserTypes) => {
        router.push(`/(tabs)/(home)/(profile)/${user.id}`);
    };

    const handleLoadMore = () => {
        setPage(prevPage => prevPage + 1);
    };

    const handleSearch = () => {
        if (inputText.length >= 3 || search) {
            setSearch(inputText);
            setPage(1);
        }
    };

    useEffect(() => {
        const loadUsers = async () => {
            setIsLoading(true);
            const filters = search ? {
                filter: {
                    first_name: {
                        _contains: search,
                    },
                },
            } : {};

            const responseUsers = await getUsers({
                ...filters,
                sort: 'first_name',
                limit: PAGE_SIZE,
                offset: (page - 1) * PAGE_SIZE,
            });

            setUsers(page === 1 ? responseUsers : [...users, ...responseUsers]);
            setIsLoading(false);
        };

        loadUsers();
    }, [search, page]);

    const renderItem = ({ item, index }: any) => (
        <UserItem key={`${item.id}-${index}`} item={item} handleUserPress={handleUserPress}/>
    );

    return (
        <Box flex={1} bg="white">
            {showSearchInput && (
                <HStack width="100%" py={2} px={3} background={colors.primary}>
                    <Input
                        ref={inputRef}
                        flex={1}
                        size={'lg'}
                        placeholderTextColor={colors.text}
                        placeholder="Digite o nome do usuário"
                        onChangeText={setInputText}
                        value={inputText}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                </HStack>
            )}

            {isLoading ? (
                <UserSkeleton />
            ) : users.length === 0 ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text>Nenhum usuário {search ? `"${search}"` : ''} encontrado.</Text>
                </View>
            ) : (
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
