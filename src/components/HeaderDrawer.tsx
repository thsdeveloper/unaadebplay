import {Text, Icon, Box, Flex, Button} from 'native-base'
import {DrawerContentScrollView} from "@react-navigation/drawer";
import React, {useContext, useEffect, useState} from "react";
import {useAuth} from "../contexts/AuthContext";
import {relativeTime} from "../utils/directus";
import {AntDesign} from "@expo/vector-icons";
import ConfigContext from "../contexts/ConfigContext";
import {getImageData} from "../services/AssetsService";
import {Avatar} from "./Avatar";

export function HeaderDrawer(props) {
    const {signOut, user} = useAuth()
    const [avatar, setAvatar] = useState<String | undefined>(undefined);
    const config = useContext(ConfigContext);


    useEffect(() => {
        async function loadImage() {
            const idAvatar = config.avatar_default;

            // Verifica se user e user.avatar existem, caso contrário, usa o valor padrão idAvatar
            const avatarId = (user && user.avatar) ? user.avatar : idAvatar;

            const base64data = await getImageData(`/assets/${avatarId}`);
            // @ts-ignore
            setAvatar(base64data)
        }

        loadImage();
    }, []);

    async function handleSignOut() {
        signOut();
    }

    return (
        <DrawerContentScrollView {...props}>
            <Box>
                <Flex alignItems={'center'} direction="row" safeArea borderBottomWidth={'2'}
                      borderBottomColor={'lightBlue.900'}>
                    <Box p={4}>
                        <Avatar assetId={user?.avatar} height={50} width={50}/>
                    </Box>
                    <Box>
                        <Text color={"text.300"} fontWeight={'bold'}>{user?.first_name}</Text>
                        <Text color={"text.400"} fontSize={'xs'}>{user?.email}</Text>
                        <Text color={"text.400"} fontSize={'xs'}>Ultimo acesso: {relativeTime(user?.last_access)}</Text>
                    </Box>
                </Flex>
                <Box>
                    <Button variant={'link'} colorScheme={'danger'} leftIcon={
                        <Icon as={AntDesign} name="logout" size="sm"/>
                    } onPress={handleSignOut}>Sair da Aplicação</Button>
                </Box>
            </Box>
        </DrawerContentScrollView>
    )
}
