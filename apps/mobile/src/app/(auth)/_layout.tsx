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
                                 headerShown: false,
                             }}/>
               <Stack.Screen name="forget-password" options={{headerShown: false}}/>
               <Stack.Screen name="reset-password" options={{
                   headerShown: false,
               }}/>
               {/* Documentos legais — abertos como modal a partir do cadastro (LegalScreen tem header próprio) */}
               <Stack.Screen name="terms" options={{ headerShown: false, presentation: 'modal' }}/>
               <Stack.Screen name="privacy" options={{ headerShown: false, presentation: 'modal' }}/>
           </Stack>
    );
}




