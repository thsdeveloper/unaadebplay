import {HStack, Avatar, VStack, Text, Box, Spacer, IInputProps} from 'native-base'
import {ReponseUser} from "../services/auth";
import {useEffect, useState} from "react";
import {getImageData} from "../utils/directus";

type Props = {
    user?: ReponseUser;
}

export function ItemListUser({user}: Props) {
    const [avatar, setAvatar] = useState();

    useEffect(() => {
        async function loadAvatar() {
            if(user?.avatar != null){
                const base64data = await getImageData(`/assets/${user?.avatar}`);
                setAvatar(base64data)
            }
        }
        loadAvatar();
    }, []);


    return (
        <Box borderBottomWidth="1" _dark={{borderColor: "muted.50"}} borderColor="muted.800" pl={["0", "4"]}
             pr={["0", "5"]} py="2">
            <HStack space={[2, 3]} justifyContent="space-between">
                <Avatar size="48px" source={{
                    uri: avatar
                }}/>
                <VStack>
                    <Text _dark={{
                        color: "warmGray.50"
                    }} color="coolGray.800" bold>
                        {user.first_name}
                    </Text>
                    <Text color="coolGray.600" _dark={{
                        color: "warmGray.200"
                    }}>
                        {user.email}
                    </Text>
                </VStack>
                <Spacer/>
                <Text fontSize="xs" _dark={{
                    color: "warmGray.50"
                }} color="coolGray.800" alignSelf="flex-start">
                    {user.last_access}
                </Text>
            </HStack>
        </Box>
    )
}

