import { memo } from 'react';
import { View } from 'react-native';
import { SectionHeader } from '@/components/atoms/SectionHeader';
import { InfoRow } from '@/components/atoms/InfoRow';
import { Text } from '@/components/atoms/Text';
import { Divider } from '@/components/atoms/Divider';
import { FontAwesome5 } from '@expo/vector-icons';
import { useThemedColors } from '@/hooks/useThemedColors';
import { cn } from '@/utils/cn';
import * as Application from 'expo-application';

interface AppInfoSectionProps {
  className?: string;
}

/**
 * AppInfoSection Organism
 *
 * Displays app information, version details, and developer contact
 * with full theme support
 */
export const AppInfoSection = memo<AppInfoSectionProps>(({
  className
}) => {
  const colors = useThemedColors();

  return (
    <View className={cn('mb-6', className)}>
      <SectionHeader
        title="Sobre o aplicativo"
        subtitle="Informações técnicas e suporte"
      />

      <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-300 dark:border-gray-700 p-4">
        <InfoRow
          icon={
            <FontAwesome5
              name="mobile-alt"
              size={20}
              color={colors.info}
            />
          }
          label="Versão do App"
          value={Application.nativeApplicationVersion || 'N/A'}
        />

        <Divider className="my-2" />

        <InfoRow
          icon={
            <FontAwesome5
              name="code-branch"
              size={20}
              color={colors.info}
            />
          }
          label="Build Version"
          value={Application.nativeBuildVersion || 'N/A'}
        />

        <Divider className="my-4" />

        <View className="mt-2">
          <Text
            variant="caption"
            color="muted"
            align="center"
            className="mb-2"
          >
            Desenvolvido por
          </Text>
          <Text
            variant="body"
            color="primary"
            align="center"
            weight="semibold"
            className="mb-4"
          >
            NetCriativa - Thiago Pereira
          </Text>

          <InfoRow
            icon={
              <FontAwesome5
                name="envelope"
                size={18}
                color={colors.textMuted}
              />
            }
            label="E-mail"
            value="ths.pereira@gmail.com"
          />

          <InfoRow
            icon={
              <FontAwesome5
                name="phone"
                size={18}
                color={colors.textMuted}
              />
            }
            label="Telefone"
            value="(61) 9 9661-7935"
          />
        </View>
      </View>
    </View>
  );
});

AppInfoSection.displayName = 'AppInfoSection';
