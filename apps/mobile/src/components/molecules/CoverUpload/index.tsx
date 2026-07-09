import React, { useCallback, useContext, useState } from 'react';
import { View, Text, Pressable, Image, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, Camera } from 'lucide-react-native';
import { SHEET } from '@/constants/sheetTokens';
import { getStorageUrl } from '@/services/storage';
import { uploadImage } from '@/services/files';
import { updateUserMe } from '@/services/user';
import authContext from '@/contexts/AuthContext';
import AlertContext from '@/contexts/AlertContext';
import { handleErrors } from '@/utils/directus';

interface CoverUploadProps {
  /** Path/id atual da capa (coluna profiles.cover_image). */
  coverImageId?: string | null;
  /** Notifica o pai com o novo path após o upload persistir. */
  onChange?: (path: string) => void;
  /** Capa "sangrando" de borda a borda (sem raio/borda) — p/ sobrepor o header. */
  fullBleed?: boolean;
  /** Altura fixa (px) quando fullBleed; ignora o aspect-ratio 16:9 do card. */
  height?: number;
}

/**
 * Banner de capa (~16:9) editável do próprio perfil. Espelha o fluxo do avatar
 * (AvatarUpdated): abre a galeria → sobe a imagem para o bucket 'images' via
 * `uploadImage` (que usa `api.me.upload`) → persiste em `cover_image` com
 * `updateUserMe` → atualiza o usuário no contexto. Estilo fixo dark (SHEET).
 */
export const CoverUpload: React.FC<CoverUploadProps> = React.memo(({ coverImageId, onChange, fullBleed, height }) => {
  const { setUser } = useContext(authContext);
  const alert = useContext(AlertContext);
  const [uploading, setUploading] = useState(false);

  const coverUri = getStorageUrl(coverImageId, 'images');
  const hasCover = !!coverUri;

  const pickAndUpload = useCallback(async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert.error('Precisamos de permissão para acessar sua galeria.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.6, // menor → base64 leve (rápido no 5G e o picker devolve base64 confiável)
        base64: true, // evita o fetch→Blob (não suportado no Hermes/RN) no upload
      });
      if (result.canceled || !result.assets[0]?.uri) return;

      const asset = result.assets[0];
      // O upload depende do base64 do picker (o fallback fetch→Blob quebra no Hermes).
      if (!asset.base64) {
        alert.error('Não foi possível ler a imagem selecionada. Tente outra foto.');
        return;
      }

      setUploading(true);

      // 1) Upload da mídia (isola a falha para a mensagem dizer a etapa certa).
      let path: string;
      try {
        const up = await uploadImage(asset.uri, 'images', asset.base64);
        path = up.id;
      } catch (e: any) {
        console.error('[CoverUpload] falha no UPLOAD:', e);
        throw new Error(`no upload — ${e?.message ?? String(e)}`);
      }

      // 2) Persiste o cover_image no perfil.
      const updated = await updateUserMe({ cover_image: path });
      await setUser(updated);
      onChange?.(path);
      alert.success('Capa atualizada com sucesso!');
    } catch (e: any) {
      console.error('[CoverUpload] falha ao atualizar capa:', e);
      const msg = e?.message || handleErrors(e) || 'erro desconhecido';
      alert.error(`Erro ao atualizar a capa: ${msg}`);
    } finally {
      setUploading(false);
    }
  }, [alert, setUser, onChange]);

  return (
    <Pressable
      onPress={pickAndUpload}
      disabled={uploading}
      accessibilityRole="button"
      accessibilityLabel={hasCover ? 'Alterar capa do perfil' : 'Adicionar capa do perfil'}
      style={[styles.banner, fullBleed ? { height: height ?? 190 } : styles.bannerCard]}
    >
      {hasCover ? (
        <Image source={{ uri: coverUri! }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder}>
          <ImagePlus size={26} color={SHEET.textMuted} />
          <Text style={styles.placeholderText}>Adicionar capa</Text>
        </View>
      )}

      {hasCover && !uploading && (
        <View style={styles.pill}>
          <Camera size={14} color={SHEET.textPrimary} />
          <Text style={styles.pillText}>Alterar capa</Text>
        </View>
      )}

      {uploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator color={SHEET.textPrimary} />
          <Text style={styles.uploadingText}>Enviando capa...</Text>
        </View>
      )}
    </Pressable>
  );
});

CoverUpload.displayName = 'CoverUpload';

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: SHEET.surface,
  },
  // Variante "card" (padrão): 16:9 arredondado com borda.
  bannerCard: {
    aspectRatio: 16 / 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: SHEET.border,
  },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: SHEET.glass },
  placeholderText: { color: SHEET.textMuted, fontSize: 13, fontWeight: '600' },
  pill: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: SHEET.border,
  },
  pillText: { color: SHEET.textPrimary, fontSize: 12, fontWeight: '700' },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  uploadingText: { color: SHEET.textPrimary, fontSize: 13, fontWeight: '600' },
});

export default CoverUpload;
