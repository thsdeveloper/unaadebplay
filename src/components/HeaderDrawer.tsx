import {View, Avatar, Text, Icon, Box, Flex, Spacer, Center, Button} from 'native-base'
import {DrawerContentScrollView, DrawerItem} from "@react-navigation/drawer";
import React, {useEffect, useState} from "react";
import {StyleSheet} from "react-native";
import Colors from "../constants/colors";
import {useAuth} from "../contexts/auth";
import {formatTime, getImageData, relativeTime} from "../utils/directus";
import {AntDesign} from "@expo/vector-icons";

export function HeaderDrawer(props) {
    const {signOut, user} = useAuth()
    const [avatar, setAvatar] = useState<String | undefined>(undefined);

    useEffect(() => {
        async function loadImage() {
            const base64data = await getImageData(`/assets/${user?.avatar}`);
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
                <Flex alignItems={'center'} direction="row" safeArea
                      borderBottomWidth={'2'} borderBottomColor={'lightBlue.900'}>
                    <Avatar size={"lg"} source={{uri: avatar}} mr={4} ml={4} backgroundColor={'white'}>
                        <Avatar.Badge bg="green.500" />
                    </Avatar>
                    <Box>
                        <Text color={"text.300"} fontWeight={'bold'}>{user?.first_name}</Text>
                        <Text color={"text.400"} fontSize={'xs'}>{user?.email}</Text>
                        <Text color={"text.400"} fontSize={'xs'}>Ultimo acesso: {relativeTime(user?.last_access)}</Text>
                    </Box>
                </Flex>
                <Box>
                    <Button variant={'link'} colorScheme={'danger'} leftIcon={
                        <Icon as={AntDesign} name="logout" size="sm" />
                    } onPress={handleSignOut}>Sair da Aplicação</Button>
                </Box>
            </Box>


            {/*<Box>*/}

            {/*    <Flex justifyContent={'center'} alignItems={'center'} direction="row" mb="2.5" mt="1.5" p={4} borderBottomWidth={'2'} borderBottomColor={'lightBlue.900'}>*/}
            {/*        <Avatar size={"lg"} source={{uri: avatar}} mr={4}/>*/}
            {/*        <Box>*/}
            {/*            <Text color={"text.400"} fontWeight={'bold'}>{user?.first_name}</Text>*/}
            {/*            <Text color={"text.400"}>{user?.email}</Text>*/}
            {/*        </Box>*/}
            {/*    </Flex>*/}

            {/*    <Flex justifyContent={'center'} alignItems={'center'} direction="row" mb="2.5" mt="1.5" p={4} borderBottomWidth={'2'} borderBottomColor={'lightBlue.900'}>*/}
            {/*        <Avatar size={"lg"} source={{uri: avatar}} mr={4}/>*/}
            {/*        <Box>*/}
            {/*            <Text color={"text.400"} fontWeight={'bold'}>{user?.first_name}</Text>*/}
            {/*            <Text color={"text.400"}>{user?.email}</Text>*/}
            {/*        </Box>*/}
            {/*    </Flex>*/}


            {/*</Box>*/}
            {/*<DrawerItem*/}
            {/*    label="Item 1"*/}
            {/*    onPress={() => props.navigation.navigate('Item1')}*/}
            {/*    icon={({ color, size }) => <Icon name="home" style={{ color, fontSize: size }} />}*/}
            {/*/>*/}
            {/*<DrawerItem*/}
            {/*    label="Item 2"*/}
            {/*    onPress={() => props.navigation.navigate('Item2')}*/}
            {/*    icon={({ color, size }) => <Icon name="settings" style={{ color: color, fontSize: size }} />}*/}
            {/*/>*/}
            {/*<View style={styles.drawerFooter}>*/}
            {/*    <Avatar*/}
            {/*        source={{uri: avatar}}*/}
            {/*        style={styles.avatar}*/}
            {/*    />*/}
            {/*    <View style={styles.userInfo}>*/}
            {/*        <Text>asdfsadsa</Text>*/}
            {/*    </View>*/}
            {/*</View>*/}
        </DrawerContentScrollView>
    )
}
