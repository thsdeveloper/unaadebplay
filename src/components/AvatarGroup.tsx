import React, {useContext, useEffect, useState} from 'react';
import {Avatar, Center, Text} from 'native-base';
import {getUsers} from "@/services/user";
import {UserTypes} from "@/types/UserTypes";
import ConfigContext from "@/contexts/ConfigContext";
import colors from "../constants/colors";
import {TouchableOpacity} from "react-native";
import {useNavigation, useRouter} from "expo-router";

const AvatarGroup = () => {
    const [users, setUsers] = useState<UserTypes[]>([]);
    const config = useContext(ConfigContext)
    const router = useRouter();


    useEffect(() => {
        const fetchUsers = async () => {
            const users = await getUsers();
            console.log('users', users);
            setUsers(users);
        };

        fetchUsers();
    }, []);

    return (
        <TouchableOpacity onPress={() => router.push('/users')} activeOpacity={0.9}>
            <Center>
                <Text color={colors.light} pb={4} fontWeight={"bold"}>Junte-se a milhares de adolescentes com
                    propósitos!</Text>
                <Avatar.Group space={-4} max={5} _avatar={{size: "lg"}}>
                    {users && users.slice(0, 10).map((user, index) => {
                        const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
                        return (
                            <Avatar
                                backgroundColor={colors.primary}
                                key={index}
                                source={{uri: `${config.url_api}/assets/${user.avatar}`}}
                                _text={{color: "gray.50", fontWeight: "bold"}}
                            >
                                {initials}
                            </Avatar>
                        );
                    })}
                </Avatar.Group>
            </Center>
        </TouchableOpacity>
    );
};

export default AvatarGroup;
