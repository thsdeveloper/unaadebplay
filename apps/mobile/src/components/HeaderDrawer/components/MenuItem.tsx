import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { Badge } from '@/components/ui/badge';
import { MenuItem as MenuItemType } from '../types';

interface MenuItemProps {
  item: MenuItemType;
  onPress: (item: MenuItemType) => void;
  isActive?: boolean;
}

export const MenuItem: React.FC<MenuItemProps> = ({ item, onPress, isActive }) => {
  const handlePress = () => {
    if (!item.disabled) {
      onPress(item);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={item.disabled}
      className="mx-4 mb-2"
    >
      <Box 
        className={`
          flex-row items-center justify-between p-4 rounded-xl
          ${isActive 
            ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800' 
            : 'bg-white dark:bg-background-800 border border-outline-100 dark:border-outline-800'
          }
          ${item.disabled ? 'opacity-50' : ''}
        `}
      >
        <View className="flex-row items-center flex-1">
          <View 
            className={`
              w-10 h-10 rounded-full items-center justify-center
              ${isActive ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-background-100 dark:bg-background-700'}
            `}
          >
            <FontAwesome5 
              name={item.icon} 
              size={18} 
              color={isActive ? '#3B82F6' : '#6B7280'}
            />
          </View>
          
          <View className="ml-4 flex-1">
            <View className="flex-row items-center">
              <Text 
                className={`
                  text-base font-medium
                  ${isActive 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-typography-900 dark:text-typography-100'
                  }
                `}
              >
                {item.name}
              </Text>
              
              {item.isPremium && (
                <Badge className="ml-2 bg-warning-500/20 px-2 py-0.5">
                  <Feather name="star" size={10} color="#FFA500" />
                  <Text className="text-xs text-warning-600 ml-1">Pro</Text>
                </Badge>
              )}
            </View>
          </View>
          
          {item.badge && item.badge > 0 && (
            <View className="bg-error-500 rounded-full px-2 py-1 min-w-[24px] items-center">
              <Text className="text-xs text-white font-bold">
                {item.badge > 99 ? '99+' : item.badge}
              </Text>
            </View>
          )}
          
          <Feather 
            name="chevron-right" 
            size={20} 
            color={isActive ? '#3B82F6' : '#9CA3AF'}
            style={{ marginLeft: 8 }}
          />
        </View>
      </Box>
    </TouchableOpacity>
  );
};