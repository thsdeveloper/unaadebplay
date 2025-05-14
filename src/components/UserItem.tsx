import React from 'react';
import { TouchableOpacity } from 'react-native';
import colors from "../constants/colors";
import {Avatar} from "./Avatar";
import {Box} from "@/components/ui/box";
import {Divider} from "@/components/ui/divider";
import {VStack} from "@/components/ui/vstack";
const UserItem = React.memo(({ item, handleUserPress }: any) => (
    <TouchableOpacity onPress={() => handleUserPress(item)}>
        <Box direction="row" space={"sm"} p={2}>
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
                    <Text fontSize="lg" fontWeight="bold">{item.first_name}</Text>
                    <Text color="gray.500">{item.email}</Text>
                </VStack>
            </Box>
        </Box>
        <Divider/>
    </TouchableOpacity>
));
export default UserItem;
