import Dashboard from '../pages/app/Dashboard';
import ForgetPassword from '../pages/ForgetPassword';
import About from "../pages/app/About";
import {MaterialIcons, FontAwesome5, FontAwesome} from '@expo/vector-icons'
import Colors from '../constants/colors'

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {createDrawerNavigator} from '@react-navigation/drawer'

import Contact from "../pages/app/Contact";
import Settings from "../pages/app/Settings";

import News from "../pages/app/News";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();


function DrawerRoutes() {
    return (
        <Drawer.Navigator>
            <Drawer.Screen name="Dashboard" component={Dashboard}/>
        </Drawer.Navigator>
    );
}

function DashboardScreen() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Home" component={Dashboard} options={{headerShown: false}}/>
            <Stack.Screen name="Contact" component={Contact} options={{headerShown: false}}/>
            <Stack.Screen name="About" component={About}/>
        </Stack.Navigator>
    );
}

function NewsScreen() {
    return (
        <Stack.Navigator screenOptions={{
            headerShown: false,
        }}>
            <Stack.Screen name="newss" component={News}/>
        </Stack.Navigator>
    );
}

function SettingsScreen() {
    return (
        <Stack.Navigator screenOptions={{
            headerShown: false,
        }}>
            <Stack.Screen name="Settings" component={Settings}/>
        </Stack.Navigator>
    );
}


function TabRoutes() {
    return (
        <Tab.Navigator screenOptions={{
            tabBarIconStyle: {
              borderStyle: "solid",
                backgroundColor: 'red',
                color: 'red'
            },
            tabBarActiveTintColor: Colors.text,
            // headerTransparent: true,
            headerTintColor: 'red', tabBarStyle: {
                // height: 100,
                // // position: 'absolute',
                // bottom: 10,
                // // right: 16,
                // // left: 16,
                // borderRadius: 16,
                // padding: 10,
                backgroundColor: Colors.secundary,
                borderColor: 'red',
            },
        }}>
            <Tab.Screen name="Dashboard" component={DashboardScreen} options={
                {
                    headerShown: false,
                    // tabBarShowLabel: false,
                    tabBarLabel: 'UNAADEB',
                    tabBarIcon: ({color, size}) => (
                        <FontAwesome5 name={'fire'} color={color} size={size}/>
                    )
                }
            }/>
            <Tab.Screen name="News" component={NewsScreen} options={
                {
                    headerShown: false,
                    tabBarLabel: 'Notícias',
                    tabBarIcon: ({color, size}) => (
                        <FontAwesome5 name={'newspaper'} color={color} size={size}/>
                    )
                }
            }/>
            <Tab.Screen name="SettingsScreen" component={SettingsScreen} options={
                {
                    headerShown: false,
                    tabBarLabel: 'Agenda',
                    tabBarIcon: ({color, size}) => (
                        <FontAwesome name={'calendar'} color={color} size={size}/>
                    )
                }
            }/>
            <Tab.Screen name="media" component={SettingsScreen} options={
                {
                    headerShown: false,
                    tabBarLabel: 'Configurações',
                    tabBarIcon: ({color, size}) => (
                        <MaterialIcons name={'settings'} color={color} size={size}/>
                    )
                }
            }/>
        </Tab.Navigator>
    );
}

export default TabRoutes;