import {Stack} from 'expo-router';
import React from "react";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";

export default function HomeLayout() {
    return (
       <>
           <Stack screenOptions={{
               headerBackTitle: 'Voltar'
           }}>
               <Stack.Screen name={'index'} options={{title: 'Olá Thiago, bem-vindo'}} />
               <Stack.Screen name={'contribua'} options={{title: 'Contribua com a UNAADEB'}} />
               <Stack.Screen name={'congresso'} options={{title: 'Home page de Tabs'}} />
               <Stack.Screen name={'[itemId]'} options={{title: 'Details itemID'}} />
               <Stack.Screen name={'users'} options={{title: 'Usuários'}} />
               <Stack.Screen name={'(profile)/[id]'} options={{title: 'Perfil'}} />
               <Stack.Screen name={'modal'} options={{title: 'Perfil', presentation: 'modal'}} />
               <Stack.Screen name={'youtube'} options={{title: 'Youtube', presentation: 'modal'}} />
               <Stack.Screen name={'repertories'} options={{title: 'Repertórios', presentation: 'modal'}} />
           </Stack>
       </>
    );
}
