import React, { useEffect, useState } from 'react';
import { Box, VStack, Text, HStack, Center } from 'native-base';
import { getUser } from "../../../services/user";
import { UserTypes } from "../../../types/UserTypes";
import { Avatar } from "../../../components/Avatar";
import colors from "../../../constants/colors";
import { TouchableOpacity } from "react-native";
import { LoadingLottier } from "../../../components/LoadingLottier";
import { useNavigation } from "@react-navigation/native";

const UserProfile = ({ route }: any) => {
    const { id } = route.params;
    const [user, setUser] = useState<UserTypes | null>(null);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUser = async () => {
            const response = await getUser<UserTypes>(id, {
                fields: '*.*,sector.*.*',
            });
            console.log('Setor >>>', response)
            setUser(response);
        };

        fetchUser();
    }, [id]);

    const handleUserPress = (id) => {
        if (user?.id !== id) {
            setUser(null)
            navigation.navigate('Dashboard', { screen: 'UserProfile', params: { id: id } });
        }
    };

    return (
        <Box flex={1}>
            {user ? (
                <VStack space={4}>
                    <Box h={24} w={"full"} position={"relative"}>
                            <Avatar
                                position={"absolute"}
                                top={2}
                                borderWidth={4}
                                borderColor={colors.light}
                                height={40}
                                width={40}
                                userAvatarID={user.avatar?.id}
                                _text={{ fontSize: "md", fontWeight: "600" }}
                                alignSelf="center"
                            />
                    </Box>

                    <Box top={16}>
                        <Box>
                            <Text fontSize="25" fontWeight="bold" textAlign={"center"}>
                                {user.first_name} {user.last_name}
                            </Text>
                            <Text colorScheme="info" alignSelf="center" variant={"outline"}>
                                {user.role?.name} - {user?.title}
                            </Text>
                        </Box>

                        <HStack space={2} mt={4} px={4}>

                            <Box width={'50%'}>
                                <Text textAlign={"center"} fontWeight={"bold"} pb={2} color={'dark.200'}>Pr.
                                    Coordenador
                                    Setorial</Text>
                                <TouchableOpacity onPress={() => handleUserPress(user.sector.pr_coordenador.id)}>
                                    <Box p={2} borderRadius={'md'} bgColor={"dark.700"}
                                        borderColor={colors.darkOverlayColor}>

                                        <Center>
                                            <Avatar
                                                borderWidth={4}
                                                borderColor={colors.light}
                                                height={20}
                                                width={20}
                                                userAvatarID={user.sector.pr_coordenador.avatar}
                                            />
                                            <Text color={'dark.200'}
                                                fontWeight={"bold"}>{user.sector.pr_coordenador.first_name}</Text>
                                        </Center>
                                    </Box>
                                </TouchableOpacity>
                            </Box>

                            <Box width={'50%'}>
                                <Text textAlign={"center"} fontWeight={"bold"} pb={2} color={'dark.200'}>Líder
                                    Setorial
                                    UNAADEB</Text>
                                <TouchableOpacity onPress={() => handleUserPress(user.sector.lider_coordenador.id)}>
                                    <Box p={2} borderRadius={'md'} bgColor={"dark.700"}
                                        borderColor={colors.darkOverlayColor}>
                                        <Center>
                                            <Avatar
                                                borderWidth={4}
                                                borderColor={colors.light}
                                                height={20}
                                                width={20}
                                                userAvatarID={user.sector.lider_coordenador.avatar}
                                            />
                                            <Text color={'dark.200'}
                                                fontWeight={"bold"}>{user.sector.lider_coordenador.first_name}</Text>
                                        </Center>
                                    </Box>
                                </TouchableOpacity>
                            </Box>
                        </HStack>


                        <Box px={4} py={4}>
                            <Text fontSize="md" color="gray.500">
                                Localização: {user.location}
                            </Text>
                            <Text fontSize="md" color="gray.500">
                                E-mail: {user.email}
                            </Text>
                        </Box>

                    </Box>
                </VStack>
            ) : (
                <>
                    <LoadingLottier />
                </>
            )}
        </Box>
    );
};

export default UserProfile;
