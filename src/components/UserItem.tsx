import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Box, Text, VStack, Divider, Stack } from 'native-base';
import {Image} from "./Image";
import colors from "../constants/colors";
import {Avatar} from "./Avatar";

const UserItem = React.memo(({ item, handleUserPress }) => (
    <TouchableOpacity onPress={() => handleUserPress(item)}>
        <Stack direction="row" space={"sm"} p={2}>
            <Box>
                <Avatar
                    borderWidth={4}
                    borderColor={colors.light}
                    height={16}
                    width={16}
                    userAvatarID={item.avatar}
                    _text={{fontSize: "md", fontWeight: "600"}}
                    alignSelf="center"
                />
            </Box>
            <Box>
                <VStack>
                    <Text fontSize="lg" fontWeight="bold">
                        {item.first_name}
                    </Text>
                    <Text color="gray.500">{item.email}</Text>
                    <Text color="gray.500">{item.sector.name}</Text>
                </VStack>
            </Box>
        </Stack>
        <Divider/>
    </TouchableOpacity>
));

export default UserItem;
