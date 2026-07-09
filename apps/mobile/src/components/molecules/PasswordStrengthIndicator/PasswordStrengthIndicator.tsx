import React, { useMemo } from 'react';
import { View, ViewStyle } from 'react-native';
import { Text } from '@/components/atoms/Text';

interface PasswordStrengthIndicatorProps {
  password: string;
  style?: ViewStyle;
}

type PasswordStrength = 'weak' | 'medium' | 'strong';

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = React.memo(({
  password,
  style,
}) => {
  const { strength, score, feedback } = useMemo(() => {
    if (!password) return { strength: 'weak' as PasswordStrength, score: 0, feedback: [] };

    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push('Use pelo menos 8 caracteres');

    if (password.length >= 12) score += 1;

    // Complexity checks
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Inclua letras minúsculas');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Inclua letras maiúsculas');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Inclua números');

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else feedback.push('Inclua caracteres especiais');

    let strength: PasswordStrength;
    if (score <= 2) strength = 'weak';
    else if (score <= 4) strength = 'medium';
    else strength = 'strong';

    return { strength, score, feedback };
  }, [password]);

  const strengthConfig = {
    weak: {
      color: '#ef4444',
      text: 'Fraca',
      bars: 1,
    },
    medium: {
      color: '#f59e0b',
      text: 'Média',
      bars: 2,
    },
    strong: {
      color: '#10b981',
      text: 'Forte',
      bars: 3,
    },
  };

  const config = strengthConfig[strength];

  if (!password) return null;

  return (
    <View style={[{ marginTop: 8 }, style]}>
      {/* Strength bars */}
      <View style={{
        flexDirection: 'row',
        marginBottom: 8,
        gap: 4,
      }}>
        {[1, 2, 3].map((bar) => (
          <View
            key={bar}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: bar <= config.bars ? config.color : 'rgba(255,255,255,0.1)',
            }}
          />
        ))}
      </View>

      {/* Strength text */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Text
          size="xs"
          color={config.color}
          weight="medium"
        >
          Força: {config.text}
        </Text>
        <Text
          size="xs"
          color="rgba(255,255,255,0.5)"
        >
          {score}/6 pontos
        </Text>
      </View>

      {/* Feedback */}
      {feedback.length > 0 && (
        <View style={{ marginTop: 4 }}>
          {feedback.slice(0, 2).map((tip, index) => (
            <Text
              key={index}
              size="xs"
              color="rgba(255,255,255,0.5)"
              style={{ marginTop: 2 }}
            >
              • {tip}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
});

PasswordStrengthIndicator.displayName = 'PasswordStrengthIndicator';