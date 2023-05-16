import React, {useEffect, useState} from 'react';
import {StyleSheet, useWindowDimensions} from 'react-native';
import {Text,ScrollView, Box, VStack, HStack, Tag, Heading} from 'native-base';
import {getUserId} from "../../../services/user";
import {UserTypes} from "../../../types/UserTypes";
import {PostsTypes} from "../../../types/PostsTypes";
import {getItem} from "../../../services/items";
import {Image} from "../../../components/Image";
import {LinearGradient} from 'expo-linear-gradient';
import colors from "../../../constants/colors";
import RenderHtml from "react-native-render-html";
import SkeletonItem from "../../../components/SkeletonItem";

const PostDetailsPage = ({route}: any) => {
    const { id } = route.params;
    const {width} = useWindowDimensions();
    const [creator, setCreator] = useState<UserTypes | null>(null);
    const [post, setPost] = useState<PostsTypes | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadData = async () => {
            const responsePost = await getItem<PostsTypes>('posts', id);
            setPost(responsePost);

            const creator = await getUserId(responsePost.user_created);
            setCreator(creator);
            setIsLoading(false);
        };

        loadData();
    }, [id]);

    if (isLoading) {
        return (
            <>
                <SkeletonItem count={1} />
            </>
        );
    }

    return (
        <ScrollView>
            <Box>
                <Box>
                    <Image
                        assetId={post?.image}
                        width={'100%'} height={'64'}
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0, 0, 0, 2.9)']}
                        style={styles.gradient}
                    />
                    <Box position={"absolute"} bottom={4} left={4} right={4}>
                        <Heading style={styles.title}>{post?.title}</Heading>
                        <Text color={colors.text2}>Criado por: {creator?.first_name} {creator?.last_name}</Text>

                        <HStack space={2} alignItems="center" mt={2}>
                            {post?.tags.map((tag, index) => (
                                <Tag key={index} variant="outline" colorScheme="cyan" size={'sm'}>{tag}</Tag>
                            ))}
                        </HStack>

                    </Box>
                </Box>

                <VStack space={4} alignItems="center">
                   <Box p={4}>
                       <RenderHtml
                           contentWidth={width}
                           source={{html: String(post?.content)}}
                       />
                   </Box>
                </VStack>
            </Box>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '100%',
        justifyContent: 'flex-end',
        padding: 10,
    },
    title: {
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: {width: -1, height: 1},
        textShadowRadius: 10,
    },
});

export default PostDetailsPage;
