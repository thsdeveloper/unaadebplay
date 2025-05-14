import React, {useEffect, useState} from 'react';
import {getUser} from "@/services/user";
import {UserTypes} from "@/types/UserTypes";
import {Avatar} from "@/components/Avatar";
import {ScrollView, TouchableOpacity} from "react-native";
import {LoadingLottier} from "@/components/LoadingLottier";
import {Link, useGlobalSearchParams} from "expo-router";
import LikedIcon from "@/components/LikedIcon";
import colors from "@/constants/colors";
import SectionInfo from "@/components/SectionInfo";
import {Feather} from "@expo/vector-icons";
import {Box} from "@/components/ui/box";
import {VStack} from "@/components/ui/vstack";
import {HStack} from "@/components/ui/hstack";
import {Center} from "@/components/ui/center";


export default function UserProfile({route}: any) {
    const [user, setUser] = useState<UserTypes | null>(null);
    const {id} = useGlobalSearchParams();

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

    return (
        <Box flex={1}>
            <ScrollView>
                {user ? (
                    <VStack space={4}>
                        <Box h={24} w={"full"} position={"relative"}>
                            <Avatar
                                position={"absolute"}
                                top={4}
                                borderWidth={4}
                                borderColor={colors.light}
                                height={40}
                                width={40}
                                userAvatarID={user.avatar?.id}
                                _text={{fontSize: "md", fontWeight: "600"}}
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
                                <HStack space={4} alignItems={"center"} justifyContent={"center"}>
                                    <Box>
                                        <LikedIcon color={colors.dark} iconName={'heart'} title={'Curtir'}/>
                                    </Box>
                                    <Box>
                                        <LikedIcon color={colors.dark} iconName={'instagram'} title={'Instagram'}/>
                                    </Box>
                                    <Box>
                                        <LikedIcon color={colors.dark} iconName={'mail'} title={'E-mail'}/>
                                    </Box>
                                </HStack>
                            </Box>

                            <HStack space={2} mt={4} px={4}>

                                <Box width={'50%'}>
                                    <Text textAlign={"center"} fontWeight={"bold"} pb={2} color={'dark.200'}>Pr.
                                        Coordenador
                                        Setorial</Text>
                                    <Link href={`(profile)/${user.sector.pr_coordenador.id}`} asChild>
                                        <TouchableOpacity>
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
                                    </Link>
                                </Box>

                                <Box width={'50%'}>
                                    <Text textAlign={"center"} fontWeight={"bold"} pb={2} color={'dark.200'}>Líder
                                        Setorial
                                        UNAADEB</Text>
                                    <Link href={`(profile)/${user.sector.lider_coordenador.id}`} asChild>
                                        <TouchableOpacity>
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
                                    </Link>
                                </Box>
                            </HStack>

                            <Box px={4} py={4}>
                                <Text fontSize="md" color="gray.500">
                                    E-mail: {user.email}
                                </Text>
                                <Box mt={2}>
                                    <SectionInfo to={'/contribua'}
                                                 title={'Contribua para a UNAADEB'}
                                                 description={'Faça sua doação em PIX para o congresso'}
                                                 icon={'award'}
                                                 bgColor={colors.secundary2}
                                    />
                                </Box>
                                <Box mt={2}>
                                    <SectionInfo to={'/youtube'}
                                                 title={'Acesse nosso canal no Youtube'}
                                                 description={'Todos os vídeos do congresso'}
                                                 icon={'youtube'}
                                                 bgColor={colors.accent}
                                    />
                                </Box>
                            </Box>

                        </Box>
                    </VStack>
                ) : (
                    <>
                        <LoadingLottier/>
                    </>
                )}
            </ScrollView>
        </Box>
    );
};
