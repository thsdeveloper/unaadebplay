import React, { useEffect, useState } from 'react';
import { getUser } from "@/services/user";
import { UserTypes } from "@/types/UserTypes";
import { Avatar } from "@/components/Avatar";
import { ScrollView } from "react-native";
import { LoadingLottier } from "@/components/LoadingLottier";
import { useLocalSearchParams } from "expo-router";
import LikedIcon from "@/components/LikedIcon";
import { useThemedColors } from "@/hooks/useThemedColors";
import SectionInfo from "@/components/SectionInfo";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";

export default function UserProfile() {
    const colors = useThemedColors();
    const [user, setUser] = useState<UserTypes | null>(null);
    const { id } = useLocalSearchParams<{ id: string }>();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Diretório seguro: retorna id, first_name, last_name, avatar, role, sector, status, title
                const response = await getUser<UserTypes>(String(id));
                setUser(response);
            } catch (e) {
                console.error('Erro ao carregar perfil:', e);
            }
        };
        if (id) fetchUser();
    }, [id]);

    if (!user) {
        return (
            <Box className="flex-1">
                <LoadingLottier />
            </Box>
        );
    }

    return (
        <Box className="flex-1">
            <ScrollView>
                <VStack space="md">
                    <Center className="mt-8">
                        <Avatar
                            size="2xl"
                            userAvatarID={user.avatar}
                            name={`${user.first_name ?? ''} ${user.last_name ?? ''}`}
                        />
                        <Text className="mt-3 text-2xl font-bold text-center">
                            {user.first_name} {user.last_name}
                        </Text>
                        {!!user.title && (
                            <Text className="text-center text-typography-500">{user.title}</Text>
                        )}

                        <HStack space="lg" className="items-center justify-center mt-3">
                            <LikedIcon color={colors.text} iconName={'heart'} title={'Curtir'} />
                            <LikedIcon color={colors.text} iconName={'instagram'} title={'Instagram'} />
                            <LikedIcon color={colors.text} iconName={'mail'} title={'E-mail'} />
                        </HStack>
                    </Center>

                    <Box className="px-4 py-4">
                        <Box className="mt-2">
                            <SectionInfo
                                to={'/contribua'}
                                title={'Contribua para a UNAADEB'}
                                description={'Faça sua doação em PIX para o congresso'}
                                icon={'award'}
                                bgColor={colors.primary}
                            />
                        </Box>
                        <Box className="mt-2">
                            <SectionInfo
                                to={'/youtube'}
                                title={'Acesse nosso canal no Youtube'}
                                description={'Todos os vídeos do congresso'}
                                icon={'youtube'}
                                bgColor={colors.primary}
                            />
                        </Box>
                    </Box>
                </VStack>
            </ScrollView>
        </Box>
    );
}
