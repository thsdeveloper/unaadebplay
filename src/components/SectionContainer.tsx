import React, { memo, ReactNode } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { Motion } from '@legendapp/motion';
import { useRouter } from 'expo-router';
import {cn} from "@gluestack-ui/nativewind-utils/cn";

interface SectionContainerProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    seeAllRoute?: string;
    actionLabel?: string;
    icon?: keyof typeof Feather.glyphMap;
    delay?: number;
    className?: string;
    contentClassName?: string;
    headerClassName?: string;
    onSeeAllPress?: () => void;
    testID?: string;
    animateOnMount?: boolean;
}

/**
 * Componente de contêiner de seção reutilizável com título, ações e animações
 * Estilizado com TailwindCSS
 */
const SectionContainer = memo(({
                                   children,
                                   title,
                                   subtitle,
                                   seeAllRoute,
                                   actionLabel = 'Ver todos',
                                   icon,
                                   delay = 0,
                                   className,
                                   contentClassName,
                                   headerClassName,
                                   onSeeAllPress,
                                   testID,
                                   animateOnMount = true
                               }: SectionContainerProps) => {
    const router = useRouter();

    const handleSeeAllPress = () => {
        if (onSeeAllPress) {
            onSeeAllPress();
        } else if (seeAllRoute) {
            router.push(seeAllRoute);
        }
    };

    const hasHeaderContent = title || subtitle || (seeAllRoute || onSeeAllPress);

    // Wrapper com animação ou sem, dependendo da propriedade animateOnMount
    const ContainerComponent = animateOnMount ? Motion.View : View;
    const containerProps = animateOnMount
        ? {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: {
                type: 'spring',
                damping: 18,
                stiffness: 100,
                delay
            }
        }
        : {};

    return (
        <ContainerComponent
            className={cn("mb-0", className)}
            {...containerProps}
            testID={testID}
        >
            {hasHeaderContent && (
                <View className={cn("flex-row justify-between items-center mb-3 mt-4 px-2.5", headerClassName)}>
                    <View className="flex-row items-center flex-1">
                        {icon && (
                            <Feather name={icon} size={20} color="#fff" className="mr-2" />
                        )}
                        <View>
                            {title && <Text className="text-lg font-bold text-white">{title}</Text>}
                            {subtitle && <Text className="text-sm text-white/70 mt-0.5">{subtitle}</Text>}
                        </View>
                    </View>

                    {(seeAllRoute || onSeeAllPress) && (
                        <TouchableOpacity
                            className="flex-row items-center py-1 px-2"
                            onPress={handleSeeAllPress}
                            activeOpacity={0.7}
                        >
                            <Text className="text-sm text-white/80 mr-1">{actionLabel}</Text>
                            <Feather name="chevron-right" size={16} color="#fff" style={{ opacity: 0.8 }} />
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <View className={cn("px-0", contentClassName)}>
                {children}
            </View>
        </ContainerComponent>
    );
});

export default SectionContainer;
