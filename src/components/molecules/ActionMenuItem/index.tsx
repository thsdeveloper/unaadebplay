import { memo } from 'react';
import { Text } from '@/components/atoms/Text';
import { View, TouchableOpacity } from 'react-native';
import { cn } from '@/utils/cn';
import { FontAwesome5 } from '@expo/vector-icons';

interface ActionMenuItemProps {
  icon: string;
  label: string;
  description?: string;
  variant?: 'default' | 'danger';
  onPress: () => void;
  className?: string;
}

export const ActionMenuItem = memo<ActionMenuItemProps>(({
  icon,
  label,
  description,
  variant = 'default',
  onPress,
  className
}) => {
  const isDanger = variant === 'danger';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={cn(
        'flex-row items-center p-4 rounded-xl mb-2',
        isDanger ? 'bg-red-900/20 border border-red-800' : 'bg-gray-800 border border-gray-700',
        className
      )}
    >
      <View className={cn(
        'w-10 h-10 rounded-full items-center justify-center mr-3',
        isDanger ? 'bg-red-900/30' : 'bg-blue-900/30'
      )}>
        <FontAwesome5
          name={icon}
          size={18}
          color={isDanger ? '#EF4444' : '#3B82F6'}
        />
      </View>

      <View className="flex-1">
        <Text
          variant="body"
          color={isDanger ? 'error' : 'white'}
          className="mb-0.5"
        >
          {label}
        </Text>
        {description && (
          <Text
            size="xs"
            color="muted"
          >
            {description}
          </Text>
        )}
      </View>

      <FontAwesome5
        name="chevron-right"
        size={14}
        color="#6B7280"
      />
    </TouchableOpacity>
  );
});

ActionMenuItem.displayName = 'ActionMenuItem';
