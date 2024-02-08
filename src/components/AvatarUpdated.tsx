import React, {useState, useEffect, useContext} from 'react';
import {
    Text,
    Actionsheet,
    useDisclose,
    Box,
    Icon,
    IAvatarProps,
    Spinner,
    HStack,
} from 'native-base';
import * as ImagePicker from 'expo-image-picker';
import {Ionicons} from "@expo/vector-icons";
import AlertContext from "../contexts/AlertContext";
import {Platform, TouchableOpacity} from "react-native";
import ConfigContext from "../contexts/ConfigContext";
import authContext from "../contexts/AuthContext";
import {setDeleteFile, setUpdateFile, uploadFile} from "../services/files";
import {DirectusFile, DirectusUser} from "@directus/sdk";
import {handleErrors} from "../utils/directus";
import {updateUserMe} from "../services/user";
import {UserTypes} from "../types/UserTypes";
import {Avatar} from "./Avatar";

type Props = IAvatarProps & {
    userAvatarID: string;
};

export default function AvatarUpdated({userAvatarID}: Props) {
    const [isLoading, setIsLoading] = useState(false); // New loading state
    const config = useContext(ConfigContext)
    const {user, setUser} = useContext(authContext)
    const {isOpen, onOpen, onClose} = useDisclose();
    const alert = useContext(AlertContext)

    const idFolder = '602c2a95-39d6-4202-8edf-37ad69723277';

    const pickImage = async () => {
        if (Platform.OS !== 'web') {
            const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert.error('Desculpe, nós precisamos de permissão para acessar a sua galeria para continuar!');
            }
        }


        let results = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        });


        if (!results.canceled) {
            setIsLoading(true);
            onClose();
            await sendImage(results.assets[0].uri);
        }
    };

    // Função para fazer o upload do arquivo e retornar o contexto do arquivo
    async function uploadImageFile(uri) {
        const fileResponse = await uploadFile(uri);
        alert.success(`Upload realizado com sucesso: ${fileResponse.type}`);
        return fileResponse;
    }

    // Função para atualizar o arquivo
    async function updateImageFile(fileContext, dataFileUp) {
        const resFile = await setUpdateFile(fileContext.id, dataFileUp);
        alert.success(`Arquivo atualizado com sucesso: ${resFile.title}`);
        return resFile;
    }

    // Função para atualizar o avatar do usuário
    async function updateUserAvatar(resUpdateFile) {
        const userdata = {avatar: resUpdateFile.id};
        const user = await updateUserMe(userdata);
        alert.success(`Perfil atualizado com sucesso: ${user.first_name}`);
        return user;
    }

    // Função principal que utiliza as funções menores
    const sendImage = async (uri) => {
        try {
            setIsLoading(true);

            // Faz o upload do arquivo
            const fileContext = await uploadImageFile(uri);

            // Faz o update do arquivo
            const dataFileUp = { title: user?.first_name, folder: idFolder };
            const resUpdateFile = await updateImageFile(fileContext, dataFileUp);

            // Atualiza o avatar do usuário
            const resUser = await updateUserAvatar(resUpdateFile);

            // Deleta o arquivo antigo do usuário
            await setDeleteFile(userAvatarID);
            alert.success(`Arquivo excluído com sucesso`);

            // Atualiza o estado do usuário
            await setUser(resUser);
        } catch (error) {
            console.log('Erro:', error);
            const message = handleErrors(error.errors);
            alert.error(`Erro: ${message}`);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            {isLoading ?
                <Box
                    top={0}
                    bottom={0}
                    left={0}
                    right={0}
                    justifyContent="center"
                    alignItems="center"
                    zIndex={1}
                >
                    <Avatar userAvatarID={user?.avatar} width={40} height={40} size={"xl"}/>
                    <HStack space={2} justifyContent="center">
                        <Spinner accessibilityLabel="Uploading"/>
                        <Text fontWeight={"bold"}>Uploading...</Text>
                    </HStack>
                </Box> :  // Display a loading spinner while loading
                <>
                    <TouchableOpacity onPress={() => onOpen()}>
                        <Avatar userAvatarID={user?.avatar} width={32} height={32} size={"xl"}/>
                        <Text textAlign={"center"} fontWeight={"bold"}>Editar foto</Text>

                        <Actionsheet isOpen={isOpen} onClose={onClose}>
                            <Actionsheet.Content>
                                <Box w="100%" h={60} px={4} justifyContent="center">
                                    <Text fontSize="16" color="gray.500" fontWeight={"bold"}>
                                        Edite a sua foto de perfil
                                    </Text>
                                </Box>
                                <Actionsheet.Item
                                    startIcon={<Icon as={Ionicons} size="6" name="albums"/>}
                                    onPress={() => pickImage()}>Buscar na galeria
                                </Actionsheet.Item>
                            </Actionsheet.Content>
                        </Actionsheet>
                    </TouchableOpacity>
                </>
            }
        </>
    );
}
