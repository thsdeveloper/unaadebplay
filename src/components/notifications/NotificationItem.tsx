import React, { memo, useCallback, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { NotificationData } from '@/services/notification';
import colors from '@/constants/colors';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, {
    FadeIn,
    FadeOut,
    Layout,
    useAnimatedStyle,
    withTiming,
    useSharedValue
} from 'react-native-reanimated';
import { formatNotificationDate } from './utils';
import { SWIPE_ACTION_WIDTH } from './constants';

interface NotificationItemProps {
    notification: NotificationData;
    onPress: (id: string) => void;
    onDelete: (id: string) => void;
}

export const NotificationItem = memo<NotificationItemProps>(({
    notification,
    onPress,
    onDelete,
}) => {
    const swipeableRef = React.useRef<Swipeable>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);

    const formattedDate = React.useMemo(
        () => formatNotificationDate(notification.created_at),
        [notification.created_at]
    );

    const handlePress = useCallback(() => {
        if (!notification.read) {
            onPress(notification.id);
        }
        swipeableRef.current?.close();
    }, [notification.id, notification.read, onPress]);

    const handleDelete = useCallback(() => {
        Alert.alert(
            'Deletar Notificação',
            'Tem certeza que deseja deletar esta notificação?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                    onPress: () => swipeableRef.current?.close()
                },
                {
                    text: 'Deletar',
                    style: 'destructive',
                    onPress: () => {
                        setIsDeleting(true);
                        opacity.value = withTiming(0, { duration: 300 });
                        scale.value = withTiming(0.8, { duration: 300 });

                        setTimeout(() => {
                            onDelete(notification.id);
                        }, 300);
                    }
                }
            ]
        );
    }, [notification.id, onDelete, opacity, scale]);

    const animatedContainerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }]
    }));

    if (isDeleting) {
        return <Animated.View style={[animatedContainerStyle, { height: 60 }]} />;
    }

    return (
        <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
            layout={Layout.springify()}
            style={animatedContainerStyle}
        >
            <Swipeable
                ref={swipeableRef}
                renderLeftActions={() => (
                    <SwipeLeftAction
                        onPress={handlePress}
                        isRead={notification.read}
                    />
                )}
                renderRightActions={() => (
                    <SwipeRightAction onPress={handleDelete} />
                )}
                overshootLeft={false}
                overshootRight={false}
                leftThreshold={40}
                rightThreshold={40}
                friction={2}
                shouldCancelWhenOutside={true}
            >
                <NotificationContent
                    notification={notification}
                    formattedDate={formattedDate}
                    onPress={handlePress}
                />
            </Swipeable>
        </Animated.View>
    );
});

NotificationItem.displayName = 'NotificationItem';

// Sub-componentes
interface SwipeLeftActionProps {
    onPress: () => void;
    isRead: boolean;
}

const SwipeLeftAction = memo<SwipeLeftActionProps>(({ onPress, isRead }) => {
    if (isRead) return null;

    return (
        <Pressable
            onPress={onPress}
            className="bg-green-500 justify-center items-center px-6"
            style={{ width: SWIPE_ACTION_WIDTH }}
        >
            <Feather name="check" size={24} color="white" />
            <Text className="text-white text-xs font-semibold mt-1">Lido</Text>
        </Pressable>
    );
});

SwipeLeftAction.displayName = 'SwipeLeftAction';

interface SwipeRightActionProps {
    onPress: () => void;
}

const SwipeRightAction = memo<SwipeRightActionProps>(({ onPress }) => (
    <Pressable
        onPress={onPress}
        className="bg-red-500 justify-center items-center px-6"
        style={{ width: SWIPE_ACTION_WIDTH }}
    >
        <Feather name="trash-2" size={24} color="white" />
        <Text className="text-white text-xs font-semibold mt-1">Deletar</Text>
    </Pressable>
));

SwipeRightAction.displayName = 'SwipeRightAction';

interface NotificationContentProps {
    notification: NotificationData;
    formattedDate: string;
    onPress: () => void;
}

const NotificationContent = memo<NotificationContentProps>(({
    notification,
    formattedDate,
    onPress
}) => (
    <Pressable
        onPress={onPress}
        className={`
            flex-row items-center px-4 py-3
            ${notification.read ? 'bg-white' : 'bg-stone-100'}
            ${notification.read ? '' : 'border-l-4 border-l-primary-500'}
        `}
        style={({ pressed }) => ({
            opacity: pressed ? 0.8 : 1,
            minHeight: 60,
            borderBottomWidth: 0.5,
            borderBottomColor: '#E5E7EB'
        })}
    >
        {!notification.read && (
            <View className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />
        )}

        <View className="flex-1 mr-3">
            <View className="flex-row justify-between items-center mb-1">
                <Text
                    className={`
                        text-sm flex-1 mr-2
                        ${notification.read ? 'font-semibold text-gray-700' : 'font-bold text-gray-900'}
                    `}
                    numberOfLines={1}
                >
                    {notification.title}
                </Text>
                <Text className="text-xs text-gray-500">
                    {formattedDate}
                </Text>
            </View>

            <Text
                className={`
                    text-sm leading-5
                    ${notification.read ? 'text-gray-600' : 'text-gray-700'}
                `}
                numberOfLines={2}
            >
                {notification.body}
            </Text>
        </View>

        <NotificationStatusIcon isRead={notification.read} />
    </Pressable>
));

NotificationContent.displayName = 'NotificationContent';

const NotificationStatusIcon = memo<{ isRead: boolean }>(({ isRead }) => (
    <View className="p-1">
        <Feather
            name={isRead ? "check-circle" : "bell"}
            size={20}
            color={isRead ? '#3cca6d' : colors.primary}
        />
    </View>
));

NotificationStatusIcon.displayName = 'NotificationStatusIcon';
