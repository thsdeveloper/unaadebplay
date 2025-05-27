import React, { useEffect, useRef } from 'react';
import {
    Animated,
    View,
    Text,
    StyleSheet,
    Dimensions,
    Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface FeedbackToastProps {
    visible: boolean;
    message: string;
    type: ToastType;
    duration?: number;
    onHide?: () => void;
    position?: 'top' | 'bottom';
}

const toastConfig = {
    success: {
        icon: 'check-circle',
        color: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    error: {
        icon: 'error',
        color: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    warning: {
        icon: 'warning',
        color: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    info: {
        icon: 'info',
        color: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
};

export const FeedbackToast: React.FC<FeedbackToastProps> = ({
    visible,
    message,
    type,
    duration = 3000,
    onHide,
    position = 'top',
}) => {
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        if (visible) {
            // Haptic feedback
            if (type === 'success') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else if (type === 'error') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            } else {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }

            // Show animation
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(scale, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto hide
            const timer = setTimeout(() => {
                hideToast();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: position === 'top' ? -100 : 100,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(scale, {
                toValue: 0.8,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onHide?.();
        });
    };

    if (!visible) return null;

    const config = toastConfig[type];
    const topPosition = position === 'top' ? (Platform.OS === 'ios' ? 50 : 30) : undefined;
    const bottomPosition = position === 'bottom' ? 30 : undefined;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    top: topPosition,
                    bottom: bottomPosition,
                    opacity,
                    transform: [
                        { translateY },
                        { scale },
                    ],
                },
            ]}
        >
            <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
                <View
                    style={[
                        styles.content,
                        {
                            backgroundColor: config.backgroundColor,
                            borderColor: config.borderColor,
                        },
                    ]}
                >
                    <View style={styles.iconContainer}>
                        <MaterialIcons
                            name={config.icon as any}
                            size={24}
                            color={config.color}
                        />
                    </View>
                    <Text style={[styles.message, { color: 'white' }]} numberOfLines={2}>
                        {message}
                    </Text>
                </View>
            </BlurView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 20,
        right: 20,
        alignItems: 'center',
        zIndex: 9999,
        elevation: 9999,
    },
    blurContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        width: '100%',
        maxWidth: width - 40,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderRadius: 16,
    },
    iconContainer: {
        marginRight: 12,
    },
    message: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 20,
    },
});

// Hook para usar o toast
import { useState, useCallback } from 'react';

export const useFeedbackToast = () => {
    const [toastConfig, setToastConfig] = useState({
        visible: false,
        message: '',
        type: 'info' as ToastType,
    });

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        setToastConfig({
            visible: true,
            message,
            type,
        });
    }, []);

    const hideToast = useCallback(() => {
        setToastConfig(prev => ({ ...prev, visible: false }));
    }, []);

    const success = useCallback((message: string) => {
        showToast(message, 'success');
    }, [showToast]);

    const error = useCallback((message: string) => {
        showToast(message, 'error');
    }, [showToast]);

    const warning = useCallback((message: string) => {
        showToast(message, 'warning');
    }, [showToast]);

    const info = useCallback((message: string) => {
        showToast(message, 'info');
    }, [showToast]);

    return {
        toastConfig,
        showToast,
        hideToast,
        success,
        error,
        warning,
        info,
    };
};