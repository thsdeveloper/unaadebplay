import React, {useState, useCallback, useEffect, useRef} from 'react';
import {FlatList, TouchableOpacity, Text, View, ActivityIndicator} from 'react-native';
import {Box, Input, HStack} from 'native-base';
import {Feather} from '@expo/vector-icons';
import {getUsers} from "@/services/user";
import UserItem from "@/components/UserItem";
import UserSkeleton from '@/components/Skeletons/UserListSkeletons'
import {UserTypes} from "@/types/UserTypes";
import {useNavigation, useRouter} from 'expo-router'
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
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [isMoreLoading, setIsMoreLoading] = useState(false);
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
        if (isMoreLoading) return; // Evita chamadas adicionais se já estiver carregando mais usuários
        setIsMoreLoading(true); // Define que está carregando mais usuários
        setPage(prevPage => prevPage + 1);
    };

    useEffect(() => {
        if (inputText.length >= 3) {
            setSearch(inputText);
            setPage(1);
            setIsSearching(true); // Inicia o loading da busca
        }
    }, [inputText]);

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

            setIsLoading(true);
            setUsers(page === 1 ? responseUsers : [...users, ...responseUsers]);
            setIsLoading(false);
            setIsSearching(false); // Finaliza o loading da busca
            if (page === 1) {
                setIsInitialLoading(false);
            }
            setIsMoreLoading(false); // Indica que o carregamento de mais usuários foi concluído
        };

        loadUsers();
    }, [search, page]);

    const clearSearch = () => {
        setInputText('');
        setSearch(''); // Redefine o estado de busca
        setPage(1); // Opcional: Redefine a página para 1
        setShowSearchInput(false);
        setIsSearching(false); // Opcional: Indica que a busca foi encerrada
    };

    const renderItem = ({item, index}: any) => (
        <UserItem key={`${item.id}-${index}`} item={item} handleUserPress={handleUserPress}/>
    );

    const inputIconRigth = () => {
        return  inputText.length > 0 ? (
            <TouchableOpacity onPress={clearSearch}>
                <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
        ) : null
    }

    return (
        <Box flex={1} bg="white">
            {showSearchInput && (
                <HStack width="100%" py={2} px={3} background={colors.primary}>
                    <Input
                        ref={inputRef}
                        flex={1}
                        size={'2xl'}
                        variant={'underlined'}
                        color={colors.light}
                        placeholderTextColor={colors.text}
                        placeholder="Digite o nome do usuário"
                        onChangeText={setInputText}
                        value={inputText}
                        returnKeyType="search"
                        InputRightElement={inputIconRigth()}
                    />
                </HStack>
            )}

            {isSearching ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : isInitialLoading ? (
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
                    onEndReachedThreshold={0.2}
                />
            )}
        </Box>
    );
};

export default UserListPage;
