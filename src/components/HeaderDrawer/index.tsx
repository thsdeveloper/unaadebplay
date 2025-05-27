import React, { useEffect } from 'react';
import { ScrollView, View, KeyboardAvoidingView, Platform } from 'react-native';
import * as Application from 'expo-application';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { UserProfile } from './components/UserProfile';
import { MenuItem } from './components/MenuItem';
import { QuickActions } from './components/QuickActions';
import { useHeaderDrawer } from './hooks/useHeaderDrawer';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  interpolate,
  Extrapolate 
} from 'react-native-reanimated';

export function HeaderDrawer() {
  const {
    menuItems,
    handleMenuItemPress,
    handleDeleteAccount,
    handleLogout,
    userProfile,
    isLoading,
  } = useHeaderDrawer();

  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSpring(0, {
      damping: 20,
      stiffness: 90,
    });
    opacity.value = withSpring(1, {
      damping: 20,
      stiffness: 90,
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  const menuItemAnimatedStyle = (index: number) => {
    return useAnimatedStyle(() => {
      const inputRange = [0, 1];
      const outputRange = [50, 0];
      
      return {
        transform: [
          {
            translateX: withSpring(
              interpolate(opacity.value, inputRange, outputRange, Extrapolate.CLAMP),
              { delay: index * 50 }
            ),
          },
        ],
        opacity: withSpring(opacity.value, { delay: index * 50 }),
      };
    });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <Box className="flex-1 bg-background-50 dark:bg-background-900 mt-4">
            <ScrollView 
              className="flex-1"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* User Profile */}
              <UserProfile profile={userProfile} />
              
              {/* Menu Items */}
              <View className="mb-6">
                {menuItems.map((item, index) => (
                  <Animated.View 
                    key={item.id}
                    style={menuItemAnimatedStyle(index)}
                  >
                    <MenuItem
                      item={item}
                      onPress={handleMenuItemPress}
                      isActive={item.isActive}
                    />
                  </Animated.View>
                ))}
              </View>
            </ScrollView>
            
            {/* Quick Actions */}
            <QuickActions
              onLogout={handleLogout}
              onDeleteAccount={handleDeleteAccount}
              isLoading={isLoading}
            />
            
            {/* Footer Info */}
            <View className="px-4 pb-4 border-t border-outline-200 dark:border-outline-800">
              <Text className="text-xs text-typography-500 text-center mt-3">
                Versão {Application.nativeApplicationVersion} • Build {Application.nativeBuildVersion}
              </Text>
              <Text className="text-xs text-typography-600 text-center mt-1">
                Desenvolvido por NetCriativa
              </Text>
            </View>
          </Box>
        </Animated.View>
      </KeyboardAvoidingView>
  );
}