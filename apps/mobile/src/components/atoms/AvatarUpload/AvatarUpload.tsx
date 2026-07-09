import React, { useState } from 'react';
import { View, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { Text } from '../Text';

interface AvatarUploadProps {
  value?: string;
  onChange: (uri: string) => void;
  error?: string;
  className?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = React.memo(({
  value,
  onChange,
  error,
  className,
}) => {
  const [imageUri, setImageUri] = useState(value);
  // A galeria nativa demora a abrir; como o toque já foi registrado, mostramos um spinner
  // no avatar entre o toque e a abertura (evita a sensação de "não respondeu").
  const [opening, setOpening] = useState(false);

  const pickImage = async () => {
    if (opening) return;
    try {
      setOpening(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        onChange(uri);
      }
    } finally {
      setOpening(false);
    }
  };

  return (
    <View className={`items-center ${className || ''}`}>
      <TouchableOpacity
        onPress={pickImage}
        disabled={opening}
        activeOpacity={0.8}
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderWidth: 2,
          borderColor: error ? '#ef4444' : 'rgba(255,255,255,0.2)',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <MaterialIcons name="camera-alt" size={40} color="rgba(255,255,255,0.5)" />
        )}
        {opening && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(8,12,22,0.55)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ActivityIndicator color="#E51C44" />
          </View>
        )}
      </TouchableOpacity>

      <Text variant="caption" className="mt-2">
        {opening ? 'Abrindo galeria…' : 'Toque para adicionar foto'}
      </Text>
      
      {error && (
        <Text variant="error" className="mt-1">
          {error}
        </Text>
      )}
    </View>
  );
});

AvatarUpload.displayName = 'AvatarUpload';