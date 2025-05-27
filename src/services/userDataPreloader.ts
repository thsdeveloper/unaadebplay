// src/services/userDataPreloader.ts
import directusClient from './api';
import { readItems } from '@directus/sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function preloadUserData(userId: string) {
    try {
        // Disparar múltiplas requisições em paralelo
        const [
            userDetails,
            userPosts,
            userNotifications
        ] = await Promise.all([
            directusClient.request(readItems('users' as any, {
                filter: { id: { _eq: userId } },
                fields: ['email', 'avatar', 'first_name', 'last_name', 'role']
            })),
            directusClient.request(readItems('posts' as any, {
                filter: { user_created: { _eq: userId } },
                limit: 5
            })),
            directusClient.request(readItems('notifications' as any, {
                filter: { recipient: { _eq: userId }, read: { _eq: false } }
            }))
        ]);

        // Armazenar em cache
        await AsyncStorage.setItem('UNAADEB_UserDetailsCache', JSON.stringify(userDetails));
        await AsyncStorage.setItem('UNAADEB_UserPostsCache', JSON.stringify(userPosts));
        await AsyncStorage.setItem('UNAADEB_UserNotificationsCache', JSON.stringify(userNotifications));

        return { userDetails, userPosts, userNotifications };
    } catch (error) {
        console.error('Erro ao pré-carregar dados:', error);
        return null;
    }
}
