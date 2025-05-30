import React, {useEffect, useState} from "react";
import {formatTime} from "@/utils/directus";
import Image from "@/components/Image";
import {getUser} from "@/services/user";
import {PostsTypes} from "@/types/PostsTypes";
import {UserTypes} from "@/types/UserTypes";
import {Link} from "expo-router";
import {Box} from "@/components/ui/box";
import {Pressable} from "@/components/ui/pressable";

type Props = {
    post: PostsTypes;
}

export function CardPost({post}: Props) {
    const [user, setUser] = useState<UserTypes>();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const responseUser = await getUser(post.user_created);
                setUser(responseUser);
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };

        fetchData();
    }, [post.user_created]);
    return (
        <Link href={`post/${post.id}`} asChild>
        <Pressable>
            {({isHovered, isFocused, isPressed}) => {
                return (
                    <Box m={'2'}>
                        <Box maxW="100%" rounded="lg" overflow="hidden" borderColor="coolGray.200" borderWidth="1"
                             bg={isPressed ? 'coolGray.100' : isHovered ? 'coolGray.200' : 'white'}>
                            <Box>
                                <AspectRatio w="100%" ratio={16 / 9}>
                                    <Image assetId={post.image} width={'100%'} height={'100%'} alt={post.title}/>
                                </AspectRatio>
                            </Box>
                            <Stack p="4" space={3}>
                                <Stack space={2}>
                                    <Heading size="md" ml="-1">
                                        {post.title}
                                    </Heading>
                                </Stack>
                                <Box>
                                    <Text textAlign={'justify'} lineHeight={'md'}>
                                        {post.description}
                                    </Text>
                                </Box>
                                <Box flex={1} flexDirection={'row'} alignItems={'center'}>
                                    <Box>
                                        <Text color="coolGray.400" fontWeight="600" lineHeight={'xs'}>
                                           Publicador por: {user?.first_name}
                                        </Text>
                                        <Text color="coolGray.400" fontWeight="400">
                                            Data: {formatTime(post.date_created, 'DD/MM/YYYY')}
                                        </Text>
                                    </Box>
                                </Box>
                            </Stack>
                        </Box>
                    </Box>
                )
            }}
        </Pressable>
        </Link>
    )
}
