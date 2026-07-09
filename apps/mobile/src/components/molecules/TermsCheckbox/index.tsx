import React, { memo, useState } from 'react';
import { View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Text } from '@/components/atoms/Text';
import { Button } from '@/components/atoms/Button';
import { X } from 'lucide-react-native';
import { Icon } from '@/components/atoms/Icon';

interface TermsCheckboxProps {
  value: boolean;
  onChange: (value: boolean) => void;
  termsContent?: string;
  privacyContent?: string;
  error?: string;
  className?: string;
}

export const TermsCheckbox = memo<TermsCheckboxProps>(({ 
  value,
  onChange,
  termsContent = 'Termos de uso...',
  privacyContent = 'Política de privacidade...',
  error,
  className
}) => {
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<'terms' | 'privacy'>('terms');

  const openModal = (type: 'terms' | 'privacy') => {
    setModalContent(type);
    setShowModal(true);
  };

  return (
    <>
      <View className={className}>
        <View className="flex-row items-start">
          <Checkbox
            value={value}
            onValueChange={onChange}
            className="mt-1"
          />
          <View className="flex-1 ml-3">
            <Text variant="body">
              Li e concordo com os{' '}
              <Text 
                variant="body" 
                color="#3b82f6" 
                onPress={() => openModal('terms')}
                style={{ textDecorationLine: 'underline' }}
              >
                Termos de Uso
              </Text>
              {' '}e a{' '}
              <Text 
                variant="body" 
                color="#3b82f6" 
                onPress={() => openModal('privacy')}
                style={{ textDecorationLine: 'underline' }}
              >
                Política de Privacidade
              </Text>
            </Text>
          </View>
        </View>
        
        {error && (
          <Text variant="caption" color="error" className="mt-2 ml-8">
            {error}
          </Text>
        )}
      </View>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-black/50">
          <View className="flex-1 bg-white mt-20 rounded-t-3xl">
            <View className="flex-row justify-between items-center p-6 border-b border-gray-200">
              <Text variant="h3">
                {modalContent === 'terms' ? 'Termos de Uso' : 'Política de Privacidade'}
              </Text>
              <TouchableOpacity 
                onPress={() => setShowModal(false)}
                className="p-2"
              >
                <Icon name={X} size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <ScrollView className="flex-1 p-6">
              <Text variant="body">
                {modalContent === 'terms' ? termsContent : privacyContent}
              </Text>
            </ScrollView>
            
            <View className="p-6 border-t border-gray-200">
              <Button
                variant="primary"
                size="large"
                onPress={() => {
                  setShowModal(false);
                  if (!value) onChange(true);
                }}
                fullWidth
              >
                Concordar e Fechar
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
});

TermsCheckbox.displayName = 'TermsCheckbox';