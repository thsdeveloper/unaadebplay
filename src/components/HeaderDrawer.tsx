import {Text, Icon, Box, Flex, Button, VStack} from 'native-base'
import {DrawerContentScrollView} from "@react-navigation/drawer";
import {useAuth} from "../contexts/AuthContext";
import {relativeTime} from "../utils/directus";
import {AntDesign} from "@expo/vector-icons";
import {Avatar} from "./Avatar";
import * as Application from 'expo-application';
import { ReactNode, RefAttributes } from 'react';
import { ScrollViewProps, ScrollView } from 'react-native';

export function HeaderDrawer(props: JSX.IntrinsicAttributes & ScrollViewProps & { children: ReactNode; } & RefAttributes<ScrollView>) {
    const {signOut, user} = useAuth()

    async function handleSignOut() {
        signOut();
    }

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{flex: 1}}>
            <Box flex={1}>
                <VStack space={4} my={4}>
                    <Box>
                        <Flex alignItems={'center'} direction="row" borderBottomWidth={'2'}
                              borderBottomColor={'lightBlue.900'}>
                            <Box p={4}>
                                <Avatar userAvatarID={user?.avatar} height={50} width={50}/>
                            </Box>
                            <Box>
                                <Text color={"text.300"} fontWeight={'bold'}>{user?.first_name}</Text>
                                <Text color={"text.400"} fontSize={'xs'}>{user?.email}</Text>
                                <Text color={"text.400"} fontSize={'xs'}>Ultimo acesso: {relativeTime(user?.last_access)}</Text>
                            </Box>
                        </Flex>
                    </Box>
                    <Box p={4}>
                        <Button colorScheme={'danger'} leftIcon={
                            <Icon as={AntDesign} name="logout" size="sm"/>
                        } onPress={handleSignOut}>Sair da Aplicação</Button>
                    </Box>
                </VStack>
                <Box position={"absolute"} bottom={10} width={"100%"} p={4}>
                    <Text color={"text.300"} fontWeight={'bold'}>Versão da Build: {Application.nativeBuildVersion}</Text>
                </Box>
            </Box>
        </DrawerContentScrollView>
    )
}
