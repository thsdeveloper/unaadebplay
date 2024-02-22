import { Text } from 'react-native';
import {useGlobalSearchParams, useNavigation} from "expo-router";
import {useLayoutEffect} from "react";

export default function Details() {
    const navigation = useNavigation()
    const { itemId } = useGlobalSearchParams<{itemId: string}>();

    useLayoutEffect(() => {
        navigation.setOptions({
            title: `Details: ${itemId}`
        })
        // Perform some sort of async data or asset fetching.

    }, []);

    return <Text>My App {itemId}</Text>;
}
