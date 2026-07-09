// src/components/AvatarUpdated.tsx
import React, { useState, useContext, useCallback, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from "@expo/vector-icons";
import AlertContext from "../contexts/AlertContext";
import { Platform, TouchableOpacity, View } from "react-native";
import authContext from "../contexts/AuthContext";
import { setDeleteFile, setUpdateFile, uploadImage } from "@/services/files";
import { handleErrors } from "@/utils/directus";
import { updateUserMe } from "@/services/user";
import { useActionsheet, CustomActionsheet } from "@/components/common/Actionsheet";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { UserAvatar } from "@/components/atoms";

// Mapa de tamanhos (string legada) -> px, para alimentar o UserAvatar global (numérico).
const SIZE_MAP: Record<string, number> = { xs: 24, sm: 32, md: 40, lg: 48, xl: 56, '2xl': 64 };
const toNumericSize = (s: string): number => SIZE_MAP[s] ?? 40;

type AvatarUpdatedProps = {
    userAvatarID: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
    width?: number;
    height?: number;
    onChange?: (newAvatarId: string) => void;
    /** Oculta o rótulo interno "Editar foto" (legado, invisível em fundo escuro). */
    hideLabel?: boolean;
    /** Expõe o abridor do seletor ao pai (p/ um rótulo externo acionar a mesma ação). */
    registerOpen?: (open: () => void) => void;
};

// Estados possíveis do componente
enum UploadState {
    IDLE = 'idle',
    UPLOADING = 'uploading',
    UPDATING = 'updating',
    PROCESSING = 'processing',
    ERROR = 'error',
}

export default function AvatarUpdated({
                                          userAvatarID,
                                          size = "xl",
                                          width,
                                          height,
                                          onChange,
                                          hideLabel,
                                          registerOpen
                                      }: AvatarUpdatedProps) {
    // Estados
    const [uploadState, setUploadState] = useState<UploadState>(UploadState.IDLE);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [progressMessage, setProgressMessage] = useState<string>('');

    // Contexts
    const { user, setUser } = useContext(authContext);
    const { isOpen, onOpen, onClose } = useActionsheet();
    const alert = useContext(AlertContext);

    // Permite que um rótulo externo ("Editar foto ou avatar") abra o mesmo seletor.
    useEffect(() => { registerOpen?.(onOpen); }, [registerOpen, onOpen]);

    // Constantes
    const FOLDER_ID = '104fe742-cf9f-466a-af77-8886a05a2a7c';
    const IMAGE_ASPECT_RATIO = [4, 4];
    const IMAGE_QUALITY = 0.8;

    // Verifica se tem permissão para acessar a galeria
    const checkGalleryPermission = useCallback(async (): Promise<boolean> => {
        if (Platform.OS === 'web') return true;

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert.error('Desculpe, precisamos de permissão para acessar sua galeria!');
            setErrorMessage('Permissão de galeria negada');
            return false;
        }
        return true;
    }, [alert]);

    // Abre o seletor de imagem
    const pickImage = useCallback(async () => {
        try {
            // Verificar permissão
            const hasPermission = await checkGalleryPermission();
            if (!hasPermission) return;

            // Configurações do seletor de imagem
            const pickerOptions: ImagePicker.ImagePickerOptions = {
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: IMAGE_ASPECT_RATIO,
                quality: IMAGE_QUALITY,
                base64: true, // evita o fetch→Blob (não suportado no Hermes/RN) no upload
            };

            // Abrir seletor
            const results = await ImagePicker.launchImageLibraryAsync(pickerOptions);

            // Processar resultado
            if (!results.canceled && results.assets[0]?.uri) {
                onClose();
                await processSelectedImage(results.assets[0].uri, results.assets[0].base64 ?? undefined);
            }
        } catch (error) {
            handleActionError(error, 'Erro ao selecionar imagem');
        }
    }, [checkGalleryPermission, onClose]);

    // Fazer upload da imagem
    const uploadImageFile = useCallback(async (uri: string, base64?: string) => {
        setProgressMessage('Fazendo upload da imagem...');
        try {
            // Avatar VAI para o bucket 'avatars' — o UserAvatar resolve a foto com
            // getStorageUrl(avatar, 'avatars'). Subir em 'images' (bug antigo) fazia a
            // URL de exibição apontar para o bucket errado → a foto não aparecia.
            const fileResponse = await uploadImage(uri, 'avatars', base64);
            return fileResponse;
        } catch (error) {
            throw new Error('Falha ao fazer upload da imagem');
        }
    }, []);

    // Atualizar informações do arquivo
    const updateImageFile = useCallback(async (fileId: string, dataFileUp: any) => {
        setProgressMessage('Atualizando informações do arquivo...');
        try {
            const resFile = await setUpdateFile(fileId, dataFileUp);
            return resFile;
        } catch (error) {
            throw new Error('Falha ao atualizar informações do arquivo');
        }
    }, []);

    // Atualizar avatar do usuário
    const updateUserAvatar = useCallback(async (fileId: string) => {
        setProgressMessage('Atualizando seu perfil...');
        try {
            const userData = { avatar: fileId };
            const updatedUser = await updateUserMe(userData);
            return updatedUser;
        } catch (error) {
            throw new Error('Falha ao atualizar o perfil');
        }
    }, []);

    // Deletar arquivo antigo
    const deleteOldAvatar = useCallback(async (avatarId: string) => {
        if (!avatarId) return;

        setProgressMessage('Finalizando...');
        try {
            await setDeleteFile(avatarId, 'avatars');
        } catch (error) {
            console.warn('Aviso: Não foi possível excluir o avatar antigo', error);
        }
    }, []);

    // Tratar erros em ações
    const handleActionError = useCallback((error: any, defaultMessage: string) => {
        console.error('Erro:', error);

        setUploadState(UploadState.ERROR);
        let errorMsg = defaultMessage;

        if (error.errors) {
            errorMsg = handleErrors(error.errors) || defaultMessage;
        } else if (error.message) {
            errorMsg = error.message;
        }

        setErrorMessage(errorMsg);
        alert.error(`Erro: ${errorMsg}`);

        // Resetar estado após exibir erro
        setTimeout(() => {
            setUploadState(UploadState.IDLE);
            setErrorMessage(null);
        }, 3000);
    }, [alert]);

    // Processar a imagem selecionada - fluxo principal
    const processSelectedImage = useCallback(async (uri: string, base64?: string) => {
        setUploadState(UploadState.UPLOADING);
        setErrorMessage(null);

        try {
            // 1. Upload do arquivo
            const fileContext = await uploadImageFile(uri, base64);

            // 2. Atualização das informações do arquivo
            setUploadState(UploadState.UPDATING);
            const fileMetadata = {
                title: user?.first_name || 'Avatar',
                folder: FOLDER_ID
            };
            const updatedFile = await updateImageFile(fileContext.id, fileMetadata);

            // 3. Atualização do avatar do usuário
            setUploadState(UploadState.PROCESSING);
            const updatedUser = await updateUserAvatar(updatedFile.id);

            // 4. Deletar avatar antigo
            await deleteOldAvatar(userAvatarID);

            // 5. Atualizar estado do usuário no contexto
            setUser(updatedUser);

            // 6. Chamar callback onChange se existir
            if (onChange) {
                onChange(updatedFile.id);
            }

            // 7. Sucesso
            alert.success('Foto de perfil atualizada com sucesso!');
        } catch (error) {
            handleActionError(error, 'Falha ao atualizar foto de perfil');
        } finally {
            setUploadState(UploadState.IDLE);
            setProgressMessage('');
        }
    }, [uploadImageFile, updateImageFile, updateUserAvatar, deleteOldAvatar, userAvatarID, user, setUser, alert, handleActionError, onChange]);

    // Verificar se está em estado de carregamento
    const isLoading = uploadState !== UploadState.IDLE && uploadState !== UploadState.ERROR;

    // Componente de loading com feedback do progresso
    const renderLoadingState = () => (
        <Box
            justifyContent="center"
            alignItems="center"
            p={2}
        >
            <UserAvatar
                avatar={user?.avatar}
                name={user?.first_name}
                size={width ? width * 1.2 : toNumericSize(size === "xl" ? "2xl" : "xl")}
                showPresence={false}
            />
            <HStack space={2} mt={4} alignItems="center">
                <Spinner accessibilityLabel="Atualizando foto" color="$primary500" />
                <Text fontWeight="bold">{progressMessage || 'Processando...'}</Text>
            </HStack>

            {errorMessage && (
                <Text color="$error500" mt={2}>
                    {errorMessage}
                </Text>
            )}
        </Box>
    );

    // Componente de estado normal
    const renderNormalState = () => (
        <>
            <TouchableOpacity
                onPress={onOpen}
                activeOpacity={0.7}
                accessible={true}
                accessibilityLabel="Editar foto de perfil"
                accessibilityHint="Abre menu para selecionar nova foto de perfil"
            >
                <Box alignItems="center">
                    <View style={{ position: "relative" }}>
                        <UserAvatar
                            avatar={user?.avatar}
                            name={user?.first_name}
                            size={width ?? 140}
                            showPresence={false}
                        />
                        {/* Selo de edição (afeta layout, não é status/presença). */}
                        <View
                            style={{
                                position: "absolute",
                                right: 4,
                                bottom: 4,
                                width: 26,
                                height: 26,
                                borderRadius: 13,
                                backgroundColor: "#E51C44",
                                alignItems: "center",
                                justifyContent: "center",
                                borderWidth: 2,
                                borderColor: "#fff",
                            }}
                        >
                            <Ionicons name="pencil" size={12} color="white" />
                        </View>
                    </View>
                    {!hideLabel && (
                        <Text
                            textAlign="center"
                            fontWeight="bold"
                            mt={2}
                            fontSize="sm"
                            color="$textLight800"
                        >
                            Editar foto
                        </Text>
                    )}
                </Box>
            </TouchableOpacity>

            <CustomActionsheet
                isOpen={isOpen}
                onClose={onClose}
                title="Edite a sua foto de perfil"
                items={[
                    {
                        label: "Buscar na galeria",
                        icon: {
                            as: Ionicons,
                            name: "albums",
                            size: "md"
                        },
                        onPress: pickImage
                    },
                    {
                        label: "Cancelar",
                        icon: {
                            as: Ionicons,
                            name: "close-circle",
                            size: "md",
                            color: "$error500"
                        },
                        onPress: onClose
                    }
                ]}
            />
        </>
    );

    // Renderização principal
    return (
        <Box>
            {isLoading ? renderLoadingState() : renderNormalState()}
        </Box>
    );
}
