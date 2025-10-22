import React, { memo, useState } from 'react';
import { View, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Camera, Edit3 } from 'lucide-react-native';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { AvatarUploadProps } from './types';
import { getStyles } from './styles';

export const AvatarUpload = memo<AvatarUploadProps>(({ 
  value,
  onChange,
  size = 120,
  loading = false,
  error,
  disabled = false,
  placeholder = 'Adicionar foto',
  className
}) => {
  const [uploading, setUploading] = useState(false);
  const styles = getStyles(size, !!error, disabled);

  const handleImagePicker = async () => {
    if (disabled || uploading) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de acesso à sua galeria.');
      return;
    }

    Alert.alert(
      'Escolher foto',
      'De onde você quer escolher a foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Câmera', onPress: () => pickImage('camera') },
        { text: 'Galeria', onPress: () => pickImage('library') }
      ]
    );
  };

  const pickImage = async (source: 'camera' | 'library') => {
    try {
      setUploading(true);
      
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      };

      const result = source === 'camera' 
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets[0]) {
        const compressedImage = await compressImage(result.assets[0].uri);
        onChange(compressedImage);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    } finally {
      setUploading(false);
    }
  };

  const compressImage = async (uri: string): Promise<string> => {
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 500, height: 500 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipulatedImage.uri;
  };

  const isLoading = loading || uploading;

  return (
    <View className={`items-center ${className || ''}`}>
      <TouchableOpacity
        onPress={handleImagePicker}
        disabled={disabled || isLoading}
        activeOpacity={0.8}
        className={styles.container}
      >
        {value ? (
          <>
            <Image source={{ uri: value }} className={styles.image} />
            <View className={styles.editButton}>
              <Icon name={Edit3} size={16} color="#fff" />
            </View>
          </>
        ) : (
          <View className={styles.placeholder}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#60a5fa" />
            ) : (
              <>
                <Icon name={Camera} size={32} color="#9ca3af" />
                <Text variant="caption" color="#9ca3af" className="mt-2">
                  {placeholder}
                </Text>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>
      
      {error && (
        <Text variant="caption" color="error" className="mt-2">
          {error}
        </Text>
      )}
    </View>
  );
});

AvatarUpload.displayName = 'AvatarUpload';