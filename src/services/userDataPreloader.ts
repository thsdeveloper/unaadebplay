// src/services/userDataPreloader.ts
import directusClient from './api';
import { readItems } from '@directus/sdk';

export async function preloadUserData(userId: string) {
    try {
        // Disparar múltiplas requisições em paralelo
        const [
            userDetails,
            userPosts,
            userNotifications
        ] = await Promise.all([
            directusClient.request(readItems('users', {
                filter: { id: { _eq: userId } },
                fields: ['email', 'avatar', 'first_name', 'last_name', 'role']
            })),
            directusClient.request(readItems('posts', {
                filter: { user_created: { _eq: userId } },
                limit: 5
            })),
            directusClient.request(readItems('notifications', {
                filter: { recipient: { _eq: userId }, read: { _eq: false } }
            }))
        ]);

        // Armazenar em cache
        await AsyncStorage.setItem('@UNAADEB:UserDetailsCache', JSON.stringify(userDetails));
        await AsyncStorage.setItem('@UNAADEB:UserPostsCache', JSON.stringify(userPosts));
        await AsyncStorage.setItem('@UNAADEB:UserNotificationsCache', JSON.stringify(userNotifications));

        return { userDetails, userPosts, userNotifications };
    } catch (error) {
        console.error('Erro ao pré-carregar dados:', error);
        return null;
    }
}
