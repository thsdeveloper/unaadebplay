import {Stack, useRouter} from 'expo-router';
import React, {useEffect} from "react";
import {useAuth} from "@/contexts/AuthContext";
export default function AuthLayout() {
    const {signed} = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (signed) {
            router.push('/(tabs)/(home)/')
        }
    }, [signed]);

    if(signed) {
        return null;
    }

    return (
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
    );
}




