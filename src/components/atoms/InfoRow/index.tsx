import { memo } from 'react';
import { Text } from '@/components/atoms/Text';
import { View } from 'react-native';
import { cn } from '@/utils/cn';

interface InfoRowProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  className?: string;
}

export const InfoRow = memo<InfoRowProps>(({
  label,
  value,
  icon,
  className
}) => {
  return (
    <View className={cn('flex-row items-center py-3', className)}>
      {icon && (
        <View className="mr-3">
          {icon}
        </View>
      )}
      <View className="flex-1">
        <Text
          variant="caption"
          color="muted"
          className="mb-1"
        >
          {label}
        </Text>
        <Text
          variant="body"
          color="primary"
        >
          {value}
        </Text>
      </View>
    </View>
  );
});

InfoRow.displayName = 'InfoRow';
