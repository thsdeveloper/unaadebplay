import React, { memo } from 'react';
import { View } from 'react-native';
import { Text } from '../Text';
import { Check } from 'lucide-react-native';
import { Icon } from '../Icon';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

export const ProgressIndicator = memo<ProgressIndicatorProps>(({ 
  currentStep,
  totalSteps,
  labels = [],
  className
}) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View className={`mb-8 ${className || ''}`}>
      <View className="flex-row justify-between items-center mb-4">
        {steps.map((step, index) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          const isUpcoming = step > currentStep;

          return (
            <React.Fragment key={step}>
              <View className="items-center flex-1">
                <View 
                  className={`
                    w-10 h-10 rounded-full items-center justify-center
                    ${isCompleted ? 'bg-green-500' : ''}
                    ${isCurrent ? 'bg-blue-500' : ''}
                    ${isUpcoming ? 'bg-gray-200' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Icon name={Check} size={20} color="#fff" />
                  ) : (
                    <Text 
                      variant="button" 
                      color={isCurrent ? '#fff' : '#6b7280'}
                    >
                      {step}
                    </Text>
                  )}
                </View>
                
                {labels[index] && (
                  <Text 
                    variant="caption" 
                    color={isCurrent ? '#3b82f6' : '#6b7280'}
                    className="mt-2 text-center"
                  >
                    {labels[index]}
                  </Text>
                )}
              </View>
              
              {index < steps.length - 1 && (
                <View 
                  className={`
                    h-0.5 flex-1 mx-2
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                  `}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
});

ProgressIndicator.displayName = 'ProgressIndicator';