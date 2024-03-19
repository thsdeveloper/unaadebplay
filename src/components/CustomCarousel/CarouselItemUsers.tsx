import React, {useEffect, useState} from 'react';
import {Dimensions} from 'react-native';
import {GlobalQueryParams} from "@/types/GlobalQueryParamsTypes";
import {Box, FlatList, Text} from "native-base";
import colors from "@/constants/colors";
import {Avatar} from "@/components/Avatar";
import {UserTypes} from "@/types/UserTypes";
import {getUsers} from "@/services/user";
import {Link} from "expo-router";

const windowWidth = Dimensions.get('window').width;

interface PropsCarrousseu {
    convidados: any[] | null
}

const CarouselItem = ({id, avatar, first_name}: UserTypes) => (
    <Box py={2} px={2}>
        <Link href={`/(tabs)/(home)/(congresso)/convidado/${id}`}>
            <Box alignItems={"center"}>
                <Avatar userAvatarID={avatar} width={"40"} height={"40"} rounded={'full'} borderWidth={2} borderColor={colors.light} />
                <Text pt={1} color={colors.light}>{first_name}</Text>
            </Box>
        </Link>
    </Box>
);


export default function CarouselItemUsers({convidados}: PropsCarrousseu) {
    const [users, setUsers] = useState<UserTypes[] | []>([]);

    useEffect(() => {
        const loadUsers = async () => {
            // Verifica se 'convidados' não é nulo e tem itens
            if (convidados && convidados.length > 0) {
                // Extrai os 'directus_users_id' do array de 'convidados'
                const userIds = convidados.map(convidado => convidado.directus_users_id);

                // Constrói o filtro para buscar usuários pelos 'directus_users_id'
                const params: GlobalQueryParams = {
                    filter: {
                        id: {
                            _in: userIds,
                        },
                    },
                    fields: ['*'],
                };
                try {
                    const responseUsers = await getUsers<UserTypes>(params);
                    setUsers(responseUsers);
                } catch (error) {
                    console.error("Erro ao carregar os usuários:", error);
                }
            }
        };

        loadUsers();
    }, []);

    if(users.length === 0){
        return (
            <>
                <Box py={4} px={2}>
                    <Text color={colors.light}>Nenhum convidado cadastrado</Text>
                </Box>
            </>
        )
    }

    return (
        <Box>
            <FlatList
                horizontal
                data={users}
                renderItem={({item}: any) => <CarouselItem {...item} />}
                snapToInterval={windowWidth * 0.8}
                decelerationRate="fast"
                keyExtractor={(user: UserTypes) => user.id}
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
            />
        </Box>
    );
};
