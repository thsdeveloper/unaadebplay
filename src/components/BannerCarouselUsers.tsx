import React, {useEffect, useState} from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import {Box, FlatList, HStack, Pressable, Skeleton} from 'native-base';
import {NavigationProp, ParamListBase} from '@react-navigation/native';
import {UserTypes} from "../types/UserTypes";
import {Avatar} from "./Avatar";
import {getUsers} from "../services/user";
import colors from "../constants/colors";


const {width: screenWidth} = Dimensions.get('window');

interface PropsBanners {
    navigation: NavigationProp<ParamListBase>;
    refreshing: any,
    setRefreshing: any
}

const BannerCarouselUsers = ({navigation, refreshing, setRefreshing}: PropsBanners) => {
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [users, setUsers] = useState<UserTypes[]>([]);


    useEffect(() => {
        const loadBanners = async () => {
            const response = await getUsers<UserTypes>({
                filter: {
                    role: {
                        _eq: 'fb948a78-4c3e-408e-b712-327eec70ad54',
                    },
                },
            }).finally(() => {
                setLoading(false)
                setRefreshing(false)
            });
            setUsers(response);
        }

        loadBanners()
    }, [refreshing]);


    const handleBannerPress = (item: UserTypes) => {
        // Adicione a lógica de navegação aqui para redirecionar o usuário para uma tela específica
        navigation.navigate('Dashboard', {screen: 'UserProfile', params: {id: item.id}});
    };

    const renderItem = ({item}: { item: UserTypes }) => (
        <Box>
            <Pressable onPress={() => handleBannerPress(item)} ml={2}>
                <Avatar
                    borderColor={colors.bag2Bg}
                    borderWidth={3}
                    userAvatarID={item?.avatar}
                    width={20}
                    height={20}
                />
            </Pressable>
        </Box>
    );


    const renderLoader = () => (
        <HStack m={2}>
            <Skeleton width={20} height={20} borderRadius={"full"}/>
            <Skeleton width={20} height={20} borderRadius={"full"}/>
            <Skeleton width={20} height={20} borderRadius={"full"}/>
            <Skeleton width={20} height={20} borderRadius={"full"}/>
            <Skeleton width={20} height={20} borderRadius={"full"}/>
            <Skeleton width={20} height={20} borderRadius={"full"}/>
            <Skeleton width={20} height={20} borderRadius={"full"}/>
        </HStack>
    );

    return (
        <Box>
            {loading ? (
                renderLoader()
            ) : (
                <>
                    <FlatList
                        horizontal
                        data={users}
                        renderItem={renderItem}
                        snapToInterval={screenWidth * 0.8}
                        decelerationRate="fast"
                        keyExtractor={(user: UserTypes) => user.id}
                        contentContainerStyle={styles.flatListContainer}
                        showsHorizontalScrollIndicator={false}
                        onScroll={(event) => {
                            const newIndex = Math.round(event.nativeEvent.contentOffset.x / 20);
                            if (newIndex !== activeIndex) {
                                setActiveIndex(newIndex);
                            }
                        }}
                        scrollEventThrottle={16}
                    />
                    {/*<PaginationDots data={users} activeIndex={activeIndex}/>*/}
                </>
            )}
        </Box>
    );
};

const styles = StyleSheet.create({
    flatListContainer: {
        flexGrow: 1,
    },
    textBackground: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '90%',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    bannerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    bannerDescription: {
        color: 'white',
        fontSize: 14,
    },
    dots: {
        alignSelf: 'center',
        marginTop: 8,
    },
});

export default BannerCarouselUsers;

