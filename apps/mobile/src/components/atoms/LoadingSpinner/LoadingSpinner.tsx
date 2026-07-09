import React from 'react';
import { ActivityIndicator, View, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';
import { Text } from '../Text';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  type?: 'default' | 'lottie';
  message?: string;
  containerStyle?: ViewStyle;
}

const sizeMap = {
  small: { indicator: 24, lottie: 100 },
  medium: { indicator: 36, lottie: 150 },
  large: { indicator: 48, lottie: 200 },
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = React.memo(({
  size = 'medium',
  color = 'white',
  type = 'default',
  message,
  containerStyle,
}) => {
  const sizes = sizeMap[size];

  return (
    <View style={[{
      justifyContent: 'center',
      alignItems: 'center',
    }, containerStyle]}>
      {type === 'lottie' ? (
        <LottieView
          source={require('@/assets/99297-loading-files.json')}
          autoPlay
          loop
          style={{ width: sizes.lottie, height: sizes.lottie }}
        />
      ) : (
        <ActivityIndicator size={size} color={color} />
      )}
      {message && (
        <Text variant="body" style={{ marginTop: 12 }}>
          {message}
        </Text>
      )}
    </View>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';