import {Box, AspectRatio, Stack, Heading, Text, Pressable} from 'native-base'
import React, {useEffect, useState} from "react";
import {formatTime} from "../utils/directus";
import {Image} from "./Image";
import {Avatar} from "./Avatar";
import {NewsItem} from "../services/news";
import {getUserId} from "../services/user";
import {ReponseUser} from "../services/auth";

type Props = {
    post: NewsItem;
}

export function CardNews({post}: Props) {
    const [user, setUser] = useState<ReponseUser>();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedUser = await getUserId(post.user_created);
                setUser(fetchedUser);
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };

        fetchData();
    }, [post.user_created]);


    return (
        <Pressable>
            {({isHovered, isFocused, isPressed}) => {
                return (
                    <Box m={'2'}>
                        <Box maxW="100%" rounded="lg" overflow="hidden" borderColor="coolGray.200" borderWidth="1"
                             bg={isPressed ? 'coolGray.100' : isHovered ? 'coolGray.200' : 'white'}>
                            <Box>
                                <AspectRatio w="100%" ratio={16 / 9}>
                                    <Image assetId={post.image} alt={post.title}/>
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
                                   <Box pr={2}>
                                       <Avatar assetId={user?.avatar} size={'sm'}/>
                                   </Box>
                                    <Box>
                                        <Text color="coolGray.400" fontWeight="600" lineHeight={'xs'}>
                                           Publicador por: {user?.first_name}
                                        </Text>
                                        <Text color="coolGray.400" fontWeight="400">
                                            Data: {formatTime(post.date_created)}
                                        </Text>
                                    </Box>
                                </Box>
                            </Stack>
                        </Box>
                    </Box>
                )
            }}
        </Pressable>
    )
}