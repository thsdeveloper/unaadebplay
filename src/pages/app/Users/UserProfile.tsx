import React, {useContext, useEffect, useState} from 'react';
import {Box, VStack, Text, Icon, HStack, Center, Badge} from 'native-base';
import {Ionicons} from '@expo/vector-icons';
import {getUserId} from "../../../services/user";
import {UserTypes} from "../../../types/UserTypes";
import {Avatar} from "../../../components/Avatar";
import colors from "../../../constants/colors";
import {ImageBackground} from "react-native";
import ConfigContext from "../../../contexts/ConfigContext";

const UserProfile = ({route}: any) => {
    const {id} = route.params;
    const [user, setUser] = useState<UserTypes | null>(null);
    const config = useContext(ConfigContext);

    useEffect(() => {
        const fetchUser = async () => {
            const response = await getUserId<UserTypes>(id);
            setUser(response);
        };

        fetchUser();
    }, [id]);

    return (
        <Box flex={1}>
            {user ? (
                <VStack space={4}>

                    <Box h={24} w={"full"} position={"relative"}>
                        <ImageBackground source={{uri: `${config.url_api}/assets/${config.public_background}`}}
                                         style={{flex: 1}}>
                            <Avatar
                                position={"absolute"}
                                top={4}
                                borderWidth={4}
                                borderColor={colors.light}
                                height={40}
                                width={40}
                                userAvatarID={user.avatar}
                                _text={{fontSize: "md", fontWeight: "600"}}
                                alignSelf="center"
                            />
                        </ImageBackground>
                    </Box>
                    <Box alignItems="center" width={"full"} top={16}>

                        <Box>
                            <Text fontSize="25" fontWeight="bold" textAlign={"center"}>
                                {user.first_name} {user.last_name}
                            </Text>
                            <Badge colorScheme="info" alignSelf="center" variant={"outline"}>
                                {user.title}
                            </Badge>
                        </Box>

                        <Box mt={4}>
                            <Text fontSize="md" color="gray.500">
                                E-mail: {user.email}
                            </Text>
                            <HStack space={1}>
                                <Icon as={Ionicons} name="location-outline" size={5} color="muted.500"/>
                                <Text fontSize="sm" color="gray.500">
                                    Localização: {user.location}
                                </Text>
                            </HStack>
                        </Box>
                        <Box>
                            <Text fontSize="sm" color="gray.500">
                                Sexo: {user.gender}
                            </Text>
                        </Box>

                        <Box mt={4}>
                            <Text fontSize="md">
                                {user.description}
                            </Text>
                        </Box>

                    </Box>
                </VStack>
            ) : (
                <Center flex={1}>
                    <Text>Loading...</Text>
                </Center>
            )}
        </Box>
    );
};

export default UserProfile;
