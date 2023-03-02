import React from "react";
import {useAuth} from "../contexts/auth";

import AppRoutes from "./app.routes";
import AuthRoutes from "./auth.routes";
import TabRoutes from "./tab.routes";
import DrawerRoutes from "./drawer.routes";


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


    return signed ? <AppRoutes/> : <AuthRoutes/>;
}

export default Routes;