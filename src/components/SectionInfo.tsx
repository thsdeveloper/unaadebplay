import {TouchableOpacity} from "react-native";
import {Box, HStack, Text, VStack} from "native-base";
import colors from "@/constants/colors";
import {Feather} from "@expo/vector-icons";
import {Link} from "expo-router";
import React from "react";

interface PropsSectionInfo{
    to: string,
    title: string,
    description: string,
    icon: string
    bgColor: string
}

export default function SectionInfo({to, title, description, icon, bgColor}: PropsSectionInfo){
    return (
        <Link href={to} asChild>
            <TouchableOpacity activeOpacity={0.9}>
                <HStack backgroundColor={bgColor} width={'100%'} height={'24'} alignItems={"center"} rounded={4}>
                    <HStack space={4} alignItems={"center"} justifyContent={"center"} px={4}>
                        <Box>
                            <Feather name={icon} size={40} color={colors.light}/>
                        </Box>
                        <VStack>
                            <Text fontSize={20} fontWeight={"bold"} color={colors.text}>
                                {title}
                            </Text>
                            <Text color={colors.yellow}>
                                {description}
                            </Text>
                        </VStack>
                    </HStack>
                </HStack>
            </TouchableOpacity>
        </Link>
    )
}