import Dashboard from '../pages/app/Dashboard';
import {MaterialIcons, FontAwesome5, FontAwesome} from '@expo/vector-icons'
import Colors from '../constants/colors'

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {createDrawerNavigator} from '@react-navigation/drawer'

import Contact from "../pages/app/Contact";
import Settings from "../pages/app/Settings";

import Events from "../pages/app/Events";
import RepertoireListScreen from "../pages/app/Dashboard/RepertoireListScreen";
import React from "react";
import GlobalAudioPlayer from "../components/GlobalAudioPlayer";
import FlashMessage from "react-native-flash-message";
import EventDetailsPage from "../pages/app/Events/EventDetailsPage";
import PostsPage from "../pages/app/Posts";
import PostDetailsPage from "../pages/app/Posts/PostDetailsPage";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();


function DashboardScreen() {
    return (
        <>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={Dashboard} options={{headerShown: false}}/>
                <Stack.Screen name="Contact" component={Contact} options={{headerShown: false}}/>
                <Stack.Screen name="RepertoireList" component={RepertoireListScreen} options={{headerShown: false}}/>
            </Stack.Navigator>
        </>
    );
}

function PostsScreen() {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="Posts" component={PostsPage}/>
            <Stack.Screen name="PostsDetails" component={PostDetailsPage}/>
        </Stack.Navigator>
    );
}

function EventosScreen() {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="Events" component={Events}/>
            <Stack.Screen name="EventsDetails" component={EventDetailsPage}/>
        </Stack.Navigator>
    );
}

function SettingsScreen() {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="Settings" component={Settings}/>
        </Stack.Navigator>
    );
}


function TabRoutes() {
    return (
        <>
            <FlashMessage position="top"/>
            <GlobalAudioPlayer />

            <Tab.Navigator screenOptions={{
                tabBarIconStyle: {
                    borderStyle: "solid",
                    backgroundColor: 'red',
                    color: 'red'
                },
                tabBarActiveTintColor: Colors.text,
                // headerTransparent: true,
                headerTintColor: 'red',
                tabBarStyle: {
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
                <Tab.Screen name="Noticias" component={PostsScreen} options={
                    {
                        headerShown: false,
                        tabBarLabel: 'Notícias',
                        tabBarIcon: ({color, size}) => (
                            <FontAwesome5 name={'newspaper'} color={color} size={size}/>
                        )
                    }
                }/>
                <Tab.Screen name="Eventos" component={EventosScreen} options={
                    {
                        headerShown: false,
                        tabBarLabel: 'Eventos',
                        tabBarIcon: ({color, size}) => (
                            <FontAwesome name={'calendar'} color={color} size={size}/>
                        )
                    }
                }/>
                <Tab.Screen name="Configuracoes" component={SettingsScreen} options={
                    {
                        headerShown: false,
                        tabBarLabel: 'Configurações',
                        tabBarIcon: ({color, size}) => (
                            <MaterialIcons name={'settings'} color={color} size={size}/>
                        )
                    }
                }/>
            </Tab.Navigator>
        </>
    );
}

export default TabRoutes;