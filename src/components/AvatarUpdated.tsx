import React, {useState, useEffect, useContext} from 'react';
import {Button, Avatar, Pressable, Text, Actionsheet, useDisclose, Box, Icon, IAvatarProps, Spinner} from 'native-base';
import * as ImagePicker from 'expo-image-picker';
import api from "../services/api";
import {Ionicons} from "@expo/vector-icons";
import AlertContext from "../contexts/AlertContext";
import {TouchableOpacity} from "react-native";
import {FilesTypes} from "../types/FilesTypes";
import ConfigContext from "../contexts/ConfigContext";
import authContext from "../contexts/AuthContext";

type Props = IAvatarProps & {
    userAvatarID: string | undefined;
};

export default function AvatarUpdated({userAvatarID}: Props) {
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // New loading state
    const config = useContext(ConfigContext)
    const {setUser} = useContext(authContext)
    const {isOpen, onOpen, onClose} = useDisclose();
    const alert = useContext(AlertContext)

    useEffect(() => {
        if (userAvatarID) {
            const url = getUrlFromAvatarId(userAvatarID);
            setImage(url);
        }
    }, [userAvatarID]);

    function getUrlFromAvatarId(id: string) {
        return `${config.url_api}/assets/${id}`;
    }

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

    const sendImage = async (uri) => {
        const idFolder = '602c2a95-39d6-4202-8edf-37ad69723277'

        let formData = new FormData();
        let name = uri.split("/").pop();
        let match = /\.(\w+)$/.exec(name);
        let type = match ? `image/${match[1]}` : `image`;

        formData.append('file', { uri: uri, name: name, type });

        try {
            if (userAvatarID) {
                await api.delete(`/files/${userAvatarID}`);
            }

            let response = await api.post("/files", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const dataFileUp = {
                title: response.data.data.first_name,
                folder: idFolder
            }

            const resUpdateFile = await api.patch(`/files/${response.data.data.id}`, dataFileUp);

            const userdata = {
                avatar: resUpdateFile.data.data.id
            }

            const resUser = await api.patch('/users/me', userdata);

            setUser(resUser.data.data)

            alert.success(`Arquivo salvo com sucesso! ${resUser.data.data.first_name}`);
        } catch (error) {
            alert.error('Erro ao salvar a imagem')
            console.log(error);
        } finally {
            setIsLoading(false); // Set loading to false after sending the image
        }
    }

    return (
        <TouchableOpacity onPress={() => onOpen()}>
            {isLoading ?
                <Spinner /> :  // Display a loading spinner while loading
                <>
                    <Avatar source={{ uri: String(image) }} size={"xl"} />
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
                        startIcon={<Icon as={Ionicons} size="6" name="albums" />}
                        onPress={() => pickImage()}>Buscar na galeria
                    </Actionsheet.Item>
                </Actionsheet.Content>
            </Actionsheet>
        </TouchableOpacity>
    );
}
