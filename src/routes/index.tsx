import React from "react";
import {useAuth} from "../contexts/AuthContext";

import AuthRoutes from "./auth.routes";
import DrawerRoutes from "./drawer.routes";
import GlobalAudioPlayer from "../components/GlobalAudioPlayer";


import {ActivityIndicator, View} from "react-native";


function Routes() {
    const {signed, loading} = useAuth()

    if (loading) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size={'large'} color={'#666'}/>
            </View>
        )
    }


    return signed ? (
        <>
            <DrawerRoutes/>
        </>
    ) : <AuthRoutes/>;
}

export default Routes;