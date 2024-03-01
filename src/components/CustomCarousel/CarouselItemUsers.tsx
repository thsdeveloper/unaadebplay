import React, {useEffect, useState} from 'react';
import {Dimensions} from 'react-native';
import CustomCarousel from './CustomCarousel';
import {GlobalQueryParams} from "@/types/GlobalQueryParamsTypes";
import {Box, Text} from "native-base";
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
    <Box py={2}>
        <Link href={`/(tabs)/(home)/(congresso)/convidado/${id}`}>
            <Box alignItems={"center"}>
                <Avatar userAvatarID={avatar} width={"40"} height={"40"} rounded={'full'}/>
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
            <CustomCarousel
                data={users}
                renderItem={({item}: any) => <CarouselItem {...item} />}
                sliderWidth={windowWidth}
                loop={true}
                autoplay={false}
                itemWidth={160} // Tamanho uniforme dos itens
                inactiveSlideScale={0.8}
                inactiveSlideOpacity={0.5}
                snapToAlignment={'start'}
                snapToInterval={150}
            />
            {/*<Box backgroundColor={"blue.900"}>*/}
            {/*    <Text color={colors.light}>*/}
            {/*        {JSON.stringify(users, null, 2)}*/}
            {/*    </Text>*/}
            {/*</Box>*/}
        </Box>
    );
};
