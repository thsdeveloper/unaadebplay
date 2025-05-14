import React, { useContext, useEffect, useState } from 'react';
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { getUsers } from "@/services/user";
import { UserTypes } from "@/types/UserTypes";
import ConfigContext from "@/contexts/ConfigContext";
import colors from "../constants/colors";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
// Importando o Avatar do caminho correto
import { Avatar } from "@/components/ui/avatar";
// Importando o AvatarGroup do mesmo pacote
import { AvatarGroup as GluestackAvatarGroup } from "@/components/ui/avatar";

const AvatarGroup = () => {
    const [users, setUsers] = useState<UserTypes[]>([]);
    const config = useContext(ConfigContext);
    const router = useRouter();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const users = await getUsers();
                setUsers(users);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);

    return (
        <TouchableOpacity onPress={() => router.push('/users')} activeOpacity={0.9}>
            <Center>
                <Text className="text-white pb-4 font-bold">
                    Junte-se a milhares de adolescentes com propósitos!
                </Text>

                {/* Usando o GluestackAvatarGroup corretamente */}
                <GluestackAvatarGroup>
                    {users && users.slice(0, 5).map((user, index) => {
                        const initials = `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`;
                        return (
                            <Avatar
                                key={index}
                                userAvatarID={user.avatar}
                                name={`${user.first_name} ${user.last_name}`}
                                width={48}
                                height={48}
                            />
                        );
                    })}
                </GluestackAvatarGroup>
            </Center>
        </TouchableOpacity>
    );
};

export default AvatarGroup;
