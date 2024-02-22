import {createDrawerNavigator} from '@react-navigation/drawer'
import {HeaderDrawer} from "@/components/HeaderDrawer";
import Colors from "@/constants/colors";
import React, {useContext} from "react";
import AuthContext from "@/contexts/AuthContext";
import {Feather} from '@expo/vector-icons'

import TabRoutes from '@/routes/tab.routes'
import StackRoutes from '@/routes/stack.routes'

const Drawer = createDrawerNavigator();


export default function DrawerRoutes() {
    const {user} = useContext(AuthContext)
    return (
        <>

            <Drawer.Navigator drawerContent={props => <HeaderDrawer {...props} />} screenOptions={{
                headerTintColor: Colors.text,
                gestureEnabled: true,
                headerStyle: {
                    backgroundColor: Colors.secundary,
                },
                title: `Olá ${user?.first_name}, bem-vindo!`,
                drawerStyle: {
                    backgroundColor: Colors.secundary
                },
                swipeEnabled: false,
            }}>
                <Drawer.Screen name="home" component={TabRoutes} options={{
                    drawerIcon: ({color, size}) => <Feather name={'home'} color={color} size={size}/>,
                    drawerLabel: 'Início'
                }}
                />

                <Drawer.Screen name="profile" component={StackRoutes} options={{
                    drawerIcon: ({color, size}) => <Feather name={'user'} color={color} size={size}/>,
                }}
                />

            </Drawer.Navigator>
        </>
    );
}