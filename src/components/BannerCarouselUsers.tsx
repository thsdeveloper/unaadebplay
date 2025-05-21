import React, { useEffect, useState, useRef } from 'react';
import { Dimensions, FlatList, StyleSheet, Animated, TouchableOpacity, View } from 'react-native';
import { UserTypes } from "@/types/UserTypes";
import { Avatar } from "@/components/Avatar";
import { getUsers } from "@/services/user";
import colors from "@/constants/colors";
import { Link, useRouter } from "expo-router";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { Skeleton } from "@/components/ui/skeleton";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');
const ITEM_WIDTH = 100; // Largura aproximada de cada item

interface PropsBanners {
    refreshing: any;
    setRefreshing: any;
    idRole: string;
    title?: string;
    showNames?: boolean;
}

const BannerCarouselUsers = ({
                                 refreshing,
                                 setRefreshing,
                                 idRole,
                                 title,
                                 showNames = true
                             }: PropsBanners) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [users, setUsers] = useState<UserTypes[]>([]);
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef<FlatList>(null);
    const router = useRouter();

    useEffect(() => {
        const loadUsers = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await getUsers<UserTypes>({
                    filter: {
                        role: {
                            _eq: idRole,
                        },
                    },
                });

                setUsers(response);
            } catch (err) {
                console.error('Erro ao carregar usuários:', err);
                setError('Não foi possível carregar os usuários. Tente novamente.');
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        };

        loadUsers();
    }, [refreshing, idRole]);

    const navigateToUserProfile = (userId: string) => {
        router.push(`/(tabs)/(home)/(profile)/${userId}`);
    };

    const renderItem = ({ item, index }: { item: UserTypes; index: number }) => {
        // Calcular a escala baseada na posição
        const inputRange = [
            (index - 1) * ITEM_WIDTH,
            index * ITEM_WIDTH,
            (index + 1) * ITEM_WIDTH
        ];

        const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.7, 1, 0.7],
            extrapolate: 'clamp'
        });

        const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1, 0.8],
            extrapolate: 'clamp'
        });

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigateToUserProfile(item.id)}
                style={styles.itemContainer}
            >
                <Animated.View style={[
                    styles.itemContent,
                    {
                        opacity,
                        transform: [{ scale }]
                    }
                ]}>
                    <View style={styles.avatarContainer}>
                        <Avatar
                            size={'xl'} // Usando o tamanho pré-definido 'xl'
                            borderColor={colors.light}
                            borderWidth={3}
                            userAvatarID={item?.avatar}
                            width={24} // Mantendo props width/height para compatibilidade
                            height={24}
                        />
                    </View>

                    {showNames && (
                        <View style={styles.nameContainer}>
                            <Text style={styles.nameText}>
                                {item.first_name} {item.last_name?.charAt(0)}.
                            </Text>
                            {item.title && (
                                <Text style={styles.positionText}>
                                    {item.title}
                                </Text>
                            )}
                        </View>
                    )}
                </Animated.View>
            </TouchableOpacity>
        );
    };

    const renderLoader = () => (
        <HStack style={styles.loaderContainer}>
            {[...Array(5)].map((_, i) => (
                <View key={i} style={styles.skeletonItem}>
                    <Skeleton className={'h-[40px]'} />
                    {showNames && (
                        <>
                            <Skeleton className={'h-[80px]'} style={styles.skeletonName} />
                            <Skeleton className={'h-[60px]'} style={styles.skeletonPosition} />
                        </>
                    )}
                </View>
            ))}
        </HStack>
    );

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Feather name="users" size={48} color="rgba(255,255,255,0.5)" />
            <Text style={styles.emptyText}>
                Nenhum usuário encontrado
            </Text>
        </View>
    );

    const renderErrorState = () => (
        <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={48} color="rgba(255,255,255,0.5)" />
            <Text style={styles.errorText}>
                {error}
            </Text>
            <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                    setRefreshing(true);
                }}
            >
                <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
        </View>
    );

    // Indicadores do carrossel
    const renderPagination = () => {
        if (users.length <= 1 || !showNames) return null;

        return (
            <View style={styles.paginationContainer}>
                {users.map((_, index) => {
                    const inputRange = [
                        (index - 1) * ITEM_WIDTH,
                        index * ITEM_WIDTH,
                        (index + 1) * ITEM_WIDTH
                    ];

                    const dotWidth = scrollX.interpolate({
                        inputRange,
                        outputRange: [8, 16, 8],
                        extrapolate: 'clamp'
                    });

                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp'
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.paginationDot,
                                {
                                    width: dotWidth,
                                    opacity
                                }
                            ]}
                        />
                    );
                })}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Título com gradiente se fornecido */}
            {title && (
                <View style={styles.titleContainer}>
                    <Text style={styles.titleText}>
                        {title}
                    </Text>
                    <LinearGradient
                        colors={['rgba(255,255,255,0.2)', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.titleGradient}
                    />
                </View>
            )}

            {/* Conteúdo principal */}
            <View>
                {loading ? (
                    renderLoader()
                ) : error ? (
                    renderErrorState()
                ) : users.length === 0 ? (
                    renderEmptyList()
                ) : (
                    <View>
                        <Animated.FlatList
                            ref={flatListRef}
                            horizontal
                            data={users}
                            renderItem={renderItem}
                            keyExtractor={(user: UserTypes) => user.id}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.listContent}
                            snapToInterval={ITEM_WIDTH}
                            decelerationRate="fast"
                            snapToAlignment="center"
                            onScroll={Animated.event(
                                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                                { useNativeDriver: true }
                            )}
                            scrollEventThrottle={16}
                        />
                        {renderPagination()}
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    titleContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    titleText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    titleGradient: {
        height: 2,
        width: 100,
        marginBottom: 8,
    },
    loaderContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignItems: 'center',
    },
    skeletonItem: {
        alignItems: 'center',
        marginHorizontal: 8,
    },
    skeletonName: {
        marginTop: 12,
    },
    skeletonPosition: {
        marginTop: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        marginTop: 12,
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
    },
    errorText: {
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        marginTop: 12,
    },
    retryButton: {
        marginTop: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 100,
    },
    retryText: {
        color: 'white',
        fontWeight: '500',
    },
    itemContainer: {
        alignItems: 'center',
        marginHorizontal: 8,
    },
    itemContent: {
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: 8,
        padding: 4,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    nameContainer: {
        alignItems: 'center',
    },
    nameText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 4,
        fontSize: 16,
    },
    positionText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 2,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12,
    },
    paginationDot: {
        height: 8,
        borderRadius: 4,
        backgroundColor: 'white',
        marginHorizontal: 4,
    },
});

export default BannerCarouselUsers;
