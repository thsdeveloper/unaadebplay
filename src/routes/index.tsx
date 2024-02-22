import React from "react";
import {useAuth} from "../contexts/AuthContext";
import AuthRoutes from "./auth.routes";
import DrawerRoutes from "./drawer.routes";
import FlashMessage from "react-native-flash-message";

import { NavigationContainer } from '@react-navigation/native'
import GlobalAudioPlayer from "../components/GlobalAudioPlayer";

function Routes() {
    const {signed} = useAuth()
    return (
       <>
           <NavigationContainer>
               {signed ? (
                   <DrawerRoutes/>
               ): (
                   <AuthRoutes />
               )}
           </NavigationContainer>
       </>
    );
}

export default Routes;