import {createDrawerNavigator} from '@react-navigation/drawer'
import {HeaderDrawer} from "../components/HeaderDrawer";
import TabRoutes from '../routes/tab.routes'
import Colors from "../constants/colors";
import React, {useContext} from "react";
import AuthContext from "../contexts/AuthContext";
import GlobalAudioPlayer from "../components/GlobalAudioPlayer";

const Drawer = createDrawerNavigator();


function DrawerRoutes() {
    const {user} = useContext(AuthContext)
    return (
        <>

            <Drawer.Navigator drawerContent={props => <HeaderDrawer {...props} />} screenOptions={{
                headerTintColor: Colors.text,
                headerStyle: {
                    backgroundColor: Colors.secundary,
                },
                title: `Olá ${user?.first_name}, bem-vindo!`,
                drawerStyle: {
                    backgroundColor: Colors.secundary
                }
            }}>
                <Drawer.Screen name="Home" component={TabRoutes}/>
            </Drawer.Navigator>
        </>
    );
}

export default DrawerRoutes;