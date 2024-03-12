import {Text, Icon, Box, Flex, Button, VStack, HStack, Divider} from 'native-base'
import {useAuth} from "@/contexts/AuthContext";
import {relativeTime} from "@/utils/directus";
import {AntDesign, FontAwesome5} from "@expo/vector-icons";
import {Avatar} from "@/components/Avatar";
import * as Application from 'expo-application';
import React, {useContext} from 'react';
import {ScrollView, Alert} from 'react-native';
import {TouchableOpacity} from 'react-native';
import colors from "@/constants/colors";
import AlertContext from "@/contexts/AlertContext";
import {updateUserMe} from "@/services/user";
import {Href, Link, useNavigation} from "expo-router";

export function HeaderDrawer() {
    const {logout, user} = useAuth()
    const alert = useContext(AlertContext)
    const navigation = useNavigation();

    const navigateToNewScreen = (routeUrl: string) => {
        navigation.goBack(); // Fecha o modal atual
        navigation.navigate(routeUrl); // Navega para a nova tela
    };

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
            console.error(e);
        }
    }

    const menuItems = [
        {name: 'início', icon: 'home', route: '/(tabs)/(home)', isActive: true},
        {name: 'O Congresso', icon: 'fire', route: '/(tabs)/(home)', screen: '(congresso)', isActive: false},
        {name: 'Contribua', icon: 'calendar-alt', route: '/(tabs)/(home)/contribua', screen: 'home', isActive: false},
        {name: 'Eventos', icon: 'calendar-alt', route: '/(tabs)/(events)', screen: 'home', isActive: false},
        {name: 'Notícias', icon: 'newspaper', route: '/(tabs)/(posts)', screen: 'home', isActive: false},
        {name: 'Meu Perfil', icon: 'user-alt', route: '/(tabs)/(settings)', screen: 'home', isActive: false},
        {name: 'Membros', icon: 'users', route: 'users', screen: 'users', isActive: false},
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
        <Box flex={1} backgroundColor={'coolGray.800'} >
            <ScrollView>

                <Box>
                    <Box>
                        <VStack space={4} my={4}>
                            <Box>
                                <Link href={'/(tabs)/(settings)'} asChild>
                                    <TouchableOpacity>
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
                                </Link>
                            </Box>
                        </VStack>
                    </Box>

                    <Box>
                        {menuItems.map((item, index) => (
                            <Link key={index} href={item.route as Href<any>} asChild>
                                <TouchableOpacity activeOpacity={0.9}>
                                    <DrawerItem icon={item.icon} name={item.name}/>
                                </TouchableOpacity>
                            </Link>
                        ))}
                    </Box>


                    <Box p={4} width={'full'}>
                        <Button colorScheme={'danger'} leftIcon={
                            <Icon as={AntDesign} name="logout" size="sm"/>
                        } onPress={logout}>Sair da aplicação</Button>
                        <Divider my={4}/>
                        <Button variant={"outline"} colorScheme={'danger'}
                                leftIcon={<Icon as={AntDesign} name="delete" size="sm"/>} onPress={handleDeleteAcount}>Excluir
                            minha conta</Button>
                    </Box>

                    <Box>
                        <Text color={"text.300"} textAlign={"center"} fontWeight={'bold'}>
                            Build Version: {Application.nativeBuildVersion}
                        </Text>

                        <Text color={"text.300"} textAlign={"center"} fontWeight={'bold'}>
                            App Version: {Application.nativeApplicationVersion}
                        </Text>

                        <Text color={"text.300"} textAlign={"center"} pt={4}>
                           App desenvolvido por: NetCriativa - Thiago Pereira.
                        </Text>

                        <Text color={"text.300"} textAlign={"center"} pt={4}>
                            E-mail: ths.pereira@gmail.com
                        </Text>
                        <Text color={"text.300"} textAlign={"center"}>
                            Telefone: (61) 9 9661-7935
                        </Text>
                    </Box>

                </Box>

            </ScrollView>
        </Box>
    )
}
