import { memo } from 'react';
import { Text } from '@/components/atoms/Text';
import { View } from 'react-native';
import { cn } from '@/utils/cn';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export const SectionHeader = memo<SectionHeaderProps>(({
  title,
  subtitle,
  className
}) => {
  return (
    <View className={cn('mb-4', className)}>
      <Text
        variant="subheading"
        color="primary"
        className="mb-1"
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          variant="caption"
          color="muted"
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
});

SectionHeader.displayName = 'SectionHeader';
