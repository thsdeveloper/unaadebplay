import React from "react";
import {Text} from "react-native";
import MercadoPago from "@/components/MercadoPago";
import {ScrollView} from "native-base";
import {Link} from "expo-router";

export default function Congresso(){
    return (
        <ScrollView>
            <Text>Página do Congresso</Text>
            <Text>Em breve mais informações sobre o congresso geral da UNAADEB 2024</Text>
            <Link href={'/repertories'}>
            Repertories
            </Link>
            <MercadoPago />

            {/*<HStack space={2}>*/}
            {/*    <Box width={'1/4'} height={20} bgColor={colors.secundary2}*/}
            {/*         justifyContent={"center"}>*/}
            {/*        <TouchableOpacity onPress={() => navigation.navigate('congresso')}>*/}
            {/*            <Box alignItems={"center"} justifyContent={"center"}>*/}
            {/*                <Icon ml={2} as={FontAwesome5} name="fire" size={"2xl"} color={colors.primary}/>*/}
            {/*                <Text fontWeight={'bold'} color={colors.white}>Congresso</Text>*/}
            {/*            </Box>*/}
            {/*        </TouchableOpacity>*/}
            {/*    </Box>*/}
            {/*    <Box width={'1/4'} height={20} bgColor={colors.secundary2}*/}
            {/*         justifyContent={"center"}>*/}
            {/*        <TouchableOpacity onPress={() => navigation.navigate('repertories')}>*/}
            {/*            <Box alignItems={"center"} justifyContent={"center"}>*/}
            {/*                <Icon as={FontAwesome} name="music" size={"2xl"} color={colors.primary}/>*/}
            {/*                <Text fontWeight={'bold'} color={colors.white}>Repertório</Text>*/}
            {/*            </Box>*/}
            {/*        </TouchableOpacity>*/}
            {/*    </Box>*/}
            {/*    <Box width={'1/4'} height={20} bgColor={colors.secundary2}*/}
            {/*         justifyContent={"center"}>*/}
            {/*        <TouchableOpacity onPress={() => navigation.navigate('youtube')}>*/}
            {/*            <Box alignItems={"center"} justifyContent={"center"}>*/}
            {/*                <Icon as={Entypo} name="youtube" size={"2xl"} color={colors.primary}/>*/}
            {/*                <Text fontWeight={'bold'} color={colors.white}>Youtube</Text>*/}
            {/*            </Box>*/}
            {/*        </TouchableOpacity>*/}
            {/*    </Box>*/}
            {/*</HStack>*/}
        </ScrollView>
    );
};