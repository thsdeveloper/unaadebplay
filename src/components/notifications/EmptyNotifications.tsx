import React, { memo } from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { Feather } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import colors from '@/constants/colors';

interface EmptyNotificationsProps {
    isLoading: boolean;
    onRefresh: () => void;
    onSendTest?: () => void;
    onDebug?: () => void;
    userId?: string;
    isDevelopment?: boolean;
}

export const EmptyNotifications = memo<EmptyNotificationsProps>(({
    isLoading,
    onRefresh,
    onSendTest,
    onDebug,
    userId,
    isDevelopment = __DEV__
}) => {
    console.log('[EmptyNotifications] Props:', { isLoading, userId, isDevelopment });

    if (isLoading) {
        console.log('[EmptyNotifications] Mostrando LoadingState');
        return <LoadingState />;
    }

    console.log('[EmptyNotifications] Mostrando EmptyState');
    return (
        <EmptyState
            onRefresh={onRefresh}
            onSendTest={onSendTest}
            onDebug={onDebug}
            userId={userId}
            isDevelopment={isDevelopment}
        />
    );
});

EmptyNotifications.displayName = 'EmptyNotifications';

// Sub-componentes
const LoadingState = memo(() => (
    <Animated.View
        entering={FadeIn.duration(300)}
        className="flex-1 justify-center items-center pt-24"
    >
        <Spinner size="large" color={colors.primary} />
        <Text className="mt-4 text-base text-gray-600">
            Carregando notificações...
        </Text>
    </Animated.View>
));

LoadingState.displayName = 'LoadingState';

const EmptyState = memo<Omit<EmptyNotificationsProps, 'isLoading'>>(({
    onRefresh,
    onSendTest,
    onDebug,
    userId,
    isDevelopment
}) => (
    <Animated.View
        entering={FadeInDown.duration(500)}
        className="flex-1 justify-center items-center px-8"
        style={{ backgroundColor: '#FFFFFF' }}
    >
        <EmptyAnimation />
        <EmptyMessage />
        <ActionButtons
            onRefresh={onRefresh}
            onSendTest={onSendTest}
            onDebug={onDebug}
            userId={userId}
            isDevelopment={isDevelopment}
        />
    </Animated.View>
));

EmptyState.displayName = 'EmptyState';

const EmptyAnimation = memo(() => (
    <View className="mb-6" style={{ width: 200, height: 200, justifyContent: 'center', alignItems: 'center' }}>
        <LottieView
            source={require('@/assets/animations/bell-notification.json')}
            autoPlay
            loop
            style={{ width: 200, height: 200 }}
        />
    </View>
));

EmptyAnimation.displayName = 'EmptyAnimation';

const EmptyMessage = memo(() => (
    <>
        <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">
            Sem notificações
        </Text>
        <Text className="text-base text-gray-600 text-center mb-8 leading-6">
            Você não tem notificações no momento.{'\n'}
            Novas atividades aparecerão aqui.
        </Text>
    </>
));

EmptyMessage.displayName = 'EmptyMessage';

interface ActionButtonsProps {
    onRefresh: () => void;
    onSendTest?: () => void;
    onDebug?: () => void;
    userId?: string;
    isDevelopment?: boolean;
}

const ActionButtons = memo<ActionButtonsProps>(({
    onRefresh,
    onSendTest,
    onDebug,
    userId,
    isDevelopment
}) => (
    <View className="flex-row gap-4">
        <RefreshButton onPress={onRefresh} />

        {isDevelopment && (
            <>
                {onSendTest && <TestButton onPress={onSendTest} />}
                {onDebug && userId && (
                    <DebugButton onPress={() => onDebug()} userId={userId} />
                )}
            </>
        )}
    </View>
));

ActionButtons.displayName = 'ActionButtons';

const RefreshButton = memo<{ onPress: () => void }>(({ onPress }) => (
    <Pressable
        onPress={onPress}
        className="bg-primary-500 rounded-xl px-6 py-3 flex-row items-center active:bg-primary-600"
    >
        <Feather name="refresh-cw" size={18} color="white" />
        <Text className="ml-2 text-white font-semibold text-base">
            Atualizar
        </Text>
    </Pressable>
));

RefreshButton.displayName = 'RefreshButton';

const TestButton = memo<{ onPress: () => void }>(({ onPress }) => (
    <Pressable
        onPress={onPress}
        className="border border-primary-500 rounded-xl px-6 py-3 flex-row items-center active:bg-primary-50"
    >
        <Feather name="bell" size={18} color={colors.primary} />
        <Text className="ml-2 text-primary-600 font-semibold text-base">
            Teste
        </Text>
    </Pressable>
));

TestButton.displayName = 'TestButton';

const DebugButton = memo<{ onPress: () => void; userId: string }>(({ onPress }) => (
    <Pressable
        onPress={onPress}
        className="border border-error-500 rounded-xl px-6 py-3 flex-row items-center active:bg-error-50"
    >
        <Feather name="terminal" size={18} color={colors.darkRed || colors.danger} />
        <Text className="ml-2 text-error-600 font-semibold text-base">
            Debug
        </Text>
    </Pressable>
));

DebugButton.displayName = 'DebugButton';
