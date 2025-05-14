import React, {useContext, useEffect, useState} from "react";
import {FlatList, RefreshControl} from "react-native";
import {CardPost} from "@/components/CardPost";
import TranslationContext from "@/contexts/TranslationContext";
import {PostsTypes} from "@/types/PostsTypes";
import {getItems} from "@/services/items";
import SkeletonItem from "@/components/SkeletonItem";
import {handleErrors} from "@/utils/directus";
import AlertContext from "@/contexts/AlertContext";
import {Box} from "@/components/ui/box";

export default function PostsTabs() {
    const [posts, setPosts] = useState<PostsTypes[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const alert = useContext(AlertContext)

    const {t} = useContext(TranslationContext);

    const loadPosts = async () => {
        setRefreshing(true);
        try {
            const responsePosts = await getItems<PostsTypes>('posts').finally(() => {
                setIsLoading(false);
                setRefreshing(false);
            });
            setPosts(responsePosts)
        }catch (e) {
            const message = handleErrors(e.errors);
            alert.error(`Error: ${message}`)
        }finally {
            setRefreshing(false);
        }
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
