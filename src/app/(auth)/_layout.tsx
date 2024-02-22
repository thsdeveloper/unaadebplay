import {Stack} from 'expo-router';
import React from "react";
export default function AuthLayout() {
    return (
       <>
           <Stack>
               <Stack.Screen name="sign-in" options={{headerShown: false}}/>
               <Stack.Screen name="sign-up"
                             options={{
                                 headerShown: true,
                                 headerBackTitle: 'Login',
                                 title: 'Cadastre-se'
                             }}/>
               <Stack.Screen name="forget-password" options={{
                   headerShown: true,
                   headerBackTitle: 'Login',
                   title: 'Recuperar senha'
               }}/>
           </Stack>
       </>
    );
}




