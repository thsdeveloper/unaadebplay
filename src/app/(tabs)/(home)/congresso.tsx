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
        </ScrollView>
    );
};