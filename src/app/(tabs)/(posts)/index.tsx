import React, {useContext, useEffect, useState} from "react";
import {RefreshControl} from "react-native";
import {
    Box,
    FlatList,
} from "native-base";
import {CardPost} from "@/components/CardPost";
import TranslationContext from "@/contexts/TranslationContext";
import {PostsTypes} from "@/types/PostsTypes";
import {getItems} from "@/services/items";
import SkeletonItem from "@/components/SkeletonItem";

export default function PostsTabs() {
    const [posts, setPosts] = useState<PostsTypes[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const {t} = useContext(TranslationContext);

    const loadPosts = async () => {
        setRefreshing(true);
        const responsePosts = await getItems<PostsTypes>('posts').finally(() => {
            setIsLoading(false);
            setRefreshing(false);
        });
        setPosts(responsePosts)
    };

    useEffect(() => {
        loadPosts();
    }, []);

    if (isLoading) {
        return (
            <>
                <SkeletonItem count={1} />
            </>
        );
    }


    return (
        <Box>
            <FlatList data={posts} renderItem={({item}) =>
                <CardPost post={item}/>
            } keyExtractor={(item: PostsTypes) => item.id.toString()} refreshControl={
                <RefreshControl
                    title={t('text_search')}
                    refreshing={refreshing}
                    onRefresh={loadPosts}
                />
            }/>
        </Box>
    );
}
