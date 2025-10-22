import React from 'react';
import { View } from 'react-native';
import { Text } from '../Text';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = React.memo(({
  currentStep,
  totalSteps,
  labels,
  className,
}) => {
  return (
    <View className={className}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const step = index + 1;
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;
          
          return (
            <View key={step} style={{ flex: 1, alignItems: 'center' }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: isActive || isCompleted ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                  borderWidth: 2,
                  borderColor: isActive || isCompleted ? '#3b82f6' : 'rgba(255,255,255,0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  size="sm"
                  weight="semibold"
                  color={isActive || isCompleted ? '#fff' : 'rgba(255,255,255,0.5)'}
                >
                  {step}
                </Text>
              </View>
              
              {labels && labels[index] && (
                <Text
                  variant="caption"
                  color={isActive ? '#3b82f6' : 'rgba(255,255,255,0.5)'}
                  className="mt-1"
                >
                  {labels[index]}
                </Text>
              )}
            </View>
          );
        })}
      </View>
      
      <View style={{ flexDirection: 'row', height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
        <View
          style={{
            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
            backgroundColor: '#3b82f6',
            borderRadius: 2,
          }}
        />
      </View>
    </View>
  );
});

ProgressIndicator.displayName = 'ProgressIndicator';