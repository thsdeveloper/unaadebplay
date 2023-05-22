import React, {useState, useEffect, useContext} from 'react';
import {
    Avatar,
    Text,
    Actionsheet,
    useDisclose,
    Box,
    Icon,
    IAvatarProps,
    Spinner,
    HStack, Heading
} from 'native-base';
import * as ImagePicker from 'expo-image-picker';
import api, {handleErrors} from "../services/api";
import {Ionicons} from "@expo/vector-icons";
import AlertContext from "../contexts/AlertContext";
import {TouchableOpacity} from "react-native";
import ConfigContext from "../contexts/ConfigContext";
import authContext from "../contexts/AuthContext";

type Props = IAvatarProps & {
    userAvatarID: string | undefined;
};

export default function AvatarUpdated({userAvatarID}: Props) {
    const [image, setImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false); // New loading state
    const config = useContext(ConfigContext)
    const {setUser} = useContext(authContext)
    const {isOpen, onOpen, onClose} = useDisclose();
    const alert = useContext(AlertContext)

    const idFolder = '602c2a95-39d6-4202-8edf-37ad69723277';


    useEffect(() => {
        async function loadImage() {
            setIsLoading(true)
            try {
                const idAvatarDefault = await config.avatar_default;
                // Verifica se userID existem, caso contrário, usa o valor padrão idAvatarDefault
                const avatarId = await (userAvatarID) ? userAvatarID : idAvatarDefault;
                const url = `${config.url_api}/assets/${avatarId}`
                setImage(url)
            } catch (e) {
                setImage(null);
            } finally {
                setIsLoading(false)
            }
        }

        loadImage();
    }, [userAvatarID]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.uri);
            setIsLoading(true); // Set loading to true before sending the image
            onClose(); // Close the action sheet
            sendImage(result.uri);
        }
    };

    async function uploadFile(uri) {
        let formData = new FormData();
        let name = uri.split("/").pop();
        let match = /\.(\w+)$/.exec(name);
        let type = match ? `image/${match[1]}` : `image`;

        formData.append('file', {uri: uri, name: name, type});

        return await api.post("/files", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }

    async function updateFile(fileId, title) {
        const dataFileUp = {
            title: title,
            folder: idFolder
        }

        return await api.patch(`/files/${fileId}`, dataFileUp);
    }

    async function updateUserAvatar(avatarId) {
        const userdata = {
            avatar: avatarId
        }

        return await api.patch('/users/me', userdata);
    }

    async function deleteUserFile(fileId) {
        if (fileId) {
            await api.delete(`/files/${fileId}`);
        }
    }

    const sendImage = async (uri) => {
        let response, resUpdateFile, resUser;

        try {
            setIsLoading(true); // Set loading to true at the beginning
            response = await uploadFile(uri);
        } catch (error) {
            const message = handleErrors(error.response.data.errors);
            alert.error(`Erro ao fazer upload da imagem: ${message}`);
            setIsLoading(false);
            return; // Sai da função se o upload falhar
        }

        try {
            resUpdateFile = await updateFile(response.data.data.id, response.data.data.first_name);
        } catch (error) {
            const message = handleErrors(error.response.data.errors);
            alert.error(`Erro ao atualizar o arquivo: ${message}`);
            setIsLoading(false);
            return; // Sai da função se a atualização do arquivo falhar
        }

        try {
            resUser = await updateUserAvatar(resUpdateFile.data.data.id);
        } catch (error) {
            const message = handleErrors(error.response.data.errors);
            alert.error(`Erro ao atualizar o avatar do usuário: ${message}`);
            setIsLoading(false);
            return; // Sai da função se a atualização do avatar do usuário falhar
        }

        try {
            await deleteUserFile(userAvatarID);
        } catch (error) {
            const message = handleErrors(error.response.data.errors);
            alert.error(`Erro ao deletar o arquivo antigo: ${message}`);
            // Aqui você pode escolher não sair da função mesmo se falhar ao deletar o arquivo antigo
        }

        setUser(resUser.data.data);
        alert.success('Imagem atualizada com sucesso!');
        setIsLoading(false);
    }


    return (
        <TouchableOpacity onPress={() => onOpen()}>
            {isLoading ?
                <Box
                    position="absolute"
                    top={0}
                    bottom={0}
                    left={0}
                    right={0}
                    justifyContent="center"
                    alignItems="center"
                    zIndex={1}
                    bgColor="rgba(0, 0, 0, 0.8)"
                >
                    <HStack space={2} justifyContent="center">
                        <Spinner accessibilityLabel="Loading posts" />
                        <Heading color="primary.500" fontSize="md">
                            Aguarde...
                        </Heading>
                    </HStack>
                </Box> :  // Display a loading spinner while loading
                <>
                    <Avatar source={{uri: String(image)}} size={"xl"}/>
                    <Text textAlign={"center"} fontWeight={"bold"}>Editar foto</Text>
                </>
            }

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
    );
}
