import {Text, Icon, Box, Flex, Button, VStack, HStack, Divider} from 'native-base'
import {DrawerContentScrollView} from "@react-navigation/drawer";
import {useAuth} from "../contexts/AuthContext";
import {relativeTime} from "../utils/directus";
import {AntDesign, FontAwesome5} from "@expo/vector-icons";
import {Avatar} from "./Avatar";
import * as Application from 'expo-application';
import React, {ReactNode, RefAttributes, useContext} from 'react';
import {ScrollViewProps, ScrollView, Alert} from 'react-native';
import {TouchableOpacity} from 'react-native';
import colors from "../constants/colors";
import {useNavigation} from "@react-navigation/native";
import AlertContext from "../contexts/AlertContext";
import {updateUserMe} from "../services/user";


export function HeaderDrawer(props: JSX.IntrinsicAttributes & ScrollViewProps & {
    children: ReactNode;
} & RefAttributes<ScrollView>) {
    const {logout, user} = useAuth()
    const navigation = useNavigation();
    const alert = useContext(AlertContext)

    async function handleDeleteAcount() {
        try {
            Alert.alert(
                "Deseja realmente excluir a sua conta?",
                "Essa ação não poderá ser desfeita, sua conta será excluída em até 24h.",
                [
                    {
                        text: "Excluir",
                        onPress: async () => {
                            const userData = {
                               status: 'suspended'
                            }
                            await updateUserMe(userData);

                            alert.success('Solicitação enviada com sucesso!')
                            logout();
                        }
                    },
                    {
                        text: "Não",
                    }
                ]
            );
        } catch (e) {
            console.error(e); // log the error to console
        }
    }

    const menuItems = [
        {name: 'início', icon: 'home', route: 'Dashboard', screen: 'Home', isActive: true},
        {name: 'Congresso 2023', icon: 'fire', route: 'Dashboard', screen: 'Congresso', isActive: false},
        {name: 'Eventos', icon: 'calendar-alt', route: 'Eventos', screen: 'Events', isActive: false},
        {name: 'Notícias', icon: 'newspaper', route: 'News', screen: 'Posts', isActive: false},
        {name: 'Meu Perfil', icon: 'user-alt', route: 'Configuracoes', screen: 'Settings', isActive: false},
        {name: 'Membros', icon: 'users', route: 'Dashboard', screen: 'UserListPage', isActive: false},
    ];

    const DrawerItem = ({icon, name}) => (
            <>
                <HStack space={2} alignItems={"center"} py={2} marginY={2} px={4}>
                    <Box>
                        <Icon as={FontAwesome5} name={icon} size={"lg"} color={colors.primary}/>
                    </Box>
                    <Box>
                        <VStack>
                            <Text color={colors.text} numberOfLines={1}>{name}</Text>
                        </VStack>
                    </Box>
                </HStack>
            </>
        )
    ;

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{flex: 1}}>
            <Box flex={1}>
                <VStack space={4} my={4}>
                    <Box>
                        <TouchableOpacity onPress={() => navigation.navigate('Configuracoes')}>
                        <Flex alignItems={'center'} direction="row" borderBottomWidth={'2'}
                              borderBottomColor={'lightBlue.900'}>
                            <Box p={4}>
                                <Avatar userAvatarID={user?.avatar} height={50} width={50}/>
                            </Box>
                            <Box>
                                <Text color={"text.300"} fontWeight={'bold'}>{user?.first_name}</Text>
                                <Text color={"text.400"} fontSize={'xs'}>{user?.email}</Text>
                                <Text color={"text.400"} fontSize={'xs'}>Ultimo
                                    acesso: {relativeTime(user?.last_access)}</Text>
                            </Box>
                        </Flex>
                        </TouchableOpacity>
                    </Box>
                </VStack>
                <Box>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity key={index}
                                          onPress={() => navigation.navigate(item.route, {screen: item.screen})}>
                            <DrawerItem icon={item.icon} name={item.name} isActive={item.isActive}/>
                        </TouchableOpacity>
                    ))}
                </Box>
                <Box p={4}>
                    <Button colorScheme={'danger'} leftIcon={
                        <Icon as={AntDesign} name="logout" size="sm"/>
                    } onPress={logout}>Sair da Aplicação</Button>
                    <Divider my={4}/>
                    <Button variant={"outline"} colorScheme={'danger'}
                            leftIcon={<Icon as={AntDesign} name="delete" size="sm"/>} onPress={handleDeleteAcount}>Excluir
                        minha conta</Button>
                    <Text color={"text.300"} textAlign={"center"} py={4} fontWeight={'bold'}>
                        Build Version: {Application.nativeBuildVersion}
                    </Text>
                    <Text color={"text.300"} textAlign={"center"} py={4} fontWeight={'bold'}>
                        App Version: {Application.nativeApplicationVersion}
                    </Text>
                </Box>
            </Box>
        </DrawerContentScrollView>
    )
}
