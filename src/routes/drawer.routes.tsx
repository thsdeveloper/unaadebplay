import {createDrawerNavigator} from '@react-navigation/drawer'
import {HeaderDrawer} from "../components/HeaderDrawer";
import TabRoutes from '../routes/tab.routes'
import Colors from "../constants/colors";
import React from "react";
const Drawer = createDrawerNavigator();


function DrawerRoutes() {
    return (
        <Drawer.Navigator drawerContent={props => <HeaderDrawer {...props} />} screenOptions={{
            headerTintColor: Colors.text,
            headerStyle: {
              backgroundColor: Colors.secundary,
            },
            title: 'Olá, bem-vindo!',
            drawerStyle: {
                backgroundColor: Colors.secundary
            }
        }}>
            <Drawer.Screen name="Home" component={TabRoutes}/>
        </Drawer.Navigator>
    );
}

export default DrawerRoutes;